import React, { useState } from 'react';
import './CreatePost.css';

function CreatePost({ onPostCreated, onCancel, onPhotoUpload }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prefecture_id: '',
    city_id: '',
    custom_location: '',
    visibility: 'public'
  });
  const [createdPostId, setCreatedPostId] = useState(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [prefectures, setPrefectures] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 都道府県が変更された場合、市町村をリセット
    if (name === 'prefecture_id') {
      setFormData(prev => ({
        ...prev,
        city_id: ''
      }));
      setCities([]);

      // 都道府県が選択された場合、市町村を取得
      if (value) {
        fetchCities(value);
      }
    }
  };

  // 都道府県一覧を取得
  const fetchPrefectures = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/prefectures');
      const data = await response.json();

      if (data.success) {
        setPrefectures(data.prefectures);
      }
    } catch (error) {
      console.error('都道府県の取得に失敗しました:', error);
    }
  };

  // 市町村一覧を取得
  const fetchCities = async (prefectureId) => {
    setLoadingLocations(true);
    try {
      const response = await fetch(`http://localhost:8000/api/cities/${prefectureId}`);
      const data = await response.json();

      if (data.success) {
        setCities(data.cities);
      }
    } catch (error) {
      console.error('市町村の取得に失敗しました:', error);
    } finally {
      setLoadingLocations(false);
    }
  };



  // コンポーネントマウント時に都道府県を取得
  React.useEffect(() => {
    fetchPrefectures();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('token');

      // 1. 投稿を作成
      const postResponse = await fetch('http://localhost:8000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const postData = await postResponse.json();

      if (!postResponse.ok) {
        if (postData.errors) {
          setErrors(postData.errors);
        } else {
          setErrors({ general: postData.message || '投稿の作成に失敗しました' });
        }
        return;
      }

      const postId = postData.post.id;

      // 2. 仮投稿完了 - 写真の有無に関わらず写真追加画面を表示
      setCreatedPostId(postId);
      onPhotoUpload(postId);

    } catch (error) {
      setErrors({ general: 'ネットワークエラーが発生しました' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-container">
      <div className="create-post-card">
        <h2>新しい投稿を作成</h2>

        {errors.general && (
          <div className="error-message">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label htmlFor="title">投稿タイトル *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              placeholder="旅行のタイトルを入力"
              required
            />
            {errors.title && <span className="error-text">{errors.title[0]}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">投稿内容 *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              placeholder="旅行の詳細や感想を入力"
              rows="6"
              required
            />
            {errors.description && <span className="error-text">{errors.description[0]}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="prefecture_id">都道府県 *</label>
            <select
              id="prefecture_id"
              name="prefecture_id"
              value={formData.prefecture_id}
              onChange={handleChange}
              className={errors.prefecture_id ? 'error' : ''}
              required
            >
              <option value="">都道府県を選択</option>
              {prefectures.map(prefecture => (
                <option key={prefecture.id} value={prefecture.id}>
                  {prefecture.name}
                </option>
              ))}
            </select>
            {errors.prefecture_id && <span className="error-text">{errors.prefecture_id[0]}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="city_id">市町村</label>
            <select
              id="city_id"
              name="city_id"
              value={formData.city_id}
              onChange={handleChange}
              className={errors.city_id ? 'error' : ''}
              disabled={!formData.prefecture_id || loadingLocations}
            >
              <option value="">
                {loadingLocations ? '読み込み中...' : '市町村を選択'}
              </option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            {errors.city_id && <span className="error-text">{errors.city_id[0]}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="custom_location">カスタム場所</label>
            <input
              type="text"
              id="custom_location"
              name="custom_location"
              value={formData.custom_location}
              onChange={handleChange}
              className={errors.custom_location ? 'error' : ''}
              placeholder="具体的な場所やスポット名"
            />
            {errors.custom_location && <span className="error-text">{errors.custom_location[0]}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="visibility">公開範囲</label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="form-control"
            >
              <option value="public">全員に公開</option>
              <option value="followers">フォロワーのみ公開</option>
              <option value="private">自分のみ公開</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? '投稿中...' : '画像選択'}
            </button>
          </div>
        </form>
      </div>


    </div>
  );
}

export default CreatePost; 