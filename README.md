# 🎥 YouTube Downloader - Docker

Sistema completo para download de vídeos do YouTube em Full HD usando Docker.

## 🖥️ Instalação no Unraid

### **Método 1: Community Applications (Recomendado)**
1. Vá para **Apps** no Unraid
2. Pesquise por "YouTube Downloader"
3. Clique em **Install**

### **Método 2: Docker Template Manual**
1. Vá para **Docker** no Unraid
2. Clique em **Add Container**
3. Configure os seguintes campos:

```
Name: YouTube-Downloader
Repository: youtube-downloader:latest
WebUI: http://[IP]:[PORT:8080]/
Icon URL: https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/youtube.png

Container Port: 80
Host Port: 8080

Container Path: /var/www/html/P/youtube
Host Path: /mnt/user/downloads/youtube
Access Mode: Read/Write

Environment Variables:
- PUID: 99
- PGID: 100
```

### **Método 3: Linha de Comando**
```bash
docker run -d \
  --name=youtube-downloader \
  -p 8080:80 \
  -v /mnt/user/downloads/youtube:/var/www/html/P/youtube \
  -e PUID=99 \
  -e PGID=100 \
  --restart unless-stopped \
  youtube-downloader:latest
```

## 📁 Configuração de Pastas Unraid

### **Caminhos recomendados:**
- **Downloads**: `/mnt/user/downloads/youtube`
- **WebUI**: `http://IP-DO-UNRAID:8080`

### **Permissões:**
```bash
# Via terminal Unraid
chown -R nobody:users /mnt/user/downloads/youtube
chmod -R 755 /mnt/user/downloads/youtube
```

## 🐳 Comandos Docker úteis

### Ver logs
```bash
docker-compose logs -f
```

### Parar container
```bash
docker-compose down
```

### Reiniciar container
```bash
docker-compose restart
```

### Entrar no container
```bash
docker exec -it youtube-downloader bash
```

### Verificar se yt-dlp está funcionando
```bash
docker exec -it youtube-downloader yt-dlp --version
```

## 📁 Estrutura do projeto

```
youtube-downloader/
├── Dockerfile              # Configuração da imagem Docker
├── docker-compose.yml      # Orquestração dos serviços
├── index.php              # Página principal
├── download.php           # Lógica de download
├── downloads/             # Pasta para os vídeos baixados
└── README.md             # Este arquivo
```

## 🔧 Configurações

### Pasta de download
- **Padrão**: `P:\youtube` (dentro do container)
- **Mapeada para**: `./downloads` (no host)

### Porta
- **Container**: 80
- **Host**: 8080

### Limites PHP
- `max_execution_time`: Ilimitado
- `memory_limit`: 512MB
- `post_max_size`: 100MB

## 🛠️ Personalização

### Alterar pasta de download
Edite o `docker-compose.yml`:
```yaml
volumes:
  - /sua/pasta/preferida:/var/www/html/P/youtube
```

### Alterar porta
Edite o `docker-compose.yml`:
```yaml
ports:
  - "sua_porta:80"
```

## 📋 Funcionalidades

✅ **Download em Full HD** (mínimo 1080p)  
✅ **Barra de progresso** em tempo real  
✅ **Título normalizado** do vídeo  
✅ **Validação** de URLs do YouTube  
✅ **Interface responsiva**  
✅ **Docker containerizado**  

## 🔍 Solução de problemas

### Container não inicia
```bash
docker-compose logs youtube-downloader
```

### Verificar se yt-dlp funciona
```bash
docker exec -it youtube-downloader yt-dlp --version
```

### Permissões de arquivo
```bash
sudo chown -R $USER:$USER downloads/
```

## 📦 Dependências incluídas

- **PHP 8.2** com Apache
- **yt-dlp** (última versão)
- **FFmpeg** para conversão de mídia
- **Python 3** para yt-dlp
- **Todas as bibliotecas** necessárias