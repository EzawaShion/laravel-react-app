import { useState, useEffect, useRef } from 'react'
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
const ModernPin = ({ width = 24, height = 24, color = "#ef4444" }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill={color} stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.25))' }}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="3" fill="#ffffff" stroke="none" />
  </svg>
);

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
  const [draftPost, setDraftPost] = useState(null)
  // スクロール位置の保存用
  const scrollPositions = useRef({});
  // PostList復帰時スクロール位置
  const [savedScrollForPostList, setSavedScrollForPostList] = useState(null);


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
      const response = await fetch('/api/hello')
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
    // 投稿作成後はマップビュー（ホーム）に戻る
    console.log('投稿が作成されました:', post);
  };

  const handleSwitchToPostList = () => {
    window.history.pushState({ view: 'postList' }, '');
    setShowPostList(true);
  };

  const handlePostClick = (post) => {
    // 現在のスクロール位置を保存
    scrollPositions.current['beforePostDetail'] = window.scrollY;
    console.log('[App] saving scrollY before postDetail:', window.scrollY);
    setPreviousScreen('postList');
    setSelectedPostId(post.id);
    window.history.pushState({ view: 'postDetail', postId: post.id }, '');
    setShowPostDetail(true);
    setShowPostList(false);
    window.scrollTo(0, 0);
  };

  const handleBackToPostList = () => {
    const savedScroll = scrollPositions.current['beforePostDetail'] || 0;
    console.log('[App] restoring scrollY:', savedScroll, '/ previousScreen:', previousScreen);
    setShowPostDetail(false);
    setSelectedPostId(null);

    if (previousScreen === 'profile') {
      setShowProfile(true);
    } else if (previousScreen === 'userProfile') {
      setShowUserProfile(true);
    } else if (previousScreen === 'postList') {
      setSavedScrollForPostList(savedScroll);
      setShowPostList(true);
    } else {
      // デフォルト（マップビュー）
    }
    setPreviousScreen(null);
  };

  const handleEditPost = (post) => {
    // 投稿編集画面に切り替え
    setSelectedPost(post);
    setShowEditPost(true);
    setShowPostDetail(false);
  };

  const handleDeletePost = () => {
    // 既にPostDetail側で削除が完了しているので、ここでは画面遷移のみ行う
    setShowPostDetail(false);
    setSelectedPostId(null);

    // 削除後、前の画面に戻る
    if (previousScreen === 'profile') {
      setShowProfile(true);
    } else if (previousScreen === 'userProfile') {
      setShowUserProfile(true);
    } else if (previousScreen === 'postList') {
      setShowPostList(true);
    } else {
      // デフォルト（マップビュー）
      // 特に処理不要（自動的にMapが表示される）
    }
    setPreviousScreen(null);
  };

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // 写真アップロード画面を表示
  // 写真アップロード画面を表示
  const handleSwitchToPhotoUpload = (postOrIdOrDraft) => {
    let postId;
    if (typeof postOrIdOrDraft === 'object') {
      if (postOrIdOrDraft.id) {
        postId = postOrIdOrDraft.id;
        setSelectedPost(postOrIdOrDraft);
        setDraftPost(null);
      } else {
        // IDがない場合はドラフトデータ
        setDraftPost(postOrIdOrDraft);
        postId = null;
        setSelectedPost(null);
      }
    } else {
      postId = postOrIdOrDraft;
      setSelectedPost(null);
      setDraftPost(null);
    }

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
    // 投稿完了後はマップビュー（ホーム）に戻る
    alert(`${photos.length}枚の写真がアップロードされました！`);
    window.location.reload();
  };

  // 写真アップロードキャンセル時の処理
  const handlePhotoUploadCancel = () => {
    setShowPhotoUpload(false);
    if (isFromCreatePost) {
      // 新規投稿フローからのキャンセルの場合は編集画面に戻る
      setShowCreatePost(true);
      // setShowEditPost(true); 
    } else {
      setShowPostDetail(true);
    }
  };

  // プロフィール画面に切り替え
  const handleSwitchToProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile', {
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
    // プロフィール画面はそのまま表示（閉じない）
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
                setPreviousScreen('mapView');
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
            savedScrollY={savedScrollForPostList}
            onScrollRestored={() => setSavedScrollForPostList(null)}
          />
        )}

        {/* 投稿作成画面 */}
        {showCreatePost && (
          <CreatePost
            onPostCreated={handlePostCreated}
            onCancel={handleCancelCreatePost}
            onPhotoUpload={handleSwitchToPhotoUpload}
            initialData={draftPost}
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
              scrollPositions.current['beforePostDetail'] = window.scrollY;
              setPreviousScreen('profile');
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
              scrollPositions.current['beforePostDetail'] = window.scrollY;
              setPreviousScreen('userProfile');
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
              setShowProfile(false);
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
        {showPhotoUpload && (selectedPostId || draftPost) && (
          <PhotoUpload
            postId={selectedPostId}
            onUploadSuccess={isFromCreatePost ? handleCreatePostPhotoUploadSuccess : handlePhotoUploadSuccess}
            onCancel={handlePhotoUploadCancel}
            isFromCreatePost={isFromCreatePost}
            draftPost={draftPost}
          />
        )}

        <Sidebar
          onNavigateToHome={handleNavigateToHome}
          onNavigateToCreatePost={handleNavigateToCreatePost}
          onNavigateToProfile={handleNavigateToProfile}
          onNavigateToUserSearch={handleNavigateToUserSearch}
          currentPage={
            showUserSearch ? 'userSearch'
            : showProfile ? 'profile'
            : showCreatePost ? 'createPost'
            : (!showPostList && !showPostDetail && !showEditPost && !showPhotoUpload && !showUserProfile) ? 'home'
            : null
          }
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
    <div className="landing-page">
      {/* 背景グラデーション＋地図モチーフ */}
      <div className="landing-bg">
        <div className="landing-bg-dots" />
      </div>

      {/* ヘッダー */}
      <header className="landing-header">
        <div style={{ width: '36px', height: '36px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/favicon.png" alt="TravelMap Logo" style={{ width: '170%', height: '170%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
        </div>
        <span className="landing-brand">TravelMap</span>
      </header>

      {/* ヒーローセクション */}
      <main className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-badge">
            <ModernPin width={16} height={16} color="#4f46e5" />
            <span style={{ marginLeft: '6px' }}>旅の記録をもっと豊かに</span>
          </div>
          <h1 className="landing-title">
            あなたの旅を<br />
            <span className="landing-title-accent">地図で残そう</span>
          </h1>
          <p className="landing-subtitle">
            訪れた場所の写真・エピソードを地図と一緒に記録。<br className="landing-br" />
            友達とシェアして、思い出をもっと鮮やかに。
          </p>

          <div className="landing-actions">
            <button
              onClick={() => setShowSignUp(true)}
              className="landing-btn-primary"
            >
              サインアップ
            </button>
            <button
              onClick={() => setShowLogin(true)}
              className="landing-btn-secondary"
            >
              ログイン
            </button>
          </div>
        </div>

        {/* マップカード装飾 */}
        <div className="landing-map-card">
          <div className="landing-map-pin pin-1"><ModernPin /></div>
          <div className="landing-map-pin pin-2"><ModernPin /></div>
          <div className="landing-map-pin pin-3"><ModernPin /></div>
          <div className="landing-map-pin pin-4"><ModernPin /></div>
          <div className="landing-map-pin pin-5"><ModernPin /></div>
          <div className="landing-map-pin pin-6"><ModernPin /></div>
          <div className="landing-map-pin pin-7"><ModernPin /></div>
          <div className="landing-map-pin pin-8"><ModernPin /></div>
          <div className="landing-map-pin pin-9"><ModernPin /></div>
          <div className="landing-map-pin pin-10"><ModernPin /></div>
        </div>
      </main>

      {/* フィーチャー */}
      <section className="landing-features">
        <div className="landing-feature-card feature-card--map">
          <div className="feature-icon-wrap feature-icon-wrap--indigo">
            {/* Map pin icon */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h3>インタラクティブマップ</h3>
          <p>日本全国の投稿をマップ上で一覧。どこに何があるかが一目でわかる。</p>
        </div>
        <div className="landing-feature-card feature-card--selfmap">
          <div className="feature-icon-wrap feature-icon-wrap--violet">
            {/* Japan / map icon */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" y1="3" x2="9" y2="18" />
              <line x1="15" y1="6" x2="15" y2="21" />
            </svg>
          </div>
          <h3>自分だけの日本地図</h3>
          <p>訪れた都道府県に写真とエピソードを刻んで、あなただけのオリジナル日本地図を育てよう。</p>
        </div>
        <div className="landing-feature-card feature-card--social">
          <div className="feature-icon-wrap feature-icon-wrap--rose">
            {/* Heart icon */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <h3>フォロー＆いいね</h3>
          <p>友達の旅をフォローして、いいねで応援しよう。旅仲間と繋がれる。</p>
        </div>
      </section>

      {/* フッター */}
      <footer className="landing-footer">
        <p>© 2026 TravelMap</p>
      </footer>
    </div>
  )
}

export default App
