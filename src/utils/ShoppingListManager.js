// src/utils/ShoppingListManager.js
export default class ShoppingListManager {
  constructor() {
    this.storageKey = 'recipeShareShoppingList';
    // Each entry: { name: string, qty: string, purchased: boolean }
    this.list = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const data = JSON.parse(localStorage.getItem(this.storageKey));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.list));
  }

  /** Get a shallow copy of the list */
  getList() {
    return [...this.list];
  }

  /** Add or update an item with its quantity */
  addItem(name, qty) {
    const idx = this.list.findIndex(item => item.name === name);
    if (idx > -1) {
      // update quantity if item exists
      this.list[idx].qty = qty;
    } else {
      this.list.push({ name, qty, purchased: false });
    }
    this.saveToStorage();
  }

  /** Remove an item by name */
  removeItem(name) {
    this.list = this.list.filter(item => item.name !== name);
    this.saveToStorage();
  }

  /** Toggle purchased status for an item */
  togglePurchased(name) {
    this.list = this.list.map(item =>
      item.name === name
        ? { ...item, purchased: !item.purchased }
        : item
    );
    this.saveToStorage();
  }

  /** Remove all items marked as purchased */
  clearPurchased() {
    this.list = this.list.filter(item => !item.purchased);
    this.saveToStorage();
  }

  /** Remove everything */
  clearList() {
    this.list = [];
    this.saveToStorage();
  }

  /**
   * Move an item from srcIdx to dstIdx
   * (optional: for drag-and-drop or up/down)
   */
  moveItem(srcIdx, dstIdx) {
    if (
      srcIdx < 0 || dstIdx < 0 ||
      srcIdx >= this.list.length || dstIdx >= this.list.length
    ) return;
    const [moved] = this.list.splice(srcIdx, 1);
    this.list.splice(dstIdx, 0, moved);
    this.saveToStorage();
  }
}
