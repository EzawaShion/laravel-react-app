import React, { useState, useRef, useEffect, useCallback } from 'react';
import './PhotoUpload.css';

function PhotoUpload({ postId, onUploadSuccess, onCancel, isFromCreatePost, draftPost }) {
  const [items, setItems] = useState([]); // { id, file, src, title, description, tags }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingPhotoCount, setExistingPhotoCount] = useState(0);
  const [dragOverId, setDragOverId] = useState(null);
  const dragItemId = useRef(null);
  const fileInputRef = useRef(null);
  const thumbListRef = useRef(null);
  // タッチドラッグ用
  const touchDragId = useRef(null);
  const touchClone = useRef(null);
  const touchOffsetX = useRef(0);
  const touchOffsetY = useRef(0);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // 既存写真数を取得
  useEffect(() => {
    if (!postId) return;
    const fetchCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/photos/post/${postId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (res.ok) setExistingPhotoCount(data.photos?.length || 0);
      } catch (e) { console.error(e); }
    };
    fetchCount();
  }, [postId]);

  // 画像圧縮
  const compressImage = (file) => new Promise((resolve, reject) => {
    const maxSize = 1920;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (evt) => {
      const img = new Image();
      img.src = evt.target.result;
      img.onload = () => {
        let { width, height } = img;
        if (width > height) { if (width > maxSize) { height = Math.round(height * maxSize / width); width = maxSize; } }
        else { if (height > maxSize) { width = Math.round(width * maxSize / height); height = maxSize; } }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Blob conversion failed'));
          resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
        }, 'image/jpeg', 0.85);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });

  // 複数ファイル選択
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const remaining = 10 - existingPhotoCount - items.length;
    if (files.length > remaining) {
      setError(`あと${remaining}枚しか追加できません（合計10枚まで）`);
      e.target.value = '';
      return;
    }

    const oversized = files.find(f => f.size > 50 * 1024 * 1024);
    if (oversized) { setError('50MBを超えるファイルは追加できません'); e.target.value = ''; return; }

    setLoading(true);
    setError('');

    try {
      const newItems = await Promise.all(files.map(async (file) => {
        const compressed = await compressImage(file);
        const src = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.readAsDataURL(compressed);
        });
        return { id: `${Date.now()}-${Math.random()}`, file: compressed, src, title: '', description: '', tags: [] };
      }));
      setItems(prev => {
        const updated = [...prev, ...newItems];
        if (prev.length === 0) setCurrentIndex(0);
        return updated;
      });
    } catch (err) {
      console.error(err);
      setError('画像の処理に失敗しました');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  // 写真削除
  const handleRemove = (id) => {
    setItems(prev => {
      const next = prev.filter(it => it.id !== id);
      const removedIndex = prev.findIndex(it => it.id === id);
      if (removedIndex <= currentIndex && currentIndex > 0) {
        setCurrentIndex(ci => ci - 1);
      }
      return next;
    });
  };

  // フィールド更新
  const handleFieldChange = (id, field, value) => {
    setItems(prev => prev.map(it => it.id === id ? {
      ...it,
      [field]: field === 'tags'
        ? value.split(',').map(t => t.trim()).filter(Boolean)
        : value
    } : it));
  };

  // 共通：並び替えロジック
  const reorderItems = (srcId, targetId) => {
    if (!srcId || srcId === targetId) return;
    setItems(prev => {
      const arr = [...prev];
      const fromIdx = arr.findIndex(it => it.id === srcId);
      const toIdx = arr.findIndex(it => it.id === targetId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const [removed] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, removed);
      setCurrentIndex(ci => {
        if (ci === fromIdx) return toIdx;
        if (fromIdx < toIdx && ci > fromIdx && ci <= toIdx) return ci - 1;
        if (fromIdx > toIdx && ci >= toIdx && ci < fromIdx) return ci + 1;
        return ci;
      });
      return arr;
    });
  };

  // マウス ドラッグ&ドロップ
  const onDragStart = (e, id) => {
    dragItemId.current = id;
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e, id) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const onDrop = (e, targetId) => {
    e.preventDefault();
    reorderItems(dragItemId.current, targetId);
    dragItemId.current = null;
    setDragOverId(null);
  };
  const onDragEnd = () => { dragItemId.current = null; setDragOverId(null); };

  // タッチ ドラッグ&ドロップ
  const onTouchStart = (e, id) => {
    const touch = e.touches[0];
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    touchDragId.current = id;
    touchOffsetX.current = touch.clientX - rect.left;
    touchOffsetY.current = touch.clientY - rect.top;

    // ゴースト要素を作成
    const clone = el.cloneNode(true);
    clone.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      opacity: 0.75;
      pointer-events: none;
      z-index: 99999;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      transition: none;
    `;
    document.body.appendChild(clone);
    touchClone.current = clone;
    el.style.opacity = '0.3';

    setDragOverId(id);
  };

  const onTouchMove = (e, id) => {
    e.preventDefault(); // スクロール抑制
    const touch = e.touches[0];

    // ゴーストを指に追従させる
    if (touchClone.current) {
      touchClone.current.style.top = `${touch.clientY - touchOffsetY.current}px`;
      touchClone.current.style.left = `${touch.clientX - touchOffsetX.current}px`;
    }

    // 指の下にある要素を特定
    if (touchClone.current) touchClone.current.style.display = 'none';
    const elBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    if (touchClone.current) touchClone.current.style.display = '';

    // pu-thumb 要素を探す
    const thumbEl = elBelow?.closest('[data-thumb-id]');
    const overId = thumbEl?.dataset.thumbId || null;
    setDragOverId(overId);
  };

  const onTouchEnd = (e, id) => {
    const touch = e.changedTouches[0];

    // クローン削除・元要素を戻す
    if (touchClone.current) {
      document.body.removeChild(touchClone.current);
      touchClone.current = null;
    }
    e.currentTarget.style.opacity = '';

    // ドロップ先を特定
    const elBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const thumbEl = elBelow?.closest('[data-thumb-id]');
    const targetId = thumbEl?.dataset.thumbId;

    if (targetId && targetId !== touchDragId.current) {
      reorderItems(touchDragId.current, targetId);
    }

    touchDragId.current = null;
    setDragOverId(null);
  };

  // アップロード
  const handleUpload = async () => {
    if (items.length === 0) { setError('写真を選択してください'); return; }
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      let currentPostId = postId;

      if (!currentPostId && draftPost) {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(draftPost),
        });
        if (!res.ok) throw new Error((await res.json()).message || '投稿の作成に失敗しました');
        currentPostId = (await res.json()).post.id;
      }
      if (!currentPostId) throw new Error('投稿IDが見つかりません');

      const formData = new FormData();
      formData.append('post_id', currentPostId);
      items.forEach((item, index) => {
        formData.append('photos[]', item.file);
        formData.append(`titles[${index}]`, item.title || '');
        formData.append(`descriptions[${index}]`, item.description || '');
        formData.append(`tags[${index}]`, JSON.stringify(item.tags || []));
      });

      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 5 * 60 * 1000);

      const res = await fetch('/api/photos/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(tid);

      const data = await res.json();
      if (res.ok) {
        onUploadSuccess(data.photos);
      } else {
        setError(data.message || 'アップロードに失敗しました');
      }
    } catch (err) {
      console.error(err);
      if (err.name === 'AbortError') setError('タイムアウトしました。再試行してください。');
      else setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const current = items[currentIndex];

  return (
    <div className="photo-upload-container">
      {/* ヘッダー */}
      <div className="pu-header">
        <button onClick={onCancel} className="pu-back-btn">
          {isFromCreatePost ? '← 戻る' : 'キャンセル'}
        </button>
        <div className="page-title">写真アップロード</div>
        <div style={{ width: 60 }} />
      </div>

      {/* 追加ボタン */}
      <div className="pu-add-area">
        <button
          className="pu-add-btn"
          onClick={() => fileInputRef.current.click()}
          disabled={loading || items.length + existingPhotoCount >= 10}
        >
          <span className="pu-add-icon">＋</span>
          {items.length === 0 ? '写真を選択' : '写真を追加'}
          <span className="pu-add-hint">（複数選択可・最大{10 - existingPhotoCount}枚）</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      {items.length > 0 && (
        <>
          {/* カルーセルプレビュー */}
          <div className="pu-carousel-wrap">
            {/* 左 */}
            {items.length > 1 && (
              <button
                className="pu-nav prev"
                onClick={() => setCurrentIndex(i => i === 0 ? items.length - 1 : i - 1)}
              >‹</button>
            )}

            {/* メイン画像 */}
            <div className="pu-main-img-wrap">
              <img src={current.src} alt="" className="pu-main-img" />
              <button className="pu-remove-btn" onClick={() => handleRemove(current.id)}>×</button>
              {items.length > 1 && (
                <div className="pu-img-counter">{currentIndex + 1} / {items.length}</div>
              )}
            </div>

            {/* 右 */}
            {items.length > 1 && (
              <button
                className="pu-nav next"
                onClick={() => setCurrentIndex(i => i === items.length - 1 ? 0 : i + 1)}
              >›</button>
            )}
          </div>

          {/* ドット */}
          {items.length > 1 && (
            <div className="pu-dots">
              {items.map((it, i) => (
                <span
                  key={it.id}
                  className={`pu-dot ${i === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(i)}
                />
              ))}
            </div>
          )}

          {/* サムネイル並び替えエリア */}
          <div className="pu-thumb-section">
            <div className="pu-thumb-label">
              順番をドラッグで並び替え　
              <span className="pu-thumb-count">{items.length}枚 / 合計{existingPhotoCount + items.length}/10枚</span>
            </div>
            <div className="pu-thumb-list">
              {items.map((it, i) => (
                <div
                  key={it.id}
                  data-thumb-id={it.id}
                  className={`pu-thumb ${it.id === dragOverId ? 'drag-over' : ''} ${i === currentIndex ? 'selected' : ''}`}
                  draggable
                  onDragStart={(e) => onDragStart(e, it.id)}
                  onDragOver={(e) => onDragOver(e, it.id)}
                  onDrop={(e) => onDrop(e, it.id)}
                  onDragEnd={onDragEnd}
                  onTouchStart={(e) => onTouchStart(e, it.id)}
                  onTouchMove={(e) => onTouchMove(e, it.id)}
                  onTouchEnd={(e) => onTouchEnd(e, it.id)}
                  onClick={() => setCurrentIndex(i)}
                >
                  <span className="pu-thumb-num">{i + 1}</span>
                  <img src={it.src} alt="" className="pu-thumb-img" />
                  <button
                    className="pu-thumb-remove"
                    onClick={(e) => { e.stopPropagation(); handleRemove(it.id); }}
                  >×</button>
                </div>
              ))}
            </div>
          </div>

          {/* 写真メタ情報入力 */}
          <div className="pu-meta">
            <div className="pu-meta-label">写真の詳細（{currentIndex + 1}枚目）</div>
            <input
              type="text"
              placeholder="タイトル"
              className="photo-title-input"
              value={current.title}
              onChange={(e) => handleFieldChange(current.id, 'title', e.target.value)}
            />
            <textarea
              placeholder="説明"
              className="photo-description-input"
              value={current.description}
              onChange={(e) => handleFieldChange(current.id, 'description', e.target.value)}
            />
            {/* タグ入力 - 一時非表示
            <input
              type="text"
              placeholder="タグ（カンマ区切り）"
              className="photo-tags-input"
              value={current.tags.join(', ')}
              onChange={(e) => handleFieldChange(current.id, 'tags', e.target.value)}
            />
            */}
          </div>

          {/* アップロードボタン */}
          <div className="upload-actions">
            <button
              onClick={handleUpload}
              disabled={loading}
              className="submit-upload-button"
            >
              {loading ? 'アップロード中...' : `${items.length}枚をアップロード`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default PhotoUpload;