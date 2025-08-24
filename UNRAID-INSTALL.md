# 🖥️ YouTube Downloader - Instalação Unraid

## 📋 Passo a Passo Completo

### **1. Construir a Imagem Docker**
No terminal do Unraid:
```bash
# Navegar para a pasta do projeto
cd /mnt/user/appdata/youtube-downloader

# Construir a imagem
docker build -t youtube-downloader:latest .
```

### **2. Criar Container via Interface Web**

**Vá para Docker → Add Container e configure:**

| Campo | Valor |
|-------|-------|
| **Name** | `YouTube-Downloader` |
| **Repository** | `youtube-downloader:latest` |
| **Network Type** | `Bridge` |
| **Console shell command** | `Bash` |
| **Privileged** | `No` |

### **3. Configurar Portas**

| Variável | Valor |
|----------|-------|
| **Container Port** | `80` |
| **Host Port** | `8080` |
| **Connection Type** | `TCP` |

### **4. Configurar Volumes**

| Variável | Valor |
|----------|-------|
| **Container Path** | `/var/www/html/P/youtube` |
| **Host Path** | `/mnt/user/downloads/youtube` |
| **Access Mode** | `Read/Write - Slave` |

### **5. Variáveis de Ambiente (Opcionais)**

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `PUID` | `99` | User ID do Unraid |
| `PGID` | `100` | Group ID do Unraid |
| `TZ` | `America/Sao_Paulo` | Timezone |

### **6. Configurações Avançadas**

```
WebUI: http://[IP]:[PORT:8080]/
Icon URL: https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/youtube.png
Extra Parameters: --restart=unless-stopped
```

### **7. Aplicar e Iniciar**
1. Clique em **Apply**
2. Aguarde o container ser criado
3. Clique em **Start**

## 🌐 Acesso

- **WebUI**: `http://IP-DO-UNRAID:8080`
- **Downloads**: `/mnt/user/downloads/youtube`

## 🔧 Comandos Úteis Unraid

### Ver logs do container
```bash
docker logs youtube-downloader -f
```

### Entrar no container
```bash
docker exec -it youtube-downloader bash
```

### Reiniciar container
```bash
docker restart youtube-downloader
```

### Parar container
```bash
docker stop youtube-downloader
```

### Remover container
```bash
docker stop youtube-downloader
docker rm youtube-downloader
```

## 📁 Estrutura de Arquivos Unraid

```
/mnt/user/appdata/youtube-downloader/
├── Dockerfile
├── docker-compose.yml
├── index.php
├── download.php
└── downloads/ → /mnt/user/downloads/youtube
```

## ⚠️ Solução de Problemas

### Container não inicia
```bash
docker logs youtube-downloader
```

### Problemas de permissão
```bash
chown -R nobody:users /mnt/user/downloads/youtube
chmod -R 755 /mnt/user/downloads/youtube
```

### yt-dlp não funciona
```bash
docker exec -it youtube-downloader yt-dlp --version
```

### Verificar se porta está livre
```bash
netstat -tuln | grep 8080
```

## 🔄 Atualização

Para atualizar o container:
```bash
# Parar container
docker stop youtube-downloader

# Reconstruir imagem
docker build -t youtube-downloader:latest . --no-cache

# Reiniciar container
docker start youtube-downloader
```