<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prefecture extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'latitude',
        'longitude',
        'capital_city_id'
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    /**
     * 市町村とのリレーションシップ
     */
    public function cities()
    {
        return $this->hasMany(City::class);
    }

    /**
     * 県庁所在地とのリレーションシップ
     */
    public function capitalCity()
    {
        return $this->belongsTo(City::class, 'capital_city_id');
    }
}
