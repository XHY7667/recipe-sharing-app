// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

import Nav                 from './components/Nav';
import Splash              from './views/Splash';
import Dashboard           from './views/Dashboard';
import Random              from './views/Random';
import Search              from './views/Search';
import FilterByIngredient  from './views/FilterByIngredient';
import FilterByCategory    from './views/FilterByCategory';
import RecipeDetail        from './views/RecipeDetail';
import Favorites           from './views/Favorites';
import ShoppingList        from './views/ShoppingList';
import Submit              from './views/Submit';
import FAQ                 from './views/FAQ';
import Community           from './views/Community';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Splash screen only */}
        <Route path="/" element={<Splash />} />

        {/* All other routes share Nav + <main> */}
        <Route element={<AppLayout />}>
          <Route path="dashboard"           element={<Dashboard />} />
          <Route path="random"              element={<Random />} />
          <Route path="search"              element={<Search />} />
          <Route path="filter/ingredient"   element={<FilterByIngredient />} />
          <Route path="filter/category"     element={<FilterByCategory />} />
          <Route path="recipe/:id"          element={<RecipeDetail />} />
          <Route path="favorites"           element={<Favorites />} />
          <Route path="shopping-list"       element={<ShoppingList />} />
          <Route path="submit"              element={<Submit />} />
          <Route path="faq"                 element={<FAQ />} />
          <Route path="community"           element={<Community />} />

          {/* Redirect any unknown path to dashboard */}
          <Route path="*"                    element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Layout wrapper that adds Nav + main container
function AppLayout() {
  return (
    <>
      <Nav />
      <main>
        <Outlet />
      </main>
    </>
  );
}
