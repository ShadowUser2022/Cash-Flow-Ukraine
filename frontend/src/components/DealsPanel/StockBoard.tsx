/**
 * StockBoard — торгівля акціями
 *
 * Механіка:
 * 1. Бачиш поточну ціну і графік (тікер)
 * 2. Купуєш під час СВОГО ходу — ціна списується з Cash
 * 3. Ціни змінюються коли хтось потрапляє на клітинку 📊 РИНОК
 * 4. Продаєш з прибутком коли ціна зросла
 *
 * Акції НЕ дають дивідендів — заробляєш тільки на різниці курсу (buy low, sell high)
 */
import React, { useState, useEffect } from 'react';
import useGameStore from '../../store/gameStore';
import { socketService } from '../../services/socketService';
import { SOCKET_EVENTS } from '../../constants/socketEvents';

// ─── Sparkline ────────────────────────────────────────────────────
const Sparkline: React.FC<{ prices: number[]; width?: number; height?: number }> = ({
  prices, width = 60, height = 24,
}) => {
  if (!prices || prices.length < 2) return (
    <svg width={width} height={height}>
      <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
    </svg>
  );
  const min = Math.min(...prices), max = Math.max(...prices), range = max - min || 1, pad = 2;
  const pts = prices.map((p, i) => {
    const x = pad + (i / (prices.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (p - min) / range) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const isUp = prices[prices.length - 1] >= prices[0];
  const color = isUp ? '#4CAF50' : '#f44336';
  const fill = [`${pad},${height - pad}`, ...pts, `${(width - pad).toFixed(1)},${height - pad}`].join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polygon points={fill} fill={`${color}18`} />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={parseFloat(pts[pts.length - 1].split(',')[0])} cy={parseFloat(pts[pts.length - 1].split(',')[1])} r={2.5} fill={color} />
    </svg>
  );
};

// ─── Головний компонент ───────────────────────────────────────────
const StockBoard: React.FC = () => {
  const { game, currentPlayer, playerId } = useGameStore();
  const [qty, setQty] = useState<Record<string, number>>({});   // кількість для купівлі
  const [pending, setPending] = useState<string | null>(null);   // символ в процесі
  const [notif, setNotif] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const stockMarket = (game as any)?.stockMarket;
  const isMyTurn = game?.currentPlayer === playerId;
  const isOffline = game?.id === 'OFFLINE-MODE' || game?.id === 'DEV-MODE';
  const cash = currentPlayer?.finances?.cash ?? 0;

  // Слухаємо відповіді сервера
  useEffect(() => {
    const onBought = (data: any) => {
      if (data.playerId !== playerId) return;
      setPending(null);
      setNotif({ type: 'ok', msg: `✅ Куплено ${data.quantity}×${data.symbol} @ $${data.pricePerShare}` });
      setTimeout(() => setNotif(null), 4000);
    };
    const onSold = (data: any) => {
      if (data.playerId !== playerId) return;
      setPending(null);
      const sign = data.profit >= 0 ? '+' : '';
      setNotif({ type: 'ok', msg: `💰 Продано ${data.quantity}×${data.symbol} — ${sign}$${data.profit}` });
      setTimeout(() => setNotif(null), 4000);
    };
    const onError = (data: any) => {
      setPending(null);
      setNotif({ type: 'err', msg: `❌ ${data.message}` });
      setTimeout(() => setNotif(null), 4000);
    };
    socketService.onGameEvent(SOCKET_EVENTS.STOCK_BOUGHT as any, onBought);
    socketService.onGameEvent(SOCKET_EVENTS.STOCK_SOLD as any, onSold);
    socketService.onGameEvent(SOCKET_EVENTS.ERROR as any, onError);
    return () => {
      socketService.offGameEvent(SOCKET_EVENTS.STOCK_BOUGHT as any, onBought);
      socketService.offGameEvent(SOCKET_EVENTS.STOCK_SOLD as any, onSold);
      socketService.offGameEvent(SOCKET_EVENTS.ERROR as any, onError);
    };
  }, [playerId]);

  if (!stockMarket) return (
    <div style={{ padding: 16, color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'center' }}>
      📊 Ринок ще не ініціалізований
    </div>
  );

  // Власні акції
  const ownedMap: Record<string, { qty: number; purchasePrice: number; assetId: string }> = {};
  currentPlayer?.finances?.assets
    ?.filter((a: any) => a.type === 'stocks')
    ?.forEach((a: any) => {
      const sym = a.symbol || symFromName(a.name);
      if (sym) ownedMap[sym] = { qty: a.quantity || 1, purchasePrice: a.cost || 0, assetId: a.id };
    });

  const stocks = Object.values(stockMarket) as Array<{
    symbol: string; name: string; icon: string;
    pricePerShare: number; basePrice: number; priceHistory: number[];
  }>;

  const getQty = (sym: string) => qty[sym] ?? 1;

  const handleBuy = (symbol: string, price: number) => {
    const q = getQty(symbol);
    if (!playerId || !game) return;
    if (cash < price * q) {
      setNotif({ type: 'err', msg: `Не вистачає $${(price * q - cash).toLocaleString()}` });
      setTimeout(() => setNotif(null), 3000);
      return;
    }
    setPending(symbol);
    socketService.getGameSocket()?.emit('buy-stock', { gameId: game.id, playerId, symbol, quantity: q });
  };

  const handleSell = (symbol: string, ownedQty: number) => {
    const q = Math.min(getQty(symbol), ownedQty);
    if (!playerId || !game) return;
    setPending(symbol);
    socketService.getGameSocket()?.emit('sell-stock', { gameId: game.id, playerId, symbol, quantity: q });
  };

  // Офлайн режим — продаж/купівля локально
  const handleBuyOffline = (symbol: string, price: number) => {
    const q = getQty(symbol);
    const totalCost = price * q;
    if (cash < totalCost) {
      setNotif({ type: 'err', msg: `Не вистачає $${(totalCost - cash).toLocaleString()}` });
      setTimeout(() => setNotif(null), 3000);
      return;
    }
    const { setGame, setCurrentPlayer } = useGameStore.getState();
    const g = JSON.parse(JSON.stringify(game));
    const p = g.players.find((pl: any) => pl.id === playerId);
    if (!p) return;
    p.finances.cash -= totalCost;
    const existing = p.finances.assets.find((a: any) => a.type === 'stocks' && a.symbol === symbol);
    if (existing) {
      const prev = existing.cost * existing.quantity;
      existing.quantity += q;
      existing.cost = Math.round((prev + totalCost) / existing.quantity);
    } else {
      const stock = stockMarket[symbol];
      p.finances.assets.push({
        id: `stock_${symbol}_${Date.now()}`, name: `${stock.name} (${symbol})`,
        type: 'stocks', symbol, quantity: q, cost: price,
        purchasePrice: price, cashFlow: 0, currentMultiplier: 1.0,
      });
    }
    setGame(g); setCurrentPlayer(p);
    setNotif({ type: 'ok', msg: `✅ Куплено ${q}×${symbol} @ $${price}` });
    setTimeout(() => setNotif(null), 4000);
  };

  const handleSellOffline = (symbol: string, currentPrice: number) => {
    const { setGame, setCurrentPlayer } = useGameStore.getState();
    const g = JSON.parse(JSON.stringify(game));
    const p = g.players.find((pl: any) => pl.id === playerId);
    if (!p) return;
    const idx = p.finances.assets.findIndex((a: any) => a.type === 'stocks' && a.symbol === symbol);
    if (idx === -1) return;
    const asset = p.finances.assets[idx];
    const sellQty = Math.min(getQty(symbol), asset.quantity);
    const proceeds = currentPrice * sellQty;
    const profit = (currentPrice - asset.cost) * sellQty;
    p.finances.cash += proceeds;
    if (sellQty >= asset.quantity) p.finances.assets.splice(idx, 1);
    else asset.quantity -= sellQty;
    setGame(g); setCurrentPlayer(p);
    const sign = profit >= 0 ? '+' : '';
    setNotif({ type: 'ok', msg: `💰 Продано ${sellQty}×${symbol}: ${sign}$${profit.toLocaleString()}` });
    setTimeout(() => setNotif(null), 4000);
  };

  const doBuy = (sym: string, price: number) => isOffline ? handleBuyOffline(sym, price) : handleBuy(sym, price);
  const doSell = (sym: string, price: number, ownedQty: number) => isOffline ? handleSellOffline(sym, price) : handleSell(sym, ownedQty);

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Заголовок */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 10 }}>
        <span style={{ color: '#FFD700', fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>📈 РИНОК АКЦІЙ</span>
        <span style={{
          marginLeft: 'auto', fontSize: 10, padding: '2px 7px', borderRadius: 10,
          background: isMyTurn ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.06)',
          color: isMyTurn ? '#4CAF50' : 'rgba(255,255,255,0.3)',
        }}>
          {isMyTurn ? '● твій хід' : '○ не твій хід'}
        </span>
      </div>

      {/* Підказка */}
      <div style={{ padding: '7px 9px', borderRadius: 6, marginBottom: 10, fontSize: 10, lineHeight: 1.5, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)' }}>
        💡 <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Стратегія:</strong> Купуй коли ціна низька → чекай поки хтось потрапить на <strong>📊 РИНОК</strong> (ціна зміниться) → продай з прибутком. Акції не дають дивідендів.
      </div>

      {/* Нотифікація */}
      {notif && (
        <div style={{
          padding: '7px 10px', borderRadius: 6, marginBottom: 8, fontSize: 12, fontWeight: 600,
          background: notif.type === 'ok' ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.15)',
          color: notif.type === 'ok' ? '#4CAF50' : '#f44336',
          border: `1px solid ${notif.type === 'ok' ? 'rgba(76,175,80,0.3)' : 'rgba(244,67,54,0.3)'}`,
        }}>{notif.msg}</div>
      )}

      {/* Список акцій */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {stocks.map(stock => {
          const { symbol, name, icon, pricePerShare: price, basePrice, priceHistory } = stock;
          const pct = ((price - basePrice) / basePrice) * 100;
          const isUp = price >= basePrice;
          const owned = ownedMap[symbol];
          const unrealized = owned ? (price - owned.purchasePrice) * owned.qty : null;
          const maxBuy = Math.floor(cash / price);
          const q = getQty(symbol);
          const isPending = pending === symbol;

          return (
            <div key={symbol} style={{
              background: owned ? 'rgba(245,166,35,0.07)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${owned ? 'rgba(245,166,35,0.25)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 8, padding: '8px 10px',
            }}>
              {/* Рядок ціни */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: owned || isMyTurn ? 8 : 0 }}>
                <div style={{ fontSize: 16 }}>{icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{symbol}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>{name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>${price}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '1px 5px', borderRadius: 4,
                      background: pct === 0 ? 'rgba(255,255,255,0.07)' : isUp ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.15)',
                      color: pct === 0 ? 'rgba(255,255,255,0.25)' : isUp ? '#4CAF50' : '#f44336',
                    }}>
                      {pct === 0 ? 'база' : `${isUp ? '▲' : '▼'}${Math.abs(pct).toFixed(0)}%`}
                    </span>
                  </div>
                </div>
                <Sparkline prices={priceHistory} width={56} height={24} />
              </div>

              {/* Позиція (якщо є) */}
              {owned && (
                <div style={{
                  padding: '5px 7px', borderRadius: 5, marginBottom: 6,
                  background: 'rgba(245,166,35,0.1)', fontSize: 11,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ color: '#f5a623' }}>
                    📦 {owned.qty} шт. @ ${owned.purchasePrice}
                  </span>
                  <span style={{ fontWeight: 700, color: unrealized !== null && unrealized >= 0 ? '#4CAF50' : '#f44336' }}>
                    {unrealized !== null ? `${unrealized >= 0 ? '+' : ''}$${unrealized.toLocaleString()}` : ''}
                  </span>
                </div>
              )}

              {/* Панель торгівлі — тільки у свій хід */}
              {isMyTurn && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {/* Кількість */}
                  <button onClick={() => setQty(p => ({ ...p, [symbol]: Math.max(1, (p[symbol] ?? 1) - 1) }))} style={smallBtn}>−</button>
                  <input
                    type="number" min={1} value={q}
                    onChange={e => setQty(p => ({ ...p, [symbol]: Math.max(1, parseInt(e.target.value) || 1) }))}
                    style={{
                      width: 42, textAlign: 'center', fontSize: 12, fontWeight: 700,
                      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff', borderRadius: 4, padding: '3px 2px',
                    }}
                  />
                  <button onClick={() => setQty(p => ({ ...p, [symbol]: (p[symbol] ?? 1) + 1 }))} style={smallBtn}>+</button>

                  {/* Купити */}
                  <button
                    disabled={isPending || maxBuy < 1}
                    onClick={() => doBuy(symbol, price)}
                    style={{
                      flex: 1, padding: '5px 0', borderRadius: 5, border: 'none', cursor: maxBuy >= 1 ? 'pointer' : 'default',
                      fontWeight: 700, fontSize: 11,
                      background: maxBuy >= 1 ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.05)',
                      color: maxBuy >= 1 ? '#4CAF50' : 'rgba(255,255,255,0.2)',
                    }}
                    title={maxBuy >= 1 ? `Вартість: $${(price * q).toLocaleString()}` : 'Недостатньо коштів'}
                  >
                    {isPending ? '⏳' : `📈 $${(price * q).toLocaleString()}`}
                  </button>

                  {/* Продати (якщо є) */}
                  {owned && (
                    <button
                      disabled={isPending || q > owned.qty}
                      onClick={() => doSell(symbol, price, owned.qty)}
                      style={{
                        flex: 1, padding: '5px 0', borderRadius: 5, border: 'none', cursor: q <= owned.qty ? 'pointer' : 'default',
                        fontWeight: 700, fontSize: 11,
                        background: q <= owned.qty ? 'rgba(244,67,54,0.18)' : 'rgba(255,255,255,0.05)',
                        color: q <= owned.qty ? '#f44336' : 'rgba(255,255,255,0.2)',
                      }}
                      title={`Продати ${q} шт. → +$${(price * Math.min(q, owned.qty)).toLocaleString()}`}
                    >
                      {isPending ? '⏳' : `📉 $${(price * Math.min(q, owned.qty)).toLocaleString()}`}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Пояснення зміни цін */}
      <div style={{ marginTop: 10, padding: '7px 9px', borderRadius: 5, fontSize: 10, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5, background: 'rgba(255,255,255,0.02)' }}>
        📊 Ціни змінюються коли хтось потрапляє на клітинку РИНОК — може бути бум (×2÷×3) або обвал (×0.5). Слідкуй за графіком!
      </div>
    </div>
  );
};

const smallBtn: React.CSSProperties = {
  width: 22, height: 22, borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.07)', color: '#ccc', fontSize: 13,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0, padding: 0,
};

function symFromName(name: string): string | null {
  if (name?.includes('NovaTech')) return 'NVT';
  if (name?.includes('AgriHolding')) return 'AGH';
  if (name?.includes('EnergyPro')) return 'ENP';
  if (name?.includes('FinBank')) return 'FNB';
  if (name?.includes('StartupX')) return 'STX';
  return null;
}

export default StockBoard;
