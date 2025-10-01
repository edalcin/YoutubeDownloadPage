#!/bin/bash

# Script para atualizar o container Docker do YouTube Downloader
# Execute no servidor onde o Docker está rodando

echo "=== Atualizando YouTube Downloader Docker ==="

# 1. Parar e remover container antigo
echo "1. Parando container antigo..."
docker stop YouTube-Downloader 2>/dev/null || true
docker rm YouTube-Downloader 2>/dev/null || true

# 2. Remover imagem antiga
echo "2. Removendo imagem antiga..."
docker rmi ghcr.io/edalcin/youtubedownloadpage:latest 2>/dev/null || true

# 3. Fazer pull da nova imagem
echo "3. Baixando nova imagem do ghcr.io..."
docker pull ghcr.io/edalcin/youtubedownloadpage:latest

# 4. Iniciar novo container
echo "4. Iniciando novo container..."
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

# 5. Verificar se está rodando
echo "5. Verificando status..."
sleep 2
docker ps | grep YouTube-Downloader

echo ""
echo "=== Atualização concluída! ==="
echo "Acesse: http://192.168.1.10:8999"
echo ""
echo "Para ver os logs:"
echo "  docker logs -f YouTube-Downloader"
