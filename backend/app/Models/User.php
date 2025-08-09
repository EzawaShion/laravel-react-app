<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

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
        'display_name',
        'bio',
        'location',
        'website',
        'profile_image',
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
     * 表示名を取得（display_nameがない場合はnameを使用）
     */
    public function getDisplayNameAttribute($value)
    {
        return $value ?: $this->name;
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
}
