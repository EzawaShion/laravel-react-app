<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

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

// Google OAuth認証ルート
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
