import React, { useState, useEffect } from 'react';
import useGameStore from '../../store/gameStore';
import { socketService } from '../../services/socketService';
import { SOCKET_EVENTS } from '../../constants/socketEvents';

// Sparkline — мінімальний SVG-графік
const Sparkline: React.FC<{ prices: number[]; width?: number; height?: number }> = ({
  prices,
  width = 80,
  height = 28,
}) => {
  if (!prices || prices.length < 2) {
    return (
      <svg width={width} height={height}>
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
      </svg>
    );
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const pad = 3;

  const points = prices.map((p, i) => {
    const x = pad + (i / (prices.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (p - min) / range) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const lastPrice = prices[prices.length - 1];
  const firstPrice = prices[0];
  const isUp = lastPrice >= firstPrice;
  const color = isUp ? '#4CAF50' : '#f44336';

  const fillPoints = [
    `${pad},${height - pad}`,
    ...points,
    `${(width - pad).toFixed(1)},${height - pad}`,
  ].join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polygon points={fillPoints} fill={`${color}22`} />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={parseFloat(points[points.length - 1].split(',')[0])}
        cy={parseFloat(points[points.length - 1].split(',')[1])}
        r={2.5}
        fill={color}
      />
    </svg>
  );
};

// Маппінг назви активу → символ акції
const getStockSymbol = (assetName: string): string | null => {
  if (assetName.includes('NovaTech')) return 'NVT';
  if (assetName.includes('AgriHolding') || assetName.includes('Золоте поле')) return 'AGH';
  if (assetName.includes('EnergyPro')) return 'ENP';
  if (assetName.includes('FinBank')) return 'FNB';
  if (assetName.includes('StartupX')) return 'STX';
  return null;
};

interface TradeNotif {
  type: 'success' | 'error';
  msg: string;
}

const StockBoard: React.FC = () => {
  const { game, currentPlayer, playerId, buyStock, sellStock } = useGameStore();

  // Стан торгівлі: обраний символ + кількість
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [tradeNotif, setTradeNotif] = useState<TradeNotif | null>(null);
  const [pending, setPending] = useState(false);

  // Слухаємо stock-bought / stock-sold від сервера
  useEffect(() => {
    const onBought = (data: any) => {
      setPending(false);
      if (data.playerId === playerId) {
        setTradeNotif({ type: 'success', msg: `✅ Куплено ${data.quantity}x ${data.symbol} @ $${data.pricePerShare}` });
        setTimeout(() => setTradeNotif(null), 4000);
        setSelectedSymbol(null);
        setQuantity(1);
      }
    };
    const onSold = (data: any) => {
      setPending(false);
      if (data.playerId === playerId) {
        const profitStr = data.profit >= 0 ? `+$${data.profit}` : `-$${Math.abs(data.profit)}`;
        setTradeNotif({ type: 'success', msg: `💰 Продано ${data.quantity}x ${data.symbol} — ${profitStr}` });
        setTimeout(() => setTradeNotif(null), 4000);
        setSelectedSymbol(null);
        setQuantity(1);
      }
    };
    const onError = (data: any) => {
      setPending(false);
      setTradeNotif({ type: 'error', msg: `❌ ${data.message}` });
      setTimeout(() => setTradeNotif(null), 4000);
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

  const stockMarket = (game as any)?.stockMarket;
  if (!stockMarket) {
    return (
      <div style={{ padding: 16, color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center' }}>
        📊 Ринок ще не ініціалізований
      </div>
    );
  }

  // Акції у поточного гравця: { [symbol]: { qty, purchasePrice, multiplier, assetId } }
  const ownedMap: Record<string, { qty: number; purchasePrice: number; multiplier: number }> = {};
  if (currentPlayer?.finances?.assets) {
    currentPlayer.finances.assets
      .filter((a: any) => a.type === 'stocks')
      .forEach((a: any) => {
        // пробуємо symbol напряму (нова структура) або маппінг по назві
        const sym = a.symbol || getStockSymbol(a.name);
        if (sym) {
          ownedMap[sym] = {
            qty: a.quantity || 1,
            purchasePrice: a.cost || 0,
            multiplier: a.currentMultiplier ?? 1.0,
          };
        }
      });
  }

  const stocks = Object.values(stockMarket) as Array<{
    symbol: string;
    name: string;
    icon: string;
    pricePerShare: number;
    basePrice: number;
    priceHistory: number[];
  }>;

  const playerCash = currentPlayer?.finances?.cash ?? 0;
  const isMyTurn = game?.currentPlayer === playerId;

  const handleBuy = (symbol: string) => {
    if (!playerId || pending) return;
    setPending(true);
    buyStock(playerId, symbol, quantity);
  };

  const handleSell = (symbol: string) => {
    if (!playerId || pending) return;
    const owned = ownedMap[symbol];
    if (!owned) return;
    setPending(true);
    // продаємо вказану кількість (але не більше ніж є)
    const sellQty = Math.min(quantity, owned.qty);
    sellStock(playerId, symbol, sellQty);
  };

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Заголовок */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 0 10px', borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: 10
      }}>
        <span style={{ fontSize: 16 }}>📈</span>
        <span style={{ color: '#FFD700', fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
          ФОНДОВИЙ РИНОК
        </span>
        {!isMyTurn && (
          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
            (не ваш хід)
          </span>
        )}
      </div>

      {/* Повідомлення про угоду */}
      {tradeNotif && (
        <div style={{
          padding: '8px 12px', borderRadius: 6, marginBottom: 10, fontSize: 12, fontWeight: 600,
          background: tradeNotif.type === 'success' ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.15)',
          border: `1px solid ${tradeNotif.type === 'success' ? 'rgba(76,175,80,0.4)' : 'rgba(244,67,54,0.4)'}`,
          color: tradeNotif.type === 'success' ? '#4CAF50' : '#f44336',
        }}>
          {tradeNotif.msg}
        </div>
      )}

      {/* Список акцій */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {stocks.map((stock) => {
          const pct = ((stock.pricePerShare - stock.basePrice) / stock.basePrice) * 100;
          const isUp = stock.pricePerShare >= stock.basePrice;
          const owned = ownedMap[stock.symbol];
          const currentValue = owned ? stock.pricePerShare * owned.qty : null;
          const profit = owned ? (stock.pricePerShare - owned.purchasePrice) * owned.qty : null;
          const isSelected = selectedSymbol === stock.symbol;
          const maxCanBuy = Math.floor(playerCash / stock.pricePerShare);

          return (
            <div
              key={stock.symbol}
              onClick={() => setSelectedSymbol(isSelected ? null : stock.symbol)}
              style={{
                background: isSelected
                  ? 'rgba(245,166,35,0.12)'
                  : owned
                    ? 'rgba(245,166,35,0.06)'
                    : 'rgba(255,255,255,0.04)',
                border: isSelected
                  ? '1px solid rgba(245,166,35,0.5)'
                  : owned
                    ? '1px solid rgba(245,166,35,0.25)'
                    : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '8px 10px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {/* Рядок: іконка / ціна / % / sparkline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Іконка + символ */}
                <div style={{ width: 38, flexShrink: 0 }}>
                  <div style={{ fontSize: 14 }}>{stock.icon}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                    {stock.symbol}
                  </div>
                </div>

                {/* Назва + ціна */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {stock.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                      ${stock.pricePerShare}
                    </span>
                    {pct !== 0 && (
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        color: isUp ? '#4CAF50' : '#f44336',
                        background: isUp ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.15)',
                        padding: '1px 5px', borderRadius: 4
                      }}>
                        {isUp ? '▲' : '▼'}{Math.abs(pct).toFixed(0)}%
                      </span>
                    )}
                    {pct === 0 && (
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>= база</span>
                    )}
                  </div>
                  {/* Позиція гравця */}
                  {owned && (
                    <div style={{ fontSize: 10, color: '#f5a623', marginTop: 2 }}>
                      Маєте: <strong>{owned.qty} шт.</strong>
                      {' · '}
                      <span style={{ color: profit !== null && profit >= 0 ? '#4CAF50' : '#f44336' }}>
                        {profit !== null && profit >= 0 ? '+' : ''}${profit?.toLocaleString()}
                      </span>
                      {' · '}${currentValue?.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Sparkline */}
                <div style={{ flexShrink: 0 }}>
                  <Sparkline prices={stock.priceHistory} width={66} height={26} />
                </div>
              </div>

              {/* ─── Панель торгівлі (розкривається при кліку) ─── */}
              {isSelected && (
                <div
                  style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)' }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Кількість */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', minWidth: 58 }}>Кількість:</span>
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      style={btnSmall}
                    >−</button>
                    <input
                      type="number"
                      value={quantity}
                      min={1}
                      max={owned ? owned.qty : maxCanBuy || 1}
                      onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{
                        width: 48, textAlign: 'center', fontSize: 13, fontWeight: 700,
                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff', borderRadius: 5, padding: '3px 4px',
                      }}
                    />
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      style={btnSmall}
                    >+</button>
                    {!owned && maxCanBuy > 0 && (
                      <button
                        onClick={() => setQuantity(maxCanBuy)}
                        style={{ ...btnSmall, fontSize: 9, padding: '3px 6px', marginLeft: 2 }}
                      >MAX</button>
                    )}
                    {owned && (
                      <button
                        onClick={() => setQuantity(owned.qty)}
                        style={{ ...btnSmall, fontSize: 9, padding: '3px 6px', marginLeft: 2 }}
                      >ALL</button>
                    )}
                  </div>

                  {/* Сума */}
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>
                    Вартість: <strong style={{ color: '#fff' }}>${(quantity * stock.pricePerShare).toLocaleString()}</strong>
                    {!owned && maxCanBuy > 0 && (
                      <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 6 }}>
                        (макс. {maxCanBuy} шт.)
                      </span>
                    )}
                  </div>

                  {/* Кнопки */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      disabled={!isMyTurn || pending || quantity < 1 || playerCash < quantity * stock.pricePerShare}
                      onClick={() => handleBuy(stock.symbol)}
                      style={{
                        flex: 1, padding: '6px 0', borderRadius: 6, border: 'none',
                        fontWeight: 700, fontSize: 12, cursor: 'pointer',
                        background: (!isMyTurn || pending || playerCash < quantity * stock.pricePerShare)
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(76,175,80,0.25)',
                        color: (!isMyTurn || pending || playerCash < quantity * stock.pricePerShare)
                          ? 'rgba(255,255,255,0.25)'
                          : '#4CAF50',
                        border: '1px solid',
                        borderColor: (!isMyTurn || pending || playerCash < quantity * stock.pricePerShare)
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(76,175,80,0.4)',
                      }}
                    >
                      {pending ? '⏳' : '📈 Купити'}
                    </button>

                    {owned && (
                      <button
                        disabled={!isMyTurn || pending || quantity > owned.qty}
                        onClick={() => handleSell(stock.symbol)}
                        style={{
                          flex: 1, padding: '6px 0', borderRadius: 6, border: 'none',
                          fontWeight: 700, fontSize: 12, cursor: 'pointer',
                          background: (!isMyTurn || pending || quantity > owned.qty)
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(244,67,54,0.2)',
                          color: (!isMyTurn || pending || quantity > owned.qty)
                            ? 'rgba(255,255,255,0.25)'
                            : '#f44336',
                          border: '1px solid',
                          borderColor: (!isMyTurn || pending || quantity > owned.qty)
                            ? 'rgba(255,255,255,0.1)'
                            : 'rgba(244,67,54,0.35)',
                        }}
                      >
                        {pending ? '⏳' : '📉 Продати'}
                      </button>
                    )}
                  </div>

                  {!isMyTurn && (
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 6, textAlign: 'center' }}>
                      Торгівля доступна лише у ваш хід
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Легенда */}
      <div style={{
        marginTop: 10, padding: '8px 10px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 6, fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        lineHeight: 1.6
      }}>
        <span style={{ color: '#4CAF50' }}>▲ Зростання</span>
        {' · '}
        <span style={{ color: '#f44336' }}>▼ Падіння</span>
        {' · '}Натисніть на акцію для торгівлі
      </div>
    </div>
  );
};

const btnSmall: React.CSSProperties = {
  width: 24, height: 24, borderRadius: 5, border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 14,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
};

export default StockBoard;
