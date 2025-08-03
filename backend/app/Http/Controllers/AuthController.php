<?php

namespace App\Http\Controllers;

use App\Mail\EmailVerification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\URL;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * ユーザー登録
     */
    public function register(Request $request)
    {
        // バリデーション
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // ユーザー作成（メール認証前は仮登録状態）
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'email_verified_at' => null, // 明示的に未認証状態
        ]);

        // メール認証URLを生成
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addHours(24),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        // メール認証メールを送信
        Mail::to($user->email)->send(new EmailVerification($verificationUrl, $user->name));

        return response()->json([
            'success' => true,
            'message' => 'ユーザー登録が完了しました。メール認証をお願いします。',
            'user' => $user,
            'email_verification_sent' => true,
            'requires_verification' => true
        ], 201);
    }

    /**
     * ユーザーログイン
     */
    public function login(Request $request)
    {
        // バリデーション
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // 認証
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'メールアドレスまたはパスワードが正しくありません'
            ], 401);
        }

        // メール認証チェック
        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'メールアドレスの認証が必要です。登録時のメールをご確認ください。',
                'requires_verification' => true
            ], 403);
        }

        // トークン生成
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'ログインしました',
            'user' => $user,
            'token' => $token
        ]);
    }

    /**
     * ログアウト
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'ログアウトしました'
        ]);
    }

    /**
     * ユーザー情報取得
     */
    public function user(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()
        ]);
    }

    /**
     * Google OAuth認証へのリダイレクト
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Google OAuth認証のコールバック処理
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            
            // ユーザーが存在するかチェック
            $user = User::where('email', $googleUser->email)->first();
            
            if (!$user) {
                // 新規ユーザー作成
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'password' => Hash::make(Str::random(16)),
                    'google_id' => $googleUser->id,
                ]);
            }
            
            // トークン生成
            $token = $user->createToken('auth_token')->plainTextToken;
            
            // フロントエンドにリダイレクト
            return redirect()->away(
                'http://localhost:5173/auth/callback?' . 
                http_build_query([
                    'token' => $token,
                    'user' => json_encode($user)
                ])
            );
            
        } catch (\Exception $e) {
            return redirect()->away('http://localhost:5173/auth/error');
        }
    }

    /**
     * メール認証処理
     */
    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals(sha1($user->email), $hash)) {
            return redirect()->away('http://localhost:5173/auth/error?message=invalid_verification');
        }

        if ($user->hasVerifiedEmail()) {
            return redirect()->away('http://localhost:5173/auth/error?message=already_verified');
        }

        $user->markEmailAsVerified();

        return redirect()->away('http://localhost:5173/auth/success?message=email_verified');
    }

    /**
     * メール認証メールの再送
     */
    public function resendVerificationEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'このメールアドレスは既に認証済みです。'
            ], 400);
        }

        // 新しい認証URLを生成
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        // メールを再送
        Mail::to($user->email)->send(new EmailVerification($verificationUrl, $user->name));

        return response()->json([
            'success' => true,
            'message' => '認証メールを再送しました。'
        ]);
    }
}
