<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * ユーザー検索
     */
    public function search(Request $request)
    {
        try {
            $query = User::query();

            // キーワード検索（名前、ユーザー名）
            if ($request->filled('keyword')) {
                $keyword = $request->keyword;
                $query->where(function($q) use ($keyword) {
                    $q->where('name', 'LIKE', "%{$keyword}%")
                      ->orWhere('username', 'LIKE', "%{$keyword}%");
                });
            }

            // フォロワー数順でソート
            $users = $query->withCount('followers')
                          ->orderBy('followers_count', 'desc')
                          ->get()
                          ->map(function ($user) {
                              // アバター画像のURLを生成
                              $avatarUrl = '/images/default-avatar.svg';
                              if ($user->profile_image) {
                                  $avatarUrl = url('storage/' . $user->profile_image);
                              }
                              
                              return [
                                  'id' => $user->id,
                                  'name' => $user->name,
                                  'username' => $user->username,
                                  'email' => $user->email,
                                  'profile' => $user->bio,
                                  'profile_image_url' => $avatarUrl,
                                  'avatar_url' => $avatarUrl, // 後方互換性のため
                                  'location' => $user->location,
                                  'followers_count' => $user->followers_count,
                                  'is_following' => Auth::check() ? Auth::user()->followings->contains($user->id) : false,
                              ];
                          });

            return response()->json([
                'success' => true,
                'users' => $users
            ]);
        } catch (\Exception $e) {
            \Log::error('ユーザー検索エラー: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'ユーザーの検索に失敗しました'
            ], 500);
        }
    }

    /**
     * ユーザー詳細取得
     */
    public function show($id)
    {
        try {
            $user = User::withCount(['followers', 'followings', 'posts'])
                       ->findOrFail($id);

            // アバター画像のURLを生成
            $avatarUrl = '/images/default-avatar.svg';
            if ($user->profile_image) {
                $avatarUrl = url('storage/' . $user->profile_image);
            }

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'profile' => $user->bio,
                    'profile_image_url' => $avatarUrl,
                    'avatar_url' => $avatarUrl, // 後方互換性のため
                    'location' => $user->location,
                    'followers_count' => $user->followers_count,
                    'followings_count' => $user->followings_count,
                    'posts_count' => $user->posts_count,
                    'is_following' => Auth::check() ? Auth::user()->followings->contains($user->id) : false,
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('ユーザー詳細取得エラー: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'ユーザー情報の取得に失敗しました'
            ], 500);
        }
    }

    /**
     * フォロー/フォロー解除
     */
    public function toggleFollow(Request $request, $id)
    {
        try {
            $user = Auth::user();
            $targetUser = User::findOrFail($id);

            if ($user->id === $targetUser->id) {
                return response()->json([
                    'success' => false,
                    'message' => '自分自身をフォローすることはできません'
                ], 400);
            }

            $isFollowing = $user->following->contains($id);

            if ($isFollowing) {
                // フォロー解除
                $user->following()->detach($id);
                $message = 'フォローを解除しました';
            } else {
                // フォロー
                $user->following()->attach($id);
                $message = 'フォローしました';
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'is_following' => !$isFollowing
            ]);
        } catch (\Exception $e) {
            \Log::error('フォロー切り替えエラー: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'フォローの切り替えに失敗しました'
            ], 500);
        }
    }
}

