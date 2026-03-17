/**
 * MechanicsDebugOverlay — Dev-only overlay for testing game mechanics
 * Toggle: кнопка 🔧 (bottom-right) або Ctrl+Shift+D
 * Includes: game state snapshot, mechanics checklist, quick actions
 */
import React, { useState, useEffect, useCallback } from 'react';
import useGameStore from '../../store/gameStore';
import { socketService } from '../../services/socketService';

// ─── Checklist items ───────────────────────────────────────────────
const CHECKLIST_ITEMS = [
  { id: 'dice', label: '🎲 Кидок кубиків → клітинка', group: 'turn' },
  { id: 'small_card', label: '🃏 Маленька угода (ExpenseCard / DealCard)', group: 'turn' },
  { id: 'big_card', label: '🏗️ Велика угода → аукціон стартує', group: 'turn' },
  { id: 'auction_bid', label: '💰 Аукціон: зробити ставку', group: 'auction' },
  { id: 'auction_pass', label: '🚫 Аукціон: пас', group: 'auction' },
  { id: 'auction_win', label: '🏆 Аукціон: виграти угоду → актив додано', group: 'auction' },
  { id: 'buy_deal', label: '💼 Купити маленьку угоду → −cash, +cashflow', group: 'deals' },
  { id: 'sell_deal', label: '💸 Продати актив → +cash', group: 'deals' },
  { id: 'buy_stock', label: '📈 Купити акції → −cash', group: 'stocks' },
  { id: 'sell_stock', label: '📉 Продати акції → +cash, profit/loss', group: 'stocks' },
  { id: 'market_event', label: '🚀 Market event → ціни змінились', group: 'stocks' },
  { id: 'income', label: '💵 Отримати дохід (pay-day)', group: 'finance' },
  { id: 'expense', label: '💸 Сплатити витрату', group: 'finance' },
  { id: 'passive_income', label: '🏦 Passive income ≥ expenses → FastTrack', group: 'finance' },
  { id: 'turn_pass', label: '⏭️ Передача ходу → currentPlayer змінився', group: 'turn' },
  { id: 'turn_timer', label: '⏱️ Таймер 90с → авто-передача ходу', group: 'turn' },
  { id: 'disconnect', label: '🔌 Reconnect → стан відновлено', group: 'net' },
];

type CheckState = 'unchecked' | 'pass' | 'fail';
const STORAGE_KEY = 'cf_mechanic_checks';

function loadChecks(): Record<string, CheckState> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveChecks(checks: Record<string, CheckState>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
}

// ─── Component ─────────────────────────────────────────────────────
const MechanicsDebugOverlay: React.FC = () => {
  const { game, currentPlayer, playerId, isConnected } = useGameStore();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'state' | 'checklist' | 'actions'>('state');
  const [checks, setChecks] = useState<Record<string, CheckState>>(loadChecks);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [cashInput, setCashInput] = useState('10000');

  // Toggle з Ctrl+Shift+D
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Логуємо socket events
  useEffect(() => {
    const socket = socketService.getGameSocket();
    if (!socket) return;
    const events = [
      'turn-completed', 'dice-rolled', 'card-action-completed',
      'auction-completed', 'stock-bought', 'stock-sold', 'deal-sold',
      'player-finances-updated', 'market-boom'
    ];
    const handlers: Array<() => void> = [];
    events.forEach(ev => {
      const h = (data: any) => {
        const time = new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setEventLog(prev => [`[${time}] ${ev}${data?.playerId ? ` (${data.playerId.slice(0,6)})` : ''}`, ...prev].slice(0, 20));
      };
      socket.on(ev as any, h);
      handlers.push(() => socket.off(ev as any, h));
    });
    return () => handlers.forEach(fn => fn());
  }, [isConnected]);

  const updateCheck = useCallback((id: string, next: CheckState) => {
    setChecks(prev => {
      const updated = { ...prev, [id]: next };
      saveChecks(updated);
      return updated;
    });
  }, []);

  const resetChecks = () => {
    localStorage.removeItem(STORAGE_KEY);
    setChecks({});
  };

  // Quick actions
  const addCash = () => {
    const socket = socketService.getGameSocket();
    if (!socket || !game || !playerId) return;
    const amount = parseInt(cashInput) || 10000;
    socket.emit('debug-add-cash' as any, { gameId: game.id, playerId, amount });
    setEventLog(prev => [`[debug] +$${amount.toLocaleString()} → ${playerId.slice(0,6)}`, ...prev].slice(0, 20));
  };

  const forceNextTurn = () => {
    const socket = socketService.getGameSocket();
    if (!socket || !game || !playerId) return;
    socket.emit('skip-turn' as any, { gameId: game.id, playerId });
    setEventLog(prev => [`[debug] skip-turn → ${playerId.slice(0,6)}`, ...prev].slice(0, 20));
  };

  // ── Stat helpers ──
  const player = currentPlayer;
  const cash = player?.finances?.cash ?? 0;
  const passive = player?.finances?.passiveIncome ?? 0;
  const expenses = player?.finances?.expenses ?? 0;
  const assets = player?.finances?.assets?.length ?? 0;
  const stockAssets = player?.finances?.assets?.filter((a: any) => a.type === 'stocks') ?? [];
  const isMyTurn = game?.currentPlayer === playerId;
  const totalChecked = Object.values(checks).filter(v => v !== 'unchecked').length;
  const passed = Object.values(checks).filter(v => v === 'pass').length;
  const failed = Object.values(checks).filter(v => v === 'fail').length;

  const groups = ['turn', 'auction', 'deals', 'stocks', 'finance', 'net'];
  const groupLabels: Record<string, string> = {
    turn: '🎲 Хід', auction: '🏗️ Аукціон', deals: '💼 Угоди',
    stocks: '📈 Акції', finance: '💵 Фінанси', net: '🌐 Мережа'
  };

  const tabStyle = (t: string): React.CSSProperties => ({
    flex: 1, padding: '5px 0', fontSize: 11, fontWeight: 600, cursor: 'pointer',
    border: 'none', borderRadius: 5,
    background: tab === t ? 'rgba(245,166,35,0.2)' : 'transparent',
    color: tab === t ? '#FFD700' : 'rgba(255,255,255,0.45)',
  });

  if (!open) {
    return (
      <button
        title="Debug Overlay (Ctrl+Shift+D)"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
          width: 36, height: 36, borderRadius: '50%', border: 'none',
          background: 'rgba(30,30,40,0.85)', color: 'rgba(255,255,255,0.5)',
          fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        🔧
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
      width: 340, maxHeight: '80vh', overflowY: 'auto',
      background: 'rgba(18,18,28,0.97)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(245,166,35,0.3)', borderRadius: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      fontFamily: 'monospace', fontSize: 12, color: '#e0e0e0',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky', top: 0, background: 'rgba(18,18,28,0.98)', zIndex: 1,
      }}>
        <span style={{ color: '#FFD700', fontWeight: 700, flex: 1 }}>🔧 Mechanics Debug</span>
        <span style={{
          fontSize: 10, padding: '2px 6px', borderRadius: 4,
          background: isConnected ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)',
          color: isConnected ? '#4CAF50' : '#f44336',
        }}>
          {isConnected ? '● online' : '● offline'}
        </span>
        <button onClick={() => setOpen(false)} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
          cursor: 'pointer', fontSize: 14, padding: '0 4px',
        }}>✕</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '8px 12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button style={tabStyle('state')} onClick={() => setTab('state')}>📊 Стан</button>
        <button style={tabStyle('checklist')} onClick={() => setTab('checklist')}>
          ✅ Чекліст {totalChecked > 0 ? `${passed}✓${failed > 0 ? `/${failed}✗` : ''}` : ''}
        </button>
        <button style={tabStyle('actions')} onClick={() => setTab('actions')}>⚡ Дії</button>
      </div>

      <div style={{ padding: '10px 12px' }}>

        {/* ─── TAB: STATE ─── */}
        {tab === 'state' && (
          <div>
            {game ? (
              <>
                <Row label="Гра" val={game.id?.slice(0, 8) + '…'} />
                <Row label="Хід №" val={String(game.turn ?? 0)} />
                <Row label="Зараз ходить" val={
                  game.players?.find((p: any) => p.id === game.currentPlayer)?.name ?? '—'
                } highlight={isMyTurn} />
                <div style={{ margin: '8px 0 4px', color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>— Поточний гравець —</div>
                {player ? (
                  <>
                    <Row label="Ім'я" val={player.name} />
                    <Row label="Cash" val={`$${cash.toLocaleString()}`} color={cash > 0 ? '#4CAF50' : '#f44336'} />
                    <Row label="Passive income" val={`$${passive.toLocaleString()}/міс`} color="#FFD700" />
                    <Row label="Expenses" val={`$${expenses.toLocaleString()}/міс`} color="#f44336" />
                    <Row label="Cashflow" val={`$${(passive - expenses).toLocaleString()}/міс`} color={passive >= expenses ? '#4CAF50' : '#f44336'} />
                    <Row label="Активи" val={`${assets} (акцій: ${stockAssets.length})`} />
                    {stockAssets.length > 0 && stockAssets.map((a: any) => (
                      <Row key={a.id} label={`  ${a.symbol ?? a.name}`} val={`${a.quantity ?? 1}шт @$${a.cost}`} />
                    ))}
                    <Row label="FastTrack?" val={passive >= expenses ? '✅ ТАК' : '❌ НІ'} color={passive >= expenses ? '#4CAF50' : '#f44336'} />
                  </>
                ) : <div style={{ color: 'rgba(255,255,255,0.3)' }}>Гравець не знайдений</div>}

                {(game as any).currentAuction && (
                  <>
                    <div style={{ margin: '8px 0 4px', color: '#FFD700', fontSize: 10 }}>— Активний аукціон —</div>
                    <Row label="Угода" val={(game as any).currentAuction.deal?.title ?? '—'} />
                    <Row label="Статус" val={(game as any).currentAuction.status} />
                    <Row label="Очікують" val={String((game as any).currentAuction.pendingPlayers?.length ?? 0)} />
                  </>
                )}

                {/* Event log */}
                <div style={{ margin: '10px 0 4px', color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>— Socket events (last 10) —</div>
                {eventLog.length === 0 ? (
                  <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>Немає подій ще</div>
                ) : eventLog.slice(0, 10).map((e, i) => (
                  <div key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{e}</div>
                ))}
              </>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '16px 0' }}>
                Гра не завантажена
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: CHECKLIST ─── */}
        {tab === 'checklist' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                {passed}/{CHECKLIST_ITEMS.length} пройшло · {failed} впало
              </span>
              <button onClick={resetChecks} style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
              }}>Скинути</button>
            </div>

            {groups.map(group => {
              const items = CHECKLIST_ITEMS.filter(i => i.group === group);
              return (
                <div key={group} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: '#FFD700', marginBottom: 4, fontWeight: 700 }}>
                    {groupLabels[group]}
                  </div>
                  {items.map(item => {
                    const state = checks[item.id] ?? 'unchecked';
                    return (
                      <div key={item.id} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                      }}>
                        <button
                          onClick={() => updateCheck(item.id, state === 'unchecked' ? 'pass' : state === 'pass' ? 'fail' : 'unchecked')}
                          style={{
                            width: 20, height: 20, borderRadius: 4, border: 'none', cursor: 'pointer', flexShrink: 0,
                            background: state === 'pass' ? 'rgba(76,175,80,0.3)' : state === 'fail' ? 'rgba(244,67,54,0.3)' : 'rgba(255,255,255,0.08)',
                            color: state === 'pass' ? '#4CAF50' : state === 'fail' ? '#f44336' : 'rgba(255,255,255,0.3)',
                            fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                          title="Клік: ⬜ → ✅ → ❌ → ⬜"
                        >
                          {state === 'pass' ? '✓' : state === 'fail' ? '✗' : '·'}
                        </button>
                        <span style={{
                          fontSize: 11, flex: 1,
                          color: state === 'pass' ? 'rgba(255,255,255,0.7)' : state === 'fail' ? '#f44336' : 'rgba(255,255,255,0.5)',
                          textDecoration: state === 'pass' ? 'line-through' : 'none',
                        }}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* ─── TAB: ACTIONS ─── */}
        {tab === 'actions' && (
          <div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginBottom: 8 }}>
              Дії застосовуються до поточного гравця ({player?.name ?? '—'})
            </div>

            {/* Add cash */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: '#FFD700', marginBottom: 6 }}>💰 Додати готівку</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="number"
                  value={cashInput}
                  onChange={e => setCashInput(e.target.value)}
                  style={{
                    flex: 1, padding: '5px 8px', borderRadius: 5,
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', fontSize: 12,
                  }}
                />
                <button onClick={addCash} disabled={!game || !playerId} style={actionBtn('#4CAF50')}>
                  + Cash
                </button>
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                {[1000, 5000, 10000, 50000].map(n => (
                  <button key={n} onClick={() => { setCashInput(String(n)); }} style={{
                    flex: 1, padding: '3px 0', fontSize: 10, borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                  }}>${(n/1000).toFixed(0)}k</button>
                ))}
              </div>
            </div>

            {/* Skip turn */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: '#FFD700', marginBottom: 6 }}>⏭️ Передати хід</div>
              <button
                onClick={forceNextTurn}
                disabled={!isMyTurn || !game}
                style={actionBtn('#2196F3')}
              >
                Skip turn (skip-turn emit)
              </button>
              {!isMyTurn && (
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                  ⚠️ Не ваш хід
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{
              padding: '8px 10px', borderRadius: 6, fontSize: 10,
              background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)',
              lineHeight: 1.6,
            }}>
              Клавіша: <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Ctrl+Shift+D</strong> — відкрити/закрити
              <br />
              <strong>debug-add-cash</strong> — потребує backend підтримки
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Helpers ───────────────────────────────────────────────────────
const Row: React.FC<{ label: string; val: string; highlight?: boolean; color?: string }> = ({ label, val, highlight, color }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', padding: '2px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  }}>
    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
    <span style={{ color: color ?? (highlight ? '#FFD700' : 'rgba(255,255,255,0.75)'), fontWeight: highlight ? 700 : 400 }}>
      {val}
    </span>
  </div>
);

const actionBtn = (color: string): React.CSSProperties => ({
  width: '100%', padding: '7px 0', borderRadius: 6, border: `1px solid ${color}40`,
  background: `${color}18`, color, fontWeight: 700, fontSize: 12, cursor: 'pointer',
});

export default MechanicsDebugOverlay;
