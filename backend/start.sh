#!/bin/bash

# PHP-FPMをバックグラウンドで起動
php-fpm -D

# PHP-FPMが起動するまで少し待機
sleep 2

# Nginxを起動
service nginx start

# フォアグラウンドでNginxを実行（コンテナを維持）
nginx -g "daemon off;" 