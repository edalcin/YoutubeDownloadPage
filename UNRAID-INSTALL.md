# YouTube Downloader - Instalação Rápida no Unraid

## 🚀 Instalação em 5 Minutos

### Opção 1: Instalação Automática via Template
1. Abra a interface web do Unraid
2. Vá em **Docker** → **Add Container**
3. Em **Template**, cole esta URL:
   ```
   https://raw.githubusercontent.com/edalcin/YoutubeDownloadPage/main/unraid-template.xml
   ```
4. Clique em **Apply**
5. Pronto! Acesse `http://IP_UNRAID:8080`

### Opção 2: Configuração Manual Rápida

#### Passo 1: Adicionar Container
- Vá em **Docker** → **Add Container**

#### Passo 2: Preencher Campos Básicos
```
Container Name: YouTube-Downloader
Repository: ghcr.io/edalcin/youtubedownloadpage:latest
Network Type: bridge
```

#### Passo 3: Configurar Porta
```
Host Port: 8080
Container Port: 8080
Connection Type: TCP
```

#### Passo 4: Configurar Volume
```
Host Path: /mnt/user/downloads/youtube/
Container Path: /downloads
Access Mode: Read/Write
```

#### Passo 5: Adicionar Variáveis de Ambiente
Clique em **"Add another Path, Port, Variable, Label or Device"** para cada variável:

**Variável 1:**
```
Variable: TZ
Value: America/Sao_Paulo
```

**Variável 2:**
```
Variable: PUID
Value: 99
```

**Variável 3:**
```
Variable: PGID
Value: 100
```

#### Passo 6: Finalizar
1. Clique em **Apply**
2. Aguarde o download da imagem
3. Acesse `http://IP_DO_UNRAID:8080`

## ✅ Verificação Rápida

### Teste 1: Container Rodando
- Na aba Docker, verifique se mostra **"Started"** em verde

### Teste 2: Interface Web
- Abra: `http://IP_DO_UNRAID:8080`
- Deve aparecer a interface moderna do YouTube Downloader

### Teste 3: Download Teste
1. Cole uma URL do YouTube
2. Escolha a qualidade
3. Clique em **"Iniciar Download"**
4. Verifique se o arquivo aparece em `/mnt/user/downloads/youtube/`

## 🔧 Configuração de Valores

### Portas Comuns
Se a porta 8080 estiver ocupada, use uma dessas:
- `8081:8080`
- `9000:8080`
- `8999:8080`

### Caminhos de Download Sugeridos
```
/mnt/user/Media/YouTube/          # Para biblioteca de mídia
/mnt/user/downloads/youtube/      # Para downloads gerais
/mnt/user/appdata/youtube/        # Para dados de aplicação
```

### Fusos Horários Comuns
```
America/Sao_Paulo     # Brasil (Brasília)
America/Recife        # Brasil (Nordeste)
America/Manaus        # Brasil (Amazônia)
America/Rio_Branco    # Brasil (Acre)
America/New_York      # Estados Unidos (Leste)
Europe/London         # Reino Unido
Europe/Paris          # França/Alemanha
```

## 📱 Comando Docker Equivalente
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
  ghcr.io/edalcin/youtubedownloadpage:latest
```

## 🛠️ Solução Rápida de Problemas

### ❌ Container não inicia
**Solução:**
1. Verifique se a porta não está ocupada
2. Mude para outra porta (ex: 8081)
3. Certifique-se que `/mnt/user/downloads/youtube/` existe

### ❌ Não consegue acessar a interface
**Solução:**
1. Confirme o IP correto do Unraid
2. Teste: `http://IP_UNRAID:8080`
3. Verifique se container está "Started"

### ❌ Downloads não aparecem
**Solução:**
1. Verifique o mapeamento de volume
2. Certifique-se que o diretório existe
3. Confirme permissões com PUID=99 e PGID=100

### ❌ Erro de permissão
**Solução:**
1. Configure PUID=99 e PGID=100
2. Execute no terminal do Unraid:
   ```bash
   mkdir -p /mnt/user/downloads/youtube
   chown -R 99:100 /mnt/user/downloads/youtube
   ```

## 📋 Checklist de Instalação

- [ ] Container criado com nome "YouTube-Downloader"
- [ ] Imagem configurada: `ghcr.io/edalcin/youtubedownloadpage:latest`
- [ ] Rede configurada como "bridge"
- [ ] Porta mapeada: `8080:8080`
- [ ] Volume mapeado: `/mnt/user/downloads/youtube/:/downloads`
- [ ] Variável TZ configurada (ex: `America/Sao_Paulo`)
- [ ] Variável PUID configurada como `99`
- [ ] Variável PGID configurada como `100`
- [ ] Container iniciado com sucesso
- [ ] Interface acessível via browser
- [ ] Teste de download funcionando
- [ ] Arquivos aparecendo no diretório correto

## 🎯 Próximos Passos

Após a instalação:
1. **Bookmark** a interface: `http://IP_UNRAID:8080`
2. **Teste** com vídeos curtos primeiro
3. **Configure** qualidades preferidas
4. **Organize** seus downloads por pasta se necessário

## 📞 Precisa de Ajuda?

Consulte o arquivo **UNRAID_SETUP.md** para instruções mais detalhadas e solução completa de problemas.