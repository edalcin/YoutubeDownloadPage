package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type DownloadRequest struct {
	URL     string `json:"url" binding:"required"`
	Quality string `json:"quality"`
}

type DownloadResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Error   string `json:"error,omitempty"`
}

type WSMessage struct {
	Type     string `json:"type"`
	Percent  int    `json:"percent,omitempty"`
	Status   string `json:"status,omitempty"`
	Title    string `json:"title,omitempty"`
	Message  string `json:"message,omitempty"`
	Filename string `json:"filename,omitempty"`
	Size     string `json:"size,omitempty"`
}

type YouTubeDownloader struct {
	downloadPath string
	clients      map[*websocket.Conn]bool
	clientsMux   sync.RWMutex
	upgrader     websocket.Upgrader
}

func NewYouTubeDownloader() *YouTubeDownloader {
	downloadPath := os.Getenv("DOWNLOAD_PATH")
	if downloadPath == "" {
		downloadPath = "/downloads"
	}

	// Criar diretório se não existir
	os.MkdirAll(downloadPath, 0755)

	return &YouTubeDownloader{
		downloadPath: downloadPath,
		clients:      make(map[*websocket.Conn]bool),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // Permitir conexões de qualquer origem
			},
		},
	}
}

func (yd *YouTubeDownloader) addClient(conn *websocket.Conn) {
	yd.clientsMux.Lock()
	defer yd.clientsMux.Unlock()
	yd.clients[conn] = true
}

func (yd *YouTubeDownloader) removeClient(conn *websocket.Conn) {
	yd.clientsMux.Lock()
	defer yd.clientsMux.Unlock()
	delete(yd.clients, conn)
	conn.Close()
}

func (yd *YouTubeDownloader) broadcast(message WSMessage) {
	yd.clientsMux.RLock()
	defer yd.clientsMux.RUnlock()

	data, _ := json.Marshal(message)
	
	for conn := range yd.clients {
		err := conn.WriteMessage(websocket.TextMessage, data)
		if err != nil {
			log.Printf("Error sending message to client: %v", err)
			delete(yd.clients, conn)
			conn.Close()
		}
	}
}

func (yd *YouTubeDownloader) getVideoInfo(url string) (map[string]string, error) {
	cmd := exec.Command("yt-dlp", "--get-title", "--get-duration", "--get-filename", "-f", "best", url)
	output, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("erro ao obter informações do vídeo: %v", err)
	}

	lines := strings.Split(strings.TrimSpace(string(output)), "\n")
	if len(lines) < 3 {
		return nil, fmt.Errorf("informações incompletas do vídeo")
	}

	return map[string]string{
		"title":    strings.TrimSpace(lines[0]),
		"duration": strings.TrimSpace(lines[1]),
		"filename": strings.TrimSpace(lines[2]),
	}, nil
}

func (yd *YouTubeDownloader) normalizeFilename(title string) string {
	// Remove caracteres especiais e mantém apenas alphanumérricos, espaços, hífens e pontos
	reg := regexp.MustCompile(`[^\w\s\-\.\(\)]`)
	filename := reg.ReplaceAllString(title, "")
	
	// Remove múltiplos espaços
	reg = regexp.MustCompile(`\s+`)
	filename = reg.ReplaceAllString(filename, " ")
	
	filename = strings.TrimSpace(filename)
	
	// Adiciona extensão se não tiver
	if !regexp.MustCompile(`\.(mp4|mkv|webm)$`).MatchString(strings.ToLower(filename)) {
		filename += ".mp4"
	}
	
	return filename
}

func (yd *YouTubeDownloader) formatBytes(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}

func (yd *YouTubeDownloader) download(url, quality string) error {
	// Broadcast que começou
	yd.broadcast(WSMessage{Type: "progress", Percent: 5, Status: "Verificando vídeo..."})

	// Obter informações do vídeo
	info, err := yd.getVideoInfo(url)
	if err != nil {
		return err
	}

	// Broadcast informações do vídeo
	yd.broadcast(WSMessage{Type: "info", Title: info["title"]})
	yd.broadcast(WSMessage{Type: "progress", Percent: 10, Status: "Preparando download..."})

	// Preparar formato baseado na qualidade
	var format string
	switch quality {
	case "1080p":
		format = "best[height<=1080]"
	case "720p":
		format = "best[height<=720]"
	case "480p":
		format = "best[height<=480]"
	case "360p":
		format = "best[height<=360]"
	default:
		format = "best"
	}

	// Normalizar nome do arquivo
	normalizedFilename := yd.normalizeFilename(info["title"])
	fullPath := filepath.Join(yd.downloadPath, normalizedFilename)

	// Executar download com yt-dlp
	cmd := exec.Command("yt-dlp", 
		"-f", format,
		"--newline",
		"--progress",
		"-o", fullPath,
		url)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("erro ao criar pipe: %v", err)
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("erro ao criar pipe de erro: %v", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("erro ao iniciar comando: %v", err)
	}

	// Ler progresso em tempo real
	go yd.readProgress(stdout)
	go yd.readProgress(stderr)

	// Aguardar conclusão
	if err := cmd.Wait(); err != nil {
		return fmt.Errorf("erro durante download: %v", err)
	}

	// Verificar se arquivo foi criado e obter tamanho
	if stat, err := os.Stat(fullPath); err == nil {
		size := yd.formatBytes(stat.Size())
		yd.broadcast(WSMessage{
			Type: "success", 
			Message: "Download concluído com sucesso!",
			Filename: normalizedFilename,
			Size: size,
		})
	} else {
		return fmt.Errorf("arquivo não foi criado corretamente")
	}

	return nil
}

func (yd *YouTubeDownloader) readProgress(pipe interface{}) {
	var scanner *bufio.Scanner
	
	if stdout, ok := pipe.(*os.File); ok {
		scanner = bufio.NewScanner(stdout)
	} else {
		return
	}

	progressRegex := regexp.MustCompile(`(\d+\.?\d*)%`)
	
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		
		if line == "" {
			continue
		}

		log.Printf("yt-dlp: %s", line)

		// Procurar progresso
		if matches := progressRegex.FindStringSubmatch(line); len(matches) > 1 {
			if percent, err := strconv.ParseFloat(matches[1], 64); err == nil {
				displayPercent := int(20 + (percent * 0.75)) // Mapeia para 20-95%
				yd.broadcast(WSMessage{
					Type: "progress", 
					Percent: displayPercent, 
					Status: fmt.Sprintf("Baixando... %.1f%%", percent),
				})
			}
		} else if strings.Contains(line, "[download]") && strings.Contains(line, "%") {
			// Padrão alternativo
			if matches := progressRegex.FindStringSubmatch(line); len(matches) > 1 {
				if percent, err := strconv.ParseFloat(matches[1], 64); err == nil {
					displayPercent := int(20 + (percent * 0.75))
					yd.broadcast(WSMessage{
						Type: "progress", 
						Percent: displayPercent, 
						Status: fmt.Sprintf("Baixando... %.1f%%", percent),
					})
				}
			}
		} else if strings.Contains(strings.ToLower(line), "downloading") {
			yd.broadcast(WSMessage{Type: "progress", Percent: 25, Status: "Iniciando download do arquivo..."})
		} else if strings.Contains(line, "100%") || strings.Contains(strings.ToLower(line), "download completed") {
			yd.broadcast(WSMessage{Type: "progress", Percent: 95, Status: "Finalizando..."})
		}
	}
}

func (yd *YouTubeDownloader) handleDownload(c *gin.Context) {
	var req DownloadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, DownloadResponse{
			Success: false,
			Error:   "Dados inválidos: " + err.Error(),
		})
		return
	}

	// Validar URL
	youtubeRegex := regexp.MustCompile(`^https?://(www\.)?(youtube\.com|youtu\.be)`)
	if !youtubeRegex.MatchString(req.URL) {
		c.JSON(http.StatusBadRequest, DownloadResponse{
			Success: false,
			Error:   "URL inválida. Use uma URL do YouTube válida.",
		})
		return
	}

	// Iniciar download em goroutine
	go func() {
		if err := yd.download(req.URL, req.Quality); err != nil {
			yd.broadcast(WSMessage{Type: "error", Message: err.Error()})
		}
	}()

	c.JSON(http.StatusOK, DownloadResponse{
		Success: true,
		Message: "Download iniciado com sucesso",
	})
}

func (yd *YouTubeDownloader) handleWebSocket(c *gin.Context) {
	conn, err := yd.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade to WebSocket: %v", err)
		return
	}

	yd.addClient(conn)
	defer yd.removeClient(conn)

	// Manter conexão viva
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			log.Printf("WebSocket read error: %v", err)
			break
		}
	}
}

func main() {
	// Configurar Gin
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}

	downloader := NewYouTubeDownloader()
	
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	// Servir arquivos estáticos
	r.Static("/static", "./static")
	
	// Rota principal
	r.GET("/", func(c *gin.Context) {
		c.File("./static/index.html")
	})

	// API routes
	api := r.Group("/api")
	{
		api.POST("/download", downloader.handleDownload)
	}

	// WebSocket
	r.GET("/ws", downloader.handleWebSocket)

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "timestamp": time.Now().Unix()})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Servidor iniciando na porta %s", port)
	log.Printf("Diretório de downloads: %s", downloader.downloadPath)
	
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Erro ao iniciar servidor: %v", err)
	}
}