import React, { useState } from 'react';
import useGameStore from '../../store/gameStore';
import type { Deal, Player, Asset } from '../../types';
import './DealsPanel.css';

interface DealsPanelProps {
  playerId: string;
}

export const DealsPanel: React.FC<DealsPanelProps> = ({ playerId }) => {
  const { 
    game, 
    currentDeals,
    addNotification 
  } = useGameStore();
  
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [negotiationModal, setNegotiationModal] = useState<{
    isOpen: boolean;
    deal: Deal | null;
    targetPlayer: Player | null;
  }>({
    isOpen: false,
    deal: null,
    targetPlayer: null
  });

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

  const handleBuyDeal = (deal: Deal) => {
    if (!canAffordDeal(deal)) {
      addNotification({
        type: 'error',
        title: 'Недостатньо коштів',
        message: `Недостатньо коштів для ${deal.title}`
      });
      return;
    }

    // This would be handled by socketService.buyDeal() in the parent component
    addNotification({
      type: 'success',
      title: 'Угода придбана',
      message: `Успішно придбано ${deal.title}`
    });
  };

  const handleSellAsset = (asset: Asset) => {
    // This would need to be implemented in the socket service
    addNotification({
      type: 'success',
      title: 'Актив продано',
      message: `Успішно продано ${asset.name}`
    });
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

  return (
    <div className="deals-panel">
      <div className="card stats-card">
        <h3>💰 Market Deals</h3>
        <div className="deals-stats">
          <span>Available: {currentDeals.length}</span>
          <span>Your Cash: {formatCurrency(currentPlayer.finances.cash)}</span>
        </div>
      </div>

      <div className="deals-grid">
        {currentDeals.map((deal: Deal) => (
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
      </div>

      {currentPlayer.finances.assets.length > 0 && (
        <div className="player-assets">
          <div className="card stats-card">
            <h4>Your Assets</h4>
          </div>
          <div className="assets-grid">
            {currentPlayer.finances.assets.map((asset: Asset) => (
              <div key={asset.id} className="card asset-card">
                <div className="asset-header">
                  <span className="asset-icon">{getDealIcon(asset.type)}</span>
                  <h5>{asset.name}</h5>
                </div>
                <div className="asset-info">
                  <div className="asset-row">
                    <span>Monthly Income:</span>
                    <span className={`asset-value ${asset.cashFlow >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(asset.cashFlow)}
                    </span>
                  </div>
                  <div className="asset-row">
                    <span>Purchase Price:</span>
                    <span className="asset-value">{formatCurrency(asset.cost)}</span>
                  </div>
                </div>
                <button 
                  className="deal-btn sell-btn"
                  onClick={() => handleSellAsset(asset)}
                >
                  Sell
                </button>
              </div>
            ))}
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
