<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prefecture extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code'
    ];

    /**
     * 市町村とのリレーションシップ
     */
    public function cities()
    {
        return $this->hasMany(City::class);
    }
}
