import React from 'react';
import './AudioWidget.css';

interface AudioWidgetProps {
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  onClose: () => void;
}

export const AudioWidget: React.FC<AudioWidgetProps> = ({
  soundEnabled,
  onToggleSound,
  onClose
}) => {
  return (
    <div className="audio-widget">
      <div className="widget-header">
        <h4>🔊 Звук</h4>
        <button className="widget-close" onClick={onClose}>✕</button>
      </div>
      
      <div className="widget-content">
        <div className="audio-control">
          <label>Головний звук</label>
          <button 
            className={`audio-toggle ${soundEnabled ? 'active' : ''}`}
            onClick={() => onToggleSound(!soundEnabled)}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>

        <div className="volume-control">
          <label>Гучність</label>
          <div className="volume-slider-container">
            <input type="range" min="0" max="100" defaultValue="70" className="volume-slider" />
            <span className="volume-value">70%</span>
          </div>
        </div>

        <div className="volume-control">
          <label>Музика</label>
          <div className="volume-slider-container">
            <input type="range" min="0" max="100" defaultValue="50" className="volume-slider" />
            <span className="volume-value">50%</span>
          </div>
        </div>

        <div className="volume-control">
          <label>Ефекти</label>
          <div className="volume-slider-container">
            <input type="range" min="0" max="100" defaultValue="80" className="volume-slider" />
            <span className="volume-value">80%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioWidget;
