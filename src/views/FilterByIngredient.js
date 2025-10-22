// src/views/FilterByIngredient.js
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RecipeManager       from '../utils/RecipeManager';
import ShoppingListManager from '../utils/ShoppingListManager';
import './FilterByIngredient.css';

export default function FilterByIngredient() {
  const recipeMgr   = useMemo(() => new RecipeManager(), []);
  const shoppingMgr = useMemo(() => new ShoppingListManager(), []);

  const [ingredient,    setIngredient]    = useState('');
  const [meals,         setMeals]         = useState([]);
  const [details,       setDetails]       = useState({});
  const [expandedId,    setExpandedId]    = useState(null);
  const [shoppingList,  setShoppingList]  = useState([]);

  // load existing list on mount
  useEffect(() => {
    setShoppingList(shoppingMgr.getList());
  }, []);

  const handleSearch = async () => {
    if (!ingredient.trim()) return;
    const results = await recipeMgr.filterByIngredient(ingredient.trim());
    setMeals(results);
    setExpandedId(null);
  };

  const toggleDetails = async id => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    if (!details[id]) {
      const full = await recipeMgr.getById(id);
      setDetails(prev => ({ ...prev, [id]: full }));
    }
    setExpandedId(id);
  };

  const handleCheckbox = (name, qty, checked) => {
    if (checked) {
      shoppingMgr.addItem(name, qty);
    } else {
      shoppingMgr.removeItem(name);
    }
    setShoppingList(shoppingMgr.getList());
  };

  return (
    <div id="filter-ingredient">
      <h1>Pantry Picker</h1>

      <div className="search-bar">
        <input
          type="text"
          value={ingredient}
          onChange={e => setIngredient(e.target.value)}
          placeholder="Enter an ingredient..."
        />
        <button onClick={handleSearch}>Find Recipes</button>
        <Link to="/shopping-list" className="to-list">
          🛒 Shopping List ({shoppingList.length})
        </Link>
      </div>

      <div className="results">
        {meals.map(meal => (
          <div key={meal.idMeal} className="meal-item">
            <div className="meal-header">
              <Link to={`/recipe/${meal.idMeal}`} className="meal-link">
                <img src={meal.strMealThumb} alt={meal.strMeal} />
                <h3>{meal.strMeal}</h3>
              </Link>
            </div>

            <div className="show-btn-wrapper">
              <button
                onClick={() => toggleDetails(meal.idMeal)}
                className="show-ingredients-btn"
              >
                {expandedId === meal.idMeal
                  ? 'Hide Ingredients'
                  : 'Show Ingredients'}
              </button>
            </div>

            {expandedId === meal.idMeal && details[meal.idMeal] && (
              <ul className="ingredient-list">
                {Array.from({ length: 20 }).map((_, i) => {
                  const ing = details[meal.idMeal][`strIngredient${i+1}`];
                  const mea = details[meal.idMeal][`strMeasure${i+1}`] || '';
                  if (!ing) return null;

                  const item = shoppingList.find(it => it.name === ing);
                  const checked = Boolean(item);

                  return (
                    <li key={i}>
                      <label>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e =>
                            handleCheckbox(ing, mea, e.target.checked)
                          }
                        />
                        <span className="ing-name">{ing}</span>
                        <span className="ing-meas">{mea}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
