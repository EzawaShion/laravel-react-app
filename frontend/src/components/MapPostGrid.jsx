
import React, { useRef, useEffect } from 'react';
import LikeButton from './LikeButton';
import './MapPostGrid.css';

function MapPostGrid({
  posts,
  onClose,
  onPostClick,
  onUserClick,
  searchParams,
  setSearchParams,
  prefectures,
  cities,
  fetchCities,
  setCities,
  locationName,
  formatDate
}) {
  const contentRef = useRef(null);

  // マウント時にスクロール位置を復元
  useEffect(() => {
    const saved = sessionStorage.getItem('mapGridScrollTop');
    if (saved && contentRef.current) {
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = parseInt(saved, 10);
          sessionStorage.removeItem('mapGridScrollTop');
        }
      }, 80);
    }
  }, []);

  // 投稿クリック時にスクロール位置を保存
  const handlePostClick = (postId) => {
    if (contentRef.current) {
      sessionStorage.setItem('mapGridScrollTop', contentRef.current.scrollTop);
    }
    onPostClick(postId);
  };

  return (
    <div className="map-post-grid-overlay">
      <div className="map-post-grid-header">
        <div className="header-left-group">
          <button
            className="back-to-map-btn"
            onClick={onClose}
            title="マップに戻る"
          >
            <span className="back-icon"></span>
          </button>
        </div>

        <div className="header-right-group">
          {/*<div className="grid-header-info">
            {locationName && <h3>{locationName}</h3>}
            {posts.length > 0 && (
              <span className="grid-post-count">
                {posts.length}件
              </span>
            )}
          </div>*/}
        </div>
      </div>

      <div className="map-post-grid-content" ref={contentRef}>
        {posts.length === 0 ? (
          <div className="no-posts-message">
            <p>{locationName}には投稿がありません</p>
          </div>
        ) : (
          <div className="location-posts-grid">
            {posts.map((post) => (
              <div
                key={post.id}
                className="grid-post-card"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="grid-post-header-top">
                  <div
                    className="grid-post-user"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onUserClick && post.user) {
                        onUserClick(post.user.id);
                      }
                    }}
                  >
                    <img
                      src={post.user?.profile_image_url || '/images/default-avatar.svg'}
                      alt={post.user?.username}
                      className="grid-author-avatar"
                    />
                    <span className="grid-author-username">@{post.user?.username}</span>
                  </div>
                  <div className="grid-post-date">
                    {(() => {
                      const d = new Date(post.created_at);
                      if (isNaN(d.getTime())) return '';
                      return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
                    })()}
                  </div>
                </div>

                <div className="grid-post-title">{post.title}</div>

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
                    <svg width="12" height="12" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '3px', verticalAlign: 'middle', flexShrink: 0, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}>
                      <path d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 16 9 16s9-9.25 9-16c0-4.97-4.03-9-9-9z" fill="#ef4444"/>
                      <circle cx="12" cy="9" r="3.5" fill="#ffffff"/>
                    </svg>
                    {post.location_name}
                  </div>

                  <div className="grid-post-actions-right">
                    {/* コメント機能が実装されたらここに件数を表示 */}
                    {/* <span className="comment-count">💬 0</span> */}
                    {(post.photos_count > 0 || post.photos?.length > 0 || post.first_photo_url) && (
                      <span className="grid-photo-count">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px', verticalAlign: 'middle', flexShrink: 0 }}>
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                        {post.photos_count || post.photos?.length || 1}
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
    </div>
  );
}

export default MapPostGrid;
