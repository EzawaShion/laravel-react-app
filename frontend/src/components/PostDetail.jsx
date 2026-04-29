import React, { useState, useEffect, useRef } from 'react';
import LikeButton from './LikeButton';
import FollowButton from './FollowButton';
// import CommentSection from './CommentSection'; // 一時非表示
import PhotoCarousel from './PhotoCarousel';
import MenuIcon from '@mui/icons-material/Menu';
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
      {/* ヘッダー: 左=戻る, 中=投稿, 右=ハンバーガー */}
      <div className="post-detail-header">
        <button
          onClick={onBackToList}
          className="back-button"
          aria-label="戻る"
        >
          ←
        </button>
        <span className="post-detail-header-title">
          {post
            ? (post.city
                ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle', flexShrink: 0 }}>
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" fill="#fff" stroke="none" />
                    </svg>
                    {`${post.city.name}${post.city.prefecture ? ` (${post.city.prefecture.name})` : ''}`}
                  </>
                )
                : post.custom_location
                  ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle', flexShrink: 0 }}>
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" fill="#fff" stroke="none" />
                      </svg>
                      {post.custom_location}
                    </>
                  )
                  : '投稿')
            : '投稿'}
        </span>
        <div className="post-header-menu" ref={menuRef}>
          {isOwner ? (
            <>
              <button
                className="header-menu-trigger"
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                aria-label="メニュー"
              >
                <MenuIcon />
              </button>
              {showMenu && (
                <div className="dropdown-menu header-dropdown">
                  <div className="menu-info-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle', flexShrink: 0 }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {post ? formatDate(post.created_at) : ''}
                  </div>
                  <button onClick={() => { onPhotoUpload(); setShowMenu(false); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle', flexShrink: 0 }}>
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    写真を追加
                  </button>
                  <button onClick={() => { onEditPost(post); setShowMenu(false); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle', flexShrink: 0 }}>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    編集
                  </button>
                  <button onClick={() => { setShowVisibilityModal(true); setShowMenu(false); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle', flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    公開範囲を変更
                  </button>
                  <button onClick={() => { handleDelete(); setShowMenu(false); }} className="delete-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle', flexShrink: 0 }}>
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6"/>
                      <path d="M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                    削除
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <button
                className="header-menu-trigger"
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                aria-label="メニュー"
              >
                <MenuIcon />
              </button>
              {showMenu && (
                <div className="dropdown-menu header-dropdown">
                  <div className="menu-info-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle', flexShrink: 0 }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {post ? formatDate(post.created_at) : ''}
                  </div>
                  <div className="menu-info-item">
                    {post.visibility === 'public' && (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>全員に公開</>
                    )}
                    {post.visibility === 'followers' && (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>フォロワーのみ</>
                    )}
                    {post.visibility === 'private' && (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>自分のみ</>
                    )}
                  </div>
                  {/* フォローボタン */}
                  {post.user && post.user.id !== JSON.parse(localStorage.getItem('user'))?.id && (
                    <div className="menu-follow-item" onClick={(e) => e.stopPropagation()}>
                      <FollowButton
                        userId={post.user.id}
                        initialIsFollowing={isFollowing}
                        onFollowChange={handleFollowChange}
                      />
                    </div>
                  )}
                  {/* いいねボタン */}
                  <div className="menu-like-item" onClick={(e) => e.stopPropagation()}>
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
              )}
            </>
          )}
        </div>
      </div>

      <div className="post-detail-card">



        <div className="post-detail-meta">
          {/* 左端: アバター + ユーザー名 */}
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
          </div>

          {/* 右側グループ: 自分の投稿の場合のみ公開範囲・いいねを表示 */}
          {isOwner && (
            <div className="post-meta-right">
              {/* 公開範囲: アイコンのみ */}
              <div className="post-visibility-icon" title={
                post.visibility === 'public' ? '全員に公開' :
                post.visibility === 'followers' ? 'フォロワーのみ' : '自分のみ'
              }>
                {post.visibility === 'public' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                )}
                {post.visibility === 'followers' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                )}
                {post.visibility === 'private' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                )}
              </div>

              {/* いいね（右端） */}
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

              {/* 写真枚数インジケーター */}
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

              {/* 写真情報（画像の外・下に表示） */}
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
        {/* コメントセクション - 一時非表示
        <CommentSection
          postId={post.id}
          userId={JSON.parse(localStorage.getItem('user'))?.id}
          token={localStorage.getItem('token')}
        />
        */}
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  全員に公開
                </button>
                <button
                  className={`visibility-option ${post.visibility === 'followers' ? 'active' : ''}`}
                  onClick={() => handleUpdateVisibility('followers')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  フォロワーのみ公開
                </button>
                <button
                  className={`visibility-option ${post.visibility === 'private' ? 'active' : ''}`}
                  onClick={() => handleUpdateVisibility('private')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  自分のみ公開
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
