FROM php:8.2-apache

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    curl \
    wget \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Instalar yt-dlp
RUN pip3 install yt-dlp

# Habilitar mod_rewrite do Apache
RUN a2enmod rewrite

# Configurar PHP
RUN echo "max_execution_time = 0" >> /usr/local/etc/php/conf.d/custom.ini && \
    echo "max_input_time = 0" >> /usr/local/etc/php/conf.d/custom.ini && \
    echo "memory_limit = 512M" >> /usr/local/etc/php/conf.d/custom.ini && \
    echo "post_max_size = 100M" >> /usr/local/etc/php/conf.d/custom.ini && \
    echo "upload_max_filesize = 100M" >> /usr/local/etc/php/conf.d/custom.ini

# Criar diretório para downloads
RUN mkdir -p /var/www/html/P/youtube && \
    chown -R www-data:www-data /var/www/html/P && \
    chmod -R 755 /var/www/html/P

# Configurar Apache para permitir .htaccess
RUN echo '<Directory /var/www/html/>' >> /etc/apache2/apache2.conf && \
    echo '    AllowOverride All' >> /etc/apache2/apache2.conf && \
    echo '</Directory>' >> /etc/apache2/apache2.conf

# Copiar arquivos da aplicação
COPY . /var/www/html/

# Copiar script de inicialização Docker
COPY docker-start.sh /usr/local/bin/docker-start.sh
RUN chmod +x /usr/local/bin/docker-start.sh

# Definir permissões
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

# Verificar se yt-dlp está funcionando
RUN yt-dlp --version

# Expor porta 80
EXPOSE 80

# Variáveis de ambiente padrão
ENV PUID=1000
ENV PGID=1000

# Comando para iniciar com script personalizado
CMD ["/usr/local/bin/docker-start.sh"]