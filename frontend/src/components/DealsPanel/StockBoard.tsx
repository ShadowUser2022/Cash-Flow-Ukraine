import React from 'react';
import useGameStore from '../../store/gameStore';

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

  // Fill area under curve
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
      {/* Остання точка */}
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

const StockBoard: React.FC = () => {
  const { game, currentPlayer } = useGameStore();

  const stockMarket = (game as any)?.stockMarket;
  if (!stockMarket) {
    return (
      <div style={{ padding: 16, color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center' }}>
        📊 Ринок ще не ініціалізований
      </div>
    );
  }

  // Визначаємо які акції є у поточного гравця
  const ownedMap: Record<string, { qty: number; purchasePrice: number; multiplier: number }> = {};
  if (currentPlayer?.finances?.assets) {
    currentPlayer.finances.assets
      .filter((a: any) => a.type === 'stocks')
      .forEach((a: any) => {
        const sym = getStockSymbol(a.name);
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

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 0 10px', borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: 10
      }}>
        <span style={{ fontSize: 16 }}>📈</span>
        <span style={{ color: '#FFD700', fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
          ФОНДОВИЙ РИНОК
        </span>
      </div>

      {/* Таблиця акцій */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {stocks.map((stock) => {
          const pct = ((stock.pricePerShare - stock.basePrice) / stock.basePrice) * 100;
          const isUp = stock.pricePerShare >= stock.basePrice;
          const owned = ownedMap[stock.symbol];
          const sellValue = owned ? Math.floor(owned.purchasePrice * (owned.multiplier ?? 1)) : null;

          return (
            <div key={stock.symbol} style={{
              background: owned
                ? 'rgba(245,166,35,0.08)'
                : 'rgba(255,255,255,0.04)',
              border: owned
                ? '1px solid rgba(245,166,35,0.3)'
                : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '7px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              {/* Іконка + символ */}
              <div style={{ width: 38, flexShrink: 0 }}>
                <div style={{ fontSize: 14 }}>{stock.icon}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                  {stock.symbol}
                </div>
              </div>

              {/* Назва + ціна */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.85)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
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
                {/* Якщо є у гравця */}
                {owned && (
                  <div style={{ fontSize: 10, color: '#f5a623', marginTop: 2 }}>
                    ✅ Куплено: ${owned.purchasePrice.toLocaleString()}
                    {sellValue && sellValue !== owned.purchasePrice && (
                      <span style={{ color: sellValue > owned.purchasePrice ? '#4CAF50' : '#f44336', marginLeft: 4 }}>
                        → ${sellValue.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Sparkline */}
              <div style={{ flexShrink: 0 }}>
                <Sparkline prices={stock.priceHistory} width={72} height={28} />
                <div style={{
                  fontSize: 9, color: 'rgba(255,255,255,0.3)',
                  textAlign: 'center', marginTop: 1
                }}>
                  {stock.priceHistory.length} точок
                </div>
              </div>
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
        {' · '}Ціна змінюється при ринкових подіях
      </div>
    </div>
  );
};

export default StockBoard;
