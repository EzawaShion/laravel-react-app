import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SignUp from './components/SignUp'
import Login from './components/Login'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import ResendVerification from './components/ResendVerification'
import EmailVerificationRequest from './components/EmailVerificationRequest'
import CreatePost from './components/CreatePost'
import PostList from './components/PostList'
import PostDetail from './components/PostDetail'
import PhotoUpload from './components/PhotoUpload'
import Profile from './components/Profile'
import MapView from './components/MapView'
import EditPost from './components/EditPost'
import UserProfile from './components/UserProfile'

function App() {
  const [count, setCount] = useState(0)
  const [apiData, setApiData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showSignUp, setShowSignUp] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showResendVerification, setShowResendVerification] = useState(false)
  const [showEmailVerificationRequest, setShowEmailVerificationRequest] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showPostList, setShowPostList] = useState(false)
  const [showPostDetail, setShowPostDetail] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showEditPost, setShowEditPost] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [showMapView, setShowMapView] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [previousScreen, setPreviousScreen] = useState(null)
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const [user, setUser] = useState(null)
  

  // ユーザー認証状態の確認
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      // ログイン済みの場合はホーム画面（MapView）を表示
      // showMapViewは使わず、条件分岐で判定
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
      
      // ログイン後はホーム画面（MapView）を表示
      // showMapViewは使わず、条件分岐で判定
    }
  }, []);

  // メール認証結果の処理
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');

    if (message) {
      // メール認証結果を処理
      if (message === 'email_verified') {
        alert('メール認証が完了しました！ログインしてください。');
        // ログイン画面を表示
        setShowLogin(true);
      } else if (message === 'already_verified') {
        alert('このメールアドレスは既に認証済みです。');
        // ログイン画面を表示
        setShowLogin(true);
      } else if (message === 'invalid_verification') {
        alert('無効な認証リンクです。');
        // ログイン画面を表示
        setShowLogin(true);
      }
      
      // URLパラメータをクリア
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
    
    // URLパラメータをクリア
    window.history.replaceState({}, document.title, window.location.pathname);
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

  // パスワードリセット画面に切り替え
  const handleSwitchToForgotPassword = () => {
    setShowLogin(false);
    setShowForgotPassword(true);
  };

  // ログイン画面に戻る
  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setShowLogin(true);
  };

  // パスワードリセット成功時の処理
  const handleResetSuccess = (message) => {
    alert(message);
    setShowForgotPassword(false);
    setShowLogin(true);
    
    // URLパラメータをクリア
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleSwitchToResendVerification = () => {
    setShowLogin(false);
    setShowForgotPassword(false);
    setShowEmailVerificationRequest(false);
    setShowResendVerification(true);
  };

  const handleBackToLoginFromResend = () => {
    setShowResendVerification(false);
    setShowLogin(true);
  };

  const handleSwitchToEmailVerificationRequest = () => {
    setShowSignUp(false);
    setShowEmailVerificationRequest(true);
  };

  const handleBackToLoginFromEmailVerification = () => {
    setShowEmailVerificationRequest(false);
    setShowLogin(true);
  };

  const handleSwitchToCreatePost = () => {
    setShowPostList(false);
    setShowCreatePost(true);
  };

  const handleCancelCreatePost = () => {
    setShowCreatePost(false);
    // MapViewホーム画面に戻る
  };

  const handlePostCreated = (post) => {
    setShowCreatePost(false);
    setShowPostList(true);
    // 投稿作成後の処理（例：投稿一覧に追加など）
    console.log('投稿が作成されました:', post);
  };

  const handleSwitchToPostList = () => {
    setShowPostList(true);
  };

  const handlePostClick = (post) => {
    setSelectedPostId(post.id);
    setShowPostDetail(true);
    setShowPostList(false);
  };

  const handleBackToPostList = () => {
    setShowPostDetail(false);
    setSelectedPostId(null);
    setShowPostList(true);
  };

  const handleEditPost = (post) => {
    // 投稿編集画面に切り替え
    setSelectedPost(post);
    setShowEditPost(true);
    setShowPostDetail(false);
  };

  const handleDeletePost = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/posts/${selectedPostId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('投稿が削除されました');
        setShowPostDetail(false);
        setSelectedPostId(null);
        setShowPostList(true);
      } else {
        alert(data.message || '投稿の削除に失敗しました');
      }
    } catch (error) {
      alert('ネットワークエラーが発生しました');
    }
  };

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // 写真アップロード画面を表示
  const handleSwitchToPhotoUpload = (postId) => {
    setSelectedPostId(postId);
    setShowPhotoUpload(true);
    setShowPostDetail(false);
  };

  // 写真アップロード完了時の処理
  const handlePhotoUploadSuccess = (photos) => {
    setShowPhotoUpload(false);
    setShowPostDetail(true);
    alert(`${photos.length}枚の写真がアップロードされました！`);
    // 投稿詳細画面を再表示して写真一覧を更新
    window.location.reload();
  };

  // 投稿作成後の写真アップロード完了時の処理
  const handleCreatePostPhotoUploadSuccess = (photos) => {
    setShowPhotoUpload(false);
    setShowPostList(true);
    alert(`${photos.length}枚の写真がアップロードされました！`);
    // 投稿一覧を再読み込み
    window.location.reload();
  };

  // 写真アップロードキャンセル時の処理
  const handlePhotoUploadCancel = () => {
    setShowPhotoUpload(false);
    setShowPostDetail(true);
  };

  // プロフィール画面に切り替え
  const handleSwitchToProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setShowProfile(true);
      } else {
        console.error('プロフィールの取得に失敗しました');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // プロフィール画面から戻る
  const handleProfileBack = () => {
    setShowProfile(false);
  };

  // 他のユーザーのプロフィール画面から戻る
  const handleUserProfileBack = () => {
    setShowUserProfile(false);
    setSelectedUserId(null);
    
    // 前の画面に戻る
    if (previousScreen === 'postList') {
      setShowPostList(true);
    } else if (previousScreen === 'postDetail') {
      setShowPostDetail(true);
    } else if (previousScreen === 'profile') {
      setShowProfile(true);
    } else if (previousScreen === 'userProfile') {
      // 他のユーザープロフィールから別のユーザープロフィールに戻る場合は何もしない
      // （既にsetShowUserProfile(false)とsetSelectedUserId(null)が実行されている）
    } else {
      // デフォルトは投稿一覧
      setShowPostList(true);
    }
    
    setPreviousScreen(null);
  };

  // 投稿編集完了時の処理
  const handleEditPostSuccess = (updatedPost) => {
    setShowEditPost(false);
    setSelectedPost(null);
    setShowPostDetail(true);
    // 投稿詳細画面を再表示して更新されたデータを反映
    window.location.reload();
  };

  // 投稿編集画面から戻る
  const handleEditPostBack = () => {
    setShowEditPost(false);
    setSelectedPost(null);
    setShowPostDetail(true);
  };

  // プロフィール更新時の処理
  const handleProfileUpdated = (updatedUser) => {
    console.log('Profile updated in App.jsx:', updatedUser);
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // プロフィール画面を閉じる
    setShowProfile(false);
    
    // 成功メッセージを表示
    alert('プロフィールが正常に更新されました！');
  };

  // マップ画面を表示
  if (showMapView) {
    return (
      <MapView
        onBack={() => {
          setShowMapView(false);
          setShowPostList(true);
        }}
        onPostClick={(postId) => {
          setSelectedPostId(postId);
          setShowPostDetail(true);
          setShowMapView(false);
        }}
      />
    );
  }

  // 投稿詳細画面を表示
  if (showPostDetail && selectedPostId) {
    return (
      <PostDetail 
        postId={selectedPostId}
        onBackToList={handleBackToPostList}
        onEditPost={handleEditPost}
        onDeletePost={handleDeletePost}
        onPhotoUpload={() => handleSwitchToPhotoUpload(selectedPostId)}
        onUserClick={(userId) => {
          console.log('PostDetail onUserClick called with userId:', userId);
          setPreviousScreen('postDetail');
          setShowPostDetail(false);
          setSelectedUserId(userId);
          setShowUserProfile(true);
        }}
      />
    );
  }

  // プロフィール画面を表示
  if (showProfile) {
    return (
      <Profile
        onBack={handleProfileBack}
        onProfileUpdated={handleProfileUpdated}
        onUserClick={(userId) => {
          setPreviousScreen('profile');
          setShowProfile(false);
          setSelectedUserId(userId);
          setShowUserProfile(true);
        }}
        onPostClick={(postId) => {
          setSelectedPostId(postId);
          setShowPostDetail(true);
          setShowProfile(false);
        }}
        onLogout={handleLogout}
      />
    );
  }

  // 他のユーザーのプロフィール画面を表示
  if (showUserProfile && selectedUserId) {
    return (
      <UserProfile
        userId={selectedUserId}
        onBack={handleUserProfileBack}
        onSwitchToProfile={() => {
          setShowUserProfile(false);
          setSelectedUserId(null);
          setShowProfile(true);
        }}
        onUserClick={(userId) => {
          setPreviousScreen('userProfile');
          setShowUserProfile(false);
          setSelectedUserId(userId);
          setShowUserProfile(true);
        }}
        onPostClick={(postId) => {
          setSelectedPostId(postId);
          setShowPostDetail(true);
          setShowUserProfile(false);
        }}
      />
    );
  }

  // 写真アップロード画面を表示
  if (showPhotoUpload && selectedPostId) {
    return (
      <PhotoUpload
        postId={selectedPostId}
        onUploadSuccess={showCreatePost ? handleCreatePostPhotoUploadSuccess : handlePhotoUploadSuccess}
        onCancel={handlePhotoUploadCancel}
      />
    );
  }

  // 投稿一覧画面を表示
  if (showPostList) {
    return (
      <PostList 
        onPostClick={handlePostClick}
        onCreatePost={handleSwitchToCreatePost}
        onUserClick={(userId) => {
          setPreviousScreen('postList');
          setShowPostList(false);
          setSelectedUserId(userId);
          setShowUserProfile(true);
        }}
        onMapView={() => {
          setShowPostList(false);
        }}
      />
    );
  }

  // 投稿作成画面を表示
  if (showCreatePost) {
    return (
      <CreatePost 
        onPostCreated={handlePostCreated}
        onCancel={handleCancelCreatePost}
        onPhotoUpload={handleSwitchToPhotoUpload}
      />
    );
  }

  // メール認証依頼画面を表示
  if (showEmailVerificationRequest) {
    return (
      <EmailVerificationRequest 
        onSwitchToResendVerification={handleSwitchToResendVerification}
        onSwitchToLogin={handleBackToLoginFromEmailVerification}
      />
    );
  }

  // サインアップ画面を表示
  if (showSignUp) {
    return (
      <SignUp 
        onSignUpSuccess={handleSignUpSuccess}
        onSwitchToLogin={handleSwitchToLogin}
        onSwitchToEmailVerificationRequest={handleSwitchToEmailVerificationRequest}
      />
    );
  }

  // メール再送画面を表示
  if (showResendVerification) {
    return (
      <ResendVerification 
        onBackToLogin={handleBackToLoginFromResend}
      />
    );
  }

  // ログイン画面を表示
  if (showLogin) {
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignUp={handleSwitchToSignUp}
        onSwitchToForgotPassword={handleSwitchToForgotPassword}
      />
    );
  }

  // パスワードリセット要求画面を表示
  if (showForgotPassword) {
    return (
      <ForgotPassword 
        onBackToLogin={handleBackToLogin}
        onSwitchToResendVerification={handleSwitchToResendVerification}
      />
    );
  }

  // パスワードリセット画面を表示（URLパラメータで判定）
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get('token');
  const resetEmail = urlParams.get('email');
  
  // パスワードリセット用のトークンとメールアドレスが両方存在する場合のみ表示
  if (resetToken && resetEmail && !user) {
    return (
      <ResetPassword 
        onResetSuccess={handleResetSuccess}
      />
    );
  }

  // 投稿編集画面
  if (showEditPost && selectedPost) {
    return (
      <EditPost
        post={selectedPost}
        onBack={handleEditPostBack}
        onUpdateSuccess={handleEditPostSuccess}
      />
    );
  }




  // 投稿作成画面
  if (showCreatePost) {
    return (
      <CreatePost
        onBackToList={handleBackToPostList}
        onPhotoUpload={handleSwitchToPhotoUpload}
        onPhotoUploadSuccess={handleCreatePostPhotoUploadSuccess}
      />
    );
  }

  // プロフィール画面
  if (showProfile) {
    return (
      <Profile
        onBack={handleProfileBack}
        onProfileUpdated={handleProfileUpdated}
        onPostClick={(postId) => {
          setSelectedPostId(postId);
          setShowPostDetail(true);
          setShowProfile(false);
        }}
      />
    );
  }

  // 写真アップロード画面
  if (showPhotoUpload && selectedPostId) {
    return (
      <PhotoUpload
        postId={selectedPostId}
        onBack={handlePhotoUploadCancel}
        onUploadSuccess={handlePhotoUploadSuccess}
      />
    );
  }

  // ログイン済みユーザーの場合、MapViewをホーム画面として表示
  if (user && !showSignUp && !showLogin && !showForgotPassword && !showResendVerification && !showEmailVerificationRequest && !showCreatePost && !showPostList && !showPostDetail && !showPhotoUpload && !showProfile && !showEditPost && !showUserProfile) {
    // デバッグ用ログ
    console.log('App.jsx: Rendering MapView with navigation functions');
    
    const handleNavigateToPostList = () => {
      console.log('App.jsx: Navigate to PostList');
      setShowPostList(true);
    };
    
    const handleNavigateToCreatePost = () => {
      console.log('App.jsx: Navigate to CreatePost');
      setShowCreatePost(true);
    };
    
    const handleNavigateToProfile = () => {
      console.log('App.jsx: Navigate to Profile');
      setShowProfile(true);
    };
    
    return (
      <MapView
        onBack={() => {}} // ホーム画面なのでバック機能は不要
        onPostClick={(postId) => {
          setSelectedPostId(postId);
          setShowPostDetail(true);
        }}
        onNavigateToPostList={handleNavigateToPostList}
        onNavigateToCreatePost={handleNavigateToCreatePost}
        onNavigateToProfile={handleNavigateToProfile}
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
            <div className="user-actions">
              <button 
                onClick={handleSwitchToPostList}
                className="post-list-button"
              >
                投稿一覧
              </button>
              <button 
                onClick={handleSwitchToCreatePost}
                className="create-post-button"
              >
                新規投稿
              </button>
              <button 
                onClick={handleSwitchToProfile}
                className="profile-button"
              >
                プロフィール
              </button>
              <button onClick={handleLogout} className="logout-button">
                ログアウト
              </button>
            </div>
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
