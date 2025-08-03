import React from 'react';
import './EmailVerificationRequest.css';

function EmailVerificationRequest({ onSwitchToResendVerification, onSwitchToLogin }) {
  return (
    <div className="email-verification-request-container">
      <div className="email-verification-request-card">
        <div className="icon-container">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#667eea"/>
          </svg>
        </div>
        
        <h2>メール認証をお願いします</h2>
        
        <div className="message-content">
          <p>
            アカウント作成が完了しました！
          </p>
          <p>
            登録したメールアドレスに認証メールを送信しました。
            メール内の「メールアドレスを確認する」ボタンをクリックして認証を完了してください。
          </p>
        </div>

        <div className="action-buttons">
          <button 
            type="button" 
            onClick={() => {
              console.log('再送ボタンがクリックされました');
              onSwitchToResendVerification();
            }}
            className="resend-button"
          >
            メールが届かない場合は再送
          </button>
          
          <button 
            type="button" 
            onClick={onSwitchToLogin}
            className="login-button"
          >
            ログイン画面に戻る
          </button>
        </div>

        <div className="help-text">
          <p>
            ※ メールが届かない場合は、迷惑メールフォルダもご確認ください。
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmailVerificationRequest; 