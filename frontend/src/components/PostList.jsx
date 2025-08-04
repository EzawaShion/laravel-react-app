import React, { useState, useEffect } from 'react';
import './PostList.css';

function PostList({ onPostClick, onCreatePost }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 投稿一覧を取得
  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/posts');

      const data = await response.json();

      if (response.ok) {
        setPosts(data.posts);
      } else {
        setError(data.message || '投稿の取得に失敗しました');
      }
    } catch (error) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // コンポーネントマウント時に投稿一覧を取得
  useEffect(() => {
    fetchPosts();
  }, []);

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
      <div className="post-list-container">
        <div className="loading-message">
          <p>投稿を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-list-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchPosts} className="retry-button">
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="post-list-container">
      <div className="post-list-header">
        <h2>投稿一覧</h2>
        <button 
          onClick={() => {
            console.log('PostListの新規投稿ボタンがクリックされました');
            onCreatePost();
          }}
          className="create-post-button"
        >
          新規投稿
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="no-posts-message">
          <p>まだ投稿がありません</p>
          <p>最初の投稿を作成してみましょう！</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <div 
              key={post.id} 
              className="post-card"
              onClick={() => onPostClick(post)}
            >
              <div className="post-header">
                <h3 className="post-title">{post.title}</h3>
                <span className="post-date">{formatDate(post.created_at)}</span>
              </div>
              
              <div className="post-content">
                <p className="post-description">
                  {post.description.length > 100 
                    ? `${post.description.substring(0, 100)}...` 
                    : post.description
                  }
                </p>
              </div>

              <div className="post-footer">
                <div className="post-author">
                  <span className="author-name">{post.user?.name}</span>
                </div>
                
                <div className="post-location">
                  {post.city && (
                    <span className="location-text">
                      📍 {post.city.name}
                      {post.city.prefecture && ` (${post.city.prefecture.name})`}
                    </span>
                  )}
                  {post.custom_location && (
                    <span className="custom-location">
                      📍 {post.custom_location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PostList; 