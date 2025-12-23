import { useState, useEffect } from 'react';
import './UserSearch.css';

// デバウンス用カスタムフック
function useDebounce(value, delay) {
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
}

function UserSearch({ onNavigateToProfile, onNavigateToUserProfile, onClose }) {
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 300);

  // 初回読み込み時に全ユーザーを取得
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // デバウンスされたキーワードが変更されたらリアルタイム検索
  useEffect(() => {
    performSearch(debouncedKeyword);
  }, [debouncedKeyword, allUsers]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/users/search', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAllUsers(data.users);
          setUsers(data.users);
        }
      }
    } catch (error) {
      console.error('ユーザー取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = (searchKeyword) => {
    if (!searchKeyword || searchKeyword.trim() === '') {
      // キーワードが空の場合はユーザーを表示しない
      setUsers([]);
      return;
    }

    // クライアント側でフィルタリング（カーソルが外れる問題を回避）
    const filtered = allUsers.filter(user => {
      const keyword = searchKeyword.toLowerCase();
      return (
        user.name.toLowerCase().includes(keyword) ||
        (user.username && user.username.toLowerCase().includes(keyword))
      );
    });

    setUsers(filtered);
  };

  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
  };

  const handleFollowToggle = async (userId, isFollowing) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('フォローするにはログインが必要です');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // 全ユーザーリストと表示中のユーザーリストを更新
        setAllUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId
              ? { ...user, is_following: data.is_following }
              : user
          )
        );
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId
              ? { ...user, is_following: data.is_following }
              : user
          )
        );
      }
    } catch (error) {
      console.error('フォロー切り替えエラー:', error);
    }
  };

  const getSearchTitle = () => {
    if (keyword && keyword.trim() !== '') {
      return `"${keyword}"の検索結果`;
    }
    return 'ユーザー検索';
  };

  if (loading && users.length === 0) {
    return (
      <div className="user-search-loading">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="user-search-container">
      <div className="user-search-header">
        <div className="header-left">
          <h2>ユーザー検索</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="close-search-btn" title="閉じる">
            ✕
          </button>
        )}
      </div>

      <div className="user-search-filters">
        <div className="filter-group-single">
          <label>キーワード検索</label>
          <input
            type="text"
            value={keyword}
            onChange={handleKeywordChange}
            placeholder="名前またはユーザー名で検索"
            className="search-input"
            autoFocus
          />
        </div>
      </div>

      <div className="user-search-results">
        <h3>{getSearchTitle()}</h3>
        {keyword && keyword.trim() !== '' && (
          <p className="user-count">{users.length}人のユーザー</p>
        )}

        {users.length === 0 && keyword && keyword.trim() !== '' ? (
          <div className="no-users-message">
            <p>該当するユーザーが見つかりませんでした。</p>
          </div>
        ) : users.length > 0 ? (
          <div className="user-list">
            {users.map(user => (
              <div key={user.id} className="us-user-card">
                <div
                  className="us-user-info"
                  onClick={() => onNavigateToUserProfile && onNavigateToUserProfile(user.id)}
                >
                  <img
                    src={user.avatar_url || 'http://localhost:8000/images/default-avatar.svg'}
                    alt={user.name}
                    className="us-user-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'http://localhost:8000/images/default-avatar.svg';
                    }}
                  />
                  <div className="us-user-details">
                    <h4 className="us-user-name-text">{user.name}</h4>
                    {user.username && (
                      <p className="us-user-username-text">@{user.username}</p>
                    )}
                  </div>
                </div>
                <button
                  className={`us-follow-button ${user.is_following ? 'following' : ''}`}
                  onClick={() => handleFollowToggle(user.id, user.is_following)}
                >
                  {user.is_following ? 'フォロー中' : 'フォロー'}
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default UserSearch;

