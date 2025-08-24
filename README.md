# YouTube Downloader

Uma aplicação moderna para download de vídeos do YouTube, desenvolvida em **Go** com interface web limpa e performática.

## 🚀 Características

### Arquitetura Otimizada
- **Backend**: Go (alta performance, baixo consumo de memória)
- **Frontend**: HTML/CSS/JS puro (sem frameworks, carregamento instantâneo)
- **Docker**: Alpine Linux (imagem ~220MB)
- **WebSocket**: Progresso em tempo real sem polling

### Performance
- ✅ **Imagem compacta** - ~220MB Docker
- ✅ **Startup rápido** - ~1.5s
- ✅ **Baixo consumo** de CPU e memória
- ✅ **Interface responsiva** e moderna

### Features
- 🎯 Download em múltiplas qualidades (360p até melhor disponível)
- 🔄 Progresso em tempo real via WebSocket
- 📱 Interface responsiva e moderna
- 🔒 Validação robusta de URLs
- 📊 Informações detalhadas do vídeo
- 🎨 Design limpo e profissional

## 🐳 Docker

### Build e Execução
```bash
# Build da imagem
docker build -t youtube-downloader .

# Executar container
docker run -d \
  -p 8080:8080 \
  -v /caminho/downloads:/downloads \
  --name youtube-downloader \
  youtube-downloader
```

### Docker Compose
```bash
docker-compose up -d
```

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Go 1.22+
- yt-dlp instalado
- ffmpeg (opcional, para conversão)

### Executar
```bash
# Instalar dependências
go mod tidy

# Executar aplicação
go run main.go

# Ou build e executar
go build -o youtube-downloader .
./youtube-downloader
```

A aplicação estará disponível em `http://localhost:8080`

## 📁 Estrutura do Projeto

```
.
├── main.go              # Backend Go
├── go.mod               # Dependências Go
├── static/              # Frontend assets
│   ├── index.html       # Interface principal
│   ├── style.css        # Estilos modernos
│   └── app.js          # JavaScript interativo
├── Dockerfile           # Docker otimizado
├── downloads/           # Diretório de downloads
└── README.md           # Esta documentação
```

## 🔧 Configuração

### Variáveis de Ambiente
- `PORT`: Porta do servidor (padrão: 8080)
- `DOWNLOAD_PATH`: Diretório para salvar downloads (padrão: /downloads)
- `GIN_MODE`: Modo do Gin (release/debug)

### Unraid
Use o template disponível em `unraid-template.xml` ou:

```bash
docker run -d \
  --name='YouTube-Downloader' \
  --net='bridge' \
  --restart=unless-stopped \
  -e TZ="America/Sao_Paulo" \
  -e PUID='99' \
  -e PGID='100' \
  -p '8080:8080/tcp' \
  -v '/mnt/user/downloads/youtube/':'/downloads':'rw' \
  'ghcr.io/edalcin/youtubedownloadpage:latest'
```