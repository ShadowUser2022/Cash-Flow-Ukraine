import React, { useState } from 'react';
import './AuctionModal.css';

interface AuctionDeal {
  id: string;
  title: string;
  description: string;
  category: string;
  cost: number;
  downPayment: number;
  cashFlow: number;
}

interface AuctionBids {
  [playerId: string]: number | 'pass';
}

interface Auction {
  dealId: string;
  deal: AuctionDeal;
  initiatorId: string;
  bids: AuctionBids;
  pendingPlayers: string[];
  status: 'active' | 'complete';
}

interface AuctionModalProps {
  show: boolean;
  auction: Auction | null;
  playerId: string;
  playerCash: number;
  players: { id: string; name: string }[];
  onBid: (amount: number) => void;
  onPass: () => void;
}

const AuctionModal: React.FC<AuctionModalProps> = ({
  show,
  auction,
  playerId,
  playerCash,
  players,
  onBid,
  onPass,
}) => {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [hasActed, setHasActed] = useState(false);

  // Скидаємо стан коли з'являється новий аукціон
  React.useEffect(() => {
    if (show && auction) {
      setBidAmount(String(auction.deal.downPayment || 0));
      setHasActed(false);
    }
  }, [show, auction?.dealId]);

  if (!show || !auction) return null;

  const deal = auction.deal;
  const basePrice = deal.downPayment || deal.cost || 0;
  const alreadyActed = playerId in auction.bids || hasActed;
  const isPending = auction.pendingPlayers.includes(playerId);
  const canAct = isPending && !alreadyActed;

  const numericBid = parseInt(bidAmount) || 0;
  const canAfford = playerCash >= numericBid && numericBid >= basePrice;

  const handleBid = () => {
    if (!canAfford) return;
    onBid(numericBid);
    setHasActed(true);
  };

  const handlePass = () => {
    onPass();
    setHasActed(true);
  };

  // Підказка по категорії
  const categoryLabel: Record<string, string> = {
    real_estate: '🏠 Нерухомість',
    business: '🏭 Бізнес',
    stocks: '📈 Акції',
    commodities: '🌾 Сировина',
  };

  return (
    <div className="auction-overlay">
      <div className="auction-modal">
        {/* Header */}
        <div className="auction-header">
          <span className="auction-badge">🏗️ ВЕЛИКА УГОДА</span>
          <h2 className="auction-title">{deal.title}</h2>
          <p className="auction-category">{categoryLabel[deal.category] || deal.category}</p>
        </div>

        {/* Deal Info */}
        <div className="auction-deal-info">
          <p className="auction-description">{deal.description}</p>
          <div className="auction-stats">
            <div className="auction-stat">
              <span className="stat-label">💰 Базова ціна</span>
              <span className="stat-value">${basePrice.toLocaleString()}</span>
            </div>
            <div className="auction-stat">
              <span className="stat-label">📈 Cash Flow / місяць</span>
              <span className="stat-value green">+${(deal.cashFlow || 0).toLocaleString()}</span>
            </div>
            <div className="auction-stat">
              <span className="stat-label">💵 Ваша готівка</span>
              <span className={`stat-value ${playerCash >= basePrice ? 'green' : 'red'}`}>
                ${playerCash.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Players Status */}
        <div className="auction-players">
          <h4>Статус гравців:</h4>
          <div className="auction-players-list">
            {players.map(player => {
              const bid = auction.bids[player.id];
              const isPend = auction.pendingPlayers.includes(player.id);
              let statusIcon = '⏳';
              let statusText = 'Очікує...';
              let statusClass = 'pending';

              if (bid === 'pass') {
                statusIcon = '🚫';
                statusText = 'Пас';
                statusClass = 'passed';
              } else if (typeof bid === 'number') {
                statusIcon = '💰';
                statusText = `$${bid.toLocaleString()}`;
                statusClass = 'bid';
              } else if (!isPend) {
                statusIcon = '✅';
                statusText = 'Готово';
                statusClass = 'done';
              }

              return (
                <div key={player.id} className={`auction-player-row ${statusClass}`}>
                  <span className="player-name">
                    {player.id === auction.initiatorId ? '⭐ ' : ''}{player.name}
                    {player.id === playerId ? ' (Ви)' : ''}
                  </span>
                  <span className="player-status">
                    {statusIcon} {statusText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bid Controls */}
        {canAct ? (
          <div className="auction-controls">
            <div className="bid-input-row">
              <label htmlFor="bid-amount">Ваша ставка ($):</label>
              <input
                id="bid-amount"
                type="number"
                min={basePrice}
                step={1000}
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
                className="bid-input"
              />
            </div>
            {numericBid < basePrice && (
              <p className="bid-warning">⚠️ Мінімальна ставка: ${basePrice.toLocaleString()}</p>
            )}
            {numericBid >= basePrice && numericBid > playerCash && (
              <p className="bid-warning">⚠️ Недостатньо готівки!</p>
            )}
            <div className="auction-buttons">
              <button
                className="btn-bid"
                onClick={handleBid}
                disabled={!canAfford}
              >
                💰 Зробити ставку ${numericBid.toLocaleString()}
              </button>
              <button className="btn-pass" onClick={handlePass}>
                🚫 Пас
              </button>
            </div>
          </div>
        ) : (
          <div className="auction-waiting">
            {alreadyActed ? (
              <p>✅ Ви вже проголосували. Очікуємо інших гравців...</p>
            ) : (
              <p>⏳ Очікуємо вашого ходу в аукціоні...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionModal;
