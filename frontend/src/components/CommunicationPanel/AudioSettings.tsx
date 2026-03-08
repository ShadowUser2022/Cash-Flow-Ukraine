import React from 'react';
import './AudioSettings.css';

interface AudioSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay audio-settings-overlay" onClick={onClose}>
      <div className="modal-content audio-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔊 Налаштування звуку</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="audio-settings-content">
          <div className="setting-item">
            <label className="setting-label">
              Головний звук гри
            </label>
            <div className="toggle-container">
              <button 
                className={`toggle-btn ${soundEnabled ? 'active' : ''}`}
                onClick={() => onToggleSound(!soundEnabled)}
              >
                <span className="toggle-icon">
                  {soundEnabled ? '🔊' : '🔇'}
                </span>
                <span className="toggle-text">
                  {soundEnabled ? 'Звук увімкнено' : 'Звук вимкнено'}
                </span>
              </button>
            </div>
          </div>

          <div className="setting-item">
            <label className="setting-label">
              Гучність звуків гри
            </label>
            <div className="volume-control">
              <input 
                type="range" 
                min="0" 
                max="100" 
                defaultValue="70"
                className="volume-slider"
              />
              <span className="volume-value">70%</span>
            </div>
          </div>

          <div className="setting-item">
            <label className="setting-label">
              Гучність музики
            </label>
            <div className="volume-control">
              <input 
                type="range" 
                min="0" 
                max="100" 
                defaultValue="50"
                className="volume-slider"
              />
              <span className="volume-value">50%</span>
            </div>
          </div>

          <div className="setting-item">
            <label className="setting-label">
              Гучність ефектів
            </label>
            <div className="volume-control">
              <input 
                type="range" 
                min="0" 
                max="100" 
                defaultValue="80"
                className="volume-slider"
              />
              <span className="volume-value">80%</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Зберегти та закрити
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioSettings;
