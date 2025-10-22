// src/views/RecipeDetail.js
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import RecipeManager     from '../utils/RecipeManager';
import SubmissionManager from '../utils/SubmissionManager';
import UserManager       from '../utils/UserManager';
import { createOrder, confirmPayment } from '../utils/api'; // ✅ 新增
import './RecipeDetail.css';

export default function RecipeDetail() {
  const { id } = useParams();

  const apiMgr        = useMemo(() => new RecipeManager(), []);
  const submissionMgr = useMemo(() => new SubmissionManager(), []);
  const userMgr       = useMemo(() => new UserManager(), []);

  const [recipe, setRecipe]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [isFav, setIsFav]     = useState(false);

  // ✅ 购买相关状态
  const [buying, setBuying] = useState(false);
  const [orderStatus, setOrderStatus] = useState(''); // pending/paid/failed...

  // ✅ 简单金额格式化（分 -> $x.xx）
  const formatCents = (cents) => (cents / 100).toFixed(2);

  useEffect(() => {
    setIsFav(userMgr.isFavorite(id));
  }, [id, userMgr]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');

      try {
        let data;
        let local = false;

        if (id.startsWith('local-')) {
          data = submissionMgr.findById(id);
          local = true;
        } else {
          data = await apiMgr.getById(id);
        }

        if (!data) throw new Error('Recipe not found');

        // Normalize into a single shape
        const normalized = {
          id:             id,
          name:           local ? data.name           : data.strMeal,
          thumb:          local ? data.image          : data.strMealThumb,
          category:       local ? data.category       : data.strCategory,
          area:           local ? data.area           : data.strArea,
          instructions:   local ? data.instructions   : data.strInstructions,
          ingredients:    local
                           ? data.ingredients        // array of strings
                           : Array.from({ length: 20 })
                               .map((_, i) => ({
                                 ing: data[`strIngredient${i+1}`],
                                 mea: data[`strMeasure${i+1}`]
                               }))
                               .filter(x => x.ing),

          // ✅ 演示用价格：后端示例里 recipe r1 是 599 分（$5.99）。
          // 如果将来你把前端的菜谱和后端打通，这里改为真实 priceCents。
          priceCents: 599
        };

        if (active) setRecipe(normalized);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [id, apiMgr, submissionMgr]);

  const toggleFav = () => {
    userMgr.toggleFavorite(id);
    setIsFav(userMgr.isFavorite(id));
  };

  // ✅ 购买流程（最小闭环：创建订单 → 确认支付 → Webhook 落账 → 返回状态）
  const handleBuy = async () => {
    if (!recipe) return;
    setBuying(true);
    setOrderStatus('');
    setError('');

    try {
      // 说明：后端当前内置了一个示例菜谱 id = 'r1'
      // 你可以先用它演示完整闭环；等打通后端数据，就把 'r1' 改为真实的 recipe.id
      const recipeIdForBackend = 'r1';

      const { data: order } = await createOrder(recipeIdForBackend, 'u2'); // buyerId 先写死演示
      if (!order?.paymentIntentId) throw new Error('Order created but no paymentIntentId');

      const res = await confirmPayment(order.paymentIntentId);
      const status = res?.data?.status || 'processing';
      setOrderStatus(status);

      if (status === 'paid') {
        // 这里你也可以做：下载附件、展示“已购买”、刷新“我的订单”等
      }
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <p>Loading recipe…</p>;
  if (error)   return <p className="error">{error}</p>;

  return (
    <div id="recipe-detail">
      <h1>{recipe.name}</h1>
      <button
        className={`like-btn ${isFav ? 'liked' : ''}`}
        onClick={toggleFav}
      >
        {isFav ? '♥ Unfavorite' : '♡ Favorite'}
      </button>

      <img src={recipe.thumb} alt={recipe.name} />

      <div className="meta">
        <span className="meta-item">
          <strong>Category:</strong> {recipe.category}
        </span>
        <span className="meta-item">
          <strong>Cuisine:</strong> {recipe.area}
        </span>
        {/* ✅ 显示价格（演示用） */}
        <span className="meta-item">
          <strong>Price:</strong> ${formatCents(recipe.priceCents)}
        </span>
      </div>

      {/* ✅ 购买区域 */}
      <section className="purchase">
        <button
          className="buy-btn"
          onClick={handleBuy}
          disabled={buying}
          title="Create order and confirm payment (mock)"
        >
          {buying ? 'Processing…' : `Buy for $${formatCents(recipe.priceCents)}`}
        </button>
        {orderStatus && (
          <p className={`order-status ${orderStatus}`}>
            Order status: <strong>{orderStatus}</strong>
          </p>
        )}
      </section>

      <section className="ingredients">
        <h2>Ingredients</h2>
        <ul>
          {recipe.ingredients.map((x, i) => (
            <li key={i}>
              {typeof x === 'string'
                ? x
                : `${x.ing}${x.mea ? ` — ${x.mea}` : ''}`}
            </li>
          ))}
        </ul>
      </section>

      <section className="instructions">
        <h2>Instructions</h2>
        <p>{recipe.instructions}</p>
      </section>
    </div>
  );
}
