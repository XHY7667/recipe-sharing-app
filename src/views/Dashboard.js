// src/views/Dashboard.js
import React, { useState, useEffect, useMemo } from 'react';

import CommunityManager     from '../utils/CommunityManager';
import HistoryManager       from '../utils/HistoryManager';
import RecipeManager        from '../utils/RecipeManager';
import ShoppingListManager  from '../utils/ShoppingListManager';
import SubmissionManager    from '../utils/SubmissionManager';
import UserManager          from '../utils/UserManager';

import './Dashboard.css';

export default function Dashboard() {
  // Instantiate data managers once
  const userMgr    = useMemo(() => new UserManager(), []);
  const subMgr     = useMemo(() => new SubmissionManager(), []);
  const shopMgr    = useMemo(() => new ShoppingListManager(), []);
  const histMgr    = useMemo(() => new HistoryManager(), []);
  const recipeMgr  = useMemo(() => new RecipeManager(), []);
  const commMgr    = useMemo(() => new CommunityManager(), []);

  // Component state
  const [favCount,       setFavCount]      = useState(0);
  const [subCount,       setSubCount]      = useState(0);
  const [shopCount,      setShopCount]     = useState(0);
  const [shopItems,      setShopItems]     = useState([]);
  const [recentAct,      setRecentAct]     = useState([]);
  const [recs,           setRecs]          = useState([]);
  const [commHighlights, setCommHighlights] = useState([]);

  // Load summary stats
  useEffect(() => {
    setFavCount(userMgr.getFavorites().length);
    setSubCount(subMgr.getRecipes().length);

    const list = shopMgr.getList();
    setShopCount(list.filter(item => !item.purchased).length);
    setShopItems(list.slice(0, 5));
  }, [userMgr, subMgr, shopMgr]);

  // Recent activity (last 5 searches)
  useEffect(() => {
    const history = histMgr.getHistory();
    setRecentAct(history.slice(-5).reverse());
  }, [histMgr]);

  // Recommended recipes: top favorites or random fallback
  useEffect(() => {
    async function loadRecs() {
      const favs = userMgr.getFavorites().slice(0, 4);

      if (favs.length > 0) {
        const details = await Promise.all(favs.map(id => recipeMgr.getById(id)));
        setRecs(details.filter(Boolean));
      } else {
        const rnds = await Promise.all(
          Array(4).fill().map(() => recipeMgr.fetchRandom())
        );
        setRecs(rnds);
      }
    }

    loadRecs();
  }, [userMgr, recipeMgr]);

  // Community highlights: most recent 3 posts
  useEffect(() => {
    setCommHighlights(commMgr.getPosts().slice(0, 3));
  }, [commMgr]);

  return (
    <div id="dashboard-view">
      {/* App Greeting */}
      <section className="card profile-card">
        <h2>Welcome to RecipeShare</h2>
        <p>Your personal cooking dashboard</p>
      </section>

      {/* Quick Stats */}
      <section className="card stats-card">
        <div className="stat">
          <h3>{favCount}</h3>
          <p>Favorites</p>
        </div>
        <div className="stat">
          <h3>{subCount}</h3>
          <p>My Recipes</p>
        </div>
        <div className="stat">
          <h3>{shopCount}</h3>
          <p>Items to Buy</p>
        </div>
        <div className="stat">
          <h3>{recentAct.length}</h3>
          <p>Recent Searches</p>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="card activity-card">
        <h2>Recent Activity</h2>
        <ul>
          {recentAct.map((act, idx) => (
            <li key={idx}>{act}</li>
          ))}
        </ul>
      </section>

      {/* Recommended Recipes */}
      <section className="card rec-card">
        <h2>Recommended for You</h2>
        <div className="rec-grid">
          {recs.map(recipe => (
            <div key={recipe.idMeal} className="rec-item">
              <img src={recipe.strMealThumb} alt={recipe.strMeal} />
              <p>{recipe.strMeal}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shopping List Progress */}
      <section className="card shop-card">
        <h2>Shopping List</h2>
        <ul>
          {shopItems.map(item => (
            <li key={item.name}>
              <input type="checkbox" checked={item.purchased} readOnly />
              {item.name}
            </li>
          ))}
        </ul>
      </section>

      {/* Community Highlights */}
      <section className="card comm-card">
        <h2>Community Highlights</h2>
        {commHighlights.map(post => (
          <div key={post.id} className="comm-item">
            <strong>{post.author}</strong>: {post.content.slice(0, 50)}…
          </div>
        ))}
      </section>
    </div>
  );
}
