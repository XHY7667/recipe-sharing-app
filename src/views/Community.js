import React, { useState, useEffect, useMemo, useRef } from 'react';
import CommunityManager from '../utils/CommunityManager';
import './Community.css';

export default function Community() {
  const mgr = useMemo(() => new CommunityManager(), []);
  const [posts, setPosts] = useState([]);

  // New post form state
  const [author, setAuthor]   = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Load posts on mount or update
  useEffect(() => {
    setPosts(mgr.getPosts());
  }, [mgr]);

  // Handle image upload preview
  const fileRef = useRef();
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Submit new post
  const handlePost = e => {
    e.preventDefault();
    if (!author.trim() || (!content.trim() && !imagePreview)) return;
    // convert image to base64 if present
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        mgr.addPost({
          author: author.trim(),
          content: content.trim(),
          image: reader.result
        });
        refresh();
      };
      reader.readAsDataURL(imageFile);
    } else {
      mgr.addPost({ author: author.trim(), content: content.trim() });
      refresh();
    }
  };

  // Refresh feed and clear form
  const refresh = () => {
    setPosts(mgr.getPosts());
    setAuthor('');
    setContent('');
    setImageFile(null);
    setImagePreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  // Add comment to a post
  const addComment = (postId, comment) => {
    mgr.addComment(postId, comment);
    setPosts(mgr.getPosts());
  };

  return (
    <div id="community-view">
      <h1>Spoonful Society</h1>

      {/* New Post Form */}
      <form className="new-post-form" onSubmit={handlePost}>
        <input
          className="np-author"
          type="text"
          placeholder="Your name"
          value={author}
          onChange={e => setAuthor(e.target.value)}
        />
        <textarea
          className="np-content"
          placeholder="What's on your mind?"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          onChange={handleImageChange}
        />
        {imagePreview && (
          <img src={imagePreview} className="np-preview" alt="preview" />
        )}
        <button className="np-submit" type="submit">Post</button>
      </form>

      {/* Feed */}
      <div className="feed">
        {posts.map(post => (
          <PostCard key={post.id} post={post} onComment={addComment} />
        ))}
      </div>
    </div>
  );
}

function PostCard({ post, onComment }) {
  const [commentText, setCommentText] = useState('');

  const submitComment = e => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post.id, { author: 'You', content: commentText.trim() });
    setCommentText('');
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="avatar">{post.author.charAt(0)}</div>
        <div className="post-meta">
          <span className="author">{post.author}</span>
          <span className="time">{new Date(post.createdAt).toLocaleString()}</span>
        </div>
      </div>

      {post.image && (
        <img src={post.image} alt="" className="post-image" />
      )}

      {post.content && (
        <div className="post-content">{post.content}</div>
      )}

      <div className="action-bar">
        <i className="fa fa-heart-o"></i>
        <i className="fa fa-comment-o"></i>
        <i className="fa fa-paper-plane-o"></i>
      </div>

      <div className="comments">
        {post.comments.map(c => (
          <div key={c.id} className="comment">
            <span className="c-author">{c.author}</span>{' '}
            <span className="c-text">{c.content}</span>
            <div className="c-time">{new Date(c.createdAt).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>

      <form className="comment-form" onSubmit={submitComment}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
        />
        <button type="submit">Post</button>
      </form>
    </div>
  );
}
