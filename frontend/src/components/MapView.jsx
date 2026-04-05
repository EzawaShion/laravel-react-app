import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Pane } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SearchPanel from './SearchPanel';
import MapPostGrid from './MapPostGrid';
import './MapView.css';

// debounce用のカスタムhook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Leafletのデフォルトアイコンを修正
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapView({ onBack, onPostClick, onNavigateToPostList, onNavigateToCreatePost, onNavigateToProfile, onUserClick }) {
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
  const mapRef = useRef(null); // 地図のref
  const [selectedLocationPosts, setSelectedLocationPosts] = useState([]);
  const [showSidePanel, setShowSidePanel] = useState(true); // 常に表示
  const [selectedLocationName, setSelectedLocationName] = useState('すべての投稿');
  const [showSearchPanel, setShowSearchPanel] = useState(true); // 常に表示
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // サイドバーが折りたたまれているか
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false); // モバイル検索メニュー
  const [searchParams, setSearchParams] = useState({
    prefecture_id: '',
    city_id: '',
    keyword: ''
  });
  const [mapStyle, setMapStyle] = useState('standard'); // 'standard' or 'simple'
  const [geojsonData, setGeojsonData] = useState(null);
  const [prefectures, setPrefectures] = useState([]);
  const [cities, setCities] = useState([]);
  const sidebarListRef = useRef(null); // サイドバースクロール担当

  // 日本以外を隠すためのマスクデータを生成（メモ化してパフォーマンスを確保）
  const maskData = useMemo(() => {
    if (!geojsonData) return null;

    // 世界全体を覆うポリゴン（反時計回り）
    const worldCoords = [
      [180, 90],
      [-180, 90],
      [-180, -90],
      [180, -90],
      [180, 90]
    ];

    const rings = [worldCoords];

    // 日本の全領土を「穴」として追加
    // 地形データの座標を反転させることで、世界を覆うポリゴンの中に「穴」を作ります
    geojsonData.features.forEach(feature => {
      if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates.forEach(ring => {
          // 配列をコピーして反転（CCW -> CW）
          rings.push([...ring].reverse());
        });
      } else if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(poly => {
          poly.forEach(ring => {
            // 配列をコピーして反転（CCW -> CW）
            rings.push([...ring].reverse());
          });
        });
      }
    });

    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: rings
      }
    };
  }, [geojsonData]);

  // debounceされた検索パラメータ（500ms遅延）
  const debouncedSearchParams = useDebounce(searchParams, 500);

  // 日本の地理的境界（少し余裕を持たせた範囲）
  const japanBounds = [
    [20.0, 122.5], // 南西端（沖縄県・与那国島）
    [46.0, 154.5]  // 北東端（北海道・択捉島）
  ];

  useEffect(() => {
    fetchPostsWithCoordinates();
    getUserLocation();

    // 日本の県境データを取得（シンプル表示用）
    fetch('https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson')
      .then(res => res.json())
      .then(data => setGeojsonData(data))
      .catch(err => console.error('GeoJSON loading error:', err));
  }, []);

  // 初期表示時にすべての投稿を表示
  useEffect(() => {
    if (posts.length > 0 && selectedLocationPosts.length === 0) {
      setSelectedLocationPosts(posts);
      setSelectedLocationName('すべての投稿');
    }
  }, [posts, selectedLocationPosts.length]);

  // マウント後、サイドバーの投稿が表示されたらスクロール位置を復元
  useEffect(() => {
    if (selectedLocationPosts.length > 0) {
      const saved = sessionStorage.getItem('mapSidebarScrollTop');
      if (saved && sidebarListRef.current) {
        const target = parseInt(saved, 10);
        setTimeout(() => {
          if (sidebarListRef.current) {
            sidebarListRef.current.scrollTop = target;
          }
          sessionStorage.removeItem('mapSidebarScrollTop');
        }, 80);
      }
    }
  }, [selectedLocationPosts]);

  // 都道府県一覧を取得
  useEffect(() => {
    fetchPrefectures();
  }, []);

  // リアルタイム検索（debounceされたパラメータが変更された時）
  useEffect(() => {
    // 検索パラメータに何か値がある場合のみ検索実行
    const hasSearchValue = Object.values(debouncedSearchParams).some(value =>
      value && value.toString().trim() !== ''
    );

    if (hasSearchValue) {
      performRealtimeSearch(debouncedSearchParams);
    } else if (posts.length > 0) {
      // 検索条件がない場合は全ての投稿を表示
      setSelectedLocationPosts(posts);
      setSelectedLocationName('すべての投稿');
    }
  }, [debouncedSearchParams, posts]);

  // 都道府県一覧を取得
  const fetchPrefectures = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/prefectures');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPrefectures(data.prefectures);
        }
      }
    } catch (error) {
      console.error('都道府県の取得に失敗しました:', error);
    }
  };

  // 市町村一覧を取得
  const fetchCities = async (prefectureId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/cities/${prefectureId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCities(data.cities);
        }
      }
    } catch (error) {
      console.error('市町村の取得に失敗しました:', error);
    }
  };

  // リアルタイム検索実行
  const performRealtimeSearch = async (params) => {
    try {
      // 空の値を除外してクエリパラメータを作成
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] && params[key].toString().trim() !== '') {
          queryParams.append(key, params[key]);
        }
      });

      if (queryParams.toString() === '') {
        // 検索条件がない場合は全ての投稿を表示
        setSelectedLocationPosts(posts);
        setSelectedLocationName('すべての投稿');
        return;
      }

      const url = `http://localhost:8000/api/posts/search?${queryParams.toString()}`;
      console.log('リアルタイム検索URL:', url);

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('リアルタイム検索結果:', data);

        // 検索結果が0件の場合
        if (data.posts.length === 0) {
          const searchTitle = getSearchTitle(params);
          setSelectedLocationPosts([]);
          setSelectedLocationName(`${searchTitle}に関する投稿はありませんでした。`);
          setShowSidePanel(true);
          return;
        }

        // 検索タイプとデータを決定
        const selectedPrefecture = prefectures.find(p => p.id == params.prefecture_id);
        const selectedCity = cities.find(c => c.id == params.city_id);

        let searchType = 'keyword';
        let searchData = {};

        if (selectedCity) {
          searchType = 'city';
          searchData = { city: selectedCity };
        } else if (selectedPrefecture) {
          searchType = 'prefecture';
          searchData = { prefecture: selectedPrefecture };
        }

        handleSearchResults(data.posts, getSearchTitle(params), searchType, searchData);
      } else {
        console.error('リアルタイム検索に失敗しました:', response.status);
      }
    } catch (error) {
      console.error('リアルタイム検索エラー:', error);
    }
  };

  // 検索タイトルを取得
  const getSearchTitle = (params = searchParams) => {
    let title = '検索結果';
    const selectedPrefecture = prefectures.find(p => p.id == params.prefecture_id);
    const selectedCity = cities.find(c => c.id == params.city_id);

    if (selectedPrefecture) {
      title += ` - ${selectedPrefecture.name}`;
      if (selectedCity) {
        title += `${selectedCity.name}`;
      }
    }

    if (params.keyword) {
      title += ` "${params.keyword}"`;
    }

    return title;
  };

  // ピンクリック時の投稿リスト表示を確実にする
  useEffect(() => {
    if (selectedLocationPosts.length > 0 && showSidePanel) {
      console.log('投稿データが設定されたので、サイドバーを表示します');
      setIsSidebarCollapsed(false);
    }
  }, [selectedLocationPosts.length, showSidePanel]);

  // サイドバーの開閉に合わせて地図のサイズを更新
  useEffect(() => {
    if (mapRef.current) {
      // CSSアニメーション（transition）の完了を待つために少し遅らせて実行
      const timer = setTimeout(() => {
        mapRef.current.invalidateSize();
        console.log('Map size invalidated');
      }, 300); // MapView.cssのtransition時間（通常300ms程度）に合わせる

      return () => clearTimeout(timer);
    }
  }, [isSidebarCollapsed]);

  // 座標情報がある投稿を取得
  const fetchPostsWithCoordinates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/posts', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    // 現在のサイドバースクロール位置をsessionStorageに保存
    if (sidebarListRef.current) {
      sessionStorage.setItem('mapSidebarScrollTop', sidebarListRef.current.scrollTop);
    }
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
  const handleSearchResults = (searchResults, searchTitle, searchType, searchData) => {
    setSelectedLocationPosts(searchResults);
    setSelectedLocationName(searchTitle);
    setShowSidePanel(true);

    // 都道府県または市町村検索の場合、地図をフォーカス
    if (searchType === 'prefecture' && searchData.prefecture) {
      const { latitude, longitude } = searchData.prefecture;
      if (latitude && longitude) {
        focusMapOnLocation(latitude, longitude, 8); // 都道府県レベルは広めに
      }
    } else if (searchType === 'city' && searchData.city) {
      const { latitude, longitude } = searchData.city;
      if (latitude && longitude) {
        focusMapOnLocation(latitude, longitude, 12); // 市町村レベルは詳細に
      }
    }
    // キーワード検索の場合は地図フォーカスしない
  };

  // 地図を指定した座標にフォーカス
  const focusMapOnLocation = (latitude, longitude, zoom = 12) => {
    if (mapRef.current) {
      const map = mapRef.current;
      map.setView([latitude, longitude], zoom);
      console.log(`地図を座標 [${latitude}, ${longitude}] にフォーカスしました`);
    }
  };

  // サイドパネルを閉じる（折りたたむ）
  const closeSidePanel = () => {
    console.log('サイドバーを折りたたみ中...', {
      before: { isSidebarCollapsed, showSidePanel },
      after: { isSidebarCollapsed: true, showSidePanel: false }
    });
    setIsSidebarCollapsed(true);
    setShowSidePanel(false);
    setIsSidebarExpanded(false); // 縮小状態もリセット
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

  // サイドパネルの全画面切替
  // サイドパネルの全画面切替
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    return localStorage.getItem('isMapSidebarExpanded') === 'true';
  });

  const toggleSidebarExpand = () => {
    setIsSidebarExpanded(prev => {
      const newState = !prev;
      localStorage.setItem('isMapSidebarExpanded', newState);
      if (newState) {
        setIsSidebarCollapsed(false);
        setShowSidePanel(true);
      }
      return newState;
    });
  };

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
      <div className="map-header-container">
        {/* モバイル用ハンバーガーメニュー */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
        >
          <span className="material-icons">
            {isMobileSearchOpen ? 'close' : 'menu'}
          </span>
        </button>

        {/* 検索欄 */}
        <div className={`search-bar-container ${isMobileSearchOpen ? 'mobile-open' : ''}`}>
          <div className="mobile-search-header">
            <span className="mobile-search-label">検索フィルター</span>
          </div>

          <select
            className="search-select"
            value={searchParams.prefecture_id || ''}
            onChange={(e) => {
              const prefectureId = e.target.value;
              setSearchParams(prev => ({
                ...prev,
                prefecture_id: prefectureId,
                city_id: '' // 都道府県変更時は市町村をリセット
              }));

              // 都道府県が選択された場合、市町村を取得
              if (prefectureId) {
                fetchCities(prefectureId);
              } else {
                setCities([]);
              }
            }}
          >
            <option value="">都道府県</option>
            {prefectures.map(prefecture => (
              <option key={prefecture.id} value={prefecture.id}>
                {prefecture.name}
              </option>
            ))}
          </select>

          <select
            className="search-select"
            value={searchParams.city_id || ''}
            onChange={(e) => {
              setSearchParams(prev => ({
                ...prev,
                city_id: e.target.value
              }));
            }}
            disabled={!searchParams.prefecture_id}
          >
            <option value="">市町村</option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="キーワード検索"
            className="search-input"
            value={searchParams.keyword || ''}
            onChange={(e) => {
              setSearchParams(prev => ({
                ...prev,
                keyword: e.target.value
              }));
            }}
          />

          {(searchParams.prefecture_id || searchParams.keyword) && (
            <button
              className="search-reset-btn"
              onClick={() => {
                setSearchParams({
                  prefecture_id: '',
                  city_id: '',
                  keyword: ''
                });
                setCities([]); // Clear cities as well
              }}
              title="検索条件をクリア"
            >
              ✕
            </button>
          )}

          <div className={`map-style-toggle-group ${mapStyle}`}>
            <div className="toggle-slider" />
            <button
              className={`style-toggle-option ${mapStyle === 'standard' ? 'active' : ''}`}
              onClick={() => setMapStyle('standard')}
            >
              標準
            </button>
            <button
              className={`style-toggle-option ${mapStyle === 'simple' ? 'active' : ''}`}
              onClick={() => setMapStyle('simple')}
            >
              シンプル
            </button>
          </div>
        </div>
        <div className="map-title">📍 投稿マップ</div>
        <div className="post-count-badge">
          {posts.length}件の投稿
        </div>
      </div>

      <div className={`map-main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${isSidebarExpanded ? 'sidebar-expanded' : ''}`}>
        {console.log('現在の状態:', {
          isSidebarCollapsed,
          showSidePanel,
          isSidebarExpanded,
          '投稿リスト表示中': showSidePanel && !isSidebarCollapsed,
          'selectedLocationPosts数': selectedLocationPosts.length,
          'selectedLocationName': selectedLocationName
        })}
        <div className="map-container">
          <MapContainer
            center={center}
            zoom={5}
            minZoom={5}
            maxZoom={18}
            className={`leaflet-container ${mapStyle === 'simple' ? 'simple-map' : ''}`}
            maxBounds={japanBounds}
            maxBoundsViscosity={1.0}
            ref={mapRef}
            style={{
              height: '100%',
              width: '100%',
              minWidth: '100%',
              maxWidth: '100%'
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url={mapStyle === 'simple'
                ? "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
              opacity={mapStyle === 'simple' ? (maskData ? 0.3 : 0.5) : 1}
            />

            {/* 日本以外を隠すマスクレイヤーを専用のペインで管理 */}
            <Pane name="mask-pane" style={{ zIndex: 450 }}>
              {maskData && (
                <GeoJSON
                  data={maskData}
                  interactive={false}
                  style={{
                    fillColor: '#b5dffbff', // アプリの背景色に合わせた海の色
                    fillOpacity: 1,
                    color: '#cbd5e1',   // 境界線（控えめな色）
                    weight: 1,
                    stroke: true
                  }}
                />
              )}
            </Pane>

            {/* シンプルモード時の陸地（日本）の色付け */}
            {mapStyle === 'simple' && geojsonData && (
              <Pane name="land-pane" style={{ zIndex: 460 }}>
                <GeoJSON
                  data={geojsonData}
                  interactive={false}
                  style={{
                    fillColor: '#30ba28ff', // 薄い緑色 (green-100相当)
                    fillOpacity: 1,
                    color: '#86efac',   // 境界線 (green-300相当)
                    weight: 1,
                    stroke: true
                  }}
                />
              </Pane>
            )}

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
                  setSelectedLocationName(null);
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
        </div>

        {/* サイドパネル - 常に表示 */}
        {showSidePanel && !isSidebarCollapsed && (
          <div className="map-sidebar">
            <div className="sidebar-content" ref={sidebarListRef}>
              <div className="sidebar-header">
                <div className="sidebar-header-left">
                  <button
                    className="expand-sidebar-btn"
                    onClick={toggleSidebarExpand}
                    title="全画面表示"
                  >
                    <span className="expand-icon"></span>
                  </button>
                  <button
                    className="hide-sidebar-btn"
                    onClick={() => {
                      console.log('非表示ボタンがクリックされました');
                      closeSidePanel();
                    }}
                    title="投稿リストを非表示"
                  >
                    <span className="hide-icon"></span>
                  </button>
                </div>
                {/* <div className="sidebar-header-text">
                  {selectedLocationName && <h3>{selectedLocationName}</h3>}
                  {selectedLocationPosts.length > 0 && (
                    <span className="sidebar-post-count-badge">
                      {selectedLocationPosts.length}件
                    </span>
                  )}
                </div> */}
              </div>

              <div className="location-posts-list">
                {selectedLocationPosts.length === 0 ? (
                  <div className="no-posts-message">
                    <p>{selectedLocationName}</p>
                  </div>
                ) : (
                  selectedLocationPosts.map((post) => (
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
                        <div className="sidebar-post-title-wrapper">
                          <div className="sidebar-post-title">{post.title}</div>
                        </div>
                        <div className="sidebar-post-info-wrapper">
                          <div className="sidebar-post-location">
                            📍 {post.location_name}
                          </div>
                          <div className="sidebar-post-likes">
                            ❤️ {post.likes_count}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 全画面表示コンポーネント */}
        {isSidebarExpanded && (
          <MapPostGrid
            posts={selectedLocationPosts}
            onClose={toggleSidebarExpand}
            onPostClick={handlePostClick}
            onUserClick={onUserClick}
            locationName={selectedLocationName}
            formatDate={formatDate}
          />
        )}

        {/* サイドバー再表示ボタン */}
        {(!showSidePanel || isSidebarCollapsed) && (
          <button
            className="show-sidebar-btn"
            onClick={() => {
              console.log('再表示ボタンがクリックされました');
              openSidePanel();
            }}
            title="投稿リストを表示"
          >
            <span className="show-icon"></span>
          </button>
        )}
      </div>

      {
        posts.length === 0 && !showSidePanel && (
          <div className="no-coordinates-message">
            <p>位置情報付きの投稿がまだありません</p>
            <p>投稿作成時に位置情報を追加すると、地図上に表示されます</p>
          </div>
        )
      }

      {
        isMobileSearchOpen && (
          <div className="mobile-search-overlay" onClick={() => setIsMobileSearchOpen(false)} />
        )
      }
    </div >
  );
}

export default MapView;
