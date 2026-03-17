import React, { useEffect, useState } from 'react';
import useGameStore from '../../store/gameStore';
import './TurnTimer.css';

interface TurnTimerProps {
  playerId: string;
}

const TurnTimer: React.FC<TurnTimerProps> = ({ playerId }) => {
  const { game, turnTimerStartedAt, turnTimerDuration } = useGameStore();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!turnTimerStartedAt || !turnTimerDuration) {
      setTimeLeft(null);
      return;
    }

    const tick = () => {
      const elapsed = (Date.now() - turnTimerStartedAt) / 1000;
      const remaining = Math.max(0, turnTimerDuration - elapsed);
      setTimeLeft(Math.ceil(remaining));
    };

    tick();
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [turnTimerStartedAt, turnTimerDuration]);

  if (timeLeft === null || !game) return null;

  const isMyTurn = game.currentPlayer === playerId;
  const pct = turnTimerDuration > 0 ? (timeLeft / turnTimerDuration) * 100 : 0;
  const isUrgent = timeLeft <= 15;
  const isDanger = timeLeft <= 10;

  const radius = 16;
  const circ = 2 * Math.PI * radius;
  const dashOffset = circ * (1 - pct / 100);
  const color = isDanger ? '#ff4444' : isUrgent ? '#ffaa00' : '#4caf50';

  return (
    <div className={`turn-timer${isUrgent ? ' urgent' : ''}${isDanger ? ' danger' : ''}${isMyTurn ? ' my-turn' : ''}`}>
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
        <circle
          cx="22" cy="22" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 22 22)"
          style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s' }}
        />
        <text
          x="22" y="27"
          textAnchor="middle"
          fontSize="13"
          fontWeight="bold"
          fill={color}
        >
          {timeLeft}
        </text>
      </svg>
      {isMyTurn && <div className="turn-timer-label">Ваш хід!</div>}
    </div>
  );
};

export default TurnTimer;
