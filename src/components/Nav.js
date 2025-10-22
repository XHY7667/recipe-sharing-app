// src/components/Nav.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Nav.css';

export default function Nav() {
  return (
    <nav className="nav-bar">
      <NavLink to="/"           className="nav-link">Dashboard</NavLink>
      <NavLink to="/random"     className="nav-link">Suggestions</NavLink>
      <NavLink to="/search"     className="nav-link">Search</NavLink>
      <NavLink to="/filter/ingredient" className="nav-link">By Ingredient</NavLink>
      <NavLink to="/filter/category"   className="nav-link">By Category</NavLink>
      <NavLink to="/favorites"  className="nav-link">Favorites</NavLink>
      <NavLink to="/shopping-list" className="nav-link">Shopping List</NavLink>
      <NavLink to="/submit"     className="nav-link">Submit Recipe</NavLink>
      <NavLink to="/faq"        className="nav-link">FAQ</NavLink>
      <NavLink to="/community" className="nav-link">Community</NavLink>
    </nav>
);
}
