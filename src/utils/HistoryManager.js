// src/utils/HistoryManager.js
export default class HistoryManager {
    constructor() {
      this.storageKey = 'recipeShareSearchHistory';
      this.limit      = 5;
      this.history    = this.loadFromStorage();
    }
  
    loadFromStorage() {
      try {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
      } catch {
        return [];
      }
    }
  
    saveToStorage() {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    }
  
    getHistory() {
      return [...this.history];
    }
  
    add(query) {
      if (!query) return;
      const idx = this.history.indexOf(query);
      if (idx > -1) this.history.splice(idx, 1);
      this.history.unshift(query);
      if (this.history.length > this.limit) this.history.pop();
      this.saveToStorage();
    }
  
    clear() {
      this.history = [];
      this.saveToStorage();
    }
  }
  