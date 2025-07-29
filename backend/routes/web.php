<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// APIテスト用ルート
Route::get("/api/hello", function () {
    return response()->json([
        "message" => "Hello from Laravel API!",
        "timestamp" => now()
    ]);
});
