// src/utils/RecipeManager.js
import axios from 'axios';

export default class RecipeManager {
  constructor() {
    this.baseUrl = 'https://www.themealdb.com/api/json/v1/1';
  }

  /** 
   * List all meal categories 
   * Endpoint: /list.php?c=list
   */
  async listCategories() {
    const resp = await axios.get(`${this.baseUrl}/list.php`, {
      params: { c: 'list' }
    });
    // resp.data.meals → [ { strCategory: 'Beef' }, … ]
    return resp.data.meals.map(m => m.strCategory);
  }

  /** 
   * List all meal areas (cuisines) 
   * Endpoint: /list.php?a=list
   */
  async listAreas() {
    const resp = await axios.get(`${this.baseUrl}/list.php`, {
      params: { a: 'list' }
    });
    // resp.data.meals → [ { strArea: 'Canadian' }, … ]
    return resp.data.meals.map(m => m.strArea);
  }

  /** 
   * Fetch one random recipe 
   * Endpoint: /random.php
   */
  async fetchRandom() {
    const resp = await axios.get(`${this.baseUrl}/random.php`);
    return resp.data.meals[0];
  }

  /** 
   * Search recipes by name 
   * Endpoint: /search.php?s={name}
   */
  async searchByName(name) {
    const resp = await axios.get(`${this.baseUrl}/search.php`, {
      params: { s: name }
    });
    return resp.data.meals || [];
  }

  /** 
   * Filter recipes by single ingredient 
   * Endpoint: /filter.php?i={ingredient}
   */
  async filterByIngredient(ingredient) {
    const resp = await axios.get(`${this.baseUrl}/filter.php`, {
      params: { i: ingredient }
    });
    return resp.data.meals || [];
  }

  /** 
   * Filter recipes by category 
   * Endpoint: /filter.php?c={category}
   */
  async filterByCategory(category) {
    const resp = await axios.get(`${this.baseUrl}/filter.php`, {
      params: { c: category }
    });
    return resp.data.meals || [];
  }

  /** 
   * Filter recipes by area (cuisine) 
   * Endpoint: /filter.php?a={area}
   */
  async filterByArea(area) {
    const resp = await axios.get(`${this.baseUrl}/filter.php`, {
      params: { a: area }
    });
    return resp.data.meals || [];
  }

  /** 
   * Lookup full details by recipe ID 
   * Endpoint: /lookup.php?i={id}
   */
  async getById(id) {
    const resp = await axios.get(`${this.baseUrl}/lookup.php`, {
      params: { i: id }
    });
    return resp.data.meals?.[0] || null;
  }
}
