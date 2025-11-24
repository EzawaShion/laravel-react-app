<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrefectureFavoritePhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'prefecture_id',
        'photo_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function prefecture()
    {
        return $this->belongsTo(Prefecture::class);
    }

    public function photo()
    {
        return $this->belongsTo(Photo::class);
    }
}

