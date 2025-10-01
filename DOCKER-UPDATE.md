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
  -e TZ=America/Sao_Paulo \
  ghcr.io/edalcin/youtubedownloadpage:latest
```

#### Windows
```bash
docker run -d ^
  --name=YouTube-Downloader ^
  --restart=unless-stopped ^
  -p 8999:8080 ^
  -e TZ=America/Sao_Paulo ^
  ghcr.io/edalcin/youtubedownloadpage:latest
```

**Nota:** Não é necessário mapear volumes (`-v`). Os arquivos são salvos diretamente no computador do usuário através do navegador.

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
- **Timezone**: Ajuste `TZ=America/Sao_Paulo` para sua timezone
- **Downloads**: Os arquivos são salvos diretamente no computador do usuário através do navegador (não há volumes mapeados)
