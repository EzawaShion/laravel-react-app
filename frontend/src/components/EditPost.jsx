import React, { useState, useEffect } from 'react';
import './EditPost.css';

function EditPost({ post, onBack, onUpdateSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city_id: '',
    custom_location: ''
  });
  const [cities, setCities] = useState([]);
  const [prefectures, setPrefectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 初期データの設定
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        description: post.description || '',
        city_id: post.city_id || '',
        custom_location: post.custom_location || ''
      });
    }
    fetchPrefectures();
  }, [post]);

  // 都道府県データを取得
  const fetchPrefectures = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/prefectures');
      const data = await response.json();
      if (response.ok) {
        setPrefectures(data.prefectures);
      }
    } catch (error) {
      console.error('都道府県データの取得に失敗:', error);
    }
  };

  // 市区町村データを取得
  const fetchCities = async (prefectureId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/cities/${prefectureId}`);
      const data = await response.json();
      if (response.ok) {
        setCities(data.cities);
      }
    } catch (error) {
      console.error('市区町村データの取得に失敗:', error);
    }
  };

  // 都道府県選択時の処理
  const handlePrefectureChange = (prefectureId) => {
    setFormData(prev => ({ ...prev, city_id: '' }));
    setCities([]);
    if (prefectureId) {
      fetchCities(prefectureId);
    }
  };

  // フォーム送信処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('投稿が更新されました');
        onUpdateSuccess(data.post);
      } else {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          setError(errorMessages);
        } else {
          setError(data.message || '投稿の更新に失敗しました');
        }
      }
    } catch (error) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // フォーム入力の変更処理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="edit-post-container">
      <div className="edit-post-header">
        <h2>投稿を編集</h2>
        <button onClick={onBack} className="back-button">
          ← 戻る
        </button>
      </div>

      <form onSubmit={handleSubmit} className="edit-post-form">
        <div className="form-group">
          <label htmlFor="title">タイトル *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="form-input"
            placeholder="投稿のタイトルを入力してください"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">投稿内容 *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            className="form-textarea"
            placeholder="投稿の内容を入力してください"
            rows="6"
          />
        </div>

        <div className="form-group">
          <label htmlFor="prefecture">都道府県</label>
          <select
            id="prefecture"
            onChange={(e) => handlePrefectureChange(e.target.value)}
            className="form-select"
          >
            <option value="">都道府県を選択</option>
            {prefectures.map(prefecture => (
              <option key={prefecture.id} value={prefecture.id}>
                {prefecture.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="city_id">市区町村</label>
          <select
            id="city_id"
            name="city_id"
            value={formData.city_id}
            onChange={handleInputChange}
            className="form-select"
            disabled={cities.length === 0}
          >
            <option value="">市区町村を選択</option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="custom_location">カスタム場所</label>
          <input
            type="text"
            id="custom_location"
            name="custom_location"
            value={formData.custom_location}
            onChange={handleInputChange}
            className="form-input"
            placeholder="具体的な場所を入力してください"
          />
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onBack}
            className="cancel-button"
            disabled={loading}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="update-button"
            disabled={loading}
          >
            {loading ? '更新中...' : '更新'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditPost;
