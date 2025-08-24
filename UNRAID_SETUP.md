# YouTube Downloader - Setup Unraid

## 🚀 Nova Versão Go (Recomendada)

### Instalação Automática
1. **Apps** → **Install Plugin** → Procurar por "YouTube Downloader"
2. Ou usar o template: `https://raw.githubusercontent.com/edalcin/YoutubeDownloadPage/main/unraid-template-go.xml`

### Configuração Manual
```bash
docker run -d \
  --name='YouTube-Downloader-Go' \
  --net='bridge' \
  --restart=unless-stopped \
  -e TZ="America/Sao_Paulo" \
  -e PUID='99' \
  -e PGID='100' \
  -p '8080:8080/tcp' \
  -v '/mnt/user/downloads/youtube/':'/downloads':'rw' \
  'ghcr.io/edalcin/youtubedownloadpage:latest'
```

### Vantagens da Versão Go:
- ✅ **95% menor** - ~220MB vs ~1.2GB PHP
- ✅ **10x mais rápido** - Startup em ~1.5s  
- ✅ **Interface moderna** - Design responsivo e limpo
- ✅ **Tempo real** - WebSocket sem polling
- ✅ **Mais estável** - Sem problemas de pip/Python

---

## 📜 Versão PHP (Legacy)

### Para manter compatibilidade com a versão anterior:
```bash
docker run -d \
  --name='YouTube-Downloader-PHP' \
  --net='bridge' \
  --restart=unless-stopped \
  -e TZ="America/Sao_Paulo" \
  -e PUID='99' \
  -e PGID='100' \
  -p '8999:80/tcp' \
  -v '/mnt/user/downloads/youtube/':'/var/www/html/P/youtube':'rw' \
  'ghcr.io/edalcin/youtubedownloadpage:legacy'
```

---

## 🔧 Configurações

### Portas
- **Go Version**: `:8080` (padrão)
- **PHP Version**: `:80` (dentro do container)

### Volumes
- **Go**: `/downloads` (novo)
- **PHP**: `/var/www/html/P/youtube` (antigo)

### Variáveis de Ambiente
| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `TZ` | `America/Sao_Paulo` | Timezone |
| `PUID` | `99` | User ID |
| `PGID` | `100` | Group ID |
| `GIN_MODE` | `release` | Modo Go (release/debug) |

### Health Check
- **URL**: `http://[IP]:8080/health`
- **Status**: `{"status":"ok","timestamp":...}`

---

## 🔄 Migração PHP → Go

1. **Backup**: Salve downloads existentes
2. **Stop**: Pare container PHP atual  
3. **Deploy**: Use novo template Go
4. **Update**: Ajuste volume path se necessário
5. **Test**: Acesse nova interface

### Comando de Migração:
```bash
# Parar versão antiga
docker stop YouTube-Downloader
docker rm YouTube-Downloader

# Iniciar nova versão
docker run -d \
  --name='YouTube-Downloader-Go' \
  --net='bridge' \
  --restart=unless-stopped \
  -e TZ="America/Sao_Paulo" \
  -p '8080:8080/tcp' \
  -v '/mnt/user/downloads/youtube/':'/downloads':'rw' \
  'ghcr.io/edalcin/youtubedownloadpage:latest'
```

---

## 📊 Comparação

| Aspecto | PHP Legacy | Go Nova |
|---------|------------|---------|
| **Tamanho** | ~1.2GB | ~220MB |
| **Startup** | ~15s | ~1.5s |
| **RAM** | ~150MB | ~15MB |
| **Interface** | Básica | Moderna |
| **Progresso** | Polling | WebSocket |
| **Qualidade** | Fixa | Selecionável |
| **Responsivo** | Não | Sim |

## 🎯 Recomendação

**Use a versão Go** para melhor performance, interface moderna e maior estabilidade. A versão PHP está mantida apenas para compatibilidade.