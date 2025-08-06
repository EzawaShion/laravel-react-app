<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * 投稿一覧を表示
     */
    public function index()
    {
        $posts = Post::with(['user', 'city'])->latest()->get();
        
        return response()->json([
            'success' => true,
            'posts' => $posts
        ]);
    }

    /**
     * 投稿作成フォームを表示
     */
    public function create()
    {
        // フロントエンドでフォームを表示するため、ここでは何もしない
        return response()->json([
            'success' => true,
            'message' => '投稿作成フォーム'
        ]);
    }

    /**
     * 新しい投稿を保存
     */
    public function store(Request $request)
    {
        // バリデーション
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'city_id' => 'nullable|integer|exists:cities,id',
            'custom_location' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // 投稿を作成
        $post = Post::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'city_id' => $request->city_id,
            'custom_location' => $request->custom_location,
            'total_photos' => 0
        ]);

        return response()->json([
            'success' => true,
            'message' => '投稿が作成されました',
            'post' => $post->load(['user', 'city'])
        ], 201);
    }

    /**
     * 指定された投稿を表示
     */
    public function show($id)
    {
        try {
            $post = Post::with(['user', 'city.prefecture'])->find($id);
            
            if (!$post) {
                return response()->json([
                    'success' => false,
                    'message' => '投稿が見つかりません'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'post' => $post
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '投稿の取得中にエラーが発生しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 投稿編集フォームを表示
     */
    public function edit($id)
    {
        $post = Post::find($id);
        
        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => '投稿が見つかりません'
            ], 404);
        }

        // 自分の投稿のみ編集可能
        if ($post->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'この投稿を編集する権限がありません'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'post' => $post
        ]);
    }

    /**
     * 指定された投稿を更新
     */
    public function update(Request $request, $id)
    {
        $post = Post::find($id);
        
        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => '投稿が見つかりません'
            ], 404);
        }

        // 自分の投稿のみ更新可能
        if ($post->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'この投稿を更新する権限がありません'
            ], 403);
        }

        // バリデーション
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'city_id' => 'nullable|integer|exists:cities,id',
            'custom_location' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // 投稿を更新
        $post->update([
            'title' => $request->title,
            'description' => $request->description,
            'city_id' => $request->city_id,
            'custom_location' => $request->custom_location,
        ]);

        return response()->json([
            'success' => true,
            'message' => '投稿が更新されました',
            'post' => $post->load(['user', 'city'])
        ]);
    }

    /**
     * 指定された投稿を削除
     */
    public function destroy($id)
    {
        try {
            $post = Post::with(['photos'])->find($id);
            
            if (!$post) {
                return response()->json([
                    'success' => false,
                    'message' => '投稿が見つかりません'
                ], 404);
            }

            // 自分の投稿のみ削除可能
            if ($post->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'この投稿を削除する権限がありません'
                ], 403);
            }

            // 投稿と関連データを削除（モデルのbootメソッドでファイル削除処理が実行される）
            $post->delete();

            return response()->json([
                'success' => true,
                'message' => '投稿が削除されました'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '投稿の削除に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }
}
