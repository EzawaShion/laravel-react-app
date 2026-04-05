import React, { useState, useEffect } from 'react';
import FollowButton from './FollowButton';
import FollowList from './FollowList';
import LikeButton from './LikeButton';
import JapanMapSimple from './JapanMapSimple';
import './Profile.css';

function UserProfile({ userId, onBack, onSwitchToProfile, onUserClick, onPostClick }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStats, setFollowStats] = useState({
    followers_count: 0,
    followings_count: 0
  });
  const [showFollowList, setShowFollowList] = useState(false);
  const [followListType, setFollowListType] = useState('followers');
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState([]);
  const [likedPostsLoading, setLikedPostsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  // 現在のユーザーIDを取得
  const getCurrentUserId = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.id;
  };

  useEffect(() => {
    // 自分のプロフィールの場合はProfileコンポーネントに切り替え
    const currentUserId = getCurrentUserId();
    if (currentUserId && parseInt(userId) === parseInt(currentUserId)) {
      if (onSwitchToProfile) {
        onSwitchToProfile();
        return;
      }
    }

    fetchUserProfile();
    fetchFollowStatus();
  }, [userId, onSwitchToProfile]);

  // userが読み込まれた後に投稿を取得
  useEffect(() => {
    if (user && user.id) {
      fetchUserPosts();
    }
  }, [user]);

  // いいねタブに切り替えた際にいいね投稿を取得（初回のみ）
  useEffect(() => {
    if (activeTab === 'likes' && likedPosts.length === 0 && !likedPostsLoading && user) {
      fetchUserLikedPosts();
    }
  }, [activeTab, user]);

  // 投稿クリック時にスクロール位置を保存するラッパー
  const handlePostClick = (postId) => {
    sessionStorage.setItem('userProfileScrollTop', window.scrollY);
    sessionStorage.setItem('userProfileActiveTab', activeTab);
    if (onPostClick) onPostClick(postId);
  };

  // マウント後にスクロール位置を復元処理
  useEffect(() => {
    const saved = sessionStorage.getItem('userProfileScrollTop');
    const savedTab = sessionStorage.getItem('userProfileActiveTab');
    if (saved) {
      if (savedTab) setActiveTab(savedTab);
      if (savedTab === 'likes') {
        sessionStorage.setItem('userProfileScrollRestoreLikes', saved);
      } else {
        sessionStorage.setItem('userProfileScrollRestore', saved);
      }
      sessionStorage.removeItem('userProfileScrollTop');
      sessionStorage.removeItem('userProfileActiveTab');
    }
  }, []);

  // 投稿データ読み込み完了後にスクロール復元
  useEffect(() => {
    const saved = sessionStorage.getItem('userProfileScrollRestore');
    if (!postsLoading && saved) {
      setTimeout(() => {
        window.scrollTo({ top: parseInt(saved, 10), behavior: 'instant' });
        sessionStorage.removeItem('userProfileScrollRestore');
      }, 80);
    }
  }, [postsLoading]);

  useEffect(() => {
    const saved = sessionStorage.getItem('userProfileScrollRestoreLikes');
    if (!likedPostsLoading && likedPosts.length > 0 && saved) {
      setTimeout(() => {
        window.scrollTo({ top: parseInt(saved, 10), behavior: 'instant' });
        sessionStorage.removeItem('userProfileScrollRestoreLikes');
      }, 80);
    }
  }, [likedPostsLoading, likedPosts.length]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        // 画像URLを絶対URLに変換
        if (data.user.profile_image_url && !data.user.profile_image_url.startsWith('http')) {
          data.user.profile_image_url = 'http://localhost:8000' + data.user.profile_image_url;
        }

        setUser(data.user);
        setFollowStats({
          followers_count: data.user.followers_count || 0,
          followings_count: data.user.followings_count || 0
        });
      } else {
        setError('ユーザー情報の取得に失敗しました');
      }
    } catch (error) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/follow/status/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.is_following || false);
      }
    } catch (error) {
      console.error('Follow status fetch error:', error);
    }
  };

  const handleFollowChange = (isFollowing) => {
    setIsFollowing(isFollowing);
    fetchUserProfile();
  };

  const showFollowListModal = (type) => {
    setFollowListType(type);
    setShowFollowList(true);
  };

  const closeFollowListModal = () => {
    setShowFollowList(false);
  };

  const handleUserClick = (clickedUserId) => {
    setShowFollowList(false);
    if (onUserClick) {
      onUserClick(clickedUserId);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/posts', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const data = await response.json();
        const filteredPosts = data.posts?.filter(post => post.user_id === parseInt(userId)) || [];
        setUserPosts(filteredPosts);
      } else {
        setUserPosts([]);
      }
    } catch (error) {
      console.error('投稿の取得エラー:', error);
      setUserPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchUserLikedPosts = async () => {
    try {
      setLikedPostsLoading(true);
      const token = localStorage.getItem('token');
      // 全投稿を取得してこのユーザーがいいねしたものをフィルタリング
      const response = await fetch('http://localhost:8000/api/posts', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const data = await response.json();
        const liked = data.posts?.filter(post =>
          post.liked_user_ids?.includes(parseInt(userId))
        ) || [];
        setLikedPosts(liked);
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

  const renderPostCard = (post) => (
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
  );

  if (loading) {
    return <div className="profile-loading">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!user) {
    return <div className="profile-loading">ユーザーが見つかりません</div>;
  }

  // 公開範囲チェック（自分のプロフィールは常に表示）
  const currentUserId = getCurrentUserId();
  const isSelf = currentUserId && parseInt(userId) === parseInt(currentUserId);

  const canView = (visibility) => {
    if (isSelf) return true;
    if (visibility === 'public') return true;
    if (visibility === 'followers') return isFollowing;
    return false; // private
  };

  const canViewLikes = canView(user.likes_visibility ?? 'public');
  const canViewMap   = canView(user.map_visibility ?? 'public');

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-page-title">プロフィール</div>
        <div className="header-actions">
          <FollowButton
            userId={user.id}
            initialIsFollowing={isFollowing}
            onFollowChange={handleFollowChange}
          />
        </div>
      </div>

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
          <div className="profile-user-name">{user.name}</div>
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

          {user.bio && user.bio !== 'null' && user.bio.trim() !== '' && (
            <p className="bio">{user.bio}</p>
          )}

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

      {/* タブ付き投稿セクション */}
      <div className="profile-posts-section">
        <div className="tabs">
          <button
            onClick={() => setActiveTab('posts')}
            className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
          >
            投稿一覧
          </button>
          {canViewLikes && (
            <button
              onClick={() => setActiveTab('likes')}
              className={`tab-button ${activeTab === 'likes' ? 'active' : ''}`}
            >
              ❤️ いいね
            </button>
          )}
          {canViewMap && (
            <button
              onClick={() => setActiveTab('map')}
              className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
            >
              日本地図
            </button>
          )}
        </div>

        {activeTab === 'posts' && (
          <>
            <div className="posts-section-title">{user.name}の投稿</div>
            {postsLoading ? (
              <div className="posts-loading"><p>投稿を読み込み中...</p></div>
            ) : userPosts.length === 0 ? (
              <div className="no-posts"><p>まだ投稿がありません</p></div>
            ) : (
              <div className="posts-grid">
                {userPosts.map(renderPostCard)}
              </div>
            )}
          </>
        )}

        {activeTab === 'likes' && canViewLikes && (
          <>
            <div className="posts-section-title">❤️ {user.name}がいいねした投稿</div>
            {likedPostsLoading ? (
              <div className="posts-loading"><p>読み込み中...</p></div>
            ) : likedPosts.length === 0 ? (
              <div className="no-posts"><p>まだいいねした投稿はありません</p></div>
            ) : (
              <div className="posts-grid">
                {likedPosts.map(renderPostCard)}
              </div>
            )}
          </>
        )}

        {activeTab === 'map' && canViewMap && user && (
          <JapanMapSimple userId={user.id} />
        )}
      </div>

      {showFollowList && (
        <FollowList
          userId={user.id}
          type={followListType}
          onClose={closeFollowListModal}
          onUserClick={handleUserClick}
        />
      )}
    </div>
  );
}

export default UserProfile;
