<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class ProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 既存のユーザーにプロフィール情報を設定
        $users = User::all();
        
        foreach ($users as $user) {
            // プロフィール情報が設定されていない場合のみ設定
            if (!$user->username) {
                $user->update([
                    'username' => 'user_' . $user->id,
                    'display_name' => $user->name,
                    'bio' => '自己紹介を追加してください',
                    'location' => '場所を設定してください',
                    'website' => null,
                    'profile_image' => null,
                ]);
            }
        }
    }
}
