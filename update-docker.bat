@echo off
REM Script para atualizar o container Docker do YouTube Downloader
REM Execute no servidor onde o Docker está rodando (Windows)

echo === Atualizando YouTube Downloader Docker ===
echo.

REM 1. Parar e remover container antigo
echo 1. Parando container antigo...
docker stop YouTube-Downloader 2>nul
docker rm YouTube-Downloader 2>nul

REM 2. Remover imagem antiga
echo 2. Removendo imagem antiga...
docker rmi ghcr.io/edalcin/youtubedownloadpage:latest 2>nul

REM 3. Fazer pull da nova imagem
echo 3. Baixando nova imagem do ghcr.io...
docker pull ghcr.io/edalcin/youtubedownloadpage:latest

REM 4. Iniciar novo container
echo 4. Iniciando novo container...
docker run -d ^
  --name=YouTube-Downloader ^
  --restart=unless-stopped ^
  -p 8999:8080 ^
  -v "%USERPROFILE%\Downloads\youtube:/downloads" ^
  -e TZ=America/Sao_Paulo ^
  ghcr.io/edalcin/youtubedownloadpage:latest

REM 5. Verificar se está rodando
echo 5. Verificando status...
timeout /t 2 /nobreak >nul
docker ps | findstr YouTube-Downloader

echo.
echo === Atualizacao concluida! ===
echo Acesse: http://localhost:8999
echo.
echo Para ver os logs:
echo   docker logs -f YouTube-Downloader
echo.
pause
