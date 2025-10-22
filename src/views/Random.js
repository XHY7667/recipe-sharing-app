// src/views/Random.js
import React, { useState, useEffect } from 'react';
import RecipeManager from '../utils/RecipeManager';
import './Random.css';

export default function Random() {
  const mgr = new RecipeManager();

  const [recipe, setRecipe]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Load one recipe on mount
  useEffect(() => {
    loadRandom();
  }, []);

  // Fetch helper
  const loadRandom = async () => {
    setLoading(true);
    setError('');
    setRecipe(null);
    try {
      const data = await mgr.fetchRandom();
      setRecipe(data);
    } catch (err) {
      console.error('Error fetching random recipe:', err);
      setError('Failed to load recipe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="random-view">
      <h1>Chef’s Surprise</h1>

      {loading && <p>Loading…</p>}
      {error && <p className="error-message">{error}</p>}

      {recipe && (
        <div className="random-card">
          <img src={recipe.strMealThumb} alt={recipe.strMeal} />

          <div className="random-content">
            <h2>{recipe.strMeal}</h2>
            <p><strong>Category:</strong> {recipe.strCategory}</p>
            <p><strong>Area:</strong> {recipe.strArea}</p>

            <h3>Instructions</h3>
            <p className="instructions">{recipe.strInstructions}</p>

            <h3>Ingredients</h3>
            <ul>
              {Array.from({ length: 20 }).map((_, i) => {
                const ing = recipe[`strIngredient${i+1}`];
                const mea = recipe[`strMeasure${i+1}`];
                return ing ? (
                  <li key={i}>{ing} – {mea}</li>
                ) : null;
              })}
            </ul>
          </div>
        </div>
      )}

      <button
        id="new-random-btn"
        onClick={loadRandom}
        disabled={loading}
      >
        {loading ? 'Loading…' : 'Another Surprise'}
      </button>
    </div>
  );
}
