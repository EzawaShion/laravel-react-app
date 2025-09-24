import React, { useState, useEffect } from 'react';
import './SearchPanel.css';

const SearchPanel = ({ onSearch, onClose, isVisible }) => {
  const [prefectures, setPrefectures] = useState([]);
  const [cities, setCities] = useState([]);
  const [searchParams, setSearchParams] = useState({
    prefecture_id: '',
    city_id: '',
    keyword: ''
  });
  const [loading, setLoading] = useState(false);

  // 都道府県一覧を取得
  useEffect(() => {
    fetchPrefectures();
  }, []);

  // 都道府県が変更されたら市町村一覧を取得（handleInputChangeで処理するため削除）

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

  const handleInputChange = (field, value) => {
    // 都道府県が変更された場合、市町村をリセットして同時に更新
    if (field === 'prefecture_id') {
      setSearchParams(prev => ({
        ...prev,
        [field]: value,
        city_id: '' // 市町村をリセット
      }));
      setCities([]);
      
      // 都道府県が選択された場合、市町村を取得
      if (value) {
        fetchCities(value);
      }
    } else {
      // その他のフィールドの場合は通常の更新
      setSearchParams(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      // 空の値を除外してクエリパラメータを作成
      const queryParams = new URLSearchParams();
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] && searchParams[key].trim() !== '') {
          queryParams.append(key, searchParams[key]);
        }
      });

      const url = `http://localhost:8000/api/posts/search?${queryParams.toString()}`;
      console.log('検索URL:', url);
      console.log('検索パラメータ:', searchParams);

      const response = await fetch(url);
      console.log('レスポンスステータス:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('検索結果:', data);
        onSearch(data.posts, getSearchTitle());
      } else {
        const errorText = await response.text();
        console.error('検索に失敗しました:', response.status, errorText);
      }
    } catch (error) {
      console.error('検索エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSearchTitle = () => {
    let title = '検索結果';
    const selectedPrefecture = prefectures.find(p => p.id == searchParams.prefecture_id);
    const selectedCity = cities.find(c => c.id == searchParams.city_id);
    
    if (selectedPrefecture) {
      title += ` - ${selectedPrefecture.name}`;
      if (selectedCity) {
        title += `${selectedCity.name}`;
      }
    }
    
    if (searchParams.keyword) {
      title += ` "${searchParams.keyword}"`;
    }
    
    return title;
  };

  const handleClear = () => {
    setSearchParams({
      prefecture_id: '',
      city_id: '',
      keyword: ''
    });
    setCities([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="search-panel-overlay">
      <div className="search-panel">
        <div className="search-header">
          <h3>投稿を検索</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="search-content">
          <div className="search-field">
            <label>都道府県</label>
            <select
              value={searchParams.prefecture_id || ''}
              onChange={(e) => handleInputChange('prefecture_id', e.target.value)}
            >
              <option value="">すべての都道府県</option>
              {prefectures.length > 0 ? prefectures.map(prefecture => (
                <option key={prefecture.id} value={prefecture.id}>
                  {prefecture.name}
                </option>
              )) : <option disabled>読み込み中...</option>}
            </select>
          </div>

          <div className="search-field">
            <label>市町村</label>
            <select
              value={searchParams.city_id || ''}
              onChange={(e) => handleInputChange('city_id', e.target.value)}
              disabled={!searchParams.prefecture_id}
            >
              <option value="">すべての市町村</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="search-field">
            <label>キーワード</label>
            <input
              type="text"
              placeholder="タイトルや内容で検索..."
              value={searchParams.keyword}
              onChange={(e) => handleInputChange('keyword', e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <div className="search-actions">
            <button 
              className="clear-button" 
              onClick={handleClear}
              disabled={loading}
            >
              クリア
            </button>
            <button 
              className="search-button" 
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? '検索中...' : '検索'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;
