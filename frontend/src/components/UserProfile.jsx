import React, { useState, useEffect } from 'react';
import FollowButton from './FollowButton';
import FollowList from './FollowList';
import './UserProfile.css';

function UserProfile({ userId, onBack, onSwitchToProfile, onUserClick }) {
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
        <h1>プロフィール</h1>
      </div>

      <div className="user-profile-content">
        <div className="user-profile-image-section">
          <img
            src={user.profile_image_url || '/images/default-avatar.svg'}
            alt="プロフィール画像"
            className="user-profile-image"
          />
        </div>

        <div className="user-profile-info">
          <h2>{user.name}</h2>
          <p className="username">@{user.username}</p>
          
          {user.bio && user.bio !== 'null' && user.bio.trim() !== '' && (
            <p className="bio">{user.bio}</p>
          )}
          
          <div className="user-profile-details">
            {user.website && user.website !== 'null' && user.website.trim() !== '' && (
              <div className="detail-item">
                <span className="label">ウェブサイト:</span>
                <a href={user.website} target="_blank" rel="noopener noreferrer">
                  {user.website}
                </a>
              </div>
            )}
            
            <div className="detail-item">
              <span className="label">投稿数:</span>
              <span>{user.posts_count || 0}</span>
            </div>
            
            <div className="follow-stats">
              <div className="follow-stat-item" onClick={() => showFollowListModal('followers')}>
                <span className="follow-count">{followStats.followers_count}</span>
                <span className="follow-label">フォロワー</span>
              </div>
              <div className="follow-stat-item" onClick={() => showFollowListModal('followings')}>
                <span className="follow-count">{followStats.followings_count}</span>
                <span className="follow-label">フォロー中</span>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="label">登録日:</span>
              <span>{new Date(user.created_at).toLocaleDateString('ja-JP')}</span>
            </div>
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
