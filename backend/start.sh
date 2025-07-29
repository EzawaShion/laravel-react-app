#!/bin/bash

# PHP-FPMをバックグラウンドで起動
php-fpm -D

# 少し待機
sleep 3

# Nginxをフォアグラウンドで実行
nginx -g "daemon off;"