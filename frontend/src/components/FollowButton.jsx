import React, { useState, useEffect } from 'react';
import './FollowButton.css';

function FollowButton({ userId, initialIsFollowing = false, onFollowChange }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // initialIsFollowingが変更された時に状態を更新
  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const handleFollowToggle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = isFollowing ? '/unfollow' : '/follow';
      
      const response = await fetch(`http://localhost:8000/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: userId })
      });

      const data = await response.json();

      if (response.ok) {
        const newFollowingState = !isFollowing;
        setIsFollowing(newFollowingState);
        
        // 親コンポーネントに状態変更を通知
        if (onFollowChange) {
          onFollowChange(newFollowingState, data.followers_count);
        }
        
        // 成功メッセージ（オプション）
        console.log(newFollowingState ? 'フォローしました' : 'フォローを解除しました');
      } else {
        // 既にフォローしている場合のエラーハンドリング
        if (data.message && data.message.includes('既にフォロー')) {
          // 既にフォローしている場合は状態を同期
          setIsFollowing(true);
          if (onFollowChange) {
            onFollowChange(true, data.followers_count || 0);
          }
        } else {
          setError(data.message || 'フォロー操作に失敗しました');
          console.error('フォロー操作に失敗しました:', data.message);
        }
      }
    } catch (error) {
      setError('ネットワークエラーが発生しました');
      console.error('ネットワークエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="follow-button-container">
      <button
        className={`follow-button ${isFollowing ? 'following' : 'not-following'} ${error ? 'error' : ''}`}
        onClick={handleFollowToggle}
        disabled={isLoading}
        title={isFollowing ? 'フォローを解除' : 'フォローする'}
      >
        {isLoading ? (
          <span className="loading">...</span>
        ) : (
          <span className="button-content">
            {isFollowing ? (
              <>
                <span className="follow-icon">✓</span>
                <span className="follow-text">フォロー中</span>
              </>
            ) : (
              <>
                <span className="follow-icon">+</span>
                <span className="follow-text">フォロー</span>
              </>
            )}
          </span>
        )}
      </button>
      {error && (
        <div className="follow-error" title={error}>
          ⚠️
        </div>
      )}
    </div>
  );
}

export default FollowButton;
