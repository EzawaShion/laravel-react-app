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
        
        $displayName = $user->display_name;
        if ($displayName === 'null' || $displayName === null) {
            $displayName = null;
        }
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'display_name' => $displayName,
                'email' => $user->email,
                'bio' => $bio,
                'website' => $website,
                'profile_image_url' => $user->profile_image_url,
                'posts_count' => $user->posts_count,
                'created_at' => $user->created_at,
            ]
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        
        // デバッグログを追加
        \Log::info('Profile update request received');
        \Log::info('Request Content-Type: ' . $request->header('Content-Type'));
        \Log::info('Request method: ' . $request->method());
        \Log::info('Request all data keys: ', array_keys($request->all()));
        \Log::info('Request files keys: ', array_keys($request->allFiles()));
        \Log::info('Request has file profile_image: ' . ($request->hasFile('profile_image') ? 'yes' : 'no'));
        
        // 詳細なデータログを追加
        \Log::info('Request all data: ', $request->all());
        \Log::info('Request input method: ' . $request->input('name'));
        \Log::info('Request input username: ' . $request->input('username'));
        \Log::info('Request get method: ' . $request->get('name'));
        \Log::info('Request get username: ' . $request->get('username'));
        
        // リクエストメソッドの確認
        if (!in_array($request->method(), ['PUT', 'POST'])) {
            return response()->json(['message' => 'Method not allowed'], 405);
        }
        
        $profileImageFile = $request->file('profile_image');
        if ($profileImageFile) {
            \Log::info('Request file profile_image: ' . $profileImageFile->getClientOriginalName());
        } else {
            \Log::info('Request file profile_image: null');
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'display_name' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'website' => 'nullable|string|max:255', // urlバリデーションを削除し、nullableに変更
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:20480'
        ]);

        if ($validator->fails()) {
            \Log::info('Validation failed:', $validator->errors()->toArray());
            return response()->json([
                'message' => 'バリデーションエラー',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        
        // プロフィールフィールドを明示的に設定（送信されていない場合はnull）
        $profileFields = ['display_name', 'bio', 'website'];
        foreach ($profileFields as $field) {
            if (!isset($data[$field])) {
                $data[$field] = null;
            } else if ($data[$field] === '' || $data[$field] === 'null') {
                $data[$field] = null;
            }
        }
        
        \Log::info('Validated data after processing:', $data);

        // プロフィール画像の処理
        if ($request->hasFile('profile_image')) {
            $profileImageFile = $request->file('profile_image');
            
            if ($profileImageFile && $profileImageFile->isValid()) {
                \Log::info('Processing profile image upload');
                
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
                
                \Log::info('Profile image saved to: ' . $filePath);
            }
        } else {
            \Log::info('No profile image file in request');
        }

        // データ配列をログに出力
        \Log::info('Data array before update: ', $data ?: []);

        $user->update($data);

        // 更新後のユーザーデータをログに出力
        \Log::info('Updated user data: ', $user->toArray());
        \Log::info('Profile image in database: ' . ($user->profile_image ?: 'null'));

        return response()->json([
            'message' => 'プロフィールが更新されました',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'display_name' => $user->display_name === 'null' ? null : $user->display_name,
                'email' => $user->email,
                'bio' => $user->bio === 'null' ? null : $user->bio,
                'website' => $user->website === 'null' ? null : $user->website,
                'profile_image_url' => $user->profile_image_url,
                'posts_count' => $user->posts_count,
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
}
