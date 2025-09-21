<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Prefecture;
use App\Models\City;

class PrefectureCapitalSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // 県庁所在地のマッピング
        $capitals = [
            '北海道' => '札幌市',
            '青森県' => '青森市',
            '岩手県' => '盛岡市',
            '宮城県' => '仙台市',
            '秋田県' => '秋田市',
            '山形県' => '山形市',
            '福島県' => '福島市',
            '茨城県' => '水戸市',
            '栃木県' => '宇都宮市',
            '群馬県' => '前橋市',
            '埼玉県' => 'さいたま市',
            '千葉県' => '千葉市',
            '東京都' => '新宿区', // 東京都庁所在地
            '神奈川県' => '横浜市',
            '新潟県' => '新潟市',
            '富山県' => '富山市',
            '石川県' => '金沢市',
            '福井県' => '福井市',
            '山梨県' => '甲府市',
            '長野県' => '長野市',
            '岐阜県' => '岐阜市',
            '静岡県' => '静岡市',
            '愛知県' => '名古屋市',
            '三重県' => '津市',
            '滋賀県' => '大津市',
            '京都府' => '京都市',
            '大阪府' => '大阪市',
            '兵庫県' => '神戸市',
            '奈良県' => '奈良市',
            '和歌山県' => '和歌山市',
            '鳥取県' => '鳥取市',
            '島根県' => '松江市',
            '岡山県' => '岡山市',
            '広島県' => '広島市',
            '山口県' => '山口市',
            '徳島県' => '徳島市',
            '香川県' => '高松市',
            '愛媛県' => '松山市',
            '高知県' => '高知市',
            '福岡県' => '福岡市',
            '佐賀県' => '佐賀市',
            '長崎県' => '長崎市',
            '熊本県' => '熊本市',
            '大分県' => '大分市',
            '宮崎県' => '宮崎市',
            '鹿児島県' => '鹿児島市',
            '沖縄県' => '那覇市',
        ];
        
        $this->command->info('県庁所在地のマッピングを設定中...');
        
        $successCount = 0;
        $notFoundCount = 0;
        
        foreach ($capitals as $prefectureName => $capitalCityName) {
            $prefecture = Prefecture::where('name', $prefectureName)->first();
            
            if ($prefecture) {
                $capitalCity = City::where('prefecture_id', $prefecture->id)
                    ->where('name', $capitalCityName)
                    ->first();
                
                if ($capitalCity) {
                    $prefecture->update(['capital_city_id' => $capitalCity->id]);
                    $successCount++;
                    $this->command->line("✅ {$prefectureName} → {$capitalCityName} (ID: {$capitalCity->id})");
                } else {
                    $notFoundCount++;
                    $this->command->line("❌ {$prefectureName}: {$capitalCityName} が見つかりません");
                }
            } else {
                $notFoundCount++;
                $this->command->line("❌ {$prefectureName} が見つかりません");
            }
        }
        
        $this->command->info("県庁所在地マッピング完了:");
        $this->command->info("成功: {$successCount}件");
        $this->command->info("失敗: {$notFoundCount}件");
    }
}