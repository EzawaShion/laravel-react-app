<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\PhotoGroupController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\LikeController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware("auth:sanctum")->get("/user", function (Request $request) {
    return $request->user();
});

// 認証関連のルート
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/email/verification-notification', [AuthController::class, 'resendVerificationEmail']);

// 地域関連のルート
Route::get('/prefectures', [LocationController::class, 'getPrefectures']);
Route::get('/cities/{prefectureId}', [LocationController::class, 'getCitiesByPrefecture']);
Route::get('/locations', [LocationController::class, 'getAllLocations']);

// パスワードリセット関連のルート
Route::post('/password/email', [PasswordResetController::class, 'sendResetLink']);
Route::post('/password/reset', [PasswordResetController::class, 'reset']);

// 投稿関連のルート（読み取りは認証不要）
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{id}', [PostController::class, 'show']);

// 写真関連のルート（読み取りは認証不要）
Route::get('/photos/post/{postId}', [PhotoController::class, 'getByPost']);
Route::get('/photos/{id}', [PhotoController::class, 'show']);
Route::get('/photo-groups/post/{postId}', [PhotoGroupController::class, 'getByPost']);
Route::get('/photo-groups/{id}', [PhotoGroupController::class, 'show']);

// 認証が必要なルート
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // 投稿関連のルート（作成・更新・削除は認証必要）
    Route::post('/posts', [PostController::class, 'store']);
    Route::put('/posts/{id}', [PostController::class, 'update']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    
    // 写真関連のルート（作成・更新・削除は認証必要）
    Route::post('/photos/upload', [PhotoController::class, 'upload']);
    Route::put('/photos/{id}', [PhotoController::class, 'update']);
    Route::delete('/photos/{id}', [PhotoController::class, 'destroy']);
    Route::post('/photos/reorder', [PhotoController::class, 'reorder']);
    
    // 写真グループ関連のルート
    Route::post('/photo-groups', [PhotoGroupController::class, 'store']);
    Route::put('/photo-groups/{id}', [PhotoGroupController::class, 'update']);
    Route::delete('/photo-groups/{id}', [PhotoGroupController::class, 'destroy']);
    Route::post('/photo-groups/reorder', [PhotoGroupController::class, 'reorder']);
    
    // プロフィール関連のルート
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile', [ProfileController::class, 'update']); // POSTリクエストにも対応
    Route::get('/profile/posts', [ProfileController::class, 'posts']);
    
    // フォロー関連のルート
    Route::post('/follow', [FollowController::class, 'follow']);
    Route::post('/unfollow', [FollowController::class, 'unfollow']);
    Route::get('/follow/status/{userId}', [FollowController::class, 'getFollowStatus']);
    Route::get('/follow/followers/{userId}', [FollowController::class, 'getFollowers']);
    Route::get('/follow/followings/{userId}', [FollowController::class, 'getFollowings']);
    
    // いいね関連のルート
    Route::post('/like', [LikeController::class, 'like']);
    Route::get('/like/status/{postId}', [LikeController::class, 'getLikeStatus']);
    Route::get('/like/post/{postId}', [LikeController::class, 'getPostLikes']);
});

// テスト用のAPIエンドポイント
Route::get("/hello", function () {
    return response()->json([
        "message" => "Hello from Laravel API!",
        "timestamp" => now()
    ]);
});