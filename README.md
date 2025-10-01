# YouTube Downloader

Uma aplicação moderna para download de vídeos do YouTube, desenvolvida em **Go** com interface web limpa e performática.

> **Baseado em:** [media-roller](https://github.com/rroller/media-roller) - Estratégia de download comprovada e otimizada para múltiplas plataformas.

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
  --name youtube-downloader \
  youtube-downloader
```

**Nota:** Não é necessário mapear volumes. O usuário escolhe onde salvar os arquivos através da interface web usando o botão "Salvar como...".

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
- `GIN_MODE`: Modo do Gin (release/debug)

**Nota:** A variável `DOWNLOAD_PATH` não é mais necessária, pois os arquivos são salvos diretamente no computador do usuário através do navegador.

### Unraid

#### Instalação Rápida (Recomendado)
1. **Docker** → **Add Container**
2. **Template URL**: `https://raw.githubusercontent.com/edalcin/YoutubeDownloadPage/main/unraid-template.xml`
3. **Apply** → Acesse `http://IP_UNRAID:8080`

#### Configuração Manual
| Campo | Valor |
|-------|-------|
| **Container Name** | `YouTube-Downloader` |
| **Repository** | `ghcr.io/edalcin/youtubedownloadpage:latest` |
| **Network** | `bridge` |
| **Port** | `8080:8080` (TCP) |
| **TZ** | `America/Sao_Paulo` |

**Nota:** Não é necessário configurar volumes. Os arquivos são salvos diretamente no computador do usuário.

#### Comando Docker Equivalente
```bash
docker run -d \
  --name=YouTube-Downloader \
  --net=bridge \
  --restart=unless-stopped \
  -p 8080:8080 \
  -e TZ=America/Sao_Paulo \
  ghcr.io/edalcin/youtubedownloadpage:latest
```

#### Guias Detalhados
- **[UNRAID-INSTALL.md](UNRAID-INSTALL.md)** - Instalação rápida em 5 minutos
- **[UNRAID_SETUP.md](UNRAID_SETUP.md)** - Configuração detalhada e solução de problemas