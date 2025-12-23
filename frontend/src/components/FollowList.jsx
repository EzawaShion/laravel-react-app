import React, { useState, useEffect } from 'react';
import FollowButton from './FollowButton';
import './FollowList.css';

function FollowList({ userId, type, onClose, onUserClick }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [userId, type]);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const endpoint = type === 'followers'
        ? `http://localhost:8000/api/follow/followers/${userId}?page=${page}`
        : `http://localhost:8000/api/follow/followings/${userId}?page=${page}`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        // APIレスポンスからユーザー配列を取得
        const userList = data[type] || [];

        if (page === 1) {
          setUsers(userList);
        } else {
          setUsers(prev => [...prev, ...userList]);
        }

        // ページネーション情報を設定
        setCurrentPage(data.current_page || page);
        setLastPage(data.last_page || 1);
        setHasMore((data.current_page || page) < (data.last_page || 1));
      } else {
        // プライバシー設定によるアクセス拒否の場合
        if (response.status === 403) {
          const data = await response.json();
          setError(data.message || 'このユーザーはフォローリストを非公開にしています');
        } else {
          setError(`${type === 'followers' ? 'フォロワー' : 'フォロー中'}の取得に失敗しました`);
        }
      }
    } catch (error) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchUsers(currentPage + 1);
    }
  };

  const handleFollowChange = (targetUserId, isFollowing) => {
    // フォロー状態が変更された時の処理
    // 必要に応じてリストを更新
  };

  const getCurrentUserId = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.id;
  };

  const handleUserClick = (clickedUserId) => {
    if (onUserClick) {
      onUserClick(clickedUserId);
    }
  };

  return (
    <div className="follow-list-overlay">
      <div className="follow-list-container">
        <div className="follow-list-header">
          <h2>{type === 'followers' ? 'フォロワー' : 'フォロー中'}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="follow-list-content">
          {loading && users.length === 0 ? (
            <div className="loading-message">読み込み中...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : users.length === 0 ? (
            <div className="empty-message">
              {type === 'followers' ? 'フォロワーはいません' : 'フォローしているユーザーはいません'}
            </div>
          ) : (
            <div className="users-list">
              {users.map((user) => (
                <div key={user.id} className="follow-user-card">
                  <div className="follow-user-info" onClick={() => handleUserClick(user.id)}>
                    <img
                      src={user.profile_image_url || 'http://localhost:8000/images/default-avatar.svg'}
                      alt={user.name}
                      className="follow-user-avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'http://localhost:8000/images/default-avatar.svg';
                      }}
                    />
                    <div className="follow-user-details">
                      <div className="follow-user-name">{user.name}</div>
                      <div className="follow-user-username">@{user.username}</div>
                    </div>
                  </div>

                  {user.id !== getCurrentUserId() && (
                    <div className="follow-user-actions">
                      <FollowButton
                        userId={user.id}
                        initialIsFollowing={user.is_following || false}
                        onFollowChange={handleFollowChange}
                      />
                    </div>
                  )}
                </div>
              ))}

              {hasMore && (
                <div className="load-more-container">
                  <button
                    className="load-more-button"
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? '読み込み中...' : 'もっと見る'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FollowList;
