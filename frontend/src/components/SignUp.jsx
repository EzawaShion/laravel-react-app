import { useState } from 'react';
import './SignUp.css';

function SignUp({ onSignUpSuccess, onSwitchToLogin }) {
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
        // トークンとユーザー情報をローカルストレージに保存
        localStorage.setItem('token', data.token);
        // ユーザー情報をローカルストレージに保存
        localStorage.setItem('user', JSON.stringify(data.user));
        // ログイン成功時のコールバックを呼び出し
        onSignUpSuccess(data.user);
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