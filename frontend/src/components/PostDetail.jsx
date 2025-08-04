import React, { useState, useEffect } from 'react';
import './PostDetail.css';

function PostDetail({ postId, onBackToList, onEditPost, onDeletePost }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  // 投稿詳細を取得
  const fetchPostDetail = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:8000/api/posts/${postId}`);

      const data = await response.json();

      if (response.ok) {
        setPost(data.post);
        
        // 現在のユーザーが投稿者かどうかをチェック
        const currentUser = JSON.parse(localStorage.getItem('user'));
        setIsOwner(currentUser && currentUser.id === data.post.user_id);
      } else {
        setError(data.message || '投稿の取得に失敗しました');
      }
    } catch (error) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 投稿を削除
  const handleDelete = async () => {
    if (!confirm('この投稿を削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('投稿が削除されました');
        onDeletePost();
      } else {
        alert(data.message || '投稿の削除に失敗しました');
      }
    } catch (error) {
      alert('ネットワークエラーが発生しました');
    }
  };

  // コンポーネントマウント時に投稿詳細を取得
  useEffect(() => {
    fetchPostDetail();
  }, [postId]);

  // 投稿の作成日をフォーマット
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="post-detail-container">
        <div className="loading-message">
          <p>投稿を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-detail-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchPostDetail} className="retry-button">
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-container">
        <div className="error-message">
          <p>投稿が見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-container">
      <div className="post-detail-header">
        <button 
          onClick={onBackToList}
          className="back-button"
        >
          ← 投稿一覧に戻る
        </button>
        
        {isOwner && (
          <div className="post-actions">
            <button 
              onClick={() => onEditPost(post)}
              className="edit-button"
            >
              編集
            </button>
            <button 
              onClick={handleDelete}
              className="delete-button"
            >
              削除
            </button>
          </div>
        )}
      </div>

      <div className="post-detail-card">
        <div className="post-detail-title">
          <h1>{post.title}</h1>
        </div>

        <div className="post-detail-meta">
          <div className="post-author">
            <span className="author-label">投稿者:</span>
            <span className="author-name">{post.user?.name}</span>
          </div>
          
          <div className="post-date">
            <span className="date-label">投稿日時:</span>
            <span className="date-value">{formatDate(post.created_at)}</span>
          </div>

          {(post.city || post.custom_location) && (
            <div className="post-location">
              <span className="location-label">場所:</span>
              {post.city && (
                <span className="location-value">
                  📍 {post.city.name}
                  {post.city.prefecture && ` (${post.city.prefecture.name})`}
                </span>
              )}
              {post.custom_location && (
                <span className="location-value">
                  📍 {post.custom_location}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="post-detail-content">
          <h3>投稿内容</h3>
          <div className="post-description">
            {post.description.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>

        {post.updated_at !== post.created_at && (
          <div className="post-updated">
            <p>最終更新: {formatDate(post.updated_at)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostDetail; 