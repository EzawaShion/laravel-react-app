FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev zip unzip git curl \
    default-mysql-client \
    nginx \
    && docker-php-ext-install pdo_mysql

# Composerを追加
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Nginxの設定
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/sites-available/default

# 起動スクリプトを作成
COPY start.sh /start.sh
RUN chmod +x /start.sh

WORKDIR /var/www/html

EXPOSE 80

CMD ["/start.sh"]
