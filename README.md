# 🎥 YouTube Downloader - Docker

Sistema completo para download de vídeos do YouTube em Full HD usando Docker.

## 🚀 Instalação Rápida (Build Local)

Para usar imediatamente, faça o build local:

```bash
git clone https://github.com/edalcin/YoutubeDownloadPage.git
cd YoutubeDownloadPage
docker build -t youtube-downloader:local .
docker run -d -p 8080:80 -v ./downloads:/var/www/html/P/youtube youtube-downloader:local
```

Acesse: http://localhost:8080

## 🖥️ Instalação no Unraid

### **Método 1: Community Applications (Recomendado)**
1. Vá para **Apps** no Unraid
2. Pesquise por "YouTube Downloader"
3. Clique em **Install**

> **Nota**: A imagem Docker será publicada automaticamente no GitHub Container Registry como `ghcr.io/edalcin/youtubedownloadpage:latest` após o próximo push. Enquanto isso, você pode fazer build local usando o método 4.

### **Método 2: Docker Template Manual**
1. Vá para **Docker** no Unraid
2. Clique em **Add Container**
3. Configure os seguintes campos:

```
Name: YouTube-Downloader
Repository: ghcr.io/edalcin/youtubedownloadpage:latest
WebUI: http://[IP]:[HOST_PORT]/
Icon URL: https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/youtube.png

Container Port: 80
Host Port: [SUA_PORTA] (ex: 8080)

Container Path: /var/www/html/P/youtube
Host Path: [SUA_PASTA] (ex: /mnt/user/downloads/youtube)
Access Mode: Read/Write

Environment Variables:
- PUID: 99
- PGID: 100
- HOST_PORT: [SUA_PORTA] (opcional, padrão: 8080)
- DOWNLOAD_PATH: [SUA_PASTA] (opcional, usado no docker-compose)
```

### **Método 3: Docker Compose**
1. Baixe os arquivos do repositório:
```bash
wget https://raw.githubusercontent.com/edalcin/YoutubeDownloadPage/main/docker-compose.yml
wget https://raw.githubusercontent.com/edalcin/YoutubeDownloadPage/main/.env.example
```

2. Configure as variáveis (opcional):
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações específicas
```

3. Execute o container:
```bash
docker-compose up -d
```

### **Método 4: Linha de Comando**

#### **Opção A: Usando imagem pré-construída (após publicação)**
```bash
# Exemplo básico
docker run -d \
  --name=youtube-downloader \
  -p 8080:80 \
  -v ./downloads:/var/www/html/P/youtube \
  --restart unless-stopped \
  ghcr.io/edalcin/youtubedownloadpage:latest

# Exemplo para Unraid (com PUID/PGID personalizados)
docker run -d \
  --name=youtube-downloader \
  -p 8080:80 \
  -v /mnt/user/downloads/youtube:/var/www/html/P/youtube \
  -e PUID=99 \
  -e PGID=100 \
  --restart unless-stopped \
  ghcr.io/edalcin/youtubedownloadpage:latest
```

#### **Opção B: Build local (disponível agora)**
```bash
# 1. Clone o repositório
git clone https://github.com/edalcin/YoutubeDownloadPage.git
cd YoutubeDownloadPage

# 2. Fazer build da imagem
docker build -t youtube-downloader:local .

# 3. Executar container (exemplo Unraid)
docker run -d \
  --name=youtube-downloader \
  -p 8999:80 \
  -v /mnt/user/PlexStorage/YouTube:/var/www/html/P/youtube \
  -e PUID=99 \
  -e PGID=100 \
  -e TZ=America/Sao_Paulo \
  --restart unless-stopped \
  youtube-downloader:local
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

### Variáveis de Ambiente

| Variável | Descrição | Padrão | Exemplo Unraid |
|----------|-----------|--------|----------------|
| `HOST_PORT` | Porta do host para acessar a aplicação | `8080` | `8080` |
| `DOWNLOAD_PATH` | Caminho local para salvar os downloads | `./downloads` | `/mnt/user/downloads/youtube` |
| `PUID` | ID do usuário para permissões de arquivo | `1000` | `99` |
| `PGID` | ID do grupo para permissões de arquivo | `1000` | `100` |

### Pasta de download
- **Padrão**: `P:\youtube` (dentro do container)
- **Mapeada para**: `./downloads` (no host) ou `$DOWNLOAD_PATH`

### Porta
- **Container**: 80
- **Host**: `$HOST_PORT` (padrão: 8080)

### Limites PHP
- `max_execution_time`: Ilimitado
- `memory_limit`: 512MB
- `post_max_size`: 100MB

## 🛠️ Personalização

### Usando arquivo .env (Recomendado)
1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env`:
```bash
# Exemplo para Unraid
HOST_PORT=8080
DOWNLOAD_PATH=/mnt/user/downloads/youtube
PUID=99
PGID=100
```

### Alterar pasta de download (manual)
Edite o `docker-compose.yml`:
```yaml
volumes:
  - /sua/pasta/preferida:/var/www/html/P/youtube
```

### Alterar porta (manual)
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