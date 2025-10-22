// @ts-check

/**
 * @typedef {string} ID
 */

/** @typedef {{ id: ID, name: string }} User */

/** @typedef {{
 *  id: ID,
 *  authorId: ID,
 *  title: string,
 *  priceCents: number,
 *  createdAt: string
 * }} Recipe */

/** @typedef {{
 *  id: ID,
 *  buyerId: ID,
 *  recipeId: ID,
 *  amountCents: number,
 *  status: "pending"|"paid"|"failed"|"refunded"|"disputed",
 *  paymentIntentId?: ID,
 *  createdAt: string
 * }} Order */

/** @typedef {{
 *  id: ID,
 *  orderId: ID,
 *  authorId: ID,
 *  grossCents: number,
 *  platformFeeCents: number,
 *  netCents: number,
 *  createdAt: string
 * }} Ledger */

/** @type {{ users: User[], recipes: Recipe[], orders: Order[], ledger: Ledger[], webhookEvents: {id: ID}[] }} */
const db = {
  users: [{ id: "u1", name: "Alice" }],
  recipes: [
    { id: "r1", authorId: "u1", title: "Pasta", priceCents: 599, createdAt: new Date().toISOString() }
  ],
  orders: [],
  ledger: [],
  webhookEvents: [], // 用于幂等去重
};

// 平台抽佣（10%）
const PLATFORM_FEE_RATE = 0.1;

module.exports = {
  db,
  PLATFORM_FEE_RATE,
};
