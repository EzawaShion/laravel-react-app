<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */
    //APIエンドポイントでCORSを有効にする
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    //すべてのHTTPメソッドを許可
    'allowed_methods' => ['*'],
    //通信を許可するドメイン
    'allowed_origins' => ['http://localhost:5173', 'http://localhost:3000'],
    //通信を許可するドメインのパターン
    'allowed_origins_patterns' => [],
    //通信を許可するヘッダー
    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

]; 