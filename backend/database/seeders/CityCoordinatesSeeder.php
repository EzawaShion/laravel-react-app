<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\City;
use App\Models\Prefecture;

class CityCoordinatesSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // 主要な市区町村の座標データ
        $cityCoordinates = [
            // 北海道
            ['prefecture' => '北海道', 'city' => '札幌市', 'lat' => 43.0642, 'lng' => 141.3469],
            ['prefecture' => '北海道', 'city' => '函館市', 'lat' => 41.7687, 'lng' => 140.7288],
            ['prefecture' => '北海道', 'city' => '旭川市', 'lat' => 43.7706, 'lng' => 142.3649],
            ['prefecture' => '北海道', 'city' => '訓子府町', 'lat' => 43.7394, 'lng' => 143.7500],
            
            // 東京都
            ['prefecture' => '東京都', 'city' => '新宿区', 'lat' => 35.6938, 'lng' => 139.7036],
            ['prefecture' => '東京都', 'city' => '渋谷区', 'lat' => 35.6580, 'lng' => 139.7016],
            ['prefecture' => '東京都', 'city' => '港区', 'lat' => 35.6585, 'lng' => 139.7514],
            
            // 大阪府
            ['prefecture' => '大阪府', 'city' => '大阪市', 'lat' => 34.6937, 'lng' => 135.5023],
            ['prefecture' => '大阪府', 'city' => '堺市', 'lat' => 34.5732, 'lng' => 135.4827],
            
            // 神奈川県
            ['prefecture' => '神奈川県', 'city' => '横浜市', 'lat' => 35.4478, 'lng' => 139.6425],
            ['prefecture' => '神奈川県', 'city' => '川崎市', 'lat' => 35.5308, 'lng' => 139.7029],
            
            // 愛知県
            ['prefecture' => '愛知県', 'city' => '名古屋市', 'lat' => 35.1802, 'lng' => 136.9066],
            
            // 福岡県
            ['prefecture' => '福岡県', 'city' => '福岡市', 'lat' => 33.6064, 'lng' => 130.4181],
            
            // 京都府
            ['prefecture' => '京都府', 'city' => '京都市', 'lat' => 35.0211, 'lng' => 135.7556],
            
            // 兵庫県
            ['prefecture' => '兵庫県', 'city' => '神戸市', 'lat' => 34.6913, 'lng' => 135.1830],
            
            // 埼玉県
            ['prefecture' => '埼玉県', 'city' => 'さいたま市', 'lat' => 35.8569, 'lng' => 139.6489],
            
            // 千葉県
            ['prefecture' => '千葉県', 'city' => '千葉市', 'lat' => 35.6074, 'lng' => 140.1065],
        ];
        
        $this->command->info('市区町村の座標データを登録中...');
        
        $successCount = 0;
        $notFoundCount = 0;
        
        foreach ($cityCoordinates as $data) {
            $prefecture = Prefecture::where('name', $data['prefecture'])->first();
            
            if ($prefecture) {
                $city = City::where('prefecture_id', $prefecture->id)
                    ->where('name', $data['city'])
                    ->first();
                
                if ($city) {
                    $city->update([
                        'latitude' => $data['lat'],
                        'longitude' => $data['lng']
                    ]);
                    $successCount++;
                    $this->command->line("✅ {$data['prefecture']} {$data['city']}: 座標登録完了");
                } else {
                    $notFoundCount++;
                    $this->command->line("❌ {$data['prefecture']} {$data['city']}: 市区町村が見つかりません");
                }
            } else {
                $notFoundCount++;
                $this->command->line("❌ {$data['prefecture']}: 都道府県が見つかりません");
            }
        }
        
        $this->command->info("座標データ登録完了:");
        $this->command->info("成功: {$successCount}件");
        $this->command->info("失敗: {$notFoundCount}件");
    }
}