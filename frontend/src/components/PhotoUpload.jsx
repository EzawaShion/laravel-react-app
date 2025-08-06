import React, { useState, useRef, useEffect } from 'react';
import './PhotoUpload.css';

function PhotoUpload({ postId, onUploadSuccess, onCancel }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoData, setPhotoData] = useState([]);
  const [existingPhotoCount, setExistingPhotoCount] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const fileInputRef = useRef(null);

  // 既存の写真数を取得
  useEffect(() => {
    const fetchExistingPhotoCount = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/photos/post/${postId}`);
        const data = await response.json();
        if (response.ok) {
          setExistingPhotoCount(data.photos?.length || 0);
        }
      } catch (error) {
        console.error('既存写真数の取得に失敗しました:', error);
      }
    };

    fetchExistingPhotoCount();
  }, [postId]);

  // ファイル選択時の処理
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // 既存の写真数 + 選択中の写真数 + 新しく選択した写真数の合計が10枚を超えないかチェック
    const totalPhotoCount = existingPhotoCount + selectedFiles.length + files.length;
    if (totalPhotoCount > 10) {
      const remainingSlots = 10 - existingPhotoCount - selectedFiles.length;
      setError(`写真は合計10枚までです。既存: ${existingPhotoCount}枚, 選択中: ${selectedFiles.length}枚, 追加可能: ${remainingSlots}枚`);
      return;
    }

    // ファイルサイズチェック（最大10MB）
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('ファイルサイズは10MB以下にしてください');
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
    setError('');

    // プレビュー生成
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, {
          id: Date.now() + Math.random(),
          src: e.target.result,
          file: file
        }]);
      };
      reader.readAsDataURL(file);
    });

    // 写真データの初期化
    const newPhotoData = files.map(file => ({
      title: '',
      description: '',
      tags: []
    }));
    setPhotoData(prev => [...prev, ...newPhotoData]);
  };

  // 写真データの更新
  const handlePhotoDataChange = (index, field, value) => {
    setPhotoData(prev => {
      const newData = [...prev];
      if (field === 'tags') {
        newData[index][field] = value.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else {
        newData[index][field] = value;
      }
      return newData;
    });
  };

  // 写真の削除
  const handleRemovePhoto = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setPhotoData(prev => prev.filter((_, i) => i !== index));
  };

  // アップロード実行
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('写真を選択してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('post_id', postId);
      
      selectedFiles.forEach((file, index) => {
        formData.append('photos[]', file);
        formData.append(`titles[${index}]`, photoData[index]?.title || '');
        formData.append(`descriptions[${index}]`, photoData[index]?.description || '');
        formData.append(`tags[${index}]`, JSON.stringify(photoData[index]?.tags || []));
      });

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/photos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        onUploadSuccess(data.photos);
      } else {
        // バックエンドからのエラーメッセージを表示
        const errorMessage = data.message || 'アップロードに失敗しました';
        setError(errorMessage);
        
        // 10枚制限エラーの場合は、既存写真数を再取得
        if (errorMessage.includes('写真は合計10枚までです')) {
          const response = await fetch(`http://localhost:8000/api/photos/post/${postId}`);
          const data = await response.json();
          if (response.ok) {
            setExistingPhotoCount(data.photos?.length || 0);
          }
        }
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // カメラ起動
  const handleCameraCapture = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // カメラ機能は後で実装
      alert('カメラ機能は準備中です');
    } else {
      alert('お使いのブラウザはカメラ機能をサポートしていません');
    }
  };

  return (
    <div className="photo-upload-container">
      <div className="photo-upload-header">
        <h2>写真アップロード</h2>
        <button onClick={onCancel} className="cancel-button">キャンセル</button>
      </div>

      <div className="upload-methods">
        <button 
          onClick={() => fileInputRef.current.click()} 
          className="upload-button"
        >
          📁 ファイルから選択
        </button>
        <button 
          onClick={handleCameraCapture} 
          className="camera-button"
        >
          📷 カメラで撮影
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {error && <div className="error-message">{error}</div>}

      {previews.length > 0 && (
        <div className="photo-previews">
          <h3>選択された写真 ({previews.length}枚) - 合計: {existingPhotoCount + selectedFiles.length}/10枚</h3>
          
          {/* カルーセル表示 */}
          <div className="photo-carousel">
            <div className="carousel-main-photo">
              {/* 前の写真の端 */}
              {previews.length > 1 && (
                <div className="carousel-prev-photo">
                  <img 
                    src={previews[currentPhotoIndex === 0 ? previews.length - 1 : currentPhotoIndex - 1].src} 
                    alt="前の写真"
                    className="carousel-edge-photo"
                  />
                </div>
              )}
              
              {/* メイン写真 */}
              <div className="preview-image-container">
                <img 
                  src={previews[currentPhotoIndex].src} 
                  alt={`Preview ${currentPhotoIndex + 1}`}
                  className="main-carousel-photo"
                />
                <button 
                  onClick={() => handleRemovePhoto(currentPhotoIndex)}
                  className="remove-photo-button"
                >
                  ×
                </button>
              </div>
              
              {/* 次の写真の端 */}
              {previews.length > 1 && (
                <div className="carousel-next-photo">
                  <img 
                    src={previews[currentPhotoIndex === previews.length - 1 ? 0 : currentPhotoIndex + 1].src} 
                    alt="次の写真"
                    className="carousel-edge-photo"
                  />
                </div>
              )}
            </div>
            
            {/* 写真枚数インジケーター */}
            {previews.length > 1 && (
              <div className="carousel-indicators">
                {previews.map((_, index) => (
                  <div 
                    key={index}
                    className={`carousel-indicator ${index === currentPhotoIndex ? 'active' : ''}`}
                    onClick={() => setCurrentPhotoIndex(index)}
                  />
                ))}
              </div>
            )}
            
            {/* ナビゲーションボタン */}
            {previews.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentPhotoIndex(prev => prev === 0 ? previews.length - 1 : prev - 1)}
                  className="carousel-nav-button prev"
                >
                  ‹
                </button>
                <button 
                  onClick={() => setCurrentPhotoIndex(prev => prev === previews.length - 1 ? 0 : prev + 1)}
                  className="carousel-nav-button next"
                >
                  ›
                </button>
              </>
            )}
          </div>
          
          {/* 写真詳細入力 */}
          <div className="photo-details">
            <input
              type="text"
              placeholder="写真のタイトル"
              value={photoData[currentPhotoIndex]?.title || ''}
              onChange={(e) => handlePhotoDataChange(currentPhotoIndex, 'title', e.target.value)}
              className="photo-title-input"
            />
            <textarea
              placeholder="写真の説明"
              value={photoData[currentPhotoIndex]?.description || ''}
              onChange={(e) => handlePhotoDataChange(currentPhotoIndex, 'description', e.target.value)}
              className="photo-description-input"
            />
            <input
              type="text"
              placeholder="タグ（カンマ区切り）"
              value={photoData[currentPhotoIndex]?.tags?.join(', ') || ''}
              onChange={(e) => handlePhotoDataChange(currentPhotoIndex, 'tags', e.target.value)}
              className="photo-tags-input"
            />
          </div>
        </div>
      )}

      {previews.length > 0 && (
        <div className="upload-actions">
          <button 
            onClick={handleUpload} 
            disabled={loading}
            className="submit-upload-button"
          >
            {loading ? 'アップロード中...' : 'アップロード'}
          </button>
        </div>
      )}
    </div>
  );
}

export default PhotoUpload; 