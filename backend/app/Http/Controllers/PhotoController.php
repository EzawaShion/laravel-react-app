<?php

namespace App\Http\Controllers;

use App\Models\Photo;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class PhotoController extends Controller
{
    /**
     * 写真のアップロード
     */
    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'post_id' => 'required|exists:posts,id',
            'photo_group_id' => 'nullable|exists:photo_groups,id',
            'photos' => 'required|array|min:1|max:10',
            'photos.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240', // 最大10MB
            'titles' => 'nullable|array',
            'descriptions' => 'nullable|array',
            'tags' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'バリデーションエラー',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $post = Post::findOrFail($request->post_id);
            
            // 投稿の所有者かチェック
            if ($post->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'この投稿に写真を追加する権限がありません'
                ], 403);
            }

            // 既存の写真数を取得
            $existingPhotoCount = Photo::where('post_id', $request->post_id)->count();
            $newPhotoCount = count($request->file('photos'));
            
            // 合計が10枚を超えないかチェック
            if ($existingPhotoCount + $newPhotoCount > 10) {
                return response()->json([
                    'success' => false,
                    'message' => "写真は合計10枚までです。既存: {$existingPhotoCount}枚, 追加しようとしている: {$newPhotoCount}枚"
                ], 422);
            }

            $uploadedPhotos = [];
            $photos = $request->file('photos');
            $titles = $request->input('titles', []);
            $descriptions = $request->input('descriptions', []);
            $tags = $request->input('tags', []);

            // ImageManagerの初期化
            $manager = new ImageManager(new Driver());

            foreach ($photos as $index => $photo) {
                // ファイル名を生成
                $fileName = time() . '_' . $index . '.' . $photo->getClientOriginalExtension();
                $filePath = 'photos/' . $fileName;
                
                // 画像を読み込み（リサイズなし）
                $image = $manager->read($photo);
                
                // 品質を設定（85%）
                $image->toJpeg(85);
                
                // ファイルを保存
                Storage::disk('public')->put($filePath, $image->encode());
                
                // メモリを解放
                unset($image);

                // サムネイルも作成
                $thumbnailPath = 'photos/thumbnails/' . $fileName;
                $thumbnail = $manager->read($photo);
                
                // サムネイルもリサイズなし
                // $thumbnail->resize(300, 300, function ($constraint) {
                //     $constraint->aspectRatio();
                //     $constraint->upsize();
                // });
                $thumbnail->toJpeg(85);
                Storage::disk('public')->put($thumbnailPath, $thumbnail->encode());
                
                // メモリを解放
                unset($thumbnail);

                // 写真レコードを作成
                $photoData = [
                    'post_id' => $request->post_id,
                    'photo_group_id' => $request->photo_group_id,
                    'file_path' => $filePath,
                    'title' => $titles[$index] ?? null,
                    'description' => $descriptions[$index] ?? null,
                    'tags' => $tags[$index] ?? [],
                    'order_num' => Photo::where('post_id', $request->post_id)->max('order_num') + 1
                ];

                $photoRecord = Photo::create($photoData);
                $uploadedPhotos[] = $photoRecord;
            }

            // 投稿の写真数を更新
            $post->update([
                'total_photos' => $post->photos()->count()
            ]);

            return response()->json([
                'success' => true,
                'message' => '写真がアップロードされました',
                'photos' => $uploadedPhotos
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '写真のアップロードに失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 投稿の写真一覧を取得
     */
    public function getByPost($postId)
    {
        try {
            $photos = Photo::where('post_id', $postId)
                ->with(['photoGroup'])
                ->orderBy('order_num')
                ->get();

            return response()->json([
                'success' => true,
                'photos' => $photos
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '写真の取得に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 写真の詳細を取得
     */
    public function show($id)
    {
        try {
            $photo = Photo::with(['photoGroup', 'post'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'photo' => $photo
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '写真の取得に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 写真の更新
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'tags' => 'nullable|array',
            'order_num' => 'nullable|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'バリデーションエラー',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $photo = Photo::findOrFail($id);
            
            // 写真の所有者かチェック
            if ($photo->post->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'この写真を編集する権限がありません'
                ], 403);
            }

            $photo->update($request->only(['title', 'description', 'tags', 'order_num']));

            return response()->json([
                'success' => true,
                'message' => '写真が更新されました',
                'photo' => $photo
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '写真の更新に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 写真の削除
     */
    public function destroy($id)
    {
        try {
            $photo = Photo::with('post')->findOrFail($id);
            
            // 写真の所有者かチェック
            if ($photo->post->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'この写真を削除する権限がありません'
                ], 403);
            }

            // ファイルを削除
            if (Storage::disk('public')->exists($photo->file_path)) {
                Storage::disk('public')->delete($photo->file_path);
            }

            $photo->delete();

            // 投稿の写真数を更新
            $photo->post->update([
                'total_photos' => $photo->post->photos()->count()
            ]);

            return response()->json([
                'success' => true,
                'message' => '写真が削除されました'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '写真の削除に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 写真の並び替え
     */
    public function reorder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'photo_ids' => 'required|array',
            'photo_ids.*' => 'required|exists:photos,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'バリデーションエラー',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            foreach ($request->photo_ids as $index => $photoId) {
                Photo::where('id', $photoId)->update(['order_num' => $index + 1]);
            }

            return response()->json([
                'success' => true,
                'message' => '写真の順序が更新されました'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '写真の並び替えに失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }
}
