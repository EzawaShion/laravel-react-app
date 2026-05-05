import { useEffect } from 'react';

/**
 * モーダルが開いているとき <body data-modal-open="true"> を付与するフック。
 * Sidebar の FAB が body[data-modal-open] セレクタで非表示になる。
 *
 * 使用例:
 *   useModalOpen(isEditing);
 *   useModalOpen(showFollowList);
 */
export function useModalOpen(isOpen) {
  useEffect(() => {
    if (isOpen) {
      document.body.setAttribute('data-modal-open', 'true');
    } else {
      // 他のモーダルが開いている可能性があるので、属性は全モーダルが閉じたときだけ削除
      // 少し遅延させて、複数モーダルの開閉が重なっても対応できるようにする
      const timer = setTimeout(() => {
        document.body.removeAttribute('data-modal-open');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
}
