import React, { useState, useEffect } from 'react';
import useGameStore from '../../store/gameStore';
import { socketService } from '../../services/socketService';
import { useDeals } from '../../hooks/useDeals';
import type { Deal, Player, Asset } from '../../types';
import StockBoard from './StockBoard';
import './DealsPanel.css';

// Локальний продаж активу (offline / DEV режим — без сервера)
function applySellLocally(
  game: any,
  playerId: string,
  asset: Asset,
  sellPrice: number,
  setGame: (g: any) => void,
  setCurrentPlayer: (p: any) => void
) {
  const mortgage = (asset as any).mortgage ?? 0;
  const netProceeds = sellPrice - mortgage;
  if (netProceeds < 0) return { success: false, message: 'Іпотека перевищує ціну продажу' };

  // Мутуємо клон гри
  const updatedGame = JSON.parse(JSON.stringify(game));
  const player = updatedGame.players.find((p: any) => p.id === playerId);
  if (!player) return { success: false, message: 'Гравця не знайдено' };

  player.finances.cash += netProceeds;
  if (asset.cashFlow > 0) {
    player.finances.passiveIncome = Math.max(0, player.finances.passiveIncome - asset.cashFlow);
  }
  player.finances.assets = player.finances.assets.filter((a: any) => a.id !== asset.id);

  setGame(updatedGame);
  setCurrentPlayer(player);
  return { success: true, netProceeds };
}

interface DealsPanelProps {
  playerId: string;
}

export const DealsPanel: React.FC<DealsPanelProps> = ({ playerId }) => {
  const {
    game,
    addNotification
  } = useGameStore();
  const { buyDeal: executeBuyDeal } = useDeals();

  // Derive available deals from game.deals (works for both online & offline)
  const availableDeals = game?.deals?.filter((d: Deal) => d.isAvailable !== false) || [];
  
  // Вкладки: deals | assets | market
  const [activeTab, setActiveTab] = useState<'deals' | 'assets' | 'market'>('deals');

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [sellModal, setSellModal] = useState<{
    isOpen: boolean;
    asset: Asset | null;
  }>({ isOpen: false, asset: null });
  const [lastSoldInfo, setLastSoldInfo] = useState<{
    assetName: string;
    amountReceived: number;
    profit: number;
  } | null>(null);
  const [negotiationModal, setNegotiationModal] = useState<{
    isOpen: boolean;
    deal: Deal | null;
    targetPlayer: Player | null;
  }>({
    isOpen: false,
    deal: null,
    targetPlayer: null
  });

  // Listen for deal-sold confirmation from server
  useEffect(() => {
    const handleDealSold = (data: any) => {
      setLastSoldInfo({
        assetName: data.assetName || data.assetId || 'Актив',
        amountReceived: data.amountReceived || 0,
        profit: data.profit || 0,
      });
      setSellModal({ isOpen: false, asset: null });
      setTimeout(() => setLastSoldInfo(null), 5000);
    };
    // Слухаємо помилки від сервера (напр. "Гру не знайдено" в offline режимі)
    const handleServerError = (data: any) => {
      addNotification({ type: 'error', title: '❌ Помилка сервера', message: data?.message || 'Невідома помилка' });
      setSellModal({ isOpen: false, asset: null });
      setLastSoldInfo(null);
    };
    socketService.onGameEvent('deal-sold' as any, handleDealSold);
    socketService.onGameEvent('error' as any, handleServerError);
    return () => {
      socketService.offGameEvent('deal-sold' as any, handleDealSold);
      socketService.offGameEvent('error' as any, handleServerError);
    };
  }, []);

  const currentPlayer = game?.players.find((p: Player) => p.id === playerId);
  
  if (!game || !currentPlayer) {
    return (
      <div className="deals-panel">
        <div className="card warning-card">
          Loading deals...
        </div>
      </div>
    );
  }

  const canAffordDeal = (deal: Deal) => {
    const downPayment = deal.downPayment || deal.cost;
    return currentPlayer.finances.cash >= downPayment;
  };

  const handleBuyDeal = async (deal: Deal) => {
    if (!canAffordDeal(deal)) {
      addNotification({
        type: 'error',
        title: 'Недостатньо коштів',
        message: `Потрібно $${(deal.downPayment || deal.cost).toLocaleString()} для «${deal.title}»`
      });
      return;
    }
    await executeBuyDeal(deal.id);
  };

  const handleSellAsset = (asset: Asset) => {
    // Open confirmation modal with sell price info
    setSellModal({ isOpen: true, asset });
  };

  const confirmSellAsset = () => {
    if (!game || !sellModal.asset) return;
    const asset = sellModal.asset;
    const multiplier = (asset as any).currentMultiplier ?? 1.0;
    const rawSellPrice = Math.floor(asset.cost * multiplier);
    const mortgage = (asset as any).mortgage ?? 0;
    const netProceeds = rawSellPrice - mortgage;
    const purchasePrice = (asset as any).purchasePrice ?? asset.cost;
    const profit = netProceeds - purchasePrice;

    setSellModal({ isOpen: false, asset: null });

    // Офлайн / DEV режим — застосовуємо локально, без сервера
    const isOffline = game.id === 'OFFLINE-MODE' || game.id === 'DEV-MODE';
    if (isOffline) {
      const { setGame, setCurrentPlayer } = useGameStore.getState();
      const result = applySellLocally(game, currentPlayer!.id, asset, rawSellPrice, setGame, setCurrentPlayer);
      if (result.success) {
        setLastSoldInfo({ assetName: asset.name, amountReceived: result.netProceeds!, profit });
        addNotification({ type: 'success', title: '✅ Продано!', message: `"${asset.name}" — +$${result.netProceeds!.toLocaleString()}` });
        setTimeout(() => setLastSoldInfo(null), 5000);
      } else {
        addNotification({ type: 'error', title: 'Помилка', message: result.message! });
      }
      return;
    }

    // Онлайн режим — через сервер
    setLastSoldInfo({ assetName: asset.name, amountReceived: 0, profit: 0 });
    try {
      socketService.sellAsset(game.id, currentPlayer!.id, asset.id, rawSellPrice);
      addNotification({ type: 'info', title: '⏳ Продаємо...', message: `"${asset.name}" за $${rawSellPrice.toLocaleString()}` });
    } catch (err) {
      addNotification({ type: 'error', title: 'Помилка', message: 'Немає підключення до сервера' });
      setLastSoldInfo(null);
    }
  };

  const getSellPrice = (asset: Asset): number => {
    const multiplier = (asset as any).currentMultiplier ?? 1.0;
    return Math.floor(asset.cost * multiplier);
  };

  const getMultiplierLabel = (asset: Asset): string | null => {
    const m = (asset as any).currentMultiplier;
    if (!m || m === 1.0) return null;
    return m > 1.0 ? `🚀 ×${m} (Бум!)` : `📉 ×${m} (Обвал)`;
  };

  const handleNegotiate = (deal: Deal) => {
    setNegotiationModal({
      isOpen: true,
      deal,
      targetPlayer: null
    });
  };

  const submitNegotiation = (_targetPlayerId: string, _offer: number) => {
    if (!negotiationModal.deal) return;

    // This would need to be implemented in the socket service
    setNegotiationModal({ isOpen: false, deal: null, targetPlayer: null });
    addNotification({
      type: 'info',
      title: 'Пропозиція відправлена',
      message: `Пропозицію по переговорах відправлено для ${negotiationModal.deal.title}`
    });
  };

  const getDealIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'real_estate':
        return '🏠';
      case 'stocks':
        return '📈';
      case 'business':
        return '🏢';
      default:
        return '💼';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Стилі вкладок
  const tabStyle = (tab: string) => ({
    flex: 1, padding: '7px 4px', fontSize: 12, fontWeight: 600,
    borderRadius: 6, border: 'none', cursor: 'pointer',
    background: activeTab === tab ? 'rgba(245,166,35,0.25)' : 'rgba(255,255,255,0.06)',
    color: activeTab === tab ? '#FFD700' : 'rgba(255,255,255,0.55)',
    transition: 'all 0.15s',
  } as React.CSSProperties);

  return (
    <div className="deals-panel">
      {/* Верхня інфо-панель */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 10px', background: 'rgba(255,255,255,0.04)',
        borderRadius: 8, marginBottom: 10, fontSize: 12
      }}>
        <span style={{ color: 'rgba(255,255,255,0.6)' }}>
          💵 {formatCurrency(currentPlayer.finances.cash)}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>
          {currentPlayer.finances.assets.length} активів · {availableDeals.length} угод
        </span>
      </div>

      {/* Вкладки */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        <button style={tabStyle('deals')} onClick={() => setActiveTab('deals')}>💼 Угоди</button>
        <button style={tabStyle('assets')} onClick={() => setActiveTab('assets')}>🏦 Активи</button>
        <button style={tabStyle('market')} onClick={() => setActiveTab('market')}>📈 Ринок</button>
      </div>

      {/* ─── ВКЛАДКА: РИНОК (StockBoard) ─── */}
      {activeTab === 'market' && <StockBoard />}

      {/* ─── ВКЛАДКА: УГОДИ ─── */}
      {activeTab === 'deals' && <div className="deals-grid">
        {availableDeals.map((deal: Deal) => (
          <div 
            key={deal.id} 
            className={`card deal-card card-clickable ${selectedDeal?.id === deal.id ? 'active' : ''} ${canAffordDeal(deal) ? '' : 'disabled'}`}
            onClick={() => setSelectedDeal(deal)}
          >
            <div className="deal-header">
              <span className="deal-icon">{getDealIcon(deal.category)}</span>
              <h4 className="deal-title">{deal.title}</h4>
            </div>
            
            <div className="deal-info">
              <div className="deal-row">
                <span>Cost:</span>
                <span className="deal-value">{formatCurrency(deal.cost)}</span>
              </div>
              {deal.downPayment && (
                <div className="deal-row">
                  <span>Down Payment:</span>
                  <span className="deal-value">{formatCurrency(deal.downPayment)}</span>
                </div>
              )}
              {deal.cashFlow && (
                <div className="deal-row">
                  <span>Monthly Cash Flow:</span>
                  <span className={`deal-value ${deal.cashFlow >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(deal.cashFlow)}
                  </span>
                </div>
              )}
              {deal.description && (
                <p className="deal-description">{deal.description}</p>
              )}
            </div>

            <div className="deal-actions">
              <button 
                className={`deal-btn buy-btn ${canAffordDeal(deal) ? '' : 'disabled'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyDeal(deal);
                }}
                disabled={!canAffordDeal(deal)}
              >
                Buy
              </button>
              <button 
                className="deal-btn negotiate-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNegotiate(deal);
                }}
              >
                Negotiate
              </button>
            </div>
          </div>
        ))}
      </div>}

      {/* ─── ВКЛАДКА: АКТИВИ ─── */}
      {activeTab === 'assets' && (
        <div>
          {/* Last sold notification */}
          {lastSoldInfo && lastSoldInfo.amountReceived > 0 && (
            <div style={{
              border: '1px solid #4CAF50', background: 'rgba(76,175,80,0.1)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 10
            }}>
              <div style={{ color: '#4CAF50', fontWeight: 700, marginBottom: 4 }}>✅ Актив продано!</div>
              <div style={{ fontSize: 13, color: '#ddd' }}>{lastSoldInfo.assetName}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                Отримано: <strong style={{ color: '#4CAF50' }}>{formatCurrency(lastSoldInfo.amountReceived)}</strong>
                {' · '}
                <span style={{ color: lastSoldInfo.profit >= 0 ? '#4CAF50' : '#F44336' }}>
                  {lastSoldInfo.profit >= 0 ? '+' : ''}{formatCurrency(lastSoldInfo.profit)}
                </span>
              </div>
            </div>
          )}

          {currentPlayer.finances.assets.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '24px 0', fontSize: 13 }}>
              У вас ще немає активів.<br />Купуйте угоди у вкладці "Угоди".
            </div>
          ) : (
            <div className="assets-grid">
              {currentPlayer.finances.assets.map((asset: Asset) => {
                const sellPrice = getSellPrice(asset);
                const multiplierLabel = getMultiplierLabel(asset);
                const mortgage = (asset as any).mortgage || 0;
                const netProceeds = sellPrice - mortgage;
                return (
                  <div key={asset.id} className="card asset-card">
                    <div className="asset-header">
                      <span className="asset-icon">{getDealIcon(asset.type)}</span>
                      <h5>{asset.name}</h5>
                    </div>
                    {multiplierLabel && (
                      <div style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '0.8em', marginBottom: 4 }}>
                        {multiplierLabel}
                      </div>
                    )}
                    <div className="asset-info">
                      <div className="asset-row">
                        <span>Дохід/міс:</span>
                        <span className={`asset-value ${asset.cashFlow >= 0 ? 'positive' : 'negative'}`}>
                          {formatCurrency(asset.cashFlow)}
                        </span>
                      </div>
                      <div className="asset-row">
                        <span>Ціна покупки:</span>
                        <span className="asset-value">{formatCurrency(asset.cost)}</span>
                      </div>
                      <div className="asset-row">
                        <span>Ціна продажу:</span>
                        <span className="asset-value" style={{ color: sellPrice > asset.cost ? '#4CAF50' : sellPrice < asset.cost ? '#F44336' : 'inherit' }}>
                          {formatCurrency(sellPrice)}
                        </span>
                      </div>
                      {mortgage > 0 && (
                        <div className="asset-row">
                          <span>Іпотека:</span>
                          <span className="asset-value negative">−{formatCurrency(mortgage)}</span>
                        </div>
                      )}
                      {mortgage > 0 && (
                        <div className="asset-row" style={{ fontWeight: 'bold' }}>
                          <span>Чисто на руки:</span>
                          <span className={`asset-value ${netProceeds >= 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(netProceeds)}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      className="deal-btn sell-btn"
                      onClick={() => handleSellAsset(asset)}
                      disabled={netProceeds < 0}
                      title={netProceeds < 0 ? 'Іпотека перевищує ціну продажу' : `Продати за ${formatCurrency(sellPrice)}`}
                    >
                      💸 Продати
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sell Confirmation Modal */}
      {sellModal.isOpen && sellModal.asset && (
        <div className="modal-overlay">
          <div className="card modal-card" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h3>💸 Продати актив</h3>
              <button className="close-btn" onClick={() => setSellModal({ isOpen: false, asset: null })}>✕</button>
            </div>
            <div className="modal-content">
              <p><strong>{sellModal.asset.name}</strong></p>
              {(() => {
                const a = sellModal.asset!;
                const sp = getSellPrice(a);
                const ml = getMultiplierLabel(a);
                const mort = (a as any).mortgage || 0;
                const net = sp - mort;
                const purchaseP = (a as any).purchasePrice || a.cost;
                const profit = net - purchaseP;
                return (
                  <div style={{ fontSize: '0.9em', lineHeight: 1.7 }}>
                    {ml && <p style={{ color: '#FFD700' }}>{ml}</p>}
                    <p>Ціна продажу: <strong>{formatCurrency(sp)}</strong></p>
                    {mort > 0 && <p>Залишок іпотеки: <strong style={{ color: '#F44336' }}>−{formatCurrency(mort)}</strong></p>}
                    <p>Отримаєте: <strong style={{ color: net >= 0 ? '#4CAF50' : '#F44336' }}>{formatCurrency(net)}</strong></p>
                    <p>Прибуток/збиток: <strong style={{ color: profit >= 0 ? '#4CAF50' : '#F44336' }}>
                      {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                    </strong></p>
                    <p style={{ color: '#aaa', fontSize: '0.85em' }}>⚠️ Пасивний дохід зменшиться на {formatCurrency(a.cashFlow)}/міс</p>
                  </div>
                );
              })()}
            </div>
            <div className="modal-actions" style={{ display: 'flex', gap: 8, padding: '12px 0 0' }}>
              <button className="deal-btn cancel-btn" onClick={() => setSellModal({ isOpen: false, asset: null })}>
                Скасувати
              </button>
              <button className="deal-btn sell-btn" onClick={confirmSellAsset}>
                ✅ Підтвердити продаж
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Negotiation Modal */}
      {negotiationModal.isOpen && negotiationModal.deal && (
        <div className="modal-overlay">
          <div className="card modal-card negotiation-modal">
            <div className="modal-header">
              <h3>Negotiate Deal: {negotiationModal.deal.title}</h3>
              <button 
                className="close-btn"
                onClick={() => setNegotiationModal({ isOpen: false, deal: null, targetPlayer: null })}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="deal-summary">
                <p>Original Price: {formatCurrency(negotiationModal.deal.cost)}</p>
                {negotiationModal.deal.downPayment && (
                  <p>Down Payment: {formatCurrency(negotiationModal.deal.downPayment)}</p>
                )}
                {negotiationModal.deal.cashFlow && (
                  <p>Monthly Cash Flow: {formatCurrency(negotiationModal.deal.cashFlow)}</p>
                )}
              </div>

              <div className="negotiation-form">
                <label>Select Player to Negotiate With:</label>
                <select 
                  value={negotiationModal.targetPlayer?.id || ''}
                  onChange={(e) => {
                    const player = game.players.find((p: Player) => p.id === e.target.value);
                    setNegotiationModal(prev => ({ ...prev, targetPlayer: player || null }));
                  }}
                >
                  <option value="">Select a player...</option>
                  {game.players
                    .filter((p: Player) => p.id !== playerId)
                    .map((player: Player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))
                  }
                </select>

                <label>Your Offer:</label>
                <input 
                  type="number" 
                  placeholder="Enter your offer..."
                  min="0"
                  max={negotiationModal.deal.cost}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && negotiationModal.targetPlayer) {
                      const offer = parseInt((e.target as HTMLInputElement).value);
                      if (offer > 0) {
                        submitNegotiation(negotiationModal.targetPlayer.id, offer);
                      }
                    }
                  }}
                />

                <div className="modal-actions">
                  <button 
                    className="deal-btn cancel-btn"
                    onClick={() => setNegotiationModal({ isOpen: false, deal: null, targetPlayer: null })}
                  >
                    Cancel
                  </button>
                  <button 
                    className="deal-btn negotiate-btn"
                    onClick={() => {
                      const input = document.querySelector('.negotiation-modal input[type="number"]') as HTMLInputElement;
                      const offer = parseInt(input?.value || '0');
                      if (offer > 0 && negotiationModal.targetPlayer) {
                        submitNegotiation(negotiationModal.targetPlayer.id, offer);
                      }
                    }}
                    disabled={!negotiationModal.targetPlayer}
                  >
                    Send Offer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealsPanel;
