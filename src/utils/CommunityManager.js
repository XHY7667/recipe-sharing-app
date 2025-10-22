// src/utils/CommunityManager.js

export default class CommunityManager {
    constructor() {
      this.storageKey = 'recipeShareCommunity';
      this.data = this._load();
    }
  
    _load() {
      try {
        return JSON.parse(localStorage.getItem(this.storageKey)) || { posts: [] };
      } catch {
        return { posts: [] };
      }
    }
  
    _save() {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }
  
    getPosts() {
      // most recent first
      return [...this.data.posts].sort((a, b) => b.createdAt - a.createdAt);
    }
  
    addPost({ author, content }) {
      const post = {
        id: `post-${Date.now()}`,
        author,
        content,
        createdAt: Date.now(),
        comments: []
      };
      this.data.posts.push(post);
      this._save();
      return post;
    }
  
    addComment(postId, { author, content }) {
      const post = this.data.posts.find(p => p.id === postId);
      if (!post) return null;
      const comment = {
        id: `cmt-${Date.now()}`,
        author,
        content,
        createdAt: Date.now()
      };
      post.comments.push(comment);
      this._save();
      return comment;
    }
  }
  