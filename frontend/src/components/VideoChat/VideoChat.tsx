import React, { useEffect, useState } from 'react';
import useGameStore from '../../store/gameStore';
import useWebRTC from '../../hooks/useWebRTC';
import { socketService } from '../../services/socketService';
import './VideoChat.css';

interface VideoChatProps {
	roomId: string;
	isMinimized?: boolean;
	onToggleMinimize?: () => void;
	onClose?: () => void;
}

const VideoChat: React.FC<VideoChatProps> = ({
	roomId,
	isMinimized = false,
	onToggleMinimize,
	onClose
}) => {
	const [socket] = useState(socketService.getWebRTCSocket());
	const [isInitialized, setIsInitialized] = useState(false);

	const {
		participants,
		connectionStatus,
		addNotification
	} = useGameStore();

	const {
		localVideoRef,
		initializeMedia,
		joinRoom,
		leaveRoom,
		toggleVideo,
		toggleAudio,
		isVideoEnabled,
		isAudioEnabled,
		remoteStreams
	} = useWebRTC({ socket, roomId });

	// Initialize WebRTC connection  
	useEffect(() => {
		const initialize = async () => {
			try {
				// Skip WebRTC in developer mode
				if (roomId === 'DEV-MODE') {
					console.log('📹 Developer mode: Skipping WebRTC initialization');
					setIsInitialized(true);
					addNotification({
						type: 'info',
						title: 'Тестовий режим',
						message: 'Відео-чат недоступний в тестовому режимі',
						duration: 3000
					});
					return;
				}

				console.log('📹 Initializing video chat for room:', roomId);

				// Initialize media devices
				await initializeMedia();

				// Join the room
				await joinRoom();

				setIsInitialized(true);
				console.log('📹 Video chat initialized successfully');

				addNotification({
					type: 'success',
					title: 'Відео чат',
					message: 'Успішно підключено до відео чату',
					duration: 3000
				});
			} catch (error) {
				console.error('Failed to initialize video chat:', error);
				addNotification({
					type: 'error',
					title: 'Помилка відео чату',
					message: 'Не вдалося ініціалізувати відео чат',
					duration: 5000
				});
			}
		};

		if (!isInitialized) {
			initialize();
		}

		return () => {
			if (isInitialized && roomId !== 'DEV-MODE') {
				leaveRoom();
			}
		};
	}, [roomId, isInitialized, initializeMedia, joinRoom, leaveRoom, addNotification]);

	const renderRemoteVideo = (peerId: string, stream: MediaStream) => {
		return (
			<div key={peerId} className="card player-card remote-video-container">
				<video
					autoPlay
					playsInline
					ref={(video) => {
						if (video) {
							video.srcObject = stream;
						}
					}}
					className="remote-video"
				/>
				<div className="video-label">Гравець {peerId.slice(0, 8)}</div>
			</div>
		);
	};

		if (isMinimized) {
			return (
				<div className="card chat-card card-sm card-clickable">
					<div className="minimized-header" onClick={onToggleMinimize}>
						<span className="minimized-title">📹 Відео чат</span>
						<span className="minimized-count">
							👥 {roomId === 'DEV-MODE' ? '1' : participants.length}
						</span>
					</div>
				</div>
			);
		}

	// Модальне вікно поверх гри
		return (
			<div className="modal-overlay video-modal">
				<div className="card board-card video-chat-container">
					<div className="video-chat-header">
						<h3>Відео чат</h3>
						<div className="header-controls">
							<span className="participant-count">
								👥 {roomId === 'DEV-MODE' ? '1 (тест)' : `${participants.length} учасників`}
							</span>
							<button
								className="minimize-btn"
								onClick={onToggleMinimize}
								title="Згорнути"
							>
								➖
							</button>
							<button
								className="close-btn"
								onClick={onClose}
								title="Закрити відео"
							>
								✕
							</button>
						</div>
					</div>
				{roomId === 'DEV-MODE' ? (
					// Developer mode view
					<div className="video-grid">
						<div className="card warning-card dev-mode-video-placeholder">
							<div className="dev-placeholder-content">
								<span className="dev-icon">🧪</span>
								<h4>Тестовий режим</h4>
								<p>Відео-чат недоступний в тестовому режимі</p>
								<small>Використовуйте звичайний режим для тестування WebRTC</small>
							</div>
						</div>
					</div>
				) : (
					// Normal mode view
					<div className="video-grid">
						{/* Local video */}
						<div className="card player-card local-video-container">
							<video
								ref={localVideoRef}
								autoPlay
								playsInline
								muted
								className={`local-video ${!isVideoEnabled ? 'video-disabled' : ''}`}
							/>
							<div className="video-label">Ви</div>
							{!isVideoEnabled && (
								<div className="video-disabled-overlay">
									📷
								</div>
							)}
						</div>
						{/* Remote videos */}
						{Object.entries(remoteStreams).map(([peerId, stream]) =>
							renderRemoteVideo(peerId, stream)
						)}
						{/* Placeholder for empty slots */}
						{participants.length < 6 && (
							<div className="card lobby-card empty-video-slot">
								<div className="empty-slot-content">
									<span>👤</span>
									<span>Очікування гравця</span>
								</div>
							</div>
						)}
					</div>
				)}
				<div className="video-controls">
					{roomId === 'DEV-MODE' ? (
						<div className="dev-mode-controls">
							<button className="control-btn inactive" disabled title="Недоступно в режимі розробника">
								📷
							</button>
							<button className="control-btn inactive" disabled title="Недоступно в режимі розробника">
								🔇
							</button>
						</div>
					) : (
						<>
							<button
								className={`control-btn ${isVideoEnabled ? 'active' : 'inactive'}`}
								onClick={toggleVideo}
								title={isVideoEnabled ? 'Вимкнути камеру' : 'Увімкнути камеру'}
							>
								{isVideoEnabled ? '📹' : '📷'}
							</button>

							<button
								className={`control-btn ${isAudioEnabled ? 'active' : 'inactive'}`}
								onClick={toggleAudio}
								title={isAudioEnabled ? 'Вимкнути мікрофон' : 'Увімкнути мікрофон'}
							>
								{isAudioEnabled ? '🎤' : '🔇'}
							</button>
						</>
					)}
					<div className="connection-status">
						<span
							className={`connection-indicator ${roomId === 'DEV-MODE' ? 'dev-mode' : connectionStatus}`}
							title={roomId === 'DEV-MODE' ? 'Тестовий режим' : `Статус підключення: ${connectionStatus}`}
						>
							{roomId === 'DEV-MODE' ? '🧪' :
								connectionStatus === 'connected' ? '🟢' :
									connectionStatus === 'connecting' ? '🟡' : '🔴'}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default VideoChat;