import React from 'react';
import './Sidebar.css';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';

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
        <HomeIcon className="sidebar-icon" />
        <span className="sidebar-text">マップ画面</span>
      </button>
      <div className="sidebar-fab-wrapper">
        <Fab
          color="primary"
          aria-label="add"
          onClick={onNavigateToCreatePost}
        >
          <AddIcon className="sidebar-icon" />
        </Fab>
        <span className="sidebar-text">新規投稿</span>
      </div>
      <button
        onClick={onNavigateToProfile}
        className="sidebar-action-button"
        title="プロフィール"
      >
        <PersonIcon className="sidebar-icon" />
        <span className="sidebar-text">プロフィール</span>
      </button>
      <button
        onClick={onNavigateToUserSearch}
        className="sidebar-action-button"
        title="ユーザー検索"
      >
        <SearchIcon className="sidebar-icon" />
        <span className="sidebar-text">ユーザー検索</span>
      </button>
    </div>
  );
}

export default Sidebar;
