import React, { useState, useEffect, useRef } from 'react';
import FollowList from './FollowList';
import JapanMapSimple from './JapanMapSimple';
import LikeButton from './LikeButton';
import ProfileEditModal from './ui/ProfileEditModal';
import './Profile.css';

function Profile({ onBack, onProfileUpdated, onUserClick, onPostClick, onLogout, onNavigateToUserSearch }) {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    bio: '',
    website: '',
    profile_image_preview: null,
    privacy_settings: {
      show_followers: true,
      show_followings: true
    },
    likes_visibility: 'public',
    map_visibility: 'public',
  });
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [showFollowList, setShowFollowList] = useState(false);
  const [followListType, setFollowListType] = useState('followers');
  const [followStats, setFollowStats] = useState({
    followers_count: 0,
    followings_count: 0
  });
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState([]);
  const [likedPostsLoading, setLikedPostsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchFollowStats();
  }, []);

  // userが読み込まれた後に投稿を取得
  useEffect(() => {
    if (user && user.id) {
      fetchMyPosts();
    }
  }, [user]);

  // いいねタブに切り替えた際にいいね投稿を取得
  useEffect(() => {
    if (activeTab === 'likes' && likedPosts.length === 0 && !likedPostsLoading) {
      fetchLikedPosts();
    }
  }, [activeTab]);

  // 投稿クリック時にスクロール位置を保存するラッパー
  const handlePostClick = (postId) => {
    sessionStorage.setItem('profileScrollTop', window.scrollY);
    sessionStorage.setItem('profileActiveTab', activeTab);
    if (onPostClick) onPostClick(postId);
  };

  // マウント後、投稿リストが表示されたらスクロール位置を復元
  useEffect(() => {
    const saved = sessionStorage.getItem('profileScrollTop');
    const savedTab = sessionStorage.getItem('profileActiveTab');
    if (saved) {
      // タブを復元
      if (savedTab) setActiveTab(savedTab);
      // タブ別の復元キーに振り分け
      if (savedTab === 'likes') {
        sessionStorage.setItem('profileScrollRestoreLikes', saved);
      } else {
        sessionStorage.setItem('profileScrollRestore', saved);
      }
      sessionStorage.removeItem('profileScrollTop');
      sessionStorage.removeItem('profileActiveTab');
    }
  }, []);

  // 投稿データ読み込み完了後にスクロール復元
  useEffect(() => {
    const saved = sessionStorage.getItem('profileScrollRestore');
    if (!postsLoading && saved) {
      setTimeout(() => {
        window.scrollTo({ top: parseInt(saved, 10), behavior: 'instant' });
        sessionStorage.removeItem('profileScrollRestore');
      }, 80);
    }
  }, [postsLoading]);

  useEffect(() => {
    const saved = sessionStorage.getItem('profileScrollRestoreLikes');
    if (!likedPostsLoading && likedPosts.length > 0 && saved) {
      setTimeout(() => {
        window.scrollTo({ top: parseInt(saved, 10), behavior: 'instant' });
        sessionStorage.removeItem('profileScrollRestoreLikes');
      }, 80);
    }
  }, [likedPostsLoading, likedPosts.length]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // 画像URLを絶対URLに変換
        if (data.user.profile_image_url && !data.user.profile_image_url.startsWith('http')) {
          data.user.profile_image_url = 'http://localhost:8000' + data.user.profile_image_url;
        }

        setUser(data.user);
        setEditForm({
          name: data.user.name || '',
          username: data.user.username || '',
          bio: data.user.bio || '',
          website: data.user.website || '',
          profile_image_preview: null,
          privacy_settings: data.user.privacy_settings || {
            show_followers: true,
            show_followings: true
          },
          likes_visibility: data.user.likes_visibility || 'public',
          map_visibility: data.user.map_visibility || 'public',
        });
      } else {
        setError('プロフィールの取得に失敗しました');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('ネットワークエラーが発生しました');
    }
  };

  const fetchFollowStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFollowStats({
          followers_count: data.user.followers_count || 0,
          followings_count: data.user.followings_count || 0
        });
      }
    } catch (error) {
      console.error('Error fetching follow stats:', error);
    }
  };

  const fetchMyPosts = async () => {
    try {
      setPostsLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setPostsLoading(false);
        return;
      }

      // 自分の投稿を取得する専用エンドポイントを使用
      const response = await fetch('http://localhost:8000/api/posts/my', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('My Posts response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('My posts count:', data.posts?.length || 0);
        setMyPosts(data.posts || []);
      } else {
        console.error('投稿の取得に失敗しました');
        setMyPosts([]);
      }
    } catch (error) {
      console.error('投稿の取得エラー:', error);
      setMyPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchLikedPosts = async () => {
    try {
      setLikedPostsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/like/my', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setLikedPosts(data.posts || []);
      } else {
        setLikedPosts([]);
      }
    } catch (error) {
      console.error('いいね投稿の取得エラー:', error);
      setLikedPosts([]);
    } finally {
      setLikedPostsLoading(false);
    }
  };

  const showFollowListModal = (type) => {
    setFollowListType(type);
    setShowFollowList(true);
  };

  const closeFollowListModal = () => {
    setShowFollowList(false);
  };

  const handleUserClick = (userId) => {
    setShowFollowList(false);
    if (onUserClick) {
      onUserClick(userId);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ファイルサイズのチェック（20MB以下）
      if (file.size > 20 * 1024 * 1024) {
        setError('ファイルサイズは20MB以下にしてください');
        return;
      }

      // ファイル形式のチェック
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('JPEG、PNG、JPG、GIF形式のファイルのみアップロードできます');
        return;
      }

      setSelectedProfileImage(file);
      setError(''); // エラーをクリア

      const reader = new FileReader();
      reader.onload = (e) => {
        setEditForm(prev => ({
          ...prev,
          profile_image_preview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setError('');
      setSuccess('');

      console.log('=== Profile Update Debug ===');
      console.log('editForm state:', editForm);
      console.log('editForm.name:', editForm.name, 'type:', typeof editForm.name);
      console.log('editForm.username:', editForm.username, 'type:', typeof editForm.username);

      // 必須フィールドの検証
      if (!editForm.name || editForm.name.trim() === '') {
        setError('名前は必須です');
        return;
      }

      if (!editForm.username || editForm.username.trim() === '') {
        setError('ユーザー名は必須です');
        return;
      }

      const token = localStorage.getItem('token');
      const formData = new FormData();

      // テキストフィールド - 空文字列も含めて全て送信
      Object.keys(editForm).forEach(key => {
        if (key !== 'profile_image_preview') {
          const value = editForm[key];
          if (key === 'privacy_settings') {
            // privacy_settingsはJSON文字列として送信
            formData.append(key, JSON.stringify(value));
          } else {
            // 空文字列も含めて全て送信（バックエンドで適切に処理）
            formData.append(key, value);
          }
        }
      });

      // プロフィール画像
      if (selectedProfileImage) {
        formData.append('profile_image', selectedProfileImage);
      }

      console.log('Sending profile update request...');
      console.log('Form data contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      console.log('editForm state:', editForm);

      const response = await fetch('http://localhost:8000/api/profile', {
        method: 'POST', // PUTからPOSTに変更
        headers: {
          'Authorization': `Bearer ${token}`,
          // multipart/form-dataの場合はContent-Typeを設定しない
          // ブラウザが自動的に適切なContent-Typeとboundaryを設定する
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile update response:', data);

        setUser(data.user);
        setIsEditing(false);
        setError('');
        setSuccess('プロフィールが更新されました');
        setEditForm(prev => ({
          ...prev,
          profile_image_preview: null
        }));
        setSelectedProfileImage(null);

        if (onProfileUpdated) {
          onProfileUpdated(data.user);
        }

        // 3秒後に成功メッセージを消す
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        console.error('Profile update error:', errorData);
        console.error('Validation errors:', errorData.errors);
        setError(errorData.message || 'プロフィールの更新に失敗しました');

        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat().join(', ');
          setError(errorMessages);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);

      // エラーの詳細を表示
      let errorMessage = 'ネットワークエラーが発生しました';

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'サーバーに接続できません。サーバーが起動しているか確認してください。';
      } else if (error.message) {
        errorMessage = `エラー: ${error.message}`;
      }

      setError(errorMessage);
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // メニューを閉じる
  const closeMenu = () => {
    setShowMenu(false);
  };

  // メニュー以外をクリックしたときに閉じる
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.profile-menu-container')) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  if (!user) {
    return <div className="profile-loading">読み込み中...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-page-title">プロフィール</div>
        <div className="header-actions">

          <div className="profile-menu-container">
            <button className="hamburger-button" onClick={toggleMenu} aria-label="メニュー">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            {showMenu && (
              <div className="profile-dropdown-menu">
                <button
                  className="menu-item"
                  onClick={() => {
                    closeMenu();
                    setIsEditing(true);
                    setEditForm({
                      name: user.name || '',
                      username: user.username || '',
                      bio: user.bio || '',
                      website: user.website || '',
                      profile_image_preview: null,
                      privacy_settings: user.privacy_settings || {
                        show_followers: true,
                        show_followings: true
                      },
                      likes_visibility: user.likes_visibility || 'public',
                      map_visibility: user.map_visibility || 'public',
                    });
                  }}
                >
                  <span className="menu-icon">✏️</span>
                  プロフィール編集
                </button>

                {onLogout && (
                  <button
                    className="menu-item logout"
                    onClick={() => {
                      closeMenu();
                      if (window.confirm('ログアウトしますか？')) {
                        onLogout();
                      }
                    }}
                  >
                    <span className="menu-icon">🚪</span>
                    ログアウト
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-content">
        <div className="profile-image-section">
          <img
            src={user.profile_image_url || '/images/default-avatar.svg'}
            alt="プロフィール画像"
            className="profile-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/default-avatar.svg';
            }}
          />
        </div>

        <div className="profile-info">
          <div className="profile-user-name">{user.name || user.username}</div>
          <p className="username">@{user.username}</p>

          <div className="profile-stats-row">
            <div className="stat-item clickable" onClick={() => showFollowListModal('followers')}>
              <span className="stat-value">{followStats.followers_count}</span>
              <span className="stat-label">フォロワー</span>
            </div>
            <div className="stat-item clickable" onClick={() => showFollowListModal('followings')}>
              <span className="stat-value">{followStats.followings_count}</span>
              <span className="stat-label">フォロー中</span>
            </div>
          </div>

          {user.bio && user.bio !== 'null' && user.bio.trim() !== '' && <p className="bio">{user.bio}</p>}

          <div className="profile-meta-row">
            {user.website && user.website !== 'null' && user.website.trim() !== '' && (
              <div className="meta-item">
                <span className="meta-icon">🔗</span>
                <a href={user.website} target="_blank" rel="noopener noreferrer">
                  {user.website}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProfileEditModal
        open={isEditing}
        onClose={() => {
          setIsEditing(false);
          setEditForm({
            name: user.name || '',
            username: user.username || '',
            bio: user.bio || '',
            website: user.website || '',
            profile_image_preview: null,
            privacy_settings: user.privacy_settings || {
              show_followers: true,
              show_followings: true
            },
            likes_visibility: user.likes_visibility || 'public',
            map_visibility: user.map_visibility || 'public',
          });
          setSelectedProfileImage(null);
        }}
        user={user}
        editForm={editForm}
        setEditForm={setEditForm}
        handleImageChange={handleImageChange}
        handleUpdateProfile={handleUpdateProfile}
      />

      {/* 自分の投稿一覧セクション */}
      <div className="profile-posts-section">
        <div className="tabs">
          <button
            onClick={() => setActiveTab('posts')}
            className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
          >
            投稿一覧
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`tab-button ${activeTab === 'likes' ? 'active' : ''}`}
          >
            ❤️ いいね
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
          >
            日本地図
          </button>
        </div>

        {activeTab === 'posts' && (
          <>
            <div className="posts-section-title">自分の投稿</div>

            {postsLoading ? (
              <div className="posts-loading">
                <p>投稿を読み込み中...</p>
              </div>
            ) : myPosts.length === 0 ? (
              <div className="no-posts">
                <p>まだ投稿がありません</p>
              </div>
            ) : (
              <div className="posts-grid">
                {myPosts.map((post) => (
                  <div key={post.id} className="grid-post-card" onClick={() => handlePostClick(post.id)}>
                    <div className="grid-post-header-top">
                      <div className="grid-post-title">{post.title}</div>
                      <div className="grid-post-visibility">
                        <span className="post-visibility-icon" title={
                          post.visibility === 'public' ? '全員に公開' :
                            post.visibility === 'followers' ? 'フォロワーのみ公開' :
                              '自分のみ公開'
                        }>
                          {post.visibility === 'public' && '🌐'}
                          {post.visibility === 'followers' && '👥'}
                          {post.visibility === 'private' && '🔒'}
                        </span>
                      </div>
                    </div>

                    <div className="grid-post-image-container">
                      {post.first_photo_url ? (
                        <img
                          src={post.first_photo_url}
                          alt={post.title}
                          className="grid-post-thumbnail"
                        />
                      ) : (
                        <div className="grid-no-image-placeholder">No Image</div>
                      )}
                    </div>

                    <div className="grid-post-description">
                      {post.description?.length > 100
                        ? `${post.description.substring(0, 100)}...`
                        : post.description
                      }
                    </div>

                    <hr className="grid-post-divider" />

                    <div className="grid-post-footer-row">
                      <div className="grid-post-location">
                        {post.city ? `📍 ${post.city.prefecture?.name} ${post.city.name}` :
                          post.custom_location ? `📍 ${post.custom_location}` : ''}
                      </div>

                      <div className="grid-post-actions-right">
                        {(post.photos_count > 0 || post.photos?.length > 0 || post.total_photos > 0 || post.first_photo_url) && (
                          <span className="grid-photo-count">
                            📷 {post.photos_count || post.photos?.length || post.total_photos || 1}
                          </span>
                        )}

                        <div onClick={(e) => e.stopPropagation()}>
                          <LikeButton
                            postId={post.id}
                            initialIsLiked={(() => {
                              const currentUserId = post.current_user_id || JSON.parse(localStorage.getItem('user'))?.id;
                              return post.liked_user_ids?.includes(currentUserId) ?? false;
                            })()}
                            initialLikesCount={post.likes_count ?? 0}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'map' && user && (
          <JapanMapSimple userId={user.id} />
        )}

        {activeTab === 'likes' && (
          <>
            <div className="posts-section-title">❤️ いいねした投稿</div>

            {likedPostsLoading ? (
              <div className="posts-loading">
                <p>読み込み中...</p>
              </div>
            ) : likedPosts.length === 0 ? (
              <div className="no-posts">
                <p>まだいいねした投稿はありません</p>
              </div>
            ) : (
              <div className="posts-grid">
                {likedPosts.map((post) => (
                  <div key={post.id} className="grid-post-card" onClick={() => handlePostClick(post.id)}>
                    <div className="grid-post-header-top">
                      <div className="grid-post-title">{post.title}</div>
                    </div>

                    <div className="grid-post-image-container">
                      {post.first_photo_url ? (
                        <img
                          src={post.first_photo_url}
                          alt={post.title}
                          className="grid-post-thumbnail"
                        />
                      ) : (
                        <div className="grid-no-image-placeholder">No Image</div>
                      )}
                    </div>

                    <div className="grid-post-description">
                      {post.description?.length > 100
                        ? `${post.description.substring(0, 100)}...`
                        : post.description
                      }
                    </div>

                    <hr className="grid-post-divider" />

                    <div className="grid-post-footer-row">
                      <div className="grid-post-location">
                        {post.city ? `📍 ${post.city.prefecture?.name} ${post.city.name}` :
                          post.custom_location ? `📍 ${post.custom_location}` : ''}
                      </div>
                      <div className="grid-post-actions-right">
                        <div onClick={(e) => e.stopPropagation()}>
                          <LikeButton
                            postId={post.id}
                            initialIsLiked={true}
                            initialLikesCount={post.likes_count ?? 0}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {
        showFollowList && (
          <FollowList
            userId={user.id}
            type={followListType}
            onClose={closeFollowListModal}
            onUserClick={handleUserClick}
          />
        )
      }
    </div >
  );
}

export default Profile;
