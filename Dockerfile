# Multi-stage build para otimizar tamanho final
FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod ./
RUN go mod download

COPY . .
RUN go mod tidy && CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o youtube-downloader .

# Imagem final mínima
FROM alpine:3.19

# Instalar dependências essenciais e yt-dlp via GitHub (como media-roller)
RUN apk --no-cache add \
    curl \
    ffmpeg \
    ca-certificates \
    tzdata \
    python3 \
    && rm -rf /var/cache/apk/* \
    # Instalar yt-dlp diretamente do GitHub (sempre atualizado)
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && /usr/local/bin/yt-dlp --update --update-to nightly

# Criar usuário não-root
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Criar diretório temporário para downloads do servidor
RUN mkdir -p /tmp/downloads && \
    chown appuser:appuser /tmp/downloads

# Copiar binário do build stage
COPY --from=builder /app/youtube-downloader /usr/local/bin/
COPY --chown=appuser:appuser static/ /app/static/

USER appuser
WORKDIR /app

EXPOSE 8080

# Variáveis de ambiente
ENV GIN_MODE=release
ENV DOWNLOAD_PATH=/tmp/downloads

CMD ["youtube-downloader"]