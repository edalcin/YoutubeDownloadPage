# YouTube Downloader - Setup Unraid

## 🚀 Instalação

### Método 1: Template Automático
1. **Apps** → **Install Plugin** → Procurar por "YouTube Downloader"
2. Ou usar o template: `https://raw.githubusercontent.com/edalcin/YoutubeDownloadPage/main/unraid-template.xml`

### Método 2: Configuração Manual
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

## 🔧 Configurações

### Variáveis de Ambiente
| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `TZ` | `America/Sao_Paulo` | Timezone |
| `PUID` | `99` | User ID |
| `PGID` | `100` | Group ID |
| `GIN_MODE` | `release` | Modo do servidor (release/debug) |

### Volumes
- **Downloads**: `/downloads` - Diretório onde os vídeos são salvos

### Health Check
- **URL**: `http://[IP]:8080/health`
- **Status**: `{"status":"ok","timestamp":...}`

## 🎯 Características

- ✅ **Imagem compacta** - ~220MB
- ✅ **Startup rápido** - ~1.5s  
- ✅ **Interface moderna** - Design responsivo e limpo
- ✅ **Tempo real** - WebSocket sem polling
- ✅ **Múltiplas qualidades** - 360p até melhor disponível
- ✅ **Estável** - Sem problemas de dependências Python