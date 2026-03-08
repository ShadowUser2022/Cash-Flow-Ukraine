import React from 'react';
import VideoChat from '../VideoChat/VideoChat';
import './VideoWidget.css';

interface VideoWidgetProps {
  gameId: string;
  onClose: () => void;
}

export const VideoWidget: React.FC<VideoWidgetProps> = ({
  gameId,
  onClose
}) => {
  return (
    <div className="video-widget">
      <div className="widget-header">
        <h4>📹 Відео зв'язок</h4>
        <button className="widget-close" onClick={onClose}>✕</button>
      </div>
      
      <div className="widget-content">
        <VideoChat
          roomId={gameId}
          isMinimized={false}
          onToggleMinimize={onClose}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default VideoWidget;
