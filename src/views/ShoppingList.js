// src/views/ShoppingList.js
import React, { useState, useEffect } from 'react';
import ShoppingListManager from '../utils/ShoppingListManager';
import './ShoppingList.css';

export default function ShoppingList() {
  const mgr = new ShoppingListManager();
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(mgr.getList());
  }, []);

  const togglePurchased = name => {
    mgr.togglePurchased(name);
    setItems(mgr.getList());
  };

  const removeItem = name => {
    mgr.removeItem(name);
    setItems(mgr.getList());
  };

  const clearPurchased = () => {
    mgr.clearPurchased();
    setItems(mgr.getList());
  };

  return (
    <div id="shopping-list">
      <h1>Kitchen Prep List</h1>

      {items.length === 0 ? (
        <p className="empty">
          Your shopping list is empty.<br />
          Go add ingredients from the Pantry Picker.
        </p>
      ) : (
        <>
          <div className="actions">
            <button onClick={clearPurchased}>Clear Purchased</button>
            <button onClick={() => window.print()}>Print List</button>
          </div>

          <ul className="list">
            {items.map(({ name, qty, purchased }) => (
              <li key={name} className={purchased ? 'bought' : ''}>
                <label>
                  <input
                    type="checkbox"
                    checked={purchased}
                    onChange={() => togglePurchased(name)}
                  />
                  <span className="item-name">
                    {name} — {qty}
                  </span>
                </label>
                <button
                  className="remove-btn"
                  onClick={() => removeItem(name)}
                  aria-label={`Remove ${name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
