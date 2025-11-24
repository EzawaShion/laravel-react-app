import { useEffect, useMemo, useState } from 'react';
import './JapanMapSimple.css';

const API_BASE_URL = 'http://localhost:8000';

const prefectureBlocks = [
  {
    id: 'pref01',
    prefectureId: 1,
    name: '北海道',
    rect: { width: 150, height: 110, x: 450, y: 10 },
    text: { x: 525, y: 65 },
  },
  {
    id: 'pref02',
    prefectureId: 2,
    name: '青森',
    rect: { width: 128, height: 40, x: 450, y: 130 },
    text: { x: 514, y: 150 },
  },
  {
    id: 'pref03',
    prefectureId: 3,
    name: '岩手',
    rect: { width: 64, height: 40, x: 514, y: 170 },
    text: { x: 546, y: 190 },
  },
  {
    id: 'pref04',
    prefectureId: 4,
    name: '宮城',
    rect: { width: 64, height: 40, x: 514, y: 210 },
    text: { x: 546, y: 230 },
  },
  {
    id: 'pref05',
    prefectureId: 5,
    name: '秋田',
    rect: { width: 64, height: 40, x: 450, y: 170 },
    text: { x: 483, y: 190 },
  },
  {
    id: 'pref06',
    prefectureId: 6,
    name: '山形',
    rect: { width: 64, height: 40, x: 450, y: 210 },
    text: { x: 483, y: 230 },
  },
  {
    id: 'pref07',
    prefectureId: 7,
    name: '福島',
    rect: { width: 128, height: 40, x: 450, y: 250 },
    text: { x: 514, y: 270 },
  },
  {
    id: 'pref08',
    prefectureId: 8,
    name: '茨城',
    rect: { width: 36, height: 80, x: 542, y: 290 },
    text: { x: 560, y: 330, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref09',
    prefectureId: 9,
    name: '栃木',
    rect: { width: 56, height: 40, x: 486, y: 290 },
    text: { x: 514, y: 310 },
  },
  {
    id: 'pref10',
    prefectureId: 10,
    name: '群馬',
    rect: { width: 36, height: 80, x: 450, y: 290 },
    text: { x: 468, y: 330, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref11',
    prefectureId: 11,
    name: '埼玉',
    rect: { width: 56, height: 40, x: 486, y: 330 },
    text: { x: 514, y: 350 },
  },
  {
    id: 'pref12',
    prefectureId: 12,
    name: '千葉',
    rect: { width: 36, height: 70, x: 542, y: 370 },
    text: { x: 560, y: 405, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref13',
    prefectureId: 13,
    name: '東京',
    rect: { width: 56, height: 40, x: 486, y: 370 },
    text: { x: 514, y: 390 },
  },
  {
    id: 'pref14',
    prefectureId: 14,
    name: '神奈川',
    rect: { width: 36, height: 70, x: 450, y: 370 },
    text: { x: 468, y: 405, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref15',
    prefectureId: 15,
    name: '新潟',
    rect: { width: 30, height: 70, x: 420, y: 250 },
    text: { x: 435, y: 285, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref16',
    prefectureId: 16,
    name: '富山',
    rect: { width: 30, height: 70, x: 390, y: 250 },
    text: { x: 405, y: 285, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref17',
    prefectureId: 17,
    name: '石川',
    rect: { width: 30, height: 70, x: 360, y: 250 },
    text: { x: 375, y: 285, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref18',
    prefectureId: 18,
    name: '福井',
    rect: { width: 30, height: 70, x: 330, y: 250 },
    text: { x: 345, y: 285, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref19',
    prefectureId: 19,
    name: '山梨',
    rect: { width: 40, height: 60, x: 410, y: 320 },
    text: { x: 430, y: 350, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref20',
    prefectureId: 20,
    name: '長野',
    rect: { width: 40, height: 60, x: 370, y: 320 },
    text: { x: 390, y: 350, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref21',
    prefectureId: 21,
    name: '岐阜',
    rect: { width: 40, height: 60, x: 330, y: 320 },
    text: { x: 350, y: 350, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref22',
    prefectureId: 22,
    name: '静岡',
    rect: { width: 40, height: 60, x: 410, y: 380 },
    text: { x: 430, y: 410, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref23',
    prefectureId: 23,
    name: '愛知',
    rect: { width: 40, height: 60, x: 370, y: 380 },
    text: { x: 390, y: 410, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref24',
    prefectureId: 24,
    name: '三重',
    rect: { width: 40, height: 60, x: 330, y: 380 },
    text: { x: 350, y: 410, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref25',
    prefectureId: 25,
    name: '滋賀',
    rect: { width: 40, height: 50, x: 290, y: 300 },
    text: { x: 310, y: 325, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref26',
    prefectureId: 26,
    name: '京都',
    rect: { width: 40, height: 50, x: 290, y: 250 },
    text: { x: 310, y: 275, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref27',
    prefectureId: 27,
    name: '大阪',
    rect: { width: 40, height: 50, x: 250, y: 350 },
    text: { x: 270, y: 375, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref28',
    prefectureId: 28,
    name: '兵庫',
    rect: { width: 40, height: 100, x: 250, y: 250 },
    text: { x: 270, y: 300, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref29',
    prefectureId: 29,
    name: '奈良',
    rect: { width: 40, height: 50, x: 290, y: 350 },
    text: { x: 310, y: 375, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref30',
    prefectureId: 30,
    name: '和歌山',
    rect: { width: 80, height: 50, x: 250, y: 400 },
    text: { x: 290, y: 425 },
  },
  {
    id: 'pref31',
    prefectureId: 31,
    name: '鳥取',
    rect: { width: 40, height: 50, x: 210, y: 250 },
    text: { x: 230, y: 275, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref32',
    prefectureId: 32,
    name: '島根',
    rect: { width: 40, height: 50, x: 170, y: 250 },
    text: { x: 190, y: 275, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref33',
    prefectureId: 33,
    name: '岡山',
    rect: { width: 40, height: 50, x: 210, y: 300 },
    text: { x: 230, y: 325, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref34',
    prefectureId: 34,
    name: '広島',
    rect: { width: 40, height: 50, x: 170, y: 300 },
    text: { x: 190, y: 325, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref35',
    prefectureId: 35,
    name: '山口',
    rect: { width: 40, height: 100, x: 130, y: 250 },
    text: { x: 150, y: 300, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref36',
    prefectureId: 36,
    name: '徳島',
    rect: { width: 54, height: 40, x: 186, y: 400 },
    text: { x: 213, y: 420 },
  },
  {
    id: 'pref37',
    prefectureId: 37,
    name: '香川',
    rect: { width: 54, height: 40, x: 186, y: 360 },
    text: { x: 213, y: 380 },
  },
  {
    id: 'pref38',
    prefectureId: 38,
    name: '愛媛',
    rect: { width: 56, height: 40, x: 130, y: 360 },
    text: { x: 158, y: 380 },
  },
  {
    id: 'pref39',
    prefectureId: 39,
    name: '高知',
    rect: { width: 56, height: 40, x: 130, y: 400 },
    text: { x: 158, y: 420 },
  },
  {
    id: 'pref40',
    prefectureId: 40,
    name: '福岡',
    rect: { width: 36, height: 70, x: 84, y: 260 },
    text: { x: 102, y: 295, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref41',
    prefectureId: 41,
    name: '佐賀',
    rect: { width: 36, height: 70, x: 48, y: 260 },
    text: { x: 66, y: 295, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref42',
    prefectureId: 42,
    name: '長崎',
    rect: { width: 36, height: 70, x: 12, y: 260 },
    text: { x: 30, y: 295, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref43',
    prefectureId: 43,
    name: '熊本',
    rect: { width: 36, height: 70, x: 48, y: 330 },
    text: { x: 66, y: 365, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref44',
    prefectureId: 44,
    name: '大分',
    rect: { width: 36, height: 70, x: 84, y: 330 },
    text: { x: 102, y: 365, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref45',
    prefectureId: 45,
    name: '宮崎',
    rect: { width: 36, height: 70, x: 84, y: 400 },
    text: { x: 102, y: 435, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref46',
    prefectureId: 46,
    name: '鹿児島',
    rect: { width: 36, height: 70, x: 48, y: 400 },
    text: { x: 66, y: 435, writingMode: 'vertical-rl' },
  },
  {
    id: 'pref47',
    prefectureId: 47,
    name: '沖縄',
    rect: { width: 60, height: 40, x: 10, y: 500 },
    text: { x: 40, y: 520 },
  },
];

function JapanMapSimple({ userId }) {
  const mapBlocks = useMemo(() => prefectureBlocks, []);
  const [mapData, setMapData] = useState({
    prefecturesById: {},
    totalVisited: 0,
    totalPrefectures: 47,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!userId) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}/map`, {
          headers: {
            'Accept': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error('地図データの取得に失敗しました');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || '地図データの取得に失敗しました');
        }

        if (!isMounted) {
          return;
        }

        const prefecturesById = {};

        (data.prefectures || []).forEach((prefecture) => {
          prefecturesById[prefecture.id] = {
            ...prefecture,
            photos: prefecture.photos || [],
          };
        });

        setMapData({
          prefecturesById,
          totalVisited: data.total_visited || 0,
          totalPrefectures: data.total_prefectures || 47,
        });
      } catch (err) {
        if (!isMounted) {
          return;
        }
        console.error(err);
        setError(err.message || '地図データの取得に失敗しました');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const closeModal = () => {
    setModalVisible(false);
    setSelectedBlock(null);
  };

  const handleBlockClick = (block) => {
    setSelectedBlock(block);
    setModalVisible(true);
  };

  const handleSelectFavorite = async (photo, prefectureId) => {
    if (!userId || !photo) {
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/favorite-photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          prefecture_id: prefectureId,
          photo_id: photo.id,
        }),
      });

      if (!response.ok) {
        throw new Error('お気に入り写真の保存に失敗しました');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'お気に入り写真の保存に失敗しました');
      }

      setMapData((prev) => {
        const updated = { ...prev.prefecturesById };
        const target = updated[prefectureId];

        if (target) {
          updated[prefectureId] = {
            ...target,
            favorite_photo: result.favorite_photo || null,
          };
        }

        return {
          ...prev,
          prefecturesById: updated,
        };
      });
    } catch (err) {
      console.error(err);
      alert(err.message || 'お気に入り写真の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const renderModal = () => {
    if (!modalVisible || !selectedBlock) {
      return null;
    }

    const prefectureId = selectedBlock.prefectureId;
    const prefectureData = mapData.prefecturesById[prefectureId];
    const photos = prefectureData?.photos || [];
    const favoritePhotoId = prefectureData?.favorite_photo?.id || null;

    return (
      <div className="map-photo-modal-overlay" onClick={closeModal}>
        <div className="map-photo-modal" onClick={(event) => event.stopPropagation()}>
          <div className="map-photo-modal-header">
            <div>
              <h3>{selectedBlock.name} の写真</h3>
              <p className="map-photo-modal-subtitle">
                {prefectureData
                  ? `訪問回数 ${prefectureData.visit_count} 回 / 写真 ${photos.length} 枚`
                  : 'まだ訪問記録がありません'}
              </p>
            </div>
            <button type="button" onClick={closeModal} aria-label="閉じる">
              ×
            </button>
          </div>
          <div className="map-photo-modal-body">
            {!prefectureData && (
              <div className="map-photo-empty">この都道府県に紐づく投稿がありません。</div>
            )}

            {prefectureData && photos.length === 0 && (
              <div className="map-photo-empty">投稿写真が見つかりません。</div>
            )}

            {prefectureData && photos.length > 0 && (
              <div className="map-photo-grid">
                {photos.map((photo) => {
                  const thumbnail = photo.thumbnail_url || photo.url;
                  const isSelected = favoritePhotoId === photo.id;

                  return (
                    <button
                      key={photo.id}
                      type="button"
                      className={`map-photo-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectFavorite(photo, prefectureId)}
                      disabled={saving}
                    >
                      {thumbnail ? (
                        <img src={thumbnail} alt={photo.title || 'photo'} />
                      ) : (
                        <div className="map-photo-placeholder">No Image</div>
                      )}
                      <span className="map-photo-caption">
                        {photo.title || `投稿#${photo.post_id}`}
                      </span>
                      {isSelected && <span className="map-photo-badge">選択中</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="japan-map-container">
      <div className="japan-map-header">
        <h3>訪問した都道府県</h3>
        <p className="visit-count">
          {loading
            ? '読み込み中...'
            : `訪問済み ${mapData.totalVisited} / ${mapData.totalPrefectures}`}
        </p>
        {error && <p className="map-error">{error}</p>}
      </div>
      <div className="japan-map-svg-container">
        {loading ? (
          <div className="japan-map-loading">地図データを取得しています...</div>
        ) : (
          <svg viewBox="0 0 610 550" className="japan-map-svg">
            {mapBlocks.map((block) => {
              const prefectureData = mapData.prefecturesById[block.prefectureId];
              const isVisited = Boolean(prefectureData);
              const hasFavorite = Boolean(prefectureData?.favorite_photo);
              const rectFill = hasFavorite
                ? 'rgba(255,255,255,0.05)'
                : isVisited
                ? '#D8EFC0'
                : '#ECF4D9';
              const clipId = `clip-${block.id}`;

              return (
                <g key={block.id} className="prefecture" onClick={() => handleBlockClick(block)}>
                  {hasFavorite && (
                    <defs>
                      <clipPath id={clipId}>
                        <rect
                          x={block.rect.x}
                          y={block.rect.y}
                          width={block.rect.width}
                          height={block.rect.height}
                          rx={6}
                          ry={6}
                        />
                      </clipPath>
                    </defs>
                  )}

                  {hasFavorite && (
                    <image
                      className="map-prefecture-photo"
                      x={block.rect.x}
                      y={block.rect.y}
                      width={block.rect.width}
                      height={block.rect.height}
                      preserveAspectRatio="xMidYMid slice"
                      href={prefectureData.favorite_photo.thumbnail_url || prefectureData.favorite_photo.url}
                      clipPath={`url(#${clipId})`}
                    />
                  )}

                  <rect
                    x={block.rect.x}
                    y={block.rect.y}
                    width={block.rect.width}
                    height={block.rect.height}
                    fill={rectFill}
                    rx={6}
                    ry={6}
                    stroke={hasFavorite ? '#ffffff' : '#999'}
                    strokeWidth={hasFavorite ? 2 : 1}
                    className={`prefecture-block ${isVisited ? 'visited' : ''} ${hasFavorite ? 'with-photo' : ''}`}
                  />
                  <text
                    className="prefecture-label"
                    x={block.text.x}
                    y={block.text.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={block.text.writingMode ? { writingMode: block.text.writingMode } : undefined}
                  >
                    {block.name}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
      {renderModal()}
    </div>
  );
}

export default JapanMapSimple;
