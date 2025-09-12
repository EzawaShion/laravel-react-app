<?php

namespace App\Http\Controllers;

use App\Models\Follow;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FollowController extends Controller
{
    /**
     * ユーザーをフォロー
     */
    public function follow(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $userToFollow = User::findOrFail($request->user_id);
        
        // 自分自身をフォローできないようにする
        if (Auth::id() === $userToFollow->id) {
            return response()->json([
                'success' => false,
                'message' => '自分自身をフォローすることはできません'
            ], 400);
        }

        // 既にフォローしているかチェック
        $existingFollow = Follow::where('follower_id', Auth::id())
            ->where('following_id', $userToFollow->id)
            ->first();

        if ($existingFollow) {
            return response()->json([
                'success' => false,
                'message' => '既にフォローしています'
            ], 400);
        }

        // フォローを作成
        Follow::create([
            'follower_id' => Auth::id(),
            'following_id' => $userToFollow->id
        ]);

        // フォロー数をリアルタイムで取得
        $followersCount = $userToFollow->followers()->count();
        $followingsCount = $userToFollow->followings()->count();

        return response()->json([
            'success' => true,
            'message' => 'フォローしました',
            'followers_count' => $followersCount,
            'followings_count' => $followingsCount
        ], 201);
    }

    /**
     * フォローを解除
     */
    public function unfollow(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $userToUnfollow = User::findOrFail($request->user_id);

        // フォロー関係を削除
        $follow = Follow::where('follower_id', Auth::id())
            ->where('following_id', $userToUnfollow->id)
            ->first();

        if (!$follow) {
            return response()->json([
                'success' => false,
                'message' => 'フォローしていません'
            ], 400);
        }

        $follow->delete();

        // フォロー数をリアルタイムで取得
        $followersCount = $userToUnfollow->followers()->count();
        $followingsCount = $userToUnfollow->followings()->count();

        return response()->json([
            'success' => true,
            'message' => 'フォローを解除しました',
            'followers_count' => $followersCount,
            'followings_count' => $followingsCount
        ]);
    }

    /**
     * フォロー状態を取得
     */
    public function getFollowStatus($userId)
    {
        $user = User::findOrFail($userId);
        $isFollowing = Auth::user()->isFollowing($user);

        return response()->json([
            'success' => true,
            'is_following' => $isFollowing,
            'followers_count' => $user->followers_count,
            'followings_count' => $user->followings_count
        ]);
    }

    /**
     * フォロワー一覧を取得
     */
    public function getFollowers($userId)
    {
        $user = User::findOrFail($userId);
        $followers = $user->followers()->paginate(20);

        // 各フォロワーのフォロー状態を追加
        $followers->getCollection()->transform(function ($follower) {
            $follower->is_following = Auth::user()->isFollowing($follower);
            $follower->profile_image_url = $follower->profile_image_url;
            return $follower;
        });

        return response()->json([
            'success' => true,
            'followers' => $followers->items(),
            'current_page' => $followers->currentPage(),
            'last_page' => $followers->lastPage(),
            'per_page' => $followers->perPage(),
            'total' => $followers->total()
        ]);
    }

    /**
     * フォロー中一覧を取得
     */
    public function getFollowings($userId)
    {
        $user = User::findOrFail($userId);
        $followings = $user->followings()->paginate(20);

        // 各フォロー中のユーザーのフォロー状態を追加
        $followings->getCollection()->transform(function ($following) {
            $following->is_following = Auth::user()->isFollowing($following);
            $following->profile_image_url = $following->profile_image_url;
            return $following;
        });

        return response()->json([
            'success' => true,
            'followings' => $followings->items(),
            'current_page' => $followings->currentPage(),
            'last_page' => $followings->lastPage(),
            'per_page' => $followings->perPage(),
            'total' => $followings->total()
        ]);
    }
}
