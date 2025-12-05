<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\PrefectureFavoritePhoto;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'username',
        'bio',
        'location',
        'website',
        'profile_image',
        'privacy_settings',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'privacy_settings' => 'array',
        ];
    }

    /**
     * プロフィール画像のURLを取得
     */
    public function getProfileImageUrlAttribute()
    {
        if ($this->profile_image) {
            return url('storage/' . $this->profile_image);
        }
        return url('images/default-avatar.svg');
    }


    /**
     * 投稿数を取得
     */
    public function getPostsCountAttribute()
    {
        return $this->posts()->count();
    }

    /**
     * ユーザーの投稿を取得
     */
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    /**
     * 都道府県を取得
     */
    public function prefecture()
    {
        return $this->belongsTo(Prefecture::class);
    }

    /**
     * 市町村を取得
     */
    public function city()
    {
        return $this->belongsTo(City::class);
    }

    /**
     * フォローしているユーザー
     */
    public function followings()
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id');
    }

    /**
     * フォローしているユーザー（エイリアス）
     */
    public function following()
    {
        return $this->followings();
    }

    /**
     * フォローされているユーザー
     */
    public function followers()
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id');
    }

    /**
     * 特定のユーザーをフォローしているかチェック
     */
    public function isFollowing(User $user)
    {
        return $this->followings()->where('following_id', $user->id)->exists();
    }

    /**
     * 特定のユーザーにフォローされているかチェック
     */
    public function isFollowedBy(User $user)
    {
        return $this->followers()->where('follower_id', $user->id)->exists();
    }

    /**
     * フォロー数を取得
     */
    public function getFollowingsCountAttribute()
    {
        return $this->followings()->count();
    }

    /**
     * フォロワー数を取得
     */
    public function getFollowersCountAttribute()
    {
        return $this->followers()->count();
    }

    /**
     * プライバシー設定を取得（デフォルト値付き）
     */
    public function getPrivacySettingsAttribute($value)
    {
        $defaultSettings = [
            'show_followers' => true,
            'show_followings' => true,
        ];
        
        if ($value) {
            $settings = is_string($value) ? json_decode($value, true) : $value;
            return array_merge($defaultSettings, $settings);
        }
        
        return $defaultSettings;
    }

    /**
     * フォロワーリストを表示可能かチェック
     */
    public function canShowFollowers()
    {
        return $this->privacy_settings['show_followers'] ?? true;
    }

    /**
     * フォロー中リストを表示可能かチェック
     */
    public function canShowFollowings()
    {
        return $this->privacy_settings['show_followings'] ?? true;
    }

    public function favoritePrefecturePhotos()
    {
        return $this->hasMany(PrefectureFavoritePhoto::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
