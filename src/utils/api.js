// src/utils/api.js
const API = "http://localhost:3001";

export async function fetchRecipes() {
  const res = await fetch(`${API}/api/recipes`);
  if (!res.ok) throw new Error(`Failed to fetch recipes: ${res.statusText}`);
  return res.json(); // { data: [...] }
}

export async function createOrder(recipeId, buyerId = "u2") {
  const res = await fetch(`${API}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipeId, buyerId }),
  });
  if (!res.ok) throw new Error(`Create order failed: ${res.statusText}`);
  return res.json(); // { data: order, clientSecret }
}

export async function confirmPayment(paymentIntentId) {
  const res = await fetch(`${API}/api/payments/${paymentIntentId}/confirm`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Confirm payment failed: ${res.statusText}`);
  return res.json(); // { data: order, webhookHandled: ... }
}

export async function fetchAuthorReport(authorId = "u1") {
  const res = await fetch(`${API}/api/reports/author/${authorId}`);
  if (!res.ok) throw new Error(`Report failed: ${res.statusText}`);
  return res.json(); // { data: {...} }
}
