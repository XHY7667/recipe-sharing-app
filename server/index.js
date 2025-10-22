// @ts-check
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { db, PLATFORM_FEE_RATE } = require("./models");

/** 简单 ID 生成 */
const uid = (p = "id") => `${p}_${crypto.randomUUID()}`;

/** Mock 的 “StripeAdapter” —— 接口形状与 Stripe 相似，便于以后替换为真 SDK */
const StripeAdapter = {
  /** @param {number} amountCents */
  createPaymentIntent(amountCents) {
    return { id: uid("pi"), amountCents, status: "requires_confirmation" };
  },
  /** @param {string} id */
  confirmPaymentIntent(id) {
    const ok = Math.random() > 0.15;
    return { id, status: ok ? "succeeded" : "requires_payment_method" };
  },
};

const app = express();
app.use(cors());
app.use(express.json());

/** ========== 业务核心：Webhook 事件处理（以事件为准 & 幂等） ========== */
/**
 * @param {{ id: string, type: string, data: { object: { id: string }}}} event
 */
function handleStripeEvent(event) {
  // 幂等：事件去重
  if (db.webhookEvents.some((e) => e.id === event.id)) {
    return { ok: true, skipped: true };
  }
  db.webhookEvents.push({ id: event.id });

  const pid = event?.data?.object?.id; // payment_intent id
  const order = db.orders.find((o) => o.paymentIntentId === pid);
  if (!order) {
    // 未知订单：生产可写入 dead-letter 备用
    return { ok: true, unknown: true };
  }

  if (event.type === "payment_intent.succeeded") {
    order.status = "paid";

    // 记账分录（gross: 总额；platformFee: 抽佣；net: 给作者）
    const recipe = db.recipes.find((r) => r.id === order.recipeId);
    if (!recipe) {
      // 如果订单关联菜谱不存在，记录异常并返回
      return { ok: false, reason: "Recipe not found for this order" };
    }

    const platformFeeCents = Math.round(order.amountCents * PLATFORM_FEE_RATE);
    const net = order.amountCents - platformFeeCents;

    db.ledger.push({
      id: uid("led"),
      orderId: order.id,
      authorId: recipe.authorId,
      grossCents: order.amountCents,
      platformFeeCents,
      netCents: net,
      createdAt: new Date().toISOString(),
    });
  } else if (event.type === "payment_intent.payment_failed") {
    order.status = "failed";
  }

  return { ok: true };
}

/** ===================== 路由 ===================== */

/** 测试：菜谱列表 */
app.get("/api/recipes", (_, res) => {
  res.json({ data: db.recipes });
});

/** 创建订单（生成 Mock PaymentIntent） */
app.post("/api/orders", (req, res) => {
  const { buyerId, recipeId } = req.body;
  const recipe = db.recipes.find((r) => r.id === recipeId);
  if (!recipe) return res.status(404).json({ error: "Recipe not found" });

  const pi = StripeAdapter.createPaymentIntent(recipe.priceCents);

  /** @type {import('./models').Order} */
  const order = {
    id: uid("order"),
    buyerId,
    recipeId,
    amountCents: recipe.priceCents,
    status: "pending",
    paymentIntentId: pi.id,
    createdAt: new Date().toISOString(),
  };
  db.orders.push(order);

  // 真 Stripe 会返回 client_secret，这里用 mock 值
  res.json({ data: order, clientSecret: "mock_" + pi.id });
});

/** 前端“确认支付” -> 适配器 -> 生成事件 -> 直接调用本地处理函数（模拟 Webhook） */
app.post("/api/payments/:pid/confirm", (req, res) => {
  const pid = req.params.pid;
  const order = db.orders.find((o) => o.paymentIntentId === pid);
  if (!order) return res.status(404).json({ error: "Order not found" });

  const result = StripeAdapter.confirmPaymentIntent(pid);
  const event = {
    id: uid("evt"),
    type: result.status === "succeeded" ? "payment_intent.succeeded" : "payment_intent.payment_failed",
    data: { object: { id: pid } },
  };

  // 直接调用处理函数，而不是 HTTP 调自己，避免 fetch 依赖
  const outcome = handleStripeEvent(event);
  res.json({ data: order, webhookHandled: outcome });
});

/** Stripe 真 Webhook 入口（未来接入真实 Stripe 时使用） */
app.post("/api/webhooks/stripe", (req, res) => {
  const outcome = handleStripeEvent(req.body);
  res.json(outcome);
});

/** 作者维度简易报表（类 P&L） */
app.get("/api/reports/author/:id", (req, res) => {
  const authorId = req.params.id;
  const recipeIds = new Set(db.recipes.filter((r) => r.authorId === authorId).map((r) => r.id));
  const paidOrders = db.orders.filter((o) => recipeIds.has(o.recipeId) && o.status === "paid");

  const gross = paidOrders.reduce((s, o) => s + o.amountCents, 0);
  const fee = Math.round(gross * PLATFORM_FEE_RATE);
  const net = gross - fee;

  res.json({
    data: {
      authorId,
      orders: paidOrders.length,
      grossCents: gross,
      platformFeeCents: fee,
      netCents: net,
      topRecipes: Array.from(recipeIds),
    },
  });
});

/** 启动服务 */
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API on http://localhost:${PORT}`);
});
