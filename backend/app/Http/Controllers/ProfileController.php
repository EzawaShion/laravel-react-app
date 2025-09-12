<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        
        // null値と「null」文字列を適切に処理
        $bio = $user->bio;
        if ($bio === 'null' || $bio === null) {
            $bio = null;
        }
        
        $website = $user->website;
        if ($website === 'null' || $website === null) {
            $website = null;
        }
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'bio' => $bio,
                'website' => $website,
                'profile_image_url' => $user->profile_image_url,
                'posts_count' => $user->posts_count,
                'followers_count' => $user->followers()->count(),
                'followings_count' => $user->followings()->count(),
                'privacy_settings' => $user->privacy_settings,
                'created_at' => $user->created_at,
            ]
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        
        // リクエストメソッドの確認
        if (!in_array($request->method(), ['PUT', 'POST'])) {
            return response()->json(['message' => 'Method not allowed'], 405);
        }
        
        $profileImageFile = $request->file('profile_image');
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'bio' => 'nullable|string|max:1000',
            'website' => 'nullable|string|max:255', // urlバリデーションを削除し、nullableに変更
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:20480',
            'privacy_settings' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'バリデーションエラー',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        
        // プロフィールフィールドを明示的に設定（送信されていない場合はnull）
        $profileFields = ['bio', 'website'];
        foreach ($profileFields as $field) {
            if (!isset($data[$field])) {
                $data[$field] = null;
            } else if ($data[$field] === '' || $data[$field] === 'null') {
                $data[$field] = null;
            }
        }

        // プライバシー設定の処理
        if (isset($data['privacy_settings'])) {
            $privacySettings = $data['privacy_settings'];
            
            // JSON文字列の場合はデコード
            if (is_string($privacySettings)) {
                $privacySettings = json_decode($privacySettings, true);
            }
            
            $data['privacy_settings'] = [
                'show_followers' => $privacySettings['show_followers'] ?? true,
                'show_followings' => $privacySettings['show_followings'] ?? true,
            ];
        }

        // プロフィール画像の処理
        if ($request->hasFile('profile_image')) {
            $profileImageFile = $request->file('profile_image');
            
            if ($profileImageFile && $profileImageFile->isValid()) {
                // 古い画像を削除
                if ($user->profile_image) {
                    Storage::disk('public')->delete($user->profile_image);
                }

                // 新しい画像を保存
                $fileName = time() . '_' . $profileImageFile->getClientOriginalName();
                $filePath = 'profile_images/' . $fileName;

                // profile_imagesディレクトリが存在しない場合は作成
                if (!Storage::disk('public')->exists('profile_images')) {
                    Storage::disk('public')->makeDirectory('profile_images');
                }

                // ファイルを保存
                Storage::disk('public')->put($filePath, file_get_contents($profileImageFile));
                $data['profile_image'] = $filePath;
            }
        }

        $user->update($data);

        return response()->json([
            'message' => 'プロフィールが更新されました',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'bio' => $user->bio === 'null' ? null : $user->bio,
                'website' => $user->website === 'null' ? null : $user->website,
                'profile_image_url' => $user->profile_image_url,
                'posts_count' => $user->posts_count,
                'followers_count' => $user->followers()->count(),
                'followings_count' => $user->followings()->count(),
                'privacy_settings' => $user->privacy_settings,
                'created_at' => $user->created_at,
            ]
        ]);
    }

    public function posts(Request $request)
    {
        $user = $request->user();
        $posts = $user->posts()->with('photos')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'posts' => $posts->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'content' => $post->content,
                    'photos' => $post->photos->map(function ($photo) {
                        return [
                            'id' => $photo->id,
                            'image_url' => $photo->image_url,
                            'thumbnail_url' => $photo->thumbnail_url,
                            'title' => $photo->title,
                            'description' => $photo->description
                        ];
                    }),
                    'created_at' => $post->created_at,
                    'updated_at' => $post->updated_at
                ];
            })
        ]);
    }

    public function showUser($userId)
    {
        $user = User::findOrFail($userId);
        
        // null値と「null」文字列を適切に処理
        $bio = $user->bio;
        if ($bio === 'null' || $bio === null) {
            $bio = null;
        }
        
        $website = $user->website;
        if ($website === 'null' || $website === null) {
            $website = null;
        }
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'bio' => $bio,
                'website' => $website,
                'profile_image_url' => $user->profile_image_url,
                'posts_count' => $user->posts_count,
                'followers_count' => $user->followers()->count(),
                'followings_count' => $user->followings()->count(),
                'privacy_settings' => $user->privacy_settings,
                'created_at' => $user->created_at,
            ]
        ]);
    }
}
