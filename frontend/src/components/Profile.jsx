import React, { useState, useEffect } from 'react';
import FollowList from './FollowList';
import './Profile.css';

function Profile({ onBack, onProfileUpdated, onUserClick, onPostClick }) {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    bio: '',
    website: '',
    profile_image_preview: null,
    privacy_settings: {
      show_followers: true,
      show_followings: true
    }
  });
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [showFollowList, setShowFollowList] = useState(false);
  const [followListType, setFollowListType] = useState('followers');
  const [followStats, setFollowStats] = useState({
    followers_count: 0,
    followings_count: 0
  });
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchFollowStats();
  }, []);

  // userが読み込まれた後に投稿を取得
  useEffect(() => {
    if (user && user.id) {
      fetchMyPosts();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setEditForm({
          name: data.user.name || '',
          username: data.user.username || '',
          bio: data.user.bio || '',
          website: data.user.website || '',
          profile_image_preview: null,
          privacy_settings: data.user.privacy_settings || {
            show_followers: true,
            show_followings: true
          }
        });
      } else {
        setError('プロフィールの取得に失敗しました');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('ネットワークエラーが発生しました');
    }
  };

  const fetchFollowStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFollowStats({
          followers_count: data.user.followers_count || 0,
          followings_count: data.user.followings_count || 0
        });
      }
    } catch (error) {
      console.error('Error fetching follow stats:', error);
    }
  };

  const fetchMyPosts = async () => {
    try {
      setPostsLoading(true);
      
      // プロフィール情報から現在のユーザーIDを取得
      if (!user || !user.id) {
        console.log('User not loaded yet, skipping posts fetch');
        setPostsLoading(false);
        return;
      }
      
      // 全ての投稿を取得して、現在のユーザーの投稿をフィルタリング
      const response = await fetch('http://localhost:8000/api/posts', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('Posts response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('=== All Posts Response ===');
        console.log('Total posts:', data.posts?.length || 0);
        
        // 現在のユーザーの投稿のみをフィルタリング
        const myPosts = data.posts?.filter(post => post.user_id === user.id) || [];
        console.log('My posts:', myPosts.length);
        
        setMyPosts(myPosts);
      } else {
        console.error('投稿の取得に失敗しました');
        setMyPosts([]);
      }
    } catch (error) {
      console.error('投稿の取得エラー:', error);
      setMyPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const showFollowListModal = (type) => {
    setFollowListType(type);
    setShowFollowList(true);
  };

  const closeFollowListModal = () => {
    setShowFollowList(false);
  };

  const handleUserClick = (userId) => {
    setShowFollowList(false);
    if (onUserClick) {
      onUserClick(userId);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ファイルサイズのチェック（20MB以下）
      if (file.size > 20 * 1024 * 1024) {
        setError('ファイルサイズは20MB以下にしてください');
        return;
      }

      // ファイル形式のチェック
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('JPEG、PNG、JPG、GIF形式のファイルのみアップロードできます');
        return;
      }

      setSelectedProfileImage(file);
      setError(''); // エラーをクリア

      const reader = new FileReader();
      reader.onload = (e) => {
        setEditForm(prev => ({
          ...prev,
          profile_image_preview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const testApiConnection = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess('API接続は正常です');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(`API接続エラー: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setError(`API接続テスト失敗: ${error.message}`);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setError('');
      setSuccess('');

      console.log('=== Profile Update Debug ===');
      console.log('editForm state:', editForm);
      console.log('editForm.name:', editForm.name, 'type:', typeof editForm.name);
      console.log('editForm.username:', editForm.username, 'type:', typeof editForm.username);

      // 必須フィールドの検証
      if (!editForm.name || editForm.name.trim() === '') {
        setError('名前は必須です');
        return;
      }

      if (!editForm.username || editForm.username.trim() === '') {
        setError('ユーザー名は必須です');
        return;
      }

      const token = localStorage.getItem('token');
      const formData = new FormData();

      // テキストフィールド - 空文字列も含めて全て送信
      Object.keys(editForm).forEach(key => {
        if (key !== 'profile_image_preview') {
          const value = editForm[key];
          if (key === 'privacy_settings') {
            // privacy_settingsはJSON文字列として送信
            formData.append(key, JSON.stringify(value));
          } else {
            // 空文字列も含めて全て送信（バックエンドで適切に処理）
            formData.append(key, value);
          }
        }
      });

      // プロフィール画像
      if (selectedProfileImage) {
        formData.append('profile_image', selectedProfileImage);
      }

      console.log('Sending profile update request...');
      console.log('Form data contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      console.log('editForm state:', editForm);

      const response = await fetch('http://localhost:8000/api/profile', {
        method: 'POST', // PUTからPOSTに変更
        headers: {
          'Authorization': `Bearer ${token}`,
          // multipart/form-dataの場合はContent-Typeを設定しない
          // ブラウザが自動的に適切なContent-Typeとboundaryを設定する
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile update response:', data);

        setUser(data.user);
        setIsEditing(false);
        setError('');
        setSuccess('プロフィールが更新されました');
        setEditForm(prev => ({
          ...prev,
          profile_image_preview: null
        }));
        setSelectedProfileImage(null);

        if (onProfileUpdated) {
          onProfileUpdated(data.user);
        }

        // 3秒後に成功メッセージを消す
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        console.error('Profile update error:', errorData);
        console.error('Validation errors:', errorData.errors);
        setError(errorData.message || 'プロフィールの更新に失敗しました');

        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat().join(', ');
          setError(errorMessages);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);

      // エラーの詳細を表示
      let errorMessage = 'ネットワークエラーが発生しました';

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'サーバーに接続できません。サーバーが起動しているか確認してください。';
      } else if (error.message) {
        errorMessage = `エラー: ${error.message}`;
      }

      setError(errorMessage);
    }
  };

  if (!user) {
    return <div className="profile-loading">読み込み中...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-button" onClick={onBack}>
          ← 戻る
        </button>
        <h1>プロフィール</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {!isEditing ? (
        <div className="profile-content">
          <div className="profile-image-section">
            <img
              src={user.profile_image_url}
              alt="プロフィール画像"
              className="profile-image"
            />
          </div>

          <div className="profile-info">
            <h2>{user.name || user.username}</h2>
            <p className="username">@{user.username}</p>

            {user.bio && user.bio !== 'null' && user.bio.trim() !== '' && <p className="bio">{user.bio}</p>}

            <div className="profile-details">
              {user.website && user.website !== 'null' && user.website.trim() !== '' && (
                <div className="detail-item">
                  <span className="label">ウェブサイト:</span>
                  <a href={user.website} target="_blank" rel="noopener noreferrer">
                    {user.website}
                  </a>
                </div>
              )}

              <div className="detail-item">
                <span className="label">投稿数:</span>
                <span>{user.posts_count || 0}</span>
              </div>

              <div className="follow-stats">
                <div className="follow-stat-item" onClick={() => showFollowListModal('followers')}>
                  <span className="follow-count">{followStats.followers_count}</span>
                  <span className="follow-label">フォロワー</span>
                </div>
                <div className="follow-stat-item" onClick={() => showFollowListModal('followings')}>
                  <span className="follow-count">{followStats.followings_count}</span>
                  <span className="follow-label">フォロー中</span>
                </div>
              </div>

              <div className="detail-item">
                <span className="label">登録日:</span>
                <span>{new Date(user.created_at).toLocaleDateString('ja-JP')}</span>
              </div>
            </div>

            <div className="profile-actions">
              <button
                className="edit-button"
                onClick={() => {
                  console.log('=== Entering Edit Mode ===');
                  console.log('Current user data:', user);
                  setIsEditing(true);
                  // フォームを確実に初期化
                  setEditForm({
                    name: user.name || '',
                    username: user.username || '',
                    bio: user.bio || '',
                    website: user.website || '',
                    profile_image_preview: null,
                    privacy_settings: user.privacy_settings || {
                      show_followers: true,
                      show_followings: true
                    }
                  });
                  console.log('Edit form initialized:', {
                    name: user.name || '',
                    username: user.username || '',
                    bio: user.bio || '',
                    website: user.website || '',
                    privacy_settings: user.privacy_settings || {
                      show_followers: true,
                      show_followings: true
                    }
                  });
                }}
              >
                編集
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="profile-edit-form">
          <div className="form-group">
            <label>名前 *</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label>ユーザー名 *</label>
            <input
              type="text"
              value={editForm.username}
              onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
              required
            />
          </div>


          <div className="form-group">
            <label>自己紹介</label>
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="自己紹介を入力してください"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>ウェブサイト</label>
            <input
              type="url"
              value={editForm.website}
              onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group">
            <label>プライバシー設定</label>
            <div className="privacy-settings">
              <div className="privacy-setting-item">
                <span className="privacy-label">フォロワーリストを公開する</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={editForm.privacy_settings.show_followers}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      privacy_settings: {
                        ...prev.privacy_settings,
                        show_followers: e.target.checked
                      }
                    }))}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="privacy-setting-item">
                <span className="privacy-label">フォロー中リストを公開する</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={editForm.privacy_settings.show_followings}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      privacy_settings: {
                        ...prev.privacy_settings,
                        show_followings: e.target.checked
                      }
                    }))}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>プロフィール画像</label>
            <div className="image-upload-section">
              <div className="current-image">
                <p>現在の画像:</p>
                <img
                  src={user.profile_image_url}
                  alt="現在のプロフィール画像"
                  className="current-profile-image"
                />
              </div>

              <div className="new-image-upload">
                <p>新しい画像を選択:</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                <div className="file-requirements">
                  <small>
                    • 対応形式: JPEG, PNG, JPG, GIF<br />
                    • 最大ファイルサイズ: 20MB
                  </small>
                </div>
                {editForm.profile_image_preview && (
                  <div className="image-preview-container">
                    <p>プレビュー:</p>
                    <img
                      src={editForm.profile_image_preview}
                      alt="プレビュー"
                      className="image-preview"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              className="save-button"
              onClick={handleUpdateProfile}
            >
              保存
            </button>
            <button
              className="test-connection-button"
              onClick={testApiConnection}
              type="button"
            >
              接続テスト
            </button>
            <button
              className="cancel-button"
              onClick={() => {
                setIsEditing(false);
                setEditForm({
                  name: user.name || '',
                  username: user.username || '',
                  bio: user.bio || '',
                  website: user.website || '',
                  profile_image_preview: null,
                  privacy_settings: user.privacy_settings || {
                    show_followers: true,
                    show_followings: true
                  }
                });
                setSelectedProfileImage(null);
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 自分の投稿一覧セクション */}
      <div className="profile-posts-section">
        <h3 className="posts-section-title">自分の投稿</h3>

        {postsLoading ? (
          <div className="posts-loading">
            <p>投稿を読み込み中...</p>
          </div>
        ) : myPosts.length === 0 ? (
          <div className="no-posts">
            <p>まだ投稿がありません</p>
          </div>
        ) : (
          <div className="posts-grid">
            {myPosts.map((post) => (
              <div key={post.id} className="post-card" onClick={() => onPostClick && onPostClick(post.id)}>
                <div className="post-header">
                  <h4 className="post-title">{post.title}</h4>
                  <span className="post-date">
                    {new Date(post.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>

                <div className="post-content">
                  {post.first_photo_url && (
                    <div className="post-image">
                      <img 
                        src={post.first_photo_url} 
                        alt={post.title}
                        className="post-thumbnail"
                      />
                    </div>
                  )}
                  
                  <p className="post-description">{post.description}</p>

                  {post.city && (
                    <div className="post-location">
                      📍 {post.city.prefecture?.name} {post.city.name}
                    </div>
                  )}

                  {post.custom_location && (
                    <div className="post-location">
                      📍 {post.custom_location}
                    </div>
                  )}
                </div>

                <div className="post-stats">
                  <span className="likes-count">❤️ {post.likes_count}</span>
                  <span className="photos-count">📷 {post.total_photos || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showFollowList && (
        <FollowList
          userId={user.id}
          type={followListType}
          onClose={closeFollowListModal}
          onUserClick={handleUserClick}
        />
      )}
    </div>
  );
}

export default Profile;
