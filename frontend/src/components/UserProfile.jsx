import React, { useState, useEffect } from 'react';
import FollowButton from './FollowButton';
import FollowList from './FollowList';
import LikeButton from './LikeButton';
import './UserProfile.css';

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
    // フォロー状態が変わったら統計を更新
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
    setShowFollowList(false); // Close the follow list modal
    if (onUserClick) {
      onUserClick(clickedUserId);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);

      // 全ての投稿を取得して、指定されたユーザーの投稿をフィルタリング
      const response = await fetch('http://localhost:8000/api/posts', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('User posts response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('=== All Posts Response ===');
        console.log('Total posts:', data.posts?.length || 0);

        // 指定されたユーザーの投稿のみをフィルタリング
        const filteredPosts = data.posts?.filter(post => post.user_id === parseInt(userId)) || [];
        console.log('User posts:', filteredPosts.length);

        setUserPosts(filteredPosts);
      } else {
        console.error('投稿の取得に失敗しました');
        setUserPosts([]);
      }
    } catch (error) {
      console.error('投稿の取得エラー:', error);
      setUserPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  if (loading) {
    return <div className="user-profile-loading">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="user-profile-error">
        <div className="error-message">{error}</div>
        <button className="back-button" onClick={onBack}>
          ← 戻る
        </button>
      </div>
    );
  }

  if (!user) {
    return <div className="user-profile-error">ユーザーが見つかりません</div>;
  }

  return (
    <div className="user-profile-container">
      <div className="user-profile-header">
        <button className="back-button" onClick={onBack}>
          ← 戻る
        </button>
        <div className="profile-page-title">プロフィール</div>
      </div>

      <div className="user-profile-content">
        <div className="user-profile-image-section">
          <img
            src={user.profile_image_url || '/images/default-avatar.svg'}
            alt="プロフィール画像"
            className="user-profile-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/default-avatar.svg';
            }}
          />
        </div>

        <div className="user-profile-info">
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

          <div className="user-profile-actions">
            <FollowButton
              userId={user.id}
              initialIsFollowing={isFollowing}
              onFollowChange={handleFollowChange}
            />
          </div>
        </div>
      </div>

      {/* ユーザーの投稿一覧セクション */}
      <div className="user-posts-section">
        <div className="posts-section-title">{user.name}の投稿</div>

        {postsLoading ? (
          <div className="posts-loading">
            <p>投稿を読み込み中...</p>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="no-posts">
            <p>まだ投稿がありません</p>
          </div>
        ) : (
          <div className="posts-grid">
            {userPosts.map((post) => (
              <div key={post.id} className="grid-post-card" onClick={() => onPostClick && onPostClick(post.id)}>
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
