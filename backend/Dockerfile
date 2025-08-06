FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev zip unzip git curl \
    default-mysql-client \
    nginx \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql gd exif

# Composerを追加
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# PHP設定をカスタマイズ（ファイルアップロード制限を緩和）
RUN echo "upload_max_filesize = 20M" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "post_max_size = 20M" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "max_file_uploads = 20" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "memory_limit = 512M" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "max_execution_time = 300" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "set_time_limit(300);" >> /usr/local/etc/php/conf.d/uploads.ini

# Nginxの設定
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/sites-available/default

# 起動スクリプトを作成
COPY start.sh /start.sh
RUN chmod +x /start.sh

WORKDIR /var/www/html

EXPOSE 80

CMD ["/start.sh"]
