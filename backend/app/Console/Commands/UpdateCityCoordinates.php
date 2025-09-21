<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\City;
use App\Models\Prefecture;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class UpdateCityCoordinates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:city-coordinates {--limit=10 : 処理する市区町村の数}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Nominatim APIを使用して市区町村の座標データを更新';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $limit = $this->option('limit');
        
        $this->info("市区町村の座標データを更新します（最大{$limit}件）");
        
        // 座標が未設定の市区町村を取得
        $cities = City::with('prefecture')
            ->whereNull('latitude')
            ->whereNull('longitude')
            ->limit($limit)
            ->get();
        
        if ($cities->isEmpty()) {
            $this->info('座標が未設定の市区町村はありません。');
            return;
        }
        
        $this->info("対象の市区町村: {$cities->count()}件");
        
        $progressBar = $this->output->createProgressBar($cities->count());
        $progressBar->start();
        
        $successCount = 0;
        $errorCount = 0;
        
        foreach ($cities as $city) {
            try {
                $coordinates = $this->fetchCoordinates($city);
                
                if ($coordinates) {
                    $city->update([
                        'latitude' => $coordinates['latitude'],
                        'longitude' => $coordinates['longitude']
                    ]);
                    $successCount++;
                    $this->line("\n✅ {$city->prefecture->name} {$city->name}: 座標更新成功 ({$coordinates['latitude']}, {$coordinates['longitude']})");
                } else {
                    $errorCount++;
                    $this->line("\n❌ {$city->prefecture->name} {$city->name}: 座標取得失敗");
                }
                
                // API制限を考慮して1秒待機
                sleep(1);
                
            } catch (\Exception $e) {
                $errorCount++;
                $this->line("\n❌ {$city->prefecture->name} {$city->name}: エラー - {$e->getMessage()}");
            }
            
            $progressBar->advance();
        }
        
        $progressBar->finish();
        
        $this->newLine(2);
        $this->info("処理完了:");
        $this->info("成功: {$successCount}件");
        $this->info("失敗: {$errorCount}件");
        
        return 0;
    }
    
    /**
     * Nominatim APIから座標を取得
     */
    private function fetchCoordinates(City $city)
    {
        try {
            $query = $city->prefecture->name . ' ' . $city->name;
            $this->line("\n🔍 検索中: {$query}");
            
            $response = Http::timeout(10)->get('https://nominatim.openstreetmap.org/search', [
                'q' => $query,
                'format' => 'json',
                'limit' => 1,
                'countrycodes' => 'jp',
                'addressdetails' => 1
            ]);
            
            $this->line("API Response Status: {$response->status()}");
            
            if ($response->successful()) {
                $data = $response->json();
                $this->line("API Response Data: " . json_encode($data));
                
                if (!empty($data) && isset($data[0]['lat']) && isset($data[0]['lon'])) {
                    return [
                        'latitude' => (float) $data[0]['lat'],
                        'longitude' => (float) $data[0]['lon']
                    ];
                } else {
                    $this->line("座標データが見つかりませんでした");
                }
            } else {
                $this->line("API呼び出し失敗: {$response->status()}");
            }
            
            return null;
            
        } catch (\Exception $e) {
            $this->error("API呼び出しエラー: {$e->getMessage()}");
            return null;
        }
    }
}
