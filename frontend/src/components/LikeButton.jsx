import React, { useState, useEffect } from 'react';
import './LikeButton.css';

function LikeButton({ postId, initialIsLiked = false, initialLikesCount = 0 }) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLoading, setIsLoading] = useState(false);

  // 初期値の設定
  useEffect(() => {
    setIsLiked(initialIsLiked);
    setLikesCount(initialLikesCount);
  }, [initialIsLiked, initialLikesCount]);

  const handleLikeToggle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8000/api/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ post_id: postId })
      });

      const data = await response.json();

      if (response.ok) {
        // actionフィールドに基づいて状態を更新
        const newIsLiked = data.action === 'liked';
        setIsLiked(newIsLiked);
        setLikesCount(data.likes_count);
        
      } else {
        console.error('いいね操作に失敗しました:', data.message);
      }
    } catch (error) {
      console.error('ネットワークエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`like-button ${isLiked ? 'liked' : 'not-liked'}`}
      onClick={handleLikeToggle}
      disabled={isLoading}
      title={isLiked ? 'いいねを解除' : 'いいね'}
    >
      <span className="like-icon">
        {isLiked ? '❤️' : '🤍'}
      </span>
      <span className="like-count">
        {likesCount > 0 ? likesCount : ''}
      </span>
      {isLoading && <span className="loading">...</span>}
    </button>
  );
}

export default LikeButton;
