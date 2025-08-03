import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SignUp from './components/SignUp'
import Login from './components/Login'

function App() {
  const [count, setCount] = useState(0)
  const [apiData, setApiData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showSignUp, setShowSignUp] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState(null)

  // ユーザー認証状態の確認
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Google OAuthコールバック処理
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');
    
    if (token && user) {
      // トークンとユーザー情報を保存
      localStorage.setItem('token', token);
      localStorage.setItem('user', user);
      setUser(JSON.parse(user));
      
      // URLからパラメータを削除
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // LaravelのAPIを呼び出す関数
  const fetchApiData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:8000/api/hello')
      if (!response.ok) {
        throw new Error('APIリクエストに失敗しました')
      }
      const data = await response.json()
      setApiData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // コンポーネントマウント時にAPIを呼び出す
  useEffect(() => {
    fetchApiData()
  }, [])

  // サインアップ成功時の処理
  const handleSignUpSuccess = (userData) => {
    setUser(userData);
    setShowSignUp(false);
  };

  // ログイン成功時の処理
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowLogin(false);
  };

  // ログイン画面に切り替え
  const handleSwitchToLogin = () => {
    setShowSignUp(false);
    setShowLogin(true);
  };

  // サインアップ画面に切り替え
  const handleSwitchToSignUp = () => {
    setShowLogin(false);
    setShowSignUp(true);
  };

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // サインアップ画面を表示
  if (showSignUp) {
    return (
      <SignUp 
        onSignUpSuccess={handleSignUpSuccess}
        onSwitchToLogin={handleSwitchToLogin}
      />
    );
  }

  // ログイン画面を表示
  if (showLogin) {
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignUp={handleSwitchToSignUp}
      />
    );
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Laravel API</h1>

      {/* ユーザー認証状態の表示 */}
      <div className="auth-section">
        {user ? (
          <div className="user-info">
            <p>ようこそ、{user.name}さん！</p>
            <button onClick={handleLogout} className="logout-button">
              ログアウト
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <button 
              onClick={() => setShowLogin(true)}
              className="login-button"
            >
              ログイン
            </button>
            <button 
              onClick={() => setShowSignUp(true)}
              className="signup-button"
            >
              アカウント作成
            </button>
          </div>
        )}
      </div>

      {/* APIデータの表示 */}
      <div className="card">
        <h2>Laravel API からのデータ</h2>
        {loading && <p>読み込み中...</p>}
        {error && <p style={{ color: 'red' }}>エラー: {error}</p>}
        {apiData && (
          <div>
            <p><strong>メッセージ:</strong> {apiData.message}</p>
            <p><strong>タイムスタンプ:</strong> {apiData.timestamp}</p>
            <button onClick={fetchApiData}>再取得</button>
          </div>
        )}
      </div>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
