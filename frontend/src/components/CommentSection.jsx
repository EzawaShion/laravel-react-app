import React, { useState, useEffect, useCallback } from 'react';
import './CommentSection.css';

const API_BASE_URL = 'http://localhost:8000';

const CommentSection = ({ postId, userId, token }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        headers: {
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data.data || data);
      }
    } catch (err) {
      console.error('Failed to fetch comments', err);
    }
  }, [postId, token]);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId, fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      } else {
        alert('コメントの投稿に失敗しました');
      }
    } catch (err) {
      console.error('Failed to post comment', err);
      alert('コメントの投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('コメントを削除しますか？')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  return (
    <div className="comment-section">
      <h3>コメント</h3>
      <div className="comment-list">
        {comments.length === 0 ? (
          <div className="no-comments">コメントはまだありません</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-avatar">
                <img
                  src={comment.user?.profile_image_url || '/images/default-avatar.svg'}
                  alt={comment.user?.name}
                />
              </div>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-username">{comment.user?.name || 'Unknown'}</span>
                  <span className="comment-date">{new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                <div className="comment-text">{comment.content}</div>
                {userId === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="comment-delete-btn"
                  >
                    削除
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="comment-input"
          placeholder="コメントを入力..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="comment-submit-btn" disabled={loading || !newComment.trim()}>
          送信
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
