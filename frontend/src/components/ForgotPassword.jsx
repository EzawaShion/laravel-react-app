import { useState } from 'react';
import './ForgotPassword.css';

function ForgotPassword({ onBackToLogin, onSwitchToResendVerification }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/password/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setEmail('');
      } else {
        setError(data.message || 'エラーが発生しました');
      }
    } catch (error) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>パスワードを忘れた場合</h2>
        <p className="forgot-password-subtitle">
          登録したメールアドレスを入力してください。<br />
          パスワードリセット用のメールをお送りします。
        </p>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
          </div>

          <button type="submit" className="reset-button" disabled={loading}>
            {loading ? '送信中...' : 'リセットメール送信'}
          </button>
        </form>

        <div className="back-to-login">
          <button onClick={onBackToLogin} className="link-button">
            ← ログイン画面に戻る
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword; 