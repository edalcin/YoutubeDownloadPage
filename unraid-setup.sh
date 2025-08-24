#!/bin/bash

# YouTube Downloader - Unraid Setup Script
# Este script faz build local e executa o container com configurações do Unraid

set -e

echo "🎥 YouTube Downloader - Unraid Setup"
echo "===================================="

# Verificar se Docker está disponível
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instale o Docker primeiro."
    exit 1
fi

echo "✅ Docker encontrado"

# Parar container existente se estiver rodando
echo "🛑 Parando container existente (se houver)..."
docker stop YouTube-Downloader 2>/dev/null || true
docker rm YouTube-Downloader 2>/dev/null || true

# Fazer build da imagem local
echo "🏗️  Fazendo build da imagem Docker..."
docker build -t youtube-downloader:local .

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    
    # Executar container com configurações do Unraid
    echo "🚀 Iniciando container..."
    docker run -d \
      --name='YouTube-Downloader' \
      --net='bridge' \
      --pids-limit 2048 \
      -e TZ="America/Sao_Paulo" \
      -e HOST_OS="Unraid" \
      -e HOST_HOSTNAME="Asilo" \
      -e HOST_CONTAINERNAME="YouTube-Downloader" \
      -e PUID=99 \
      -e PGID=100 \
      -l net.unraid.docker.managed=dockerman \
      -l net.unraid.docker.webui='http://192.168.1.10:8999' \
      -l net.unraid.docker.icon='https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/youtube.png' \
      -p 8999:80/tcp \
      -v '/mnt/user/PlexStorage/YouTube/':'/var/www/html/P/youtube':'rw' \
      youtube-downloader:local

    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Sucesso! YouTube Downloader está rodando!"
        echo ""
        echo "📍 WebUI: http://192.168.1.10:8999"
        echo "📁 Downloads: /mnt/user/PlexStorage/YouTube/"
        echo ""
        echo "📋 Comandos úteis:"
        echo "   Ver logs:      docker logs YouTube-Downloader"
        echo "   Parar:         docker stop YouTube-Downloader"
        echo "   Reiniciar:     docker restart YouTube-Downloader"
        echo "   Entrar no container: docker exec -it YouTube-Downloader bash"
        echo ""
        
        # Verificar se o container está rodando
        sleep 3
        if docker ps | grep -q YouTube-Downloader; then
            echo "✅ Container em execução"
        else
            echo "⚠️  Verificando logs do container..."
            docker logs YouTube-Downloader
        fi
    else
        echo "❌ Erro ao executar container"
        echo "   Verifique os logs: docker logs YouTube-Downloader"
    fi
else
    echo "❌ Erro no build da imagem"
    exit 1
fi