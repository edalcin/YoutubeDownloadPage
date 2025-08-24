#!/bin/bash

echo "🎥 YouTube Downloader - Docker Setup"
echo "===================================="

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instale o Docker primeiro:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar se Docker Compose está disponível
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Instale o Docker Compose:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker encontrado"

# Criar pasta de downloads se não existir
mkdir -p downloads
echo "✅ Pasta downloads criada"

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down 2>/dev/null || true

# Construir e executar
echo "🏗️  Construindo imagem Docker..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d --build
else
    docker compose up -d --build
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Sucesso! YouTube Downloader está rodando!"
    echo ""
    echo "📍 Acesse: http://localhost:8080"
    echo "📁 Downloads em: ./downloads/"
    echo ""
    echo "📋 Comandos úteis:"
    echo "   Ver logs:    docker-compose logs -f"
    echo "   Parar:       docker-compose down"
    echo "   Reiniciar:   docker-compose restart"
    echo ""
    
    # Aguardar alguns segundos para container inicializar
    echo "⏳ Aguardando container inicializar..."
    sleep 5
    
    # Verificar se está funcionando
    if curl -s http://localhost:8080 > /dev/null; then
        echo "✅ Aplicação respondendo em http://localhost:8080"
        
        # Tentar abrir no navegador (Linux)
        if command -v xdg-open &> /dev/null; then
            echo "🌐 Abrindo navegador..."
            xdg-open http://localhost:8080
        fi
    else
        echo "⚠️  Aplicação pode estar ainda inicializando..."
        echo "   Tente acessar http://localhost:8080 em alguns segundos"
    fi
else
    echo "❌ Erro ao construir/executar container"
    echo "   Verifique os logs: docker-compose logs"
fi