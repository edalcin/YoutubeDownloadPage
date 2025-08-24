# YouTube Downloader - Configuração Detalhada para Unraid

## 📋 Guia Completo de Instalação

### Passo 1: Acessar Docker no Unraid
1. Abra a interface web do Unraid no seu navegador
2. Clique na aba **"Docker"**
3. Clique no botão **"Add Container"**

### Passo 2: Configurar Container Básico

#### Nome do Container
```
Container Name: YouTube-Downloader
```

#### Imagem Docker
```
Repository: ghcr.io/edalcin/youtubedownloadpage:latest
```

### Passo 3: Configurar Rede
```
Network Type: bridge
```

### Passo 4: Configurar Portas

#### Porta da Interface Web
- **Container Port:** `8080`
- **Host Port:** `8080` (ou outra porta livre de sua escolha)
- **Connection Type:** TCP

**Exemplo completo:**
```
Port Mappings:
Host Port 8080 → Container Port 8080 (TCP)
```

### Passo 5: Configurar Volumes (Diretórios)

#### Volume de Downloads
- **Container Path:** `/downloads`
- **Host Path:** `/mnt/user/downloads/youtube/` 
- **Access Mode:** Read/Write

**Nota:** Ajuste o caminho `/mnt/user/downloads/youtube/` para onde você quer salvar os vídeos baixados.

**Exemplo completo:**
```
Volume Mappings:
/mnt/user/downloads/youtube/ → /downloads (Read/Write)
```

### Passo 6: Configurar Variáveis de Ambiente

#### Variáveis Obrigatórias

**TZ (Timezone)**
- **Variable:** `TZ`
- **Value:** `America/Sao_Paulo`
- **Description:** Define o fuso horário do container

**PUID (User ID)**
- **Variable:** `PUID`
- **Value:** `99`
- **Description:** ID do usuário para permissões de arquivo (padrão nobody do Unraid)

**PGID (Group ID)**
- **Variable:** `PGID`
- **Value:** `100`
- **Description:** ID do grupo para permissões de arquivo (padrão users do Unraid)

#### Variáveis Opcionais

**GIN_MODE (Modo do Servidor)**
- **Variable:** `GIN_MODE`
- **Value:** `release`
- **Description:** Modo de execução do servidor (release/debug)

**DOWNLOAD_PATH (Caminho Interno)**
- **Variable:** `DOWNLOAD_PATH`
- **Value:** `/downloads`
- **Description:** Caminho interno onde salvar downloads (não altere)

### Passo 7: Configurações Avançadas

#### Docker Hub URL
```
Docker Hub URL: https://hub.docker.com/
```

#### WebUI
```
WebUI: http://[IP]:[PORT:8080]/
```

#### Icon URL
```
Icon URL: https://raw.githubusercontent.com/edalcin/YoutubeDownloadPage/main/icon.png
```

#### Extra Parameters (Opcional)
```
--restart=unless-stopped
```

### Passo 8: Finalizar Instalação
1. Clique em **"Apply"**
2. Aguarde o download da imagem (primeira vez pode demorar alguns minutos)
3. O container será iniciado automaticamente

## 🔧 Resumo da Configuração

### Configuração Mínima Necessária
```
Nome: YouTube-Downloader
Imagem: ghcr.io/edalcin/youtubedownloadpage:latest
Rede: bridge
Porta: 8080:8080 (TCP)
Volume: /mnt/user/downloads/youtube/:/downloads (RW)
Variáveis:
  - TZ=America/Sao_Paulo
  - PUID=99
  - PGID=100
```

### Exemplo de Comando Docker Equivalente
```bash
docker run -d \
  --name=YouTube-Downloader \
  --net=bridge \
  --restart=unless-stopped \
  -p 8080:8080 \
  -v /mnt/user/downloads/youtube/:/downloads \
  -e TZ=America/Sao_Paulo \
  -e PUID=99 \
  -e PGID=100 \
  -e GIN_MODE=release \
  ghcr.io/edalcin/youtubedownloadpage:latest
```

## ✅ Verificação da Instalação

### 1. Verificar Status do Container
- No painel Docker do Unraid, verifique se o container aparece com status **"Started"**

### 2. Testar Interface Web
- Abra o navegador e acesse: `http://IP_DO_UNRAID:8080`
- Você deve ver a interface moderna do YouTube Downloader

### 3. Testar Health Check
- Acesse: `http://IP_DO_UNRAID:8080/health`
- Deve retornar: `{"status":"ok","timestamp":...}`

### 4. Verificar Logs
- No painel Docker, clique no ícone de logs do container
- Deve mostrar algo como:
```
Servidor iniciando na porta 8080
Diretório de downloads: /downloads
```

## 🛠️ Solução de Problemas

### Container não inicia
- Verifique se a porta 8080 não está em uso
- Certifique-se de que o diretório de downloads existe
- Verifique os logs do container

### Não consegue acessar a interface
- Confirme o IP do Unraid
- Verifique se a porta está correta
- Teste usando `IP_UNRAID:PORTA_ESCOLHIDA`

### Problemas de permissão
- Verifique se PUID e PGID estão configurados como 99 e 100
- Certifique-se de que o diretório de downloads tem permissões corretas

### Downloads não aparecem
- Verifique se o volume está mapeado corretamente
- Confirme o caminho do host (`/mnt/user/downloads/youtube/`)
- Teste fazer um download pequeno primeiro

## 📝 Notas Importantes

1. **Primeira execução:** O download da imagem pode demorar alguns minutos
2. **Fuso horário:** Ajuste a variável TZ para seu fuso horário local
3. **Caminho de downloads:** Certifique-se de que o diretório existe antes de iniciar
4. **Porta:** Se 8080 estiver ocupada, use outra porta livre (ex: 8081, 9000, etc)
5. **Atualizações:** O container será atualizado automaticamente quando você recriar com :latest