<?php

namespace App\Http\Controllers;

use App\Models\PhotoGroup;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PhotoGroupController extends Controller
{
    /**
     * 写真グループの作成
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'post_id' => 'required|exists:posts,id',
            'group_title' => 'required|string|max:255',
            'description' => 'nullable|string',
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
                    'message' => 'この投稿に写真グループを作成する権限がありません'
                ], 403);
            }

            $photoGroup = PhotoGroup::create([
                'post_id' => $request->post_id,
                'group_title' => $request->group_title,
                'description' => $request->description,
                'tags' => $request->tags ?? [],
                'photo_count' => 0,
                'order_num' => PhotoGroup::where('post_id', $request->post_id)->max('order_num') + 1
            ]);

            return response()->json([
                'success' => true,
                'message' => '写真グループが作成されました',
                'photo_group' => $photoGroup
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '写真グループの作成に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 投稿の写真グループ一覧を取得
     */
    public function getByPost($postId)
    {
        try {
            $photoGroups = PhotoGroup::where('post_id', $postId)
                ->with(['photos'])
                ->orderBy('order_num')
                ->get();

            return response()->json([
                'success' => true,
                'photo_groups' => $photoGroups
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '写真グループの取得に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 写真グループの詳細を取得
     */
    public function show($id)
    {
        try {
            $photoGroup = PhotoGroup::with(['post', 'photos'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'photo_group' => $photoGroup
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '写真グループの取得に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 写真グループの更新
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'group_title' => 'nullable|string|max:255',
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
            $photoGroup = PhotoGroup::with('post')->findOrFail($id);
            
            // 写真グループの所有者かチェック
            if ($photoGroup->post->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'この写真グループを編集する権限がありません'
                ], 403);
            }

            $photoGroup->update($request->only(['group_title', 'description', 'tags', 'order_num']));

            return response()->json([
                'success' => true,
                'message' => '写真グループが更新されました',
                'photo_group' => $photoGroup
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '写真グループの更新に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 写真グループの削除
     */
    public function destroy($id)
    {
        try {
            $photoGroup = PhotoGroup::with(['post', 'photos'])->findOrFail($id);
            
            // 写真グループの所有者かチェック
            if ($photoGroup->post->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'この写真グループを削除する権限がありません'
                ], 403);
            }

            // 写真グループ内の写真も削除
            foreach ($photoGroup->photos as $photo) {
                $photo->delete();
            }

            $photoGroup->delete();

            return response()->json([
                'success' => true,
                'message' => '写真グループが削除されました'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '写真グループの削除に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 写真グループの並び替え
     */
    public function reorder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'photo_group_ids' => 'required|array',
            'photo_group_ids.*' => 'required|exists:photo_groups,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'バリデーションエラー',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            foreach ($request->photo_group_ids as $index => $photoGroupId) {
                PhotoGroup::where('id', $photoGroupId)->update(['order_num' => $index + 1]);
            }

            return response()->json([
                'success' => true,
                'message' => '写真グループの順序が更新されました'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '写真グループの並び替えに失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }
}
