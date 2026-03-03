import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import './CreatePost.css';
import Select from './ui/Select';
import Button from './ui/Button';

function CreatePost({ onPostCreated, onCancel, onPhotoUpload, initialData }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    prefecture_id: initialData?.prefecture_id || '',
    city_id: initialData?.city_id || '',
    custom_location: initialData?.custom_location || '',
    visibility: initialData?.visibility || 'public'
  });
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

  // 初期データがある場合、その都道府県の市町村を取得
  React.useEffect(() => {
    if (initialData?.prefecture_id) {
      fetchCities(initialData.prefecture_id);
    }
  }, [initialData]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // バリデーション（簡易）
    if (!formData.title) {
      setErrors({ title: ['タイトルは必須です'] });
      return;
    }
    if (!formData.prefecture_id) {
      setErrors({ prefecture_id: ['都道府県は必須です'] });
      return;
    }

    // 投稿データ（ドラフト）を親コンポーネントに渡して画面遷移
    onPhotoUpload(formData);
  };

  return (
    <div className="create-post-container">
      <div className="create-post-card">
        <div className="page-title">新規投稿</div>

        {errors.general && (
          <div className="error-message">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-post-form">
          <TextField
            id="title"
            name="title"
            label="title"
            value={formData.title}
            onChange={handleChange}
            error={!!(errors.title && errors.title[0])}
            helperText={errors.title ? errors.title[0] : null}
            required
            fullWidth
            variant="outlined"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white'
              },
              '& .MuiOutlinedInput-input': {
                padding: '26px 14px',
              },
              '& .MuiInputLabel-shrink': {
                backgroundColor: 'white',
                padding: '0 4px'
              }
            }}
          />

          <TextField
            id="description"
            name="description"
            label="description"
            value={formData.description}
            onChange={handleChange}
            error={!!(errors.description && errors.description[0])}
            helperText={errors.description ? errors.description[0] : null}
            multiline
            rows={6}
            fullWidth
            variant="outlined"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white'
              }
            }}
          />

          <div className="form-row">
            <div className="form-group">
              <Select
                id="prefecture_id"
                name="prefecture_id"
                label="都道府県"
                value={formData.prefecture_id}
                onChange={handleChange}
                error={errors.prefecture_id ? errors.prefecture_id[0] : null}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white'
                  },
                  '& .MuiInputLabel-shrink': {
                    backgroundColor: 'white',
                    padding: '0 4px'
                  }
                }}
              >
                <option value="" disabled hidden></option>
                {prefectures.map(prefecture => (
                  <option key={prefecture.id} value={prefecture.id}>
                    {prefecture.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="form-group">
              <Select
                id="city_id"
                name="city_id"
                label="市区町村"
                value={formData.city_id}
                onChange={handleChange}
                error={errors.city_id ? errors.city_id[0] : null}
                disabled={!formData.prefecture_id || loadingLocations}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white'
                  },
                  '& .MuiInputLabel-shrink': {
                    backgroundColor: 'white',
                    padding: '0 4px'
                  }
                }}
              >
                <option value="" disabled hidden></option>
                {loadingLocations ? (
                  <option disabled>読み込み中...</option>
                ) : (
                  cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))
                )}
              </Select>
            </div>
          </div>

          <Select
            id="visibility"
            name="visibility"
            label="公開範囲"
            value={formData.visibility}
            onChange={handleChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white'
              },
              '& .MuiInputLabel-shrink': {
                backgroundColor: 'white',
                padding: '0 4px'
              }
            }}
          >
            <option value="public">全員に公開</option>
            <option value="followers">フォロワーのみ公開</option>
            <option value="private">自分のみ公開</option>
          </Select>

          <div className="form-actions">
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
            >
              {loading ? '処理中...' : '次へ（画像選択）'}
            </Button>
          </div>
        </form>
      </div>


    </div>
  );
}

export default CreatePost; 