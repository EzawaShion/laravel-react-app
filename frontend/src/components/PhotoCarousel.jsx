import React, { useState, useEffect } from 'react';
import './PhotoCarousel.css';

function PhotoCarousel({ photos, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // キーボードナビゲーション
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  // 前の写真に移動
  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  // 次の写真に移動
  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  // 特定の写真に移動
  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  // フルスクリーン切り替え
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!photos || photos.length === 0) {
    return null;
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div className={`photo-carousel-overlay ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="photo-carousel-container">
        {/* ヘッダー */}
        <div className="carousel-header">
          <div className="carousel-info">
            <span className="photo-counter">
              {currentIndex + 1} / {photos.length}
            </span>
            {currentPhoto.title && (
              <span className="photo-title">{currentPhoto.title}</span>
            )}
          </div>
          <div className="carousel-controls">
            <button onClick={toggleFullscreen} className="fullscreen-button">
              {isFullscreen ? '⤓' : '⤢'}
            </button>
            <button onClick={onClose} className="close-button">
              ×
            </button>
          </div>
        </div>

        {/* メイン写真 */}
        <div className="carousel-main">
          <button onClick={handlePrevious} className="nav-button prev-button">
            ‹
          </button>
          
          <div className="main-photo-container">
            <img 
              src={`http://localhost:8000/storage/${currentPhoto.file_path}`}
              alt={currentPhoto.title || `写真 ${currentIndex + 1}`}
              className="main-photo"
            />
            {currentPhoto.description && (
              <div className="photo-description">
                <p>{currentPhoto.description}</p>
              </div>
            )}
          </div>
          
          <button onClick={handleNext} className="nav-button next-button">
            ›
          </button>
        </div>

        {/* サムネイル */}
        {photos.length > 1 && (
          <div className="carousel-thumbnails">
            {photos.map((photo, index) => (
              <div 
                key={photo.id}
                className={`thumbnail-item ${index === currentIndex ? 'active' : ''}`}
                onClick={() => handleThumbnailClick(index)}
              >
                <img 
                  src={`http://localhost:8000/storage/${photo.file_path}`}
                  alt={`サムネイル ${index + 1}`}
                  className="thumbnail-image"
                />
              </div>
            ))}
          </div>
        )}

        {/* ナビゲーションヒント */}
        <div className="carousel-hints">
          <p>← → キーで写真を切り替え、ESCキーで閉じる</p>
        </div>
      </div>
    </div>
  );
}

export default PhotoCarousel; 