<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    /**
     * 投稿にいいね
     */
    public function like(Request $request)
    {
        $request->validate([
            'post_id' => 'required|exists:posts,id'
        ]);

        $post = Post::findOrFail($request->post_id);

        // 既にいいねしているかチェック
        $existingLike = Like::where('user_id', Auth::id())
            ->where('post_id', $post->id)
            ->first();

        if ($existingLike) {
            // 既にいいねしている場合は、いいねを解除
            $existingLike->delete();
            
            // いいね数をリアルタイムで取得
            $likesCount = $post->likes()->count();

            return response()->json([
                'success' => true,
                'message' => 'いいねを解除しました',
                'likes_count' => $likesCount,
                'action' => 'unliked'
            ]);
        }

        // いいねを作成
        Like::create([
            'user_id' => Auth::id(),
            'post_id' => $post->id
        ]);

        // いいね数をリアルタイムで取得
        $likesCount = $post->likes()->count();

        return response()->json([
            'success' => true,
            'message' => 'いいねしました',
            'likes_count' => $likesCount,
            'action' => 'liked'
        ], 201);
    }

    /**
     * いいね状態を取得
     */
    public function getLikeStatus($postId)
    {
        $post = Post::findOrFail($postId);
        $isLiked = $post->isLikedBy(Auth::user());
        $likesCount = $post->likes()->count();

        return response()->json([
            'success' => true,
            'is_liked' => $isLiked,
            'likes_count' => $likesCount
        ]);
    }

    /**
     * 投稿のいいね一覧を取得
     */
    public function getPostLikes($postId)
    {
        $post = Post::findOrFail($postId);
        $likes = $post->likedByUsers()->paginate(20);

        return response()->json([
            'success' => true,
            'likes' => $likes
        ]);
    }
}
