import React, { useState } from 'react';
import './ResendVerification.css';

function ResendVerification({ onBackToLogin }) {
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
      const response = await fetch('http://localhost:8000/api/email/verification-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setEmail('');
      } else {
        setError(data.message || 'メールの再送に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resend-verification-container">
      <div className="resend-verification-form">
        <h2>メール認証メールの再送</h2>
        <p className="description">
          メールが届かない場合は、登録時のメールアドレスを入力して再送してください。
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
          </div>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? '送信中...' : 'メールを再送'}
          </button>
        </form>

        <div className="back-to-login">
          <button 
            type="button" 
            onClick={onBackToLogin} 
            className="link-button"
          >
            ログイン画面に戻る
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResendVerification; 