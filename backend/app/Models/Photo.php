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

    /**
     * 画像URLを取得
     */
    public function getImageUrlAttribute()
    {
        if ($this->file_path) {
            return url('storage/' . $this->file_path);
        }
        return null;
    }

    /**
     * サムネイルURLを取得
     */
    public function getThumbnailUrlAttribute()
    {
        if ($this->file_path) {
            // サムネイルファイルのパスを生成
            $pathInfo = pathinfo($this->file_path);
            $thumbnailPath = $pathInfo['dirname'] . '/thumbnails/' . $pathInfo['filename'] . '_thumb.' . $pathInfo['extension'];
            
            // サムネイルが存在するかチェック
            if (\Storage::disk('public')->exists($thumbnailPath)) {
                return url('storage/' . $thumbnailPath);
            }
            
            // サムネイルがない場合は元の画像を返す
            return url('storage/' . $this->file_path);
        }
        return null;
    }
}
