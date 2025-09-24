import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SearchPanel from './SearchPanel';
import './MapView.css';

// Leafletのデフォルトアイコンを修正
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapView({ onBack, onPostClick, onNavigateToPostList, onNavigateToCreatePost, onNavigateToProfile }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // デバッグ用ログ
  console.log('MapView props:', {
    onNavigateToPostList: !!onNavigateToPostList,
    onNavigateToCreatePost: !!onNavigateToCreatePost,
    onNavigateToProfile: !!onNavigateToProfile
  });
  const [center, setCenter] = useState([35.6762, 139.6503]); // 東京駅を中心
  const [selectedLocationPosts, setSelectedLocationPosts] = useState([]);
  const [showSidePanel, setShowSidePanel] = useState(true); // 常に表示
  const [selectedLocationName, setSelectedLocationName] = useState('すべての投稿');
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // サイドバーが折りたたまれているか
  
  // 日本の地理的境界（少し余裕を持たせた範囲）
  const japanBounds = [
    [20.0, 122.5], // 南西端（沖縄県・与那国島）
    [46.0, 154.5]  // 北東端（北海道・択捉島）
  ];

  useEffect(() => {
    fetchPostsWithCoordinates();
    getUserLocation();
  }, []);

  // 初期表示時にすべての投稿を表示
  useEffect(() => {
    if (posts.length > 0 && selectedLocationPosts.length === 0) {
      setSelectedLocationPosts(posts);
    }
  }, [posts, selectedLocationPosts.length]);

  // ピンクリック時の投稿リスト表示を確実にする
  useEffect(() => {
    if (selectedLocationPosts.length > 0 && showSidePanel && isSidebarCollapsed) {
      console.log('投稿データが設定されたので、サイドバーを表示します');
      setIsSidebarCollapsed(false);
    }
  }, [selectedLocationPosts.length, showSidePanel]);

  // 座標情報がある投稿を取得
  const fetchPostsWithCoordinates = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/posts', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // 座標情報がある投稿のみをフィルタリング
        const postsWithCoordinates = data.posts.filter(post => 
          post.latitude && post.longitude
        );
        setPosts(postsWithCoordinates);
        console.log('Posts with coordinates:', postsWithCoordinates);
      } else {
        setError('投稿の取得に失敗しました');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // ユーザーの現在位置を取得
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // 日本の境界内かチェック
          if (lat >= 20.0 && lat <= 46.0 && lng >= 122.5 && lng <= 154.5) {
            setCenter([lat, lng]);
          } else {
            console.log('位置情報が日本外のため、デフォルト位置を使用します');
            // 日本外の場合はデフォルト位置（日本中心部）を使用
          }
        },
        (error) => {
          console.log('位置情報の取得に失敗しました:', error);
          // デフォルト位置（日本中心部）を使用
        }
      );
    }
  };

  // 投稿をクリックした時の処理
  const handlePostClick = (postId) => {
    if (onPostClick) {
      onPostClick(postId);
    }
  };

  // 特定の場所の投稿を表示
  const handleLocationClick = (latitude, longitude) => {
    const locationPosts = posts.filter(post => 
      Math.abs(parseFloat(post.latitude) - latitude) < 0.001 && 
      Math.abs(parseFloat(post.longitude) - longitude) < 0.001
    );
    
    // 重複を排除
    const uniquePosts = locationPosts.filter((post, index, self) => 
      index === self.findIndex(p => p.id === post.id)
    );
    
    if (uniquePosts.length > 0) {
      console.log('ピンクリック - 投稿数:', uniquePosts.length);
      setSelectedLocationPosts(uniquePosts);
      setSelectedLocationName(uniquePosts[0].location_name || '選択された場所');
      setShowSidePanel(true);
      console.log('ピンクリック後の状態:', { showSidePanel: true, isSidebarCollapsed: false });
    }
  };

  // 検索結果を処理
  const handleSearchResults = (searchResults, searchTitle) => {
    setSelectedLocationPosts(searchResults);
    setSelectedLocationName(searchTitle);
    setShowSidePanel(true);
    setShowSearchPanel(false);
  };

  // サイドパネルを閉じる（折りたたむ）
  const closeSidePanel = () => {
    console.log('サイドバーを折りたたみ中...', { 
      before: { isSidebarCollapsed, showSidePanel },
      after: { isSidebarCollapsed: true, showSidePanel: false }
    });
    setIsSidebarCollapsed(true);
    setShowSidePanel(false);
    // 選択された投稿をクリアして、useEffectが動作しないようにする
    setSelectedLocationPosts([]);
  };

  // サイドパネルを開く
  const openSidePanel = () => {
    console.log('サイドバーを表示中...', { 
      before: { isSidebarCollapsed, showSidePanel, selectedLocationPosts: selectedLocationPosts.length },
      after: { isSidebarCollapsed: false, showSidePanel: true }
    });
    setShowSidePanel(true);
    setIsSidebarCollapsed(false);
    // 投稿データがない場合は全ての投稿を表示
    if (selectedLocationPosts.length === 0 && posts.length > 0) {
      setSelectedLocationPosts(posts);
      setSelectedLocationName('すべての投稿');
    }
  };

  if (loading) {
    return (
      <div className="map-loading">
        <p>地図を読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-error">
        <p>{error}</p>
        <button onClick={onBack}>戻る</button>
      </div>
    );
  }

  return (
    <div className="map-view-container">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        position: 'relative',
        zIndex: 1000
      }}>
        <div style={{
          display: 'flex',
          gap: '10px'
        }}>
          <button 
            onClick={() => {
              console.log('投稿一覧ボタンクリック');
              if (onNavigateToPostList) {
                onNavigateToPostList();
              }
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📋 投稿一覧
          </button>
          <button 
            onClick={() => {
              console.log('新規投稿ボタンクリック');
              if (onNavigateToCreatePost) {
                onNavigateToCreatePost();
              }
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ✏️ 新規投稿
          </button>
          <button 
            onClick={() => {
              console.log('プロフィールボタンクリック');
              if (onNavigateToProfile) {
                onNavigateToProfile();
              }
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            👤 プロフィール
          </button>
          <button 
            onClick={() => {
              console.log('検索ボタンクリック');
              setShowSearchPanel(true);
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🔍 検索
          </button>
        </div>
        <h1 style={{margin: 0, fontSize: '20px'}}>📍 投稿マップ</h1>
        <div style={{
          fontSize: '14px',
          color: '#6b7280',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1px solid #e5e7eb'
        }}>
          {posts.length}件の投稿
        </div>
      </div>

      <div className={`map-main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {console.log('現在の状態:', { 
          isSidebarCollapsed, 
          showSidePanel, 
          '投稿リスト表示中': showSidePanel && !isSidebarCollapsed,
          'selectedLocationPosts数': selectedLocationPosts.length,
          'selectedLocationName': selectedLocationName
        })}
        <div className="map-container">
          <MapContainer
            center={center}
            zoom={8}
            minZoom={6}
            maxZoom={18}
            maxBounds={japanBounds}
            maxBoundsViscosity={1.0}
            style={{ 
              height: '100%', 
              width: '100%',
              minWidth: '100%',
              maxWidth: '100%'
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MarkerClusterGroup
              chunkedLoading
              maxClusterRadius={50}
              spiderfyOnMaxZoom={false}
              showCoverageOnHover={false}
              zoomToBoundsOnClick={false}
              animate={true}
              animateAddingMarkers={true}
              iconCreateFunction={(cluster) => {
                const count = cluster.getChildCount();
                let className = 'marker-cluster-small';
                
                if (count >= 10) {
                  className = 'marker-cluster-large';
                } else if (count >= 5) {
                  className = 'marker-cluster-medium';
                }
                
                return L.divIcon({
                  html: `<div><span>${count}</span></div>`,
                  className: `marker-cluster ${className}`,
                  iconSize: L.point(40, 40)
                });
              }}
              eventHandlers={{
                clusterclick: (event) => {
                  const cluster = event.layer;
                  const markers = cluster.getAllChildMarkers();
                  
                  const postIds = new Set();
                  const clusterPosts = [];
                  
                  markers.forEach(marker => {
                    const lat = marker.getLatLng().lat;
                    const lng = marker.getLatLng().lng;
                    const matchingPosts = posts.filter(post => 
                      Math.abs(parseFloat(post.latitude) - lat) < 0.001 && 
                      Math.abs(parseFloat(post.longitude) - lng) < 0.001
                    );
                    
                    matchingPosts.forEach(post => {
                      if (!postIds.has(post.id)) {
                        postIds.add(post.id);
                        clusterPosts.push(post);
                      }
                    });
                  });
                  
                  setSelectedLocationPosts(clusterPosts);
                  setSelectedLocationName(clusterPosts[0]?.location_name || '選択された場所');
                  setShowSidePanel(true);
                }
              }}
            >
              {posts.map((post) => (
                <Marker
                  key={post.id}
                  position={[parseFloat(post.latitude), parseFloat(post.longitude)]}
                  eventHandlers={{
                    click: () => {
                      handleLocationClick(parseFloat(post.latitude), parseFloat(post.longitude));
                    }
                  }}
                >
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
          
          {/* 地図の右上端の矢印ボタン */}
          <div className="arrow-buttons-container">
            {showSidePanel && isSidebarCollapsed ? (
              <button 
                className="arrow-button show-button" 
                onClick={openSidePanel}
                title="投稿リストを表示"
              >
                <span className="arrow-icon">›</span>
              </button>
            ) : (
              <button 
                className="arrow-button hide-button" 
                onClick={closeSidePanel}
                title="投稿リストを非表示"
              >
                <span className="arrow-icon">‹</span>
              </button>
            )}
          </div>
        </div>

        {/* サイドパネル - 常に表示 */}
        {showSidePanel && !isSidebarCollapsed && (
          <div className="map-sidebar">
            <div className="sidebar-content">
              <div className="sidebar-header">
                <button 
                  className="hide-sidebar-btn" 
                  onClick={() => {
                    console.log('非表示ボタンがクリックされました');
                    closeSidePanel();
                  }} 
                  title="投稿リストを非表示"
                >
                  <span className="hide-icon">−</span>
                </button>
                <h3>{selectedLocationName}の投稿</h3>
              </div>
              <div className="location-posts-count">
                {selectedLocationPosts.length}件の投稿
              </div>
              
              <div className="location-posts-list">
                {selectedLocationPosts.map((post) => (
                  <div 
                    key={post.id} 
                    className="sidebar-post-card"
                    onClick={() => handlePostClick(post.id)}
                  >
                    {post.first_photo_url && (
                      <div className="sidebar-post-image">
                        <img 
                          src={post.first_photo_url} 
                          alt={post.title}
                          className="sidebar-post-thumbnail"
                        />
                      </div>
                    )}
                    
                    <div className="sidebar-post-content">
                      <h4 className="sidebar-post-title">{post.title}</h4>
                      <p className="sidebar-post-description">
                        {post.description.length > 60 
                          ? `${post.description.substring(0, 60)}...` 
                          : post.description
                        }
                      </p>
                      
                      <div className="sidebar-post-meta">
                        <span className="sidebar-post-date">
                          {new Date(post.created_at).toLocaleDateString('ja-JP')}
                        </span>
                        <div className="sidebar-post-stats">
                          <span>❤️ {post.likes_count}</span>
                          <span>📷 {post.total_photos || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {posts.length === 0 && !showSidePanel && (
        <div className="no-coordinates-message">
          <p>位置情報付きの投稿がまだありません</p>
          <p>投稿作成時に位置情報を追加すると、地図上に表示されます</p>
        </div>
        )}

      <SearchPanel
        isVisible={showSearchPanel}
        onSearch={handleSearchResults}
        onClose={() => setShowSearchPanel(false)}
      />
    </div>
  );
}

export default MapView;
