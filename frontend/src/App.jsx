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
import UserSearch from './components/UserSearch'
import Sidebar from './components/Sidebar'

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
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [previousScreen, setPreviousScreen] = useState(null)
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const [user, setUser] = useState(null)
  const [isFromCreatePost, setIsFromCreatePost] = useState(false)


  // ユーザー認証状態と表示画面の復元
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const savedView = localStorage.getItem('appViewState');

    if (token && userData) {
      setUser(JSON.parse(userData));

      // 保存された表示状態があれば復元
      if (savedView) {
        try {
          const state = JSON.parse(savedView);
          setShowPostList(state.showPostList || false);
          setShowCreatePost(state.showCreatePost || false);
          setShowPostDetail(state.showPostDetail || false);
          setShowPhotoUpload(state.showPhotoUpload || false);
          setShowProfile(state.showProfile || false);
          setShowEditPost(state.showEditPost || false);
          setShowUserProfile(state.showUserProfile || false);
          setShowUserSearch(state.showUserSearch || false);
          setShowMapView(state.showMapView || false);
          setSelectedUserId(state.selectedUserId || null);
          setSelectedPostId(state.selectedPostId || null);
          setPreviousScreen(state.previousScreen || null);
        } catch (e) {
          console.error('Failed to restore view state:', e);
        }
      }
    }
  }, []);

  // ブラウザの戻るボタン処理
  useEffect(() => {
    const handlePopState = (event) => {
      // 全て閉じる（デフォルトでマップビュー）
      setShowPostList(false);
      setShowCreatePost(false);
      setShowPostDetail(false);
      setShowPhotoUpload(false);
      setShowProfile(false);
      setShowEditPost(false);
      setShowUserProfile(false);
      setShowUserSearch(false);
      setShowMapView(false);
      setSelectedPostId(null);

      if (event.state) {
        switch (event.state.view) {
          case 'profile':
            setShowProfile(true);
            break;
          case 'userProfile':
            if (event.state.userId) {
              setSelectedUserId(event.state.userId);
              setShowUserProfile(true);
            }
            break;
          case 'postList':
            setShowPostList(true);
            break;
          case 'postDetail':
            if (event.state.postId) {
              setSelectedPostId(event.state.postId);
              setShowPostDetail(true);
            }
            break;
          case 'createPost':
            setShowCreatePost(true);
            break;
          default:
            // マップビュー（何もしない）
            break;
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 表示状態が変わるたびにlocalStorageに保存
  useEffect(() => {
    if (user) {
      const state = {
        showPostList,
        showCreatePost,
        showPostDetail,
        showPhotoUpload,
        showProfile,
        showEditPost,
        showUserProfile,
        showUserSearch,
        showMapView,
        selectedUserId,
        selectedPostId,
        previousScreen
      };
      localStorage.setItem('appViewState', JSON.stringify(state));
    } else {
      // ログアウト時は状態をクリア
      localStorage.removeItem('appViewState');
    }
  }, [
    user, showPostList, showCreatePost, showPostDetail, showPhotoUpload,
    showProfile, showEditPost, showUserProfile, showUserSearch, showMapView,
    selectedUserId, selectedPostId, previousScreen
  ]);


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
    window.history.pushState({ view: 'createPost' }, '');
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
    window.history.pushState({ view: 'postList' }, '');
    setShowPostList(true);
  };

  const handlePostClick = (post) => {
    setSelectedPostId(post.id);
    window.history.pushState({ view: 'postDetail', postId: post.id }, '');
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
  // 写真アップロード画面を表示
  const handleSwitchToPhotoUpload = (postId) => {
    setSelectedPostId(postId);
    setShowPhotoUpload(true);
    setShowPostDetail(false);

    if (showCreatePost) {
      setIsFromCreatePost(true);
      setShowCreatePost(false);
    } else {
      setIsFromCreatePost(false);
    }
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
    if (isFromCreatePost) {
      setShowPostList(true);
      setIsFromCreatePost(false);
    } else {
      setShowPostDetail(true);
    }
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

        // 他の画面を閉じてプロフィールを表示
        setShowPostList(false);
        setShowCreatePost(false);
        setShowPostDetail(false);
        setShowUserProfile(false);
        setShowUserSearch(false);
        setShowEditPost(false);
        setShowPhotoUpload(false);
        setShowMapView(false); // MapViewは状態フラグではなく条件分岐で制御されているが念のため

        window.history.pushState({ view: 'profile' }, '');
        setShowProfile(true);
      } else {
        console.error('プロフィールの取得に失敗しました');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleNavigateToUserSearch = () => {
    // 他の画面を閉じずに、ユーザー検索画面だけを表示（オーバーレイとして重ねる）
    setShowUserSearch(true);
  };

  const handleCloseUserSearch = () => {
    setShowUserSearch(false);
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

  // ログイン済みユーザーの場合、Sidebarを表示し、各画面を制御
  if (user) {
    const handleNavigateToHome = () => {
      // 全てのフラグをオフにするとMapView（ホーム）が表示される
      setShowPostList(false);
      setShowCreatePost(false);
      setShowPostDetail(false);
      setShowProfile(false);
      setShowUserProfile(false);
      setShowUserSearch(false);
      setShowEditPost(false);
      setShowPhotoUpload(false);
    };

    const handleNavigateToPostList = () => {
      handleNavigateToHome();
      window.history.pushState({ view: 'postList' }, '');
      setShowPostList(true);
    };

    const handleNavigateToCreatePost = () => {
      handleNavigateToHome();
      window.history.pushState({ view: 'createPost' }, '');
      setShowCreatePost(true);
    };

    const handleNavigateToProfile = () => {
      handleSwitchToProfile();
    };

    return (
      <div className="app-container">
        {/* 地図（ホーム）画面 */}
        {(!showPostList && !showCreatePost && !showPostDetail && !showProfile && !showUserProfile && !showEditPost && !showPhotoUpload) && (
          (!showUserSearch || window.innerWidth > 768) ? (
            <MapView
              onBack={() => { }}
              onPostClick={(postId) => {
                setSelectedPostId(postId);
                window.history.pushState({ view: 'postDetail', postId }, '');
                setShowPostDetail(true);
              }}
              onNavigateToPostList={handleNavigateToPostList}
              onNavigateToCreatePost={handleNavigateToCreatePost}
              onNavigateToProfile={handleNavigateToProfile}
              onUserClick={(userId) => {
                setPreviousScreen('mapView');
                setShowMapView(false);
                setSelectedUserId(userId);
                window.history.pushState({ view: 'userProfile', userId }, '');
                setShowUserProfile(true);
              }}
            />
          ) : null
        )}

        {/* 投稿一覧画面 */}
        {showPostList && (
          <PostList
            onPostClick={handlePostClick}
            onCreatePost={handleSwitchToCreatePost}
            onUserClick={(userId) => {
              setPreviousScreen('postList');
              setShowPostList(false);
              setSelectedUserId(userId);
              setShowUserProfile(true);
            }}
            onMapView={handleNavigateToHome}
          />
        )}

        {/* 投稿作成画面 */}
        {showCreatePost && (
          <CreatePost
            onPostCreated={handlePostCreated}
            onCancel={handleCancelCreatePost}
            onPhotoUpload={handleSwitchToPhotoUpload}
          />
        )}

        {/* 投稿詳細画面 */}
        {showPostDetail && selectedPostId && (
          <PostDetail
            postId={selectedPostId}
            onBackToList={handleBackToPostList}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            onPhotoUpload={() => handleSwitchToPhotoUpload(selectedPostId)}
            onUserClick={(userId) => {
              setPreviousScreen('postDetail');
              setShowPostDetail(false);
              setSelectedUserId(userId);
              setShowUserProfile(true);
            }}
          />
        )}

        {/* プロフィール画面 */}
        {showProfile && (
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
            onNavigateToUserSearch={handleNavigateToUserSearch}
          />
        )}

        {/* 他のユーザーのプロフィール */}
        {showUserProfile && selectedUserId && (
          <UserProfile
            userId={selectedUserId}
            onBack={handleUserProfileBack}
            onSwitchToProfile={handleNavigateToProfile}
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
        )}

        {/* ユーザー検索 */}
        {showUserSearch && (
          <UserSearch
            onNavigateToProfile={handleNavigateToProfile}
            onNavigateToUserProfile={(userId) => {
              setPreviousScreen('userSearch');
              setShowUserSearch(false);
              setSelectedUserId(userId);
              setShowUserProfile(true);
            }}
            onClose={handleCloseUserSearch}
          />
        )}

        {/* 投稿編集 */}
        {showEditPost && selectedPost && (
          <EditPost
            post={selectedPost}
            onBack={handleEditPostBack}
            onUpdateSuccess={handleEditPostSuccess}
          />
        )}

        {/* 写真アップロード */}
        {showPhotoUpload && selectedPostId && (
          <PhotoUpload
            postId={selectedPostId}
            onUploadSuccess={isFromCreatePost ? handleCreatePostPhotoUploadSuccess : handlePhotoUploadSuccess}
            onCancel={handlePhotoUploadCancel}
          />
        )}

        <Sidebar
          onNavigateToHome={handleNavigateToHome}
          onNavigateToCreatePost={handleNavigateToCreatePost}
          onNavigateToProfile={handleNavigateToProfile}
          onNavigateToUserSearch={handleNavigateToUserSearch}
        />
      </div>
    );
  }

  // 未ログインユーザー向けの画面制御
  if (showLogin) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignUp={handleSwitchToSignUp}
        onSwitchToForgotPassword={handleSwitchToForgotPassword}
      />
    );
  }

  if (showSignUp) {
    return (
      <SignUp
        onSignUpSuccess={handleSignUpSuccess}
        onSwitchToLogin={handleSwitchToLogin}
        onSwitchToEmailVerificationRequest={handleSwitchToEmailVerificationRequest}
      />
    );
  }

  if (showForgotPassword) {
    return (
      <ForgotPassword
        onBackToLogin={handleBackToLogin}
        onSwitchToResendVerification={handleSwitchToResendVerification}
      />
    );
  }

  if (showEmailVerificationRequest) {
    return (
      <EmailVerificationRequest
        onSwitchToResendVerification={handleSwitchToResendVerification}
        onSwitchToLogin={handleBackToLoginFromEmailVerification}
      />
    );
  }

  if (showResendVerification) {
    return (
      <ResendVerification
        onBackToLogin={handleBackToLoginFromResend}
      />
    );
  }

  // パスワードリセット画面を表示（URLパラメータで判定）
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get('token');
  const resetEmail = urlParams.get('email');

  if (resetToken && resetEmail && !user) {
    return (
      <ResetPassword
        onResetSuccess={handleResetSuccess}
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
