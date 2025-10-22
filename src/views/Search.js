// src/views/Search.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';

import RecipeManager     from '../utils/RecipeManager';
import SubmissionManager from '../utils/SubmissionManager';
import HistoryManager    from '../utils/HistoryManager';

import './Search.css';

export default function Search() {
  const recipeMgr     = useMemo(() => new RecipeManager(), []);
  const submissionMgr = useMemo(() => new SubmissionManager(), []);
  const historyMgr    = useMemo(() => new HistoryManager(), []);

  const [query, setQuery]             = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults]         = useState([]);
  const [loadingSug, setLoadingSug]   = useState(false);
  const [loadingRes, setLoadingRes]   = useState(false);
  const [history, setHistory]         = useState(historyMgr.getHistory());

  const debounceTimer = useRef(null);

  // Debounced autocomplete (API + local)
  const handleInputChange = e => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      if (!val.trim()) {
        setSuggestions([]);
        return;
      }
      setLoadingSug(true);
      try {
        // 1) API suggestions
        const api = await recipeMgr.searchByName(val.trim()) || [];
        // 2) Local submissions matching
        const local = submissionMgr
          .getRecipes()
          .filter(r => r.name.toLowerCase().includes(val.toLowerCase()))
          .map(r => ({ idMeal: r.id, strMeal: r.name }));
        setSuggestions([...local, ...api]);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSug(false);
      }
    }, 500);
  };

  // Full search on Enter or button click
  const runSearch = async term => {
    if (!term.trim()) return;
    setLoadingRes(true);
    try {
      // API results
      const apiMeals = await recipeMgr.searchByName(term.trim()) || [];
      // Local submissions
      const localMeals = submissionMgr
        .getRecipes()
        .filter(r => r.name.toLowerCase().includes(term.toLowerCase()))
        .map(r => ({
          idMeal:       r.id,
          strMeal:      r.name,
          strMealThumb: r.image,
          isLocal:      true
        }));
      // Merge, local first, and dedupe
      const merged = [
        ...localMeals,
        ...apiMeals.filter(m => !localMeals.some(l => l.idMeal === m.idMeal))
      ];
      setResults(merged);
      // record history and reset suggestions
      historyMgr.add(term.trim());
      setHistory(historyMgr.getHistory());
      setSuggestions([]);
    } catch {
      setResults([]);
    } finally {
      setLoadingRes(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      runSearch(query);
    }
  };

  const clickSuggestion = meal => {
    setQuery(meal.strMeal);
    runSearch(meal.strMeal);
  };

  const clickHistory = text => {
    setQuery(text);
    runSearch(text);
  };

  const clearHistory = () => {
    historyMgr.clear();
    setHistory([]);
  };

  return (
    <div id="search-view">
      <h1>Find Your Feast</h1>

      <div className="search-group">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type to search..."
        />
        {loadingSug && <span className="loading">🔄</span>}

        {suggestions.length > 0 && (
          <ul className="autocomplete-list">
            {suggestions.map(meal => (
              <li
                key={meal.idMeal}
                onClick={() => clickSuggestion(meal)}
              >
                {meal.strMeal}{meal.isLocal ? ' (My Recipe)' : ''}
              </li>
            ))}
          </ul>
        )}
      </div>

      {history.length > 0 && (
        <div className="history-chips">
          <span>Recent:</span>
          {history.map((h, i) => (
            <button key={i} className="chip" onClick={() => clickHistory(h)}>
              {h}
            </button>
          ))}
          <button className="chip-clear" onClick={clearHistory}>Clear</button>
        </div>
      )}

      <button
        id="search-btn"
        onClick={() => runSearch(query)}
        disabled={loadingRes}
      >
        {loadingRes ? 'Searching…' : 'Search'}
      </button>

      {loadingRes && <p>Loading results…</p>}
      {!loadingRes && results.length === 0 && query.trim() && (
        <p className="no-results">No recipes found for “{query}”</p>
      )}

      {results.length > 0 && (
        <div className="results">
          {results.map(meal => (
            <Link
              key={meal.idMeal}
              to={`/recipe/${meal.idMeal}`}
              className="result-card"
            >
              {meal.strMealThumb && (
                <img src={meal.strMealThumb} alt={meal.strMeal} />
              )}
              <h3>
                {meal.strMeal}{meal.isLocal ? ' (My Recipe)' : ''}
              </h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
