import React, { useState, useEffect, useRef } from 'react';
import LikeButton from './LikeButton';
import FollowButton from './FollowButton';
import CommentSection from './CommentSection';
import PhotoCarousel from './PhotoCarousel';
import './PostDetail.css';
import './PostDetailMenu.css';

function PostDetail({ postId, onBackToList, onEditPost, onDeletePost, onPhotoUpload, onUserClick }) {
  console.log('PostDetail rendered with onUserClick:', onUserClick);
  const [post, setPost] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showPhotoCarousel, setShowPhotoCarousel] = useState(false);
  const carouselRef = useRef(null);

  // メニュー用State
  const [showMenu, setShowMenu] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const menuRef = useRef(null);

  // メニュー外クリック監視
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // photos配列が変更された時にcurrentIndexを安全に設定
  useEffect(() => {
    if (photos && photos.length > 0 && currentIndex >= photos.length) {
      setCurrentIndex(0);
    }
  }, [photos, currentIndex]);

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
      const token = localStorage.getItem('token');
      const headers = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:8000/api/posts/${postId}`, {
        headers
      });
      const data = await response.json();

      if (response.ok) {
        setPost(data.post);

        // 現在のユーザーが投稿者かどうかをチェック
        const currentUser = JSON.parse(localStorage.getItem('user'));
        setIsOwner(currentUser && currentUser.id === data.post.user_id);

        // 投稿者が自分でない場合、フォロー状態を取得
        if (data.post.user && data.post.user.id !== currentUser?.id) {
          fetchFollowStatus(data.post.user.id);
        }

      } else {
        setError(data.message || '投稿の取得に失敗しました');
      }
    } catch (error) {
      console.error('PostDetail: Network error:', error);
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 写真を取得
  const fetchPhotos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/photos/post/${postId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json();

      if (response.ok) {
        setPhotos(data.photos);
      }
    } catch (error) {
      // 写真取得エラーは無視
    }
  };

  // フォロー状態を取得
  const fetchFollowStatus = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/follow/status/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.is_following);
      }
    } catch (error) {
      console.error('フォロー状態の取得に失敗しました:', error);
    }
  };

  // フォロー状態の変更を処理
  const handleFollowChange = (isFollowing) => {
    setIsFollowing(isFollowing);
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

  // 公開範囲を更新
  const handleUpdateVisibility = async (newVisibility) => {
    try {
      const token = localStorage.getItem('token');
      // 既存の値を保持しながらvisibilityのみ更新
      const response = await fetch(`http://localhost:8000/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: post.title,
          description: post.description,
          visibility: newVisibility,
          city_id: post.city_id,
          custom_location: post.custom_location
        })
      });

      if (response.ok) {
        setPost(prev => ({ ...prev, visibility: newVisibility }));
        setShowVisibilityModal(false);
      } else {
        const data = await response.json();
        alert(data.message || '公開範囲の更新に失敗しました');
      }
    } catch (error) {
      console.error('Error updating visibility:', error);
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
    window.scrollTo(0, 0);
    if (postId) {
      fetchPostDetail();
      fetchPhotos();
    }
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

  // ローディング中
  if (loading) {
    return (
      <div className="post-detail-container">
        <div className="loading-message">
          <p>投稿を読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラーが発生した場合
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

  // 投稿データがない場合
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
          aria-label="戻る"
        >
          ←
        </button>
      </div>

      <div className="post-detail-card">



        <div className="post-detail-meta">
          <div className="post-author">
            <div
              className="author-info"
              onClick={() => {
                if (post.user && onUserClick) {
                  onUserClick(post.user.id);
                }
              }}
            >
              <img
                src={post.user?.profile_image_url || '/images/default-avatar.svg'}
                alt={post.user?.username}
                className="author-avatar"
              />
              <div className="author-details">
                <span className="author-username">@{post.user?.username}</span>
              </div>
            </div>
            {post.user && post.user.id !== JSON.parse(localStorage.getItem('user'))?.id && (
              <FollowButton
                userId={post.user.id}
                initialIsFollowing={isFollowing}
                onFollowChange={handleFollowChange}
              />
            )}
          </div>

          {!isOwner && (
            <div className="post-date">
              <span className="date-value">{formatDate(post.created_at)}</span>
            </div>
          )}

          {isOwner && (
            <div className="post-visibility">
              <span className="visibility-value">
                {post.visibility === 'public' && '🌐 全員に公開'}
                {post.visibility === 'followers' && '👥 フォロワーのみ公開'}
                {post.visibility === 'private' && '🔒 自分のみ公開'}
              </span>
            </div>
          )}

          <div className="post-likes">
            <LikeButton
              postId={post.id}
              initialIsLiked={(() => {
                const currentUserId = post.current_user_id || JSON.parse(localStorage.getItem('user'))?.id;
                return post.liked_user_ids?.includes(currentUserId) ?? false;
              })()}
              initialLikesCount={post.likes_count ?? 0}
            />
          </div>
          {(post.city || post.custom_location) && (
            <div className="post-location">
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

          {isOwner && (
            <div className="post-actions" style={{ marginLeft: 'auto' }}>
              <div className="menu-container" ref={menuRef}>
                <button
                  className="menu-trigger"
                  onClick={(e) => {
                    e.stopPropagation(); // 親要素へのバブルアップ防止
                    setShowMenu(!showMenu);
                  }}
                  aria-label="メニュー"
                >
                  ⋮
                </button>
                {showMenu && (
                  <div className="dropdown-menu">
                    <div className="menu-info-item">
                      📅 {formatDate(post.created_at)}
                    </div>
                    <button onClick={() => { onPhotoUpload(); setShowMenu(false); }}>
                      📷 写真を追加
                    </button>
                    <button onClick={() => { onEditPost(post); setShowMenu(false); }}>
                      ✏️ 編集
                    </button>
                    <button onClick={() => { setShowVisibilityModal(true); setShowMenu(false); }}>
                      🌍 公開範囲を変更
                    </button>
                    <button onClick={() => { handleDelete(); setShowMenu(false); }} className="delete-item">
                      🗑️ 削除
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="post-detail-title">
          <div className="detail-page-title">{post.title}</div>
        </div>

        {/* 写真ギャラリー (上に移動) */}
        {
          photos && photos.length > 0 && (
            <div
              className="post-carousel"
              style={{ marginTop: 0, marginBottom: '1.5rem' }}
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
                      src={getPhotoUrl(photos[currentIndex === 0 ? photos.length - 1 : currentIndex - 1]?.file_path)}
                      alt="前の写真"
                      className="carousel-edge-photo"
                    />
                  </div>
                )}

                {/* メイン写真 */}
                <img
                  src={getPhotoUrl(photos[currentIndex]?.file_path)}
                  alt={photos[currentIndex]?.title || `写真 ${currentIndex + 1}`}
                  className="main-carousel-photo clickable"
                  onClick={() => openPhotoCarousel(currentIndex)}
                />

                {/* 次の写真の端 */}
                {photos.length > 1 && (
                  <div className="carousel-next-photo">
                    <img
                      src={getPhotoUrl(photos[currentIndex === photos.length - 1 ? 0 : currentIndex + 1]?.file_path)}
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
              {(photos[currentIndex]?.title || photos[currentIndex]?.description) && (
                <div className="carousel-photo-info">
                  {photos[currentIndex]?.title && (
                    <div className="carousel-photo-title">{photos[currentIndex].title}</div>
                  )}
                  {photos[currentIndex]?.description && (
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

          )
        }





        {/* 投稿内容 */}
        <div className="post-detail-content">
          <div className="post-description">
            {post.description && post.description.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>



        {
          post.updated_at !== post.created_at && (
            <div className="post-updated">
              <p>最終更新: {formatDate(post.updated_at)}</p>
            </div>
          )
        }

        {/* PhotoCarousel */}
        {
          showPhotoCarousel && photos && photos.length > 0 && (
            <PhotoCarousel
              photos={photos}
              onClose={closePhotoCarousel}
              initialIndex={currentIndex}
            />
          )
        }
        {/* コメントセクション */}
        <CommentSection
          postId={post.id}
          userId={JSON.parse(localStorage.getItem('user'))?.id}
          token={localStorage.getItem('token')}
        />
      </div >


      {/* 公開範囲変更モーダル */}
      {
        showVisibilityModal && (
          <div className="modal-overlay" onClick={() => setShowVisibilityModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="section-title">公開範囲の設定</div>
              <div className="visibility-options">
                <button
                  className={`visibility-option ${post.visibility === 'public' ? 'active' : ''}`}
                  onClick={() => handleUpdateVisibility('public')}
                >
                  🌐 全員に公開
                </button>
                <button
                  className={`visibility-option ${post.visibility === 'followers' ? 'active' : ''}`}
                  onClick={() => handleUpdateVisibility('followers')}
                >
                  👥 フォロワーのみ公開
                </button>
                <button
                  className={`visibility-option ${post.visibility === 'private' ? 'active' : ''}`}
                  onClick={() => handleUpdateVisibility('private')}
                >
                  🔒 自分のみ公開
                </button>
              </div>
              <button onClick={() => setShowVisibilityModal(false)} className="cancel-button">
                キャンセル
              </button>
            </div>
          </div>
        )
      }
    </div >
  );
}

export default PostDetail;
