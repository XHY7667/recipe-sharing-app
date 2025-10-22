// src/utils/SubmissionManager.js
export default class SubmissionManager {
    constructor() {
      this.storageKey = 'recipeShareSubmissions';
      this.list = this._load();
    }
  
    _load() {
      try {
        const raw = JSON.parse(localStorage.getItem(this.storageKey));
        return Array.isArray(raw) ? raw : [];
      } catch {
        return [];
      }
    }
  
    _save() {
      localStorage.setItem(this.storageKey, JSON.stringify(this.list));
    }
  
    /** Return a copy of all submissions */
    getRecipes() {
      return [...this.list];
    }
  
    /** Find a single submission by its id */
    findById(id) {
      return this.list.find(r => r.id === id) || null;
    }
  
    /**
     * Add a new recipe or update existing one.
     * If recipe.id exists, update; else create new.
     */
    upsertRecipe(recipe) {
      if (recipe.id) {
        // update path
        const idx = this.list.findIndex(r => r.id === recipe.id);
        if (idx > -1) {
          this.list[idx] = { ...this.list[idx], ...recipe, updatedAt: Date.now() };
        } else {
          // fallback to add
          this.list.push({ ...recipe, createdAt: Date.now(), updatedAt: Date.now() });
        }
      } else {
        // new recipe path
        const id = `local-${Date.now()}`;
        this.list.push({ ...recipe, id, createdAt: Date.now(), updatedAt: Date.now() });
      }
      this._save();
    }
  
    /** Remove a submission */
    deleteRecipe(id) {
      this.list = this.list.filter(r => r.id !== id);
      this._save();
    }
  }
  