// src/utils/UserManager.js
export default class UserManager {
  constructor() {
    this.storageKey = 'recipeShareFavorites';
    this.favorites  = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    } catch {
      return [];
    }
  }

  saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
  }

  getFavorites() {
    return [...this.favorites];
  }

  isFavorite(id) {
    return this.favorites.includes(id);
  }

  addFavorite(id) {
    if (!this.isFavorite(id)) {
      this.favorites.push(id);
      this.saveToStorage();
    }
  }

  removeFavorite(id) {
    this.favorites = this.favorites.filter(f => f !== id);
    this.saveToStorage();
  }

  toggleFavorite(id) {
    this.isFavorite(id) ? this.removeFavorite(id) : this.addFavorite(id);
  }
}
