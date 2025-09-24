<?php

namespace App\Http\Controllers;

use App\Models\Prefecture;
use App\Models\City;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    /**
     * 都道府県一覧を取得
     */
    public function getPrefectures()
    {
        $prefectures = Prefecture::orderBy('id')->get();
        
        return response()->json([
            'success' => true,
            'prefectures' => $prefectures
        ]);
    }

    /**
     * 指定された都道府県の市町村一覧を取得
     */
    public function getCitiesByPrefecture($prefectureId)
    {
        $cities = City::where('prefecture_id', $prefectureId)
                     ->orderBy('id')
                     ->get();
        
        return response()->json([
            'success' => true,
            'cities' => $cities
        ]);
    }

    /**
     * 都道府県と市町村の全データを取得
     */
    public function getAllLocations()
    {
        $prefectures = Prefecture::with('cities')->orderBy('id')->get();
        
        return response()->json([
            'success' => true,
            'prefectures' => $prefectures
        ]);
    }
}
