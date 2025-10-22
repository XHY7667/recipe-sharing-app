// src/views/Submit.js
import React, { useState, useEffect, useMemo, useRef } from 'react';
import SubmissionManager from '../utils/SubmissionManager';
import './Submit.css';

export default function Submit() {
  const mgr = useMemo(() => new SubmissionManager(), []);

  // Form state
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [area, setArea] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [error, setError] = useState('');

  // Submissions list
  const [recipes, setRecipes] = useState([]);

  // Load on mount
  useEffect(() => {
    setRecipes(mgr.getRecipes());
  }, [mgr]);

  // Image handling
  const fileRef = useRef();
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    const reader = new FileReader();
    reader.onload = () => setImageBase64(reader.result);
    reader.readAsDataURL(file);
  };

  // Form helpers
  const updateIngredient = (i, val) => {
    const copy = [...ingredients];
    copy[i] = val;
    setIngredients(copy);
  };
  const addIngredient = () => setIngredients([...ingredients, '']);

  const resetForm = () => {
    setId('');
    setName('');
    setCategory('');
    setArea('');
    setIngredients(['']);
    setInstructions('');
    setImagePreview('');
    setImageBase64('');
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  // Edit existing
  const handleEdit = r => {
    setId(r.id);
    setName(r.name);
    setCategory(r.category);
    setArea(r.area);
    setIngredients(r.ingredients);
    setInstructions(r.instructions);
    setImageBase64(r.image);
    setImagePreview(r.image);
    setError('');
  };

  // Delete submission
  const handleDelete = id => {
    if (window.confirm('Delete this recipe?')) {
      mgr.deleteRecipe(id);
      setRecipes(mgr.getRecipes());
      if (id === id) resetForm();
    }
  };

  // Submit or update
  const onSubmit = e => {
    e.preventDefault();
    if (!name.trim() || !instructions.trim() || !imageBase64) {
      setError('Name, instructions and photo are required.');
      return;
    }
    mgr.upsertRecipe({
      id,
      name,
      category,
      area,
      ingredients: ingredients.filter(i => i.trim()),
      instructions,
      image: imageBase64
    });
    setRecipes(mgr.getRecipes());
    alert(id ? 'Recipe updated!' : 'Recipe submitted!');
    resetForm();
  };

  return (
    <div id="submit-view">
      <h1>{id ? 'Edit Recipe' : 'Submit Recipe'}</h1>
      {error && <p className="error">{error}</p>}

      <form onSubmit={onSubmit}>
        <label>
          Dish Name
          <input value={name} onChange={e => setName(e.target.value)} />
        </label>
        <label>
          Category
          <input value={category} onChange={e => setCategory(e.target.value)} />
        </label>
        <label>
          Cuisine
          <input value={area} onChange={e => setArea(e.target.value)} />
        </label>

        <fieldset>
          <legend>Ingredients</legend>
          {ingredients.map((ing, i) => (
            <input
              key={i}
              value={ing}
              onChange={e => updateIngredient(i, e.target.value)}
              placeholder={`Ingredient #${i+1}`}
            />
          ))}
          <button type="button" onClick={addIngredient}>
            + Add Ingredient
          </button>
        </fieldset>

        <label>
          Instructions
          <textarea
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
          />
        </label>

        <label>
          Photo
          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            onChange={handleImageChange}
          />
        </label>

        {imagePreview && (
          <div className="preview">
            <img src={imagePreview} alt="Preview" />
          </div>
        )}

        <button type="submit">{id ? 'Update Recipe' : 'Submit Recipe'}</button>
      </form>

      <hr />

      <h2>My Submissions</h2>
      {recipes.length === 0 ? (
        <p>No recipes yet.</p>
      ) : (
        <ul className="submission-list">
          {recipes.map(r => (
            <li key={r.id}>
              <span className="sub-name">{r.name}</span>
              <span className="timestamp">
                {new Date(r.updatedAt || r.createdAt).toLocaleString()}
              </span>
              <button onClick={() => handleEdit(r)}>Edit</button>
              <button onClick={() => handleDelete(r.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
