<?php

namespace App\Http\Controllers;

use App\Mail\PasswordReset;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * パスワードリセットメール送信
     */
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            // 既存のリセットトークンを削除
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            // 新しいリセットトークンを生成
            $token = Str::random(60);
            $resetUrl = "http://localhost:5173/password/reset?token=" . $token . "&email=" . $request->email;

            // リセットトークンをデータベースに保存
            DB::table('password_reset_tokens')->insert([
                'email' => $request->email,
                'token' => Hash::make($token),
                'created_at' => now()
            ]);

            // リセットメールを送信
            Mail::to($request->email)->send(new PasswordReset($resetUrl, $user->name));
        }

        // セキュリティのため、メールアドレスの存在に関係なく同じメッセージを返す
        return response()->json([
            'success' => true,
            'message' => 'パスワードリセットメールを送信しました。メールをご確認ください。'
        ]);
    }

    /**
     * パスワードリセット
     */
    public function reset(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed'
        ]);

        // リセットトークンを検証
        $reset = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$reset || !Hash::check($request->token, $reset->token)) {
            return response()->json([
                'success' => false,
                'message' => '無効なリセットトークンです。'
            ], 400);
        }

        // トークンの有効期限をチェック（24時間）
        if (now()->diffInHours($reset->created_at) > 24) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'リセットトークンの有効期限が切れています。'
            ], 400);
        }

        // パスワードを更新
        User::where('email', $request->email)->update([
            'password' => Hash::make($request->password)
        ]);

        // リセットトークンを削除
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'パスワードを更新しました。'
        ]);
    }
}
