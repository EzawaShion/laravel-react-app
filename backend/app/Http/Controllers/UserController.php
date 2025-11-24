<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\PrefectureFavoritePhoto;
use App\Models\Photo;
use App\Models\Prefecture;

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

    public function getMapData($id)
    {
        try {
            $user = User::findOrFail($id);

            $posts = $user->posts()
                ->with(['city.prefecture', 'photos'])
                ->orderBy('created_at', 'asc')
                ->get();

            $prefectures = [];

            foreach ($posts as $post) {
                $prefecture = optional($post->city)->prefecture;

                if (!$prefecture) {
                    continue;
                }

                if (!isset($prefectures[$prefecture->id])) {
                    $prefectures[$prefecture->id] = [
                        'id' => $prefecture->id,
                        'name' => $prefecture->name,
                        'code' => $prefecture->code,
                        'visit_count' => 0,
                        'first_visit' => null,
                        'last_visit' => null,
                        'photos' => [],
                        'favorite_photo' => null,
                        '_photo_index' => [],
                    ];
                }

                $prefectureData = &$prefectures[$prefecture->id];
                $prefectureData['visit_count']++;

                if ($post->created_at) {
                    $createdAt = $post->created_at->toDateTimeString();

                    if (!$prefectureData['first_visit'] || $createdAt < $prefectureData['first_visit']) {
                        $prefectureData['first_visit'] = $createdAt;
                    }

                    if (!$prefectureData['last_visit'] || $createdAt > $prefectureData['last_visit']) {
                        $prefectureData['last_visit'] = $createdAt;
                    }
                }

                foreach ($post->photos as $photo) {
                    if (isset($prefectureData['_photo_index'][$photo->id])) {
                        continue;
                    }

                    $prefectureData['_photo_index'][$photo->id] = true;

                    $prefectureData['photos'][] = [
                        'id' => $photo->id,
                        'post_id' => $post->id,
                        'title' => $photo->title,
                        'description' => $photo->description,
                        'url' => $photo->image_url ?? ($photo->file_path ? url('storage/' . $photo->file_path) : null),
                        'thumbnail_url' => $photo->thumbnail_url ?? ($photo->file_path ? url('storage/' . $photo->file_path) : null),
                    ];
                }
            }

            if (!empty($prefectures)) {
                $favoritePhotos = PrefectureFavoritePhoto::where('user_id', $user->id)
                    ->whereIn('prefecture_id', array_keys($prefectures))
                    ->with('photo')
                    ->get();

                foreach ($favoritePhotos as $favorite) {
                    $photo = $favorite->photo;

                    if (!$photo || !isset($prefectures[$favorite->prefecture_id])) {
                        continue;
                    }

                    $prefectures[$favorite->prefecture_id]['favorite_photo'] = [
                        'id' => $photo->id,
                        'post_id' => $photo->post_id,
                        'title' => $photo->title,
                        'url' => $photo->image_url ?? ($photo->file_path ? url('storage/' . $photo->file_path) : null),
                        'thumbnail_url' => $photo->thumbnail_url ?? ($photo->file_path ? url('storage/' . $photo->file_path) : null),
                        'display_position' => $favorite->display_position ?? 'center',
                        'position_x' => $favorite->position_x ?? 50,
                        'position_y' => $favorite->position_y ?? 50,
                        'scale' => $favorite->scale ?? 1.0,
                    ];
                }
            }

            foreach ($prefectures as &$prefectureData) {
                unset($prefectureData['_photo_index']);
            }

            ksort($prefectures);

            return response()->json([
                'success' => true,
                'prefectures' => array_values($prefectures),
                'total_prefectures' => Prefecture::count(),
                'total_visited' => count($prefectures),
            ]);
        } catch (\Exception $e) {
            \Log::error('ユーザー地図データ取得エラー: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => '地図データの取得に失敗しました'
            ], 500);
        }
    }

    public function setFavoritePhoto(Request $request, $id)
    {
        try {
            $authUser = Auth::user();

            if (!$authUser || (int) $authUser->id !== (int) $id) {
                return response()->json([
                    'success' => false,
                    'message' => 'お気に入り写真を更新できません'
                ], 403);
            }

            $validated = $request->validate([
                'prefecture_id' => 'required|integer|exists:prefectures,id',
                'photo_id' => 'required|integer|exists:photos,id',
                'display_position' => 'nullable|string',
                'position_x' => 'nullable|integer|min:0|max:100',
                'position_y' => 'nullable|integer|min:0|max:100',
                'scale' => 'nullable|numeric|min:0.1|max:5.0',
            ]);

            $photo = Photo::with(['post.city.prefecture'])->findOrFail($validated['photo_id']);

            if (!$photo->post || (int) $photo->post->user_id !== (int) $authUser->id) {
                return response()->json([
                    'success' => false,
                    'message' => '指定した写真は自身の投稿ではありません'
                ], 403);
            }

            $prefecture = optional(optional($photo->post)->city)->prefecture;

            if (!$prefecture || (int) $prefecture->id !== (int) $validated['prefecture_id']) {
                return response()->json([
                    'success' => false,
                    'message' => '写真と都道府県が一致しません'
                ], 422);
            }

            $favorite = PrefectureFavoritePhoto::updateOrCreate(
                [
                    'user_id' => $authUser->id,
                    'prefecture_id' => $validated['prefecture_id'],
                ],
                [
                    'photo_id' => $photo->id,
                    'display_position' => $validated['display_position'] ?? 'custom',
                    'position_x' => $validated['position_x'] ?? 50,
                    'position_y' => $validated['position_y'] ?? 50,
                    'scale' => $validated['scale'] ?? 1.0,
                ]
            );

            return response()->json([
                'success' => true,
                'favorite_photo' => [
                    'id' => $photo->id,
                    'post_id' => $photo->post_id,
                    'title' => $photo->title,
                    'url' => $photo->image_url ?? ($photo->file_path ? url('storage/' . $photo->file_path) : null),
                    'thumbnail_url' => $photo->thumbnail_url ?? ($photo->file_path ? url('storage/' . $photo->file_path) : null),
                    'display_position' => $favorite->display_position,
                    'position_x' => $favorite->position_x,
                    'position_y' => $favorite->position_y,
                    'scale' => $favorite->scale,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('お気に入り写真設定エラー: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'お気に入り写真の設定に失敗しました'
            ], 500);
        }
    }
}

