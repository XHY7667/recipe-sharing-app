// src/views/Favorites.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import RecipeManager     from '../utils/RecipeManager';
import SubmissionManager from '../utils/SubmissionManager';
import UserManager       from '../utils/UserManager';
import './Favorites.css';

export default function Favorites() {
  const apiMgr        = useMemo(() => new RecipeManager(), []);
  const submissionMgr = useMemo(() => new SubmissionManager(), []);
  const userMgr       = useMemo(() => new UserManager(), []);

  const [favIds, setFavIds]   = useState(userMgr.getFavorites());
  const [recipes, setRecipes] = useState([]);

  // Reload when favorites change
  useEffect(() => {
    setFavIds(userMgr.getFavorites());
  }, [userMgr]);

  // Fetch details for all favorites
  useEffect(() => {
    async function load() {
      const details = await Promise.all(
        favIds.map(id =>
          id.startsWith('local-')
            ? submissionMgr.findById(id)
            : apiMgr.getById(id)
        )
      );
      // Normalize same as in Detail view
      const normalized = details
        .filter(Boolean)
        .map(data => {
          const local = data.id || data.name && data.createdAt;
          return {
            id:       local ? data.id : data.idMeal,
            name:     local ? data.name : data.strMeal,
            thumb:    local ? data.image : data.strMealThumb,
            category: local ? data.category : data.strCategory
          };
        });
      setRecipes(normalized);
    }
    load();
  }, [favIds, apiMgr, submissionMgr]);

  if (recipes.length === 0) {
    return <p className="empty">You haven’t favorited any recipes yet.</p>;
  }

  // Group by category
  const groups = recipes.reduce((acc, r) => {
    (acc[r.category] = acc[r.category]||[]).push(r);
    return acc;
  }, {});

  return (
    <div id="favorites-view">
      <h1>My Cookbook</h1>
      {Object.entries(groups).map(([cat, recs]) => (
        <section key={cat} className="fav-group">
          <h2>{cat}</h2>
          <div className="fav-grid">
            {recs.map(r => (
              <Link
                key={r.id}
                to={`/recipe/${r.id}`}
                className="fav-card"
              >
                <img src={r.thumb} alt={r.name} />
                <h3>{r.name}</h3>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
