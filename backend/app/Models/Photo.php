<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Photo extends Model
{
    use HasFactory;

    protected $fillable = [
        'photo_group_id',
        'post_id',
        'file_path',
        'title',
        'description',
        'tags',
        'order_num'
    ];

    protected $casts = [
        'tags' => 'array'
    ];

    // リレーションシップ
    public function photoGroup()
    {
        return $this->belongsTo(PhotoGroup::class);
    }

    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
