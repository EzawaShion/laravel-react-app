<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhotoGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'group_title',
        'tags',
        'description',
        'photo_count',
        'order_num'
    ];

    protected $casts = [
        'tags' => 'array'
    ];

    // リレーションシップ
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function photos()
    {
        return $this->hasMany(Photo::class);
    }
}
