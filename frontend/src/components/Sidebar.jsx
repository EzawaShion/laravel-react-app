import React from 'react';
import './Sidebar.css';

function Sidebar({
  onNavigateToHome,
  onNavigateToCreatePost,
  onNavigateToProfile,
  onNavigateToUserSearch
}) {
  return (
    <div className="global-sidebar">
      <button
        onClick={onNavigateToHome}
        className="sidebar-action-button"
        title="マップ画面"
      >
        <span className="sidebar-icon">🗺️</span>
        <span className="sidebar-text">マップ画面</span>
      </button>
      <button
        onClick={onNavigateToCreatePost}
        className="sidebar-action-button"
        title="新規投稿"
      >
        <span className="sidebar-icon">✏️</span>
        <span className="sidebar-text">新規投稿</span>
      </button>
      <button
        onClick={onNavigateToProfile}
        className="sidebar-action-button"
        title="プロフィール"
      >
        <span className="sidebar-icon">👤</span>
        <span className="sidebar-text">プロフィール</span>
      </button>
      <button
        onClick={onNavigateToUserSearch}
        className="sidebar-action-button"
        title="ユーザー検索"
      >
        <span className="sidebar-icon">🔍</span>
        <span className="sidebar-text">ユーザー検索</span>
      </button>
    </div>
  );
}

export default Sidebar;
