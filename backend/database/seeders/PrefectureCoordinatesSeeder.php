<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Prefecture;

class PrefectureCoordinatesSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $prefectureCoordinates = [
            '北海道' => ['latitude' => 43.0642, 'longitude' => 141.3469], // 札幌市
            '青森県' => ['latitude' => 40.8244, 'longitude' => 140.7400], // 青森市
            '岩手県' => ['latitude' => 39.7036, 'longitude' => 141.1527], // 盛岡市
            '宮城県' => ['latitude' => 38.2682, 'longitude' => 140.8694], // 仙台市
            '秋田県' => ['latitude' => 39.7186, 'longitude' => 140.1024], // 秋田市
            '山形県' => ['latitude' => 38.2404, 'longitude' => 140.3633], // 山形市
            '福島県' => ['latitude' => 37.7503, 'longitude' => 140.4676], // 福島市
            '茨城県' => ['latitude' => 36.3417, 'longitude' => 140.4467], // 水戸市
            '栃木県' => ['latitude' => 36.5658, 'longitude' => 139.8836], // 宇都宮市
            '群馬県' => ['latitude' => 36.3906, 'longitude' => 139.0608], // 前橋市
            '埼玉県' => ['latitude' => 35.8569, 'longitude' => 139.6489], // さいたま市
            '千葉県' => ['latitude' => 35.6074, 'longitude' => 140.1065], // 千葉市
            '東京都' => ['latitude' => 35.6762, 'longitude' => 139.6503], // 東京
            '神奈川県' => ['latitude' => 35.4478, 'longitude' => 139.6425], // 横浜市
            '新潟県' => ['latitude' => 37.9022, 'longitude' => 139.0230], // 新潟市
            '富山県' => ['latitude' => 36.6953, 'longitude' => 137.2113], // 富山市
            '石川県' => ['latitude' => 36.5946, 'longitude' => 136.6256], // 金沢市
            '福井県' => ['latitude' => 36.0652, 'longitude' => 136.2217], // 福井市
            '山梨県' => ['latitude' => 35.6642, 'longitude' => 138.5681], // 甲府市
            '長野県' => ['latitude' => 36.6513, 'longitude' => 138.1811], // 長野市
            '岐阜県' => ['latitude' => 35.3912, 'longitude' => 136.7222], // 岐阜市
            '静岡県' => ['latitude' => 34.9756, 'longitude' => 138.3828], // 静岡市
            '愛知県' => ['latitude' => 35.1802, 'longitude' => 136.9066], // 名古屋市
            '三重県' => ['latitude' => 34.7303, 'longitude' => 136.5086], // 津市
            '滋賀県' => ['latitude' => 35.0044, 'longitude' => 135.8686], // 大津市
            '京都府' => ['latitude' => 35.0211, 'longitude' => 135.7556], // 京都市
            '大阪府' => ['latitude' => 34.6937, 'longitude' => 135.5023], // 大阪市
            '兵庫県' => ['latitude' => 34.6913, 'longitude' => 135.1830], // 神戸市
            '奈良県' => ['latitude' => 34.6851, 'longitude' => 135.8048], // 奈良市
            '和歌山県' => ['latitude' => 34.2261, 'longitude' => 135.1675], // 和歌山市
            '鳥取県' => ['latitude' => 35.5036, 'longitude' => 134.2383], // 鳥取市
            '島根県' => ['latitude' => 35.4723, 'longitude' => 133.0505], // 松江市
            '岡山県' => ['latitude' => 34.6617, 'longitude' => 133.9347], // 岡山市
            '広島県' => ['latitude' => 34.3963, 'longitude' => 132.4596], // 広島市
            '山口県' => ['latitude' => 34.1861, 'longitude' => 131.4706], // 山口市
            '徳島県' => ['latitude' => 34.0658, 'longitude' => 134.5592], // 徳島市
            '香川県' => ['latitude' => 34.3401, 'longitude' => 134.0431], // 高松市
            '愛媛県' => ['latitude' => 33.8416, 'longitude' => 132.7656], // 松山市
            '高知県' => ['latitude' => 33.5597, 'longitude' => 133.5311], // 高知市
            '福岡県' => ['latitude' => 33.6064, 'longitude' => 130.4181], // 福岡市
            '佐賀県' => ['latitude' => 33.2494, 'longitude' => 130.2989], // 佐賀市
            '長崎県' => ['latitude' => 32.7503, 'longitude' => 129.8777], // 長崎市
            '熊本県' => ['latitude' => 32.7898, 'longitude' => 130.7417], // 熊本市
            '大分県' => ['latitude' => 33.2382, 'longitude' => 131.6126], // 大分市
            '宮崎県' => ['latitude' => 31.9077, 'longitude' => 131.4202], // 宮崎市
            '鹿児島県' => ['latitude' => 31.5602, 'longitude' => 130.5581], // 鹿児島市
            '沖縄県' => ['latitude' => 26.2124, 'longitude' => 127.6792], // 那覇市
        ];

        foreach ($prefectureCoordinates as $prefectureName => $coordinates) {
            Prefecture::where('name', $prefectureName)->update([
                'latitude' => $coordinates['latitude'],
                'longitude' => $coordinates['longitude']
            ]);
        }
    }
}