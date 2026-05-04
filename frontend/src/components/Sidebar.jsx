import React, { useState } from 'react';
import './Sidebar.css';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // スクロール可能な要素（コンテナ）にも対応
  document.querySelectorAll('.sidebar-content, .profile-container, .post-list-container, .user-search-container')
    .forEach(el => el.scrollTo({ top: 0, behavior: 'smooth' }));
};

function Sidebar({
  onNavigateToHome,
  onNavigateToCreatePost,
  onNavigateToProfile,
  onNavigateToUserSearch,
  currentPage, // 'home' | 'createPost' | 'profile' | 'userSearch' | null
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => setMobileMenuOpen(prev => !prev);

  const handleAction = (action, pageKey) => {
    if (currentPage === pageKey) {
      // 現在のページなら最上部へスクロール
      scrollToTop();
    } else {
      action();
    }
    setMobileMenuOpen(false);
  };

  const menuItems = [
    {
      icon: <HomeIcon />,
      activeIcon: <VerticalAlignTopIcon />,
      label: 'マップ画面',
      activeLabel: '最上部へ',
      pageKey: 'home',
      action: onNavigateToHome,
    },
    {
      icon: <AddIcon />,
      activeIcon: <VerticalAlignTopIcon />,
      label: '新規投稿',
      activeLabel: '最上部へ',
      pageKey: 'createPost',
      action: onNavigateToCreatePost,
    },
    {
      icon: <PersonIcon />,
      activeIcon: <VerticalAlignTopIcon />,
      label: 'プロフィール',
      activeLabel: '最上部へ',
      pageKey: 'profile',
      action: onNavigateToProfile,
    },
    {
      icon: <SearchIcon />,
      activeIcon: <VerticalAlignTopIcon />,
      label: 'ユーザー検索',
      activeLabel: '最上部へ',
      pageKey: 'userSearch',
      action: onNavigateToUserSearch,
    },
  ];

  return (
    <>
      {/* ===== デスクトップ用サイドバー（769px以上） ===== */}
      <div className="global-sidebar desktop-only">
        {menuItems.map((item, index) => {
          const isActive = currentPage === item.pageKey;
          if (item.pageKey === 'createPost') {
            return (
              <div
                key={index}
                className="sidebar-fab-wrapper"
                onClick={() => handleAction(item.action, item.pageKey)}
                style={{ cursor: 'pointer' }}
              >
                <Fab color="primary" aria-label={isActive ? item.activeLabel : item.label}>
                  {isActive ? item.activeIcon : item.icon}
                </Fab>
                <span className="sidebar-text">{isActive ? item.activeLabel : item.label}</span>
              </div>
            );
          }
          return (
            <button
              key={index}
              onClick={() => handleAction(item.action, item.pageKey)}
              className={`sidebar-action-button ${isActive ? 'is-active' : ''}`}
              title={isActive ? item.activeLabel : item.label}
            >
              {isActive ? item.activeIcon : item.icon}
              <span className="sidebar-text">{isActive ? item.activeLabel : item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===== モバイル用FABメニュー（768px以下） ===== */}
      <div className="mobile-fab-container">
        {/* オーバーレイ（メニュー展開時の背景） */}
        {mobileMenuOpen && (
          <div className="mobile-fab-overlay" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* 展開メニューアイテム */}
        <div className={`mobile-fab-menu ${mobileMenuOpen ? 'open' : ''}`}>
          {menuItems.map((item, index) => {
            const isActive = currentPage === item.pageKey;
            return (
              <button
                key={index}
                className={`mobile-fab-menu-item ${isActive ? 'is-active' : ''}`}
                style={{ transitionDelay: mobileMenuOpen ? `${index * 50}ms` : `${(menuItems.length - index) * 30}ms` }}
                onClick={() => handleAction(item.action, item.pageKey)}
              >
                <span className="mobile-fab-menu-label">
                  {isActive ? item.activeLabel : item.label}
                </span>
                <span className={`mobile-fab-menu-icon ${isActive ? 'active' : ''}`}>
                  {isActive ? item.activeIcon : item.icon}
                </span>
              </button>
            );
          })}
        </div>

        {/* メインFABボタン */}
        <button
          className={`mobile-fab-trigger ${mobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="メニューを開く"
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </>
  );
}

export default Sidebar;
