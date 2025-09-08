<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'city_id',
        'custom_location',
        'total_photos'
    ];

    /**
     * 投稿者とのリレーションシップ
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 都市とのリレーションシップ
     */
    public function city()
    {
        return $this->belongsTo(City::class);
    }

    /**
     * フォトグループとのリレーションシップ
     */
    public function photoGroups()
    {
        return $this->hasMany(PhotoGroup::class);
    }

    /**
     * 写真とのリレーションシップ
     */
    public function photos()
    {
        return $this->hasMany(Photo::class);
    }

    /**
     * いいねとのリレーションシップ
     */
    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    /**
     * いいねしたユーザーとのリレーションシップ
     */
    public function likedByUsers()
    {
        return $this->belongsToMany(User::class, 'likes', 'post_id', 'user_id');
    }

    /**
     * 特定のユーザーがいいねしているかチェック
     */
    public function isLikedBy(User $user)
    {
        return $this->likes()->where('user_id', $user->id)->exists();
    }

    /**
     * いいね数を取得
     */
    public function getLikesCountAttribute()
    {
        return $this->likes()->count();
    }

    /**
     * 投稿削除時の処理
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($post) {
            // 関連する写真のファイルを削除
            foreach ($post->photos as $photo) {
                if (Storage::disk('public')->exists($photo->file_path)) {
                    Storage::disk('public')->delete($photo->file_path);
                }
                
                // サムネイルも削除
                $thumbnailPath = str_replace('photos/', 'photos/thumbnails/', $photo->file_path);
                if (Storage::disk('public')->exists($thumbnailPath)) {
                    Storage::disk('public')->delete($thumbnailPath);
                }
            }
            
            // 関連する写真レコードを先に削除（外部キー制約を回避）
            $post->photos()->delete();
            
            // 関連する写真グループも削除
            $post->photoGroups()->delete();
        });
    }
}
