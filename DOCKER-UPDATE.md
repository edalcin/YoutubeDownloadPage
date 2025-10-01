# Como Atualizar o Docker

## Método 1: Script Automático

### Linux/Mac/Unraid
```bash
chmod +x update-docker.sh
./update-docker.sh
```

### Windows
```batch
update-docker.bat
```

## Método 2: Comandos Manuais

### 1. Parar e remover o container antigo
```bash
docker stop YouTube-Downloader
docker rm YouTube-Downloader
```

### 2. Remover a imagem antiga (opcional, mas recomendado)
```bash
docker rmi ghcr.io/edalcin/youtubedownloadpage:latest
```

### 3. Baixar a nova imagem
```bash
docker pull ghcr.io/edalcin/youtubedownloadpage:latest
```

### 4. Iniciar o novo container

#### Linux/Mac/Unraid
```bash
docker run -d \
  --name=YouTube-Downloader \
  --net=bridge \
  --restart=unless-stopped \
  -p 8999:8080 \
  -v /mnt/user/downloads/youtube/:/downloads \
  -e TZ=America/Sao_Paulo \
  -e PUID=99 \
  -e PGID=100 \
  ghcr.io/edalcin/youtubedownloadpage:latest
```

#### Windows
```bash
docker run -d ^
  --name=YouTube-Downloader ^
  --restart=unless-stopped ^
  -p 8999:8080 ^
  -v "%USERPROFILE%\Downloads\youtube:/downloads" ^
  -e TZ=America/Sao_Paulo ^
  ghcr.io/edalcin/youtubedownloadpage:latest
```

### 5. Verificar se está rodando
```bash
docker ps | grep YouTube-Downloader
```

### 6. Ver os logs (opcional)
```bash
docker logs -f YouTube-Downloader
```

## Verificação

Após atualizar, acesse:
- **Local**: http://localhost:8999
- **Rede**: http://192.168.1.10:8999 (substitua pelo IP do seu servidor)

## Troubleshooting

### Container não inicia
```bash
# Ver logs detalhados
docker logs YouTube-Downloader

# Verificar se a porta está em uso
netstat -tulpn | grep 8999  # Linux
netstat -ano | findstr :8999  # Windows
```

### Problemas de permissão no volume
```bash
# Linux/Unraid - ajustar permissões do diretório
sudo chown -R 99:100 /mnt/user/downloads/youtube/
sudo chmod -R 755 /mnt/user/downloads/youtube/
```

### Forçar recriação completa
```bash
# Remover tudo e começar do zero
docker stop YouTube-Downloader
docker rm YouTube-Downloader
docker rmi ghcr.io/edalcin/youtubedownloadpage:latest
docker pull ghcr.io/edalcin/youtubedownloadpage:latest
# Depois execute o comando de run novamente
```

## Notas

- **Porta**: O container usa a porta 8080 internamente, mas pode ser mapeada para qualquer porta externa (ex: 8999)
- **Volume**: Ajuste o caminho `/mnt/user/downloads/youtube/` para o diretório desejado no seu sistema
- **Timezone**: Ajuste `TZ=America/Sao_Paulo` para sua timezone
- **PUID/PGID**: Use `99:100` para Unraid, ou ajuste para seu usuário (Linux: execute `id` para ver seus IDs)
