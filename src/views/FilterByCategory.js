// src/views/FilterByCategory.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import RecipeManager from '../utils/RecipeManager';
import './FilterByCategory.css';

export default function FilterByCategory() {
  const mgr = useMemo(() => new RecipeManager(), []);

  const [categories, setCategories] = useState([]);
  const [areas,      setAreas]      = useState([]);
  const [selCats,    setSelCats]    = useState(new Set());
  const [selAreas,   setSelAreas]   = useState(new Set());
  const [meals,      setMeals]      = useState([]);
  const [count,      setCount]      = useState(0);

  // Load category & area facets on mount
  useEffect(() => {
    mgr.listCategories().then(setCategories).catch(() => setCategories([]));
    mgr.listAreas().     then(setAreas)     .catch(() => setAreas([]));
  }, [mgr]);

  // Refetch whenever selections change
  useEffect(() => {
    async function fetchFiltered() {
      let results = [];
      const cats = Array.from(selCats);
      const ars  = Array.from(selAreas);

      if (cats.length && !ars.length) {
        // Union of selected categories
        for (const c of cats) {
          results = results.concat(await mgr.filterByCategory(c));
        }
      } else if (!cats.length && ars.length) {
        // Union of selected areas
        for (const a of ars) {
          results = results.concat(await mgr.filterByArea(a));
        }
      } else if (cats.length && ars.length) {
        // Intersection: fetch by category then filter by area client-side
        let temp = [];
        for (const c of cats) {
          temp = temp.concat(await mgr.filterByCategory(c));
        }
        const detailed = await Promise.all(
          temp.map(m => mgr.getById(m.idMeal))
        );
        results = detailed
          .filter(d => ars.includes(d.strArea))
          .map(d => ({
            idMeal:       d.idMeal,
            strMeal:      d.strMeal,
            strMealThumb: d.strMealThumb
          }));
      }

      // Remove duplicates
      const unique = Array.from(
        new Map(results.map(r => [r.idMeal, r])).values()
      );
      setMeals(unique);
      setCount(unique.length);
    }
    fetchFiltered();
  }, [selCats, selAreas, mgr]);

  // Helper to toggle a Set
  const toggleSet = (setter, setVal, key) => {
    const nxt = new Set(setVal);
    nxt.has(key) ? nxt.delete(key) : nxt.add(key);
    setter(nxt);
  };

  return (
    <div id="filter-category">
      <h1>Cuisine Curator</h1>
      <p><strong>{count}</strong> recipes found</p>

      {/* Category Chips */}
      <div className="facet-bar">
        {categories.map(cat => (
          <button
            key={cat}
            className={`chip ${selCats.has(cat) ? 'selected' : ''}`}
            onClick={() => toggleSet(setSelCats, selCats, cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Area Chips */}
      <div className="facet-bar">
        {areas.map(area => (
          <button
            key={area}
            className={`chip ${selAreas.has(area) ? 'selected' : ''}`}
            onClick={() => toggleSet(setSelAreas, selAreas, area)}
          >
            {area}
          </button>
        ))}
      </div>

      {/* Result Grid */}
      <div className="result-grid">
        {meals.map(meal => (
          <Link
            key={meal.idMeal}
            to={`/recipe/${meal.idMeal}`}
            className="result-card"
          >
            <img src={meal.strMealThumb} alt={meal.strMeal} />
            <h3>{meal.strMeal}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
