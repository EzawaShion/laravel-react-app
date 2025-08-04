<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
