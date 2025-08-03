import { useState } from 'react';
import './SignUp.css';

function SignUp({ onSignUpSuccess, onSwitchToLogin, onSwitchToEmailVerificationRequest }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    // フォームのデフォルトの動作を防止
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // バックエンドのAPIエンドポイントにPOSTリクエストを送信
      const response = await fetch('http://localhost:8000/api/register', {
        // POSTリクエストを送信
        method: 'POST',
        // ヘッダーを設定
        headers: {
          'Content-Type': 'application/json',
        },
        // フォームデータをJSON形式で送信
        body: JSON.stringify(formData)
      });

      // レスポンスをJSON形式で解析
      const data = await response.json();

      // レスポンスが成功（200）の場合
      if (response.ok) {
        // 成功時の処理
        if (data.requires_verification) {
          // メール認証が必要な場合
          onSwitchToEmailVerificationRequest();
        } else {
          // メール認証が不要な場合（Google OAuthなど）
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          onSignUpSuccess(data.user);
        }
      } else {
        // エラー時の処理
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.message || '登録に失敗しました' });
        }
      }
    } catch (error) {
      setErrors({ general: 'ネットワークエラーが発生しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8000/auth/google';
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>アカウント作成</h2>
        <p className="subtitle">旅行プランナーに参加しましょう！</p>
        
        {errors.general && (
          <div className="error-message">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="name">お名前</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="山田太郎"
              required
            />
            {errors.name && <span className="error-text">{errors.name[0]}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="example@email.com"
              required
            />
            {errors.email && <span className="error-text">{errors.email[0]}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="8文字以上で入力"
              required
            />
            {errors.password && <span className="error-text">{errors.password[0]}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password_confirmation">パスワード（確認）</label>
            <input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              className={errors.password_confirmation ? 'error' : ''}
              placeholder="パスワードを再入力"
              required
            />
            {errors.password_confirmation && <span className="error-text">{errors.password_confirmation[0]}</span>}
          </div>

          <button 
            type="submit" 
            className="signup-button"
            disabled={loading}
          >
            {loading ? '登録中...' : 'アカウント作成'}
          </button>
        </form>

        <div className="divider">
          <span>または</span>
        </div>

        <button 
          type="button" 
          onClick={handleGoogleLogin}
          className="google-login-button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Googleでアカウント作成
        </button>

        <div className="login-link">
          <p>
            既にアカウントをお持ちですか？{' '}
            <button 
              type="button" 
              onClick={onSwitchToLogin}
              className="link-button"
            >
              ログイン
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default SignUp; 