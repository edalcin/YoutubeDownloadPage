#!/bin/bash

echo "🎥 YouTube Downloader - Build para Unraid"
echo "========================================"

# Verificar se estamos no diretório correto
if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile não encontrado. Execute no diretório correto."
    exit 1
fi

echo "✅ Dockerfile encontrado"

# Limpar imagens antigas
echo "🧹 Removendo imagens antigas..."
docker rmi youtube-downloader:latest 2>/dev/null || true

# Construir nova imagem
echo "🏗️  Construindo imagem Docker..."
docker build -t youtube-downloader:latest . --no-cache

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Imagem construída com sucesso!"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Vá para Docker no Unraid"
    echo "2. Clique em 'Add Container'"
    echo "3. Use 'youtube-downloader:latest' como Repository"
    echo "4. Configure porta 8080:80"
    echo "5. Mapeie volume /mnt/user/downloads/youtube:/var/www/html/P/youtube"
    echo ""
    echo "🌐 Acesso: http://IP-DO-UNRAID:8080"
    echo ""
    
    # Mostrar informações da imagem
    echo "📊 Informações da imagem:"
    docker images youtube-downloader:latest
    
else
    echo "❌ Erro ao construir imagem"
    echo "   Verifique os logs acima"
fi