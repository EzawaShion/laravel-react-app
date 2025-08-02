import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SignUp from './components/SignUp'

function App() {
  const [count, setCount] = useState(0)
  const [apiData, setApiData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showSignUp, setShowSignUp] = useState(false)
  const [user, setUser] = useState(null)

  // ユーザー認証状態の確認
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
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

  // ログイン画面に切り替え
  const handleSwitchToLogin = () => {
    // ログイン画面の実装は後で追加
    console.log('ログイン画面に切り替え');
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
          <button 
            onClick={() => setShowSignUp(true)}
            className="signup-button"
          >
            アカウント作成
          </button>
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
