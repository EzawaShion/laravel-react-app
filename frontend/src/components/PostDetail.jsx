import React, { useState, useEffect, useRef } from 'react';
import './PostDetail.css';

function PostDetail({ postId, onBackToList, onEditPost, onDeletePost, onPhotoUpload }) {
  const [post, setPost] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showPhotoCarousel, setShowPhotoCarousel] = useState(false);
  const carouselRef = useRef(null);

  // 最小スワイプ距離
  const minSwipeDistance = 50;

  // タッチ開始
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  // タッチ移動
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // タッチ終了
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // 左スワイプ（次の写真）
      setCurrentIndex(prev => prev === photos.length - 1 ? 0 : prev + 1);
    } else if (isRightSwipe) {
      // 右スワイプ（前の写真）
      setCurrentIndex(prev => prev === 0 ? photos.length - 1 : prev - 1);
    }
  };

  // マウスドラッグ対応
  const onMouseDown = (e) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
  };

  const onMouseMove = (e) => {
    if (touchStart !== null) {
      setTouchEnd(e.clientX);
    }
  };

  const onMouseUp = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // 左スワイプ（次の写真）
      setCurrentIndex(prev => prev === photos.length - 1 ? 0 : prev + 1);
    } else if (isRightSwipe) {
      // 右スワイプ（前の写真）
      setCurrentIndex(prev => prev === 0 ? photos.length - 1 : prev - 1);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

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

  // 写真一覧を取得
  const fetchPhotos = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/photos/post/${postId}`);
      const data = await response.json();

      if (response.ok) {
        setPhotos(data.photos || []);
      }
    } catch (error) {
      console.error('写真の取得に失敗しました:', error);
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

  // キーボードナビゲーション
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showPhotoCarousel) {
        if (e.key === 'Escape') {
          closePhotoCarousel();
        } else if (e.key === 'ArrowLeft') {
          setCurrentIndex(prev => prev === 0 ? photos.length - 1 : prev - 1);
        } else if (e.key === 'ArrowRight') {
          setCurrentIndex(prev => prev === photos.length - 1 ? 0 : prev + 1);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPhotoCarousel, photos.length]);

  // コンポーネントマウント時に投稿詳細と写真を取得
  useEffect(() => {
    fetchPostDetail();
    fetchPhotos();
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

  // 写真のURLを生成
  const getPhotoUrl = (filePath) => {
    return `http://localhost:8000/storage/${filePath}`;
  };

  // PhotoCarouselの制御
  const openPhotoCarousel = (index) => {
    setCurrentIndex(index);
    setShowPhotoCarousel(true);
  };

  const closePhotoCarousel = () => {
    setShowPhotoCarousel(false);
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
              onClick={onPhotoUpload}
              className="photo-upload-button"
            >
              📷 写真を追加
            </button>
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

          {photos.length > 0 && (
            <div className="post-photos-count">
              <span className="photos-label">写真:</span>
              <span className="photos-count">{photos.length}枚</span>
            </div>
          )}
        </div>

        {/* 投稿内容 */}
        <div className="post-detail-content">
          <h3>投稿内容</h3>
          <div className="post-description">
            {post.description.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>

        {/* 写真ギャラリー */}
        {photos.length > 0 && (
          <div className="post-photos-section">
            <h3>📸 写真 ({photos.length}枚)</h3>
            
            {/* カルーセル表示 */}
            <div 
              className="post-carousel"
              ref={carouselRef}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              <div className="carousel-main-photo">
                {/* 前の写真の端 */}
                {photos.length > 1 && (
                  <div className="carousel-prev-photo">
                    <img 
                      src={getPhotoUrl(photos[currentIndex === 0 ? photos.length - 1 : currentIndex - 1].file_path)} 
                      alt="前の写真"
                      className="carousel-edge-photo"
                    />
                  </div>
                )}
                
                {/* メイン写真 */}
                <img 
                  src={getPhotoUrl(photos[currentIndex].file_path)} 
                  alt={photos[currentIndex].title || `写真 ${currentIndex + 1}`}
                  className="main-carousel-photo clickable"
                  onClick={() => openPhotoCarousel(currentIndex)}
                />
                
                {/* 次の写真の端 */}
                {photos.length > 1 && (
                  <div className="carousel-next-photo">
                    <img 
                      src={getPhotoUrl(photos[currentIndex === photos.length - 1 ? 0 : currentIndex + 1].file_path)} 
                      alt="次の写真"
                      className="carousel-edge-photo"
                    />
                  </div>
                )}
              </div>
              
              {/* 写真枚数インジケーター（点のみ）- 写真と説明の間に配置 */}
              {photos.length > 1 && (
                <div className="carousel-indicators">
                  {photos.map((_, index) => (
                    <div 
                      key={index}
                      className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
                      onClick={() => setCurrentIndex(index)}
                    />
                  ))}
                </div>
              )}
              
              {/* 写真情報 */}
              {(photos[currentIndex].title || photos[currentIndex].description) && (
                <div className="carousel-photo-info">
                  {photos[currentIndex].title && (
                    <h4 className="carousel-photo-title">{photos[currentIndex].title}</h4>
                  )}
                  {photos[currentIndex].description && (
                    <p className="carousel-photo-description">{photos[currentIndex].description}</p>
                  )}
                </div>
              )}
              
              {/* ナビゲーションボタン */}
              {photos.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentIndex(prev => prev === 0 ? photos.length - 1 : prev - 1)}
                    className="carousel-nav-button prev"
                  >
                    ‹
                  </button>
                  <button 
                    onClick={() => setCurrentIndex(prev => prev === photos.length - 1 ? 0 : prev + 1)}
                    className="carousel-nav-button next"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {post.updated_at !== post.created_at && (
          <div className="post-updated">
            <p>最終更新: {formatDate(post.updated_at)}</p>
          </div>
        )}

        {/* PhotoCarousel */}
        {showPhotoCarousel && photos.length > 0 && (
          <div className="photo-carousel-overlay">
            <div className="photo-carousel-container">
              {/* ヘッダー */}
              <div className="carousel-header">
                <div className="carousel-info">
                  <span className="photo-counter">
                    {currentIndex + 1} / {photos.length}
                  </span>
                  {photos[currentIndex].title && (
                    <span className="photo-title">
                      {photos[currentIndex].title}
                    </span>
                  )}
                </div>
                <div className="carousel-controls">
                  <button onClick={closePhotoCarousel} className="close-button">
                    ×
                  </button>
                </div>
              </div>

              {/* メイン写真 */}
              <div className="carousel-main">
                <button 
                  onClick={() => setCurrentIndex(prev => prev === 0 ? photos.length - 1 : prev - 1)}
                  className="nav-button prev-button"
                >
                  ‹
                </button>
                
                <div className="main-photo-container">
                  <img 
                    src={getPhotoUrl(photos[currentIndex].file_path)}
                    alt={photos[currentIndex].title || `写真 ${currentIndex + 1}`}
                    className="main-photo"
                  />
                  {photos[currentIndex].description && (
                    <div className="photo-description">
                      <p>{photos[currentIndex].description}</p>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => setCurrentIndex(prev => prev === photos.length - 1 ? 0 : prev + 1)}
                  className="nav-button next-button"
                >
                  ›
                </button>
              </div>

              {/* サムネイル */}
              <div className="carousel-thumbnails">
                {photos.map((photo, index) => (
                  <img
                    key={photo.id}
                    src={getPhotoUrl(photo.file_path)}
                    alt={`サムネイル ${index + 1}`}
                    className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostDetail; 