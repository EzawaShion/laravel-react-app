import React, { useState, useRef, useEffect } from 'react';
import './PhotoUpload.css';

function PhotoUpload({ postId, onUploadSuccess, onCancel, isFromCreatePost, draftPost }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoData, setPhotoData] = useState([]);
  const [existingPhotoCount, setExistingPhotoCount] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const fileInputRef = useRef(null);

  // マウント時に一番上にスクロール
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 既存の写真数を取得
  useEffect(() => {
    if (!postId) return; // 新規作成時はスキップ

    const fetchExistingPhotoCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/photos/post/${postId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
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

  // 画像圧縮関数
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const maxWidth = 1920;
      const maxHeight = 1920;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }
            const newFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(newFile);
          }, 'image/jpeg', 0.85);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // ファイル選択時の処理（1件ずつ）
  const handleFileSelect = async (e) => {
    const file = e.target.files[0]; // 1件のみ取得

    if (!file) return;

    // 既存の写真数 + 選択中の写真数が10枚を超えないかチェック
    const totalPhotoCount = existingPhotoCount + selectedFiles.length + 1;
    if (totalPhotoCount > 10) {
      setError(`写真は合計10枚までです。既存: ${existingPhotoCount}枚, 選択中: ${selectedFiles.length}枚`);
      return;
    }

    // ファイルサイズチェック（最大10MB）
    // 圧縮前なので一旦スキップするか、あまりに巨大なファイル（例えば50MB以上）だけ弾く
    if (file.size > 50 * 1024 * 1024) {
      setError('ファイルサイズが大きすぎます（50MB以下にしてください）');
      return;
    }

    try {
      setLoading(true);

      // 画像圧縮
      const compressedFile = await compressImage(file);

      // ファイルを追加
      setSelectedFiles(prev => [...prev, compressedFile]);
      setError('');

      // プレビュー生成
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, {
          id: Date.now() + Math.random(),
          src: e.target.result,
          file: compressedFile
        }]);
      };
      reader.readAsDataURL(compressedFile);

      // 写真データを追加
      setPhotoData(prev => [...prev, {
        title: '',
        description: '',
        tags: []
      }]);

    } catch (err) {
      console.error('画像の処理に失敗しました:', err);
      setError('画像の処理に失敗しました。別の画像を試してください。');
    } finally {
      setLoading(false);
      // ファイル入力をリセット（同じファイルを再度選択できるように）
      e.target.value = '';
    }
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
      const token = localStorage.getItem('token');

      // 新規投稿（ドラフト）がある場合は、まず投稿を作成
      let currentPostId = postId;
      if (!currentPostId && draftPost) {
        const postResponse = await fetch('http://localhost:8000/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(draftPost)
        });

        if (!postResponse.ok) {
          const errorData = await postResponse.json();
          throw new Error(errorData.message || '投稿の作成に失敗しました');
        }

        const postData = await postResponse.json();
        currentPostId = postData.post.id;
      }

      if (!currentPostId) {
        throw new Error('投稿IDが見つかりません');
      }

      const formData = new FormData();
      formData.append('post_id', currentPostId);

      selectedFiles.forEach((file, index) => {
        formData.append('photos[]', file);
        formData.append(`titles[${index}]`, photoData[index]?.title || '');
        formData.append(`descriptions[${index}]`, photoData[index]?.description || '');
        formData.append(`tags[${index}]`, JSON.stringify(photoData[index]?.tags || []));
      });

      // アップロードタイムアウトを設定（5分）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);

      const response = await fetch('http://localhost:8000/api/photos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        onUploadSuccess(data.photos);
      } else {
        // バックエンドからのエラーメッセージを表示
        const errorMessage = data.message || 'アップロードに失敗しました';
        setError(errorMessage);

        // 10枚制限エラーの場合は、既存写真数を再取得
        if (errorMessage.includes('写真は合計10枚までです')) {
          const response = await fetch(`http://localhost:8000/api/photos/post/${postId}`, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          const data = await response.json();
          if (response.ok) {
            setExistingPhotoCount(data.photos?.length || 0);
          }
        }
      }
    } catch (err) {
      console.error('アップロードエラー:', err);
      if (err.name === 'AbortError') {
        setError('アップロードがタイムアウトしました。しばらく待ってから再試行してください。');
      } else if (err.message.includes('413')) {
        setError('ファイルサイズが大きすぎます。10枚の写真を一度にアップロードする場合は、各写真を10MB以下にしてください。');
      } else {
        setError('ネットワークエラーが発生しました。10枚の写真を一度にアップロードする場合は、ファイルサイズを確認してください。');
      }
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
      <div className="upload-methods">
        <div className="page-title" style={{ marginBottom: '1rem', width: '100%', textAlign: 'center' }}>写真アップロード</div>
        <button
          onClick={() => fileInputRef.current.click()}
          className="upload-button"
        >
          写真を追加
        </button>
        <button onClick={onCancel} className="cancel-button" style={{
          position: 'static',
          marginTop: '1rem',
          background: 'transparent',
          border: 'none',
          textDecoration: 'underline',
          color: 'var(--text-secondary)'
        }}>
          {isFromCreatePost ? '← 戻る' : 'キャンセル'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {error && <div className="error-message">{error}</div>}

      {
        previews.length > 0 && (
          <div className="photo-previews">
            <div className="section-title">選択された写真 ({previews.length}枚) - 合計: {existingPhotoCount + selectedFiles.length}/10枚</div>



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
        )
      }

      {
        previews.length > 0 && (
          <div className="upload-actions">
            <button
              onClick={handleUpload}
              disabled={loading}
              className="submit-upload-button"
            >
              {loading ? 'アップロード中...' : 'アップロード'}
            </button>
          </div>
        )
      }
    </div >
  );
}

export default PhotoUpload; 