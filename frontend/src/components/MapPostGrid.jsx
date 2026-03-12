
import React from 'react';
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

      <div className="map-post-grid-content">
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
                onClick={() => onPostClick(post.id)}
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
                    {formatDate ? formatDate(post.created_at) : new Date(post.created_at).toLocaleDateString()}
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
                    📍 {post.location_name}
                  </div>

                  <div className="grid-post-actions-right">
                    {/* コメント機能が実装されたらここに件数を表示 */}
                    {/* <span className="comment-count">💬 0</span> */}
                    {(post.photos_count > 0 || post.photos?.length > 0 || post.first_photo_url) && (
                      <span className="grid-photo-count">
                        📷 {post.photos_count || post.photos?.length || 1}
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
