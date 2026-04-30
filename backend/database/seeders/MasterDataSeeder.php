<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Prefecture;
use App\Models\City;

class MasterDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Inserting Prefectures...');
        
        $prefecturesJson = file_get_contents(__DIR__ . '/prefectures.json');
        $prefectures = json_decode($prefecturesJson, true);

        // Batch insert prefectures
        $prefectureChunks = array_chunk($prefectures, 500);
        foreach ($prefectureChunks as $chunk) {
            Prefecture::insertOrIgnore($chunk);
        }
        
        $this->command->info('Inserted ' . count($prefectures) . ' Prefectures.');


        $this->command->info('Inserting Cities...');
        
        $citiesJson = file_get_contents(__DIR__ . '/cities.json');
        $cities = json_decode($citiesJson, true);

        // Batch insert cities
        $cityChunks = array_chunk($cities, 500);
        foreach ($cityChunks as $chunk) {
            City::insertOrIgnore($chunk);
        }
        
        $this->command->info('Inserted ' . count($cities) . ' Cities.');
        
        $this->command->info('Master Data Seeding Completed Successfully!');
    }
}
