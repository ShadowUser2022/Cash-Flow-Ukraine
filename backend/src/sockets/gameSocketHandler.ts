import { Namespace, Socket } from 'socket.io';
import { GameService } from '../services/GameService-memory';
import { GameMechanicsService } from '../services/GameMechanicsService';
import { DealService } from '../services/DealService';
import { SOCKET_EVENTS } from '../../../shared/constants/game';

export class GameSocketHandler {
	private gameService: GameService;
	private dealService: DealService;
	private playerSockets: Map<string, string> = new Map(); // playerId -> socketId

	constructor(private io: Namespace) {
		this.gameService = new GameService();
		this.dealService = new DealService();
	}

	handleConnection(socket: Socket) {
		console.log(`Game client connected: ${socket.id}`);

		socket.on(SOCKET_EVENTS.JOIN_GAME, this.handleJoinGame.bind(this, socket));
		socket.on(SOCKET_EVENTS.LEAVE_GAME, this.handleLeaveGame.bind(this, socket));
		socket.on(SOCKET_EVENTS.ROLL_DICE, this.handleRollDice.bind(this, socket));
		socket.on(SOCKET_EVENTS.MAKE_DEAL, this.handleMakeDeal.bind(this, socket));
		socket.on(SOCKET_EVENTS.READY_TO_START, this.handleReadyToStart.bind(this, socket));
		socket.on(SOCKET_EVENTS.EXECUTE_TURN, this.handleExecuteTurn.bind(this, socket));
		socket.on(SOCKET_EVENTS.TURN_COMPLETED, this.handleTurnCompleted.bind(this, socket));
		socket.on(SOCKET_EVENTS.BUY_DEAL, this.handleBuyDeal.bind(this, socket));
		socket.on(SOCKET_EVENTS.MOVE_TO_FAST_TRACK, this.handleMoveToFastTrack.bind(this, socket));
		socket.on(SOCKET_EVENTS.GENERATE_DEALS, this.handleGenerateDeals.bind(this, socket));

		// Card action events
		socket.on(SOCKET_EVENTS.PAY_EXPENSE, this.handlePayExpense.bind(this, socket));
		socket.on(SOCKET_EVENTS.CHARITY_CHOICE, this.handleCharityChoice.bind(this, socket));
		socket.on(SOCKET_EVENTS.MARKET_ACTION, this.handleMarketAction.bind(this, socket));

		// Lobby events
		socket.on(SOCKET_EVENTS.PLAYER_READY, this.handlePlayerReady.bind(this, socket));
		socket.on(SOCKET_EVENTS.PROFESSION_SELECTED, this.handleProfessionSelected.bind(this, socket));

		socket.on('disconnect', this.handleDisconnect.bind(this, socket));
	}

	private async handleJoinGame(socket: Socket, data: { gameId: string; playerId: string; playerName?: string }) {
		try {
			const { gameId, playerId, playerName } = data;

			console.log(`Player ${playerId} joining game ${gameId}`);

			// Реєструємо socket гравця
			this.playerSockets.set(playerId, socket.id);

			// Додаємо гравця до гри
			const game = await this.gameService.addPlayerToGame(gameId, playerId, playerName);

			// Додаємо socket до кімнати
			socket.join(gameId);

			// Відправляємо стан гри новому гравцю
			socket.emit(SOCKET_EVENTS.GAME_STATE, game);

			// Повідомляємо інших гравців
			socket.to(gameId).emit(SOCKET_EVENTS.PLAYER_JOINED, {
				playerId,
				playerData: game.players.find(p => p.id === playerId)
			});

			console.log(`Player ${playerId} successfully joined game ${gameId}`);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to join game';
			console.error('Error joining game:', error);
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: errorMessage || 'Failed to join game',
				code: 'JOIN_GAME_ERROR'
			});
		}
	}

	private async handleLeaveGame(socket: Socket, data: { gameId: string; playerId: string }) {
		try {
			const { gameId, playerId } = data;

			// Видаляємо гравця з гри
			const game = await this.gameService.removePlayerFromGame(gameId, playerId);

			// Видаляємо з реєстру сокетів
			this.playerSockets.delete(playerId);

			// Виходимо з кімнати
			socket.leave(gameId);

			// Повідомляємо інших гравців
			socket.to(gameId).emit(SOCKET_EVENTS.PLAYER_LEFT, { playerId });

			// Відправляємо оновлений стан гри
			this.io.to(gameId).emit(SOCKET_EVENTS.GAME_STATE, game);

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to leave game';
			console.error('Error leaving game:', error);
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: errorMessage || 'Failed to leave game',
				code: 'LEAVE_GAME_ERROR'
			});
		}
	}

	private async handleRollDice(socket: Socket, data: { gameId: string; playerId: string }) {
		try {
			const { gameId, playerId } = data;

			console.log(`Player ${playerId} rolling dice in game ${gameId}`);

			// Отримуємо поточну гру
			const game = await this.gameService.getGame(gameId);

			// Перевіряємо чи це хід гравця
			if (game.currentPlayer !== playerId) {
				socket.emit(SOCKET_EVENTS.ERROR, {
					message: 'Не ваш хід',
					code: 'NOT_YOUR_TURN'
				});
				return;
			}

			// Використовуємо новий метод з автоматичною генерацією карток
			const result = await this.gameService.rollDice(gameId, playerId);

			if (!result) {
				socket.emit(SOCKET_EVENTS.ERROR, {
					message: 'Не вдалося кинути кубик',
					code: 'ROLL_DICE_FAILED'
				});
				return;
			}

			// Відправляємо результат всім гравцям
			this.io.to(gameId).emit(SOCKET_EVENTS.DICE_ROLLED, {
				playerId,
				diceResult: result.diceResult,
				newPosition: result.newPosition,
				cellEffect: result.cellEffect,
				eventCard: result.eventCard, // Нова карта події
				gameState: await this.gameService.getGame(gameId)
			});

			console.log(`Player ${playerId} rolled ${result.diceResult}, new position: ${result.newPosition}, event card: ${result.eventCard?.cardType}`);

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to roll dice';
			console.error('Error rolling dice:', error);
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: errorMessage || 'Failed to roll dice',
				code: 'ROLL_DICE_ERROR'
			});
		}
	}

	private async handleMakeDeal(socket: Socket, data: { gameId: string; playerId: string; dealId: string }) {
		try {
			const { gameId, playerId, dealId } = data;

			console.log(`Player ${playerId} making deal ${dealId} in game ${gameId}`);

			// Тут буде логіка обробки угоди
			// Поки що просто підтверджуємо
			socket.emit(SOCKET_EVENTS.DEAL_COMPLETED, {
				playerId,
				dealId,
				success: true
			});

			// Генеруємо нові угоди
			const newDeals = await this.dealService.getInitialDeals();
			this.io.to(gameId).emit(SOCKET_EVENTS.NEW_DEALS, newDeals.slice(0, 3));

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to make deal';
			console.error('Error making deal:', error);
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: errorMessage || 'Failed to make deal',
				code: 'MAKE_DEAL_ERROR'
			});
		}
	}

	private async handleReadyToStart(socket: Socket, data: { gameId: string; playerId: string }) {
		try {
			const { gameId, playerId } = data;

			console.log(`Player ${playerId} is ready to start game ${gameId}`);

			// Встановлюємо готовність гравця
			const game = await this.gameService.setPlayerReady(gameId, playerId, true);

			// Відправляємо оновлений стан гри
			this.io.to(gameId).emit(SOCKET_EVENTS.GAME_STATE, game);

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to set ready status';
			console.error('Error setting player ready:', error);
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: errorMessage || 'Failed to set ready status',
				code: 'READY_ERROR'
			});
		}
	}

	private async handleExecuteTurn(socket: Socket, data: { gameId: string; playerId: string }) {
		try {
			const { gameId, playerId } = data;

			console.log(`Player ${playerId} executing turn in game ${gameId}`);

			const game = await this.gameService.getGame(gameId);

			if (!game) {
				socket.emit(SOCKET_EVENTS.ERROR, {
					message: 'Гру не знайдено',
					code: 'GAME_NOT_FOUND'
				});
				return;
			}

			// Перевіряємо чи це хід гравця
			if (game.currentPlayer !== playerId) {
				socket.emit(SOCKET_EVENTS.ERROR, {
					message: 'Не ваш хід',
					code: 'NOT_YOUR_TURN'
				});
				return;
			}

			// Виконуємо повний хід
			const turn = await GameMechanicsService.executeTurn(game, playerId);

			// Переходимо до наступного гравця
			const nextPlayer = GameMechanicsService.nextPlayer(game);

			// Оновлюємо гру
			await this.gameService.updateGame(gameId, game);

			// Знаходимо cellEffect з дій ходу
			const cellAction = turn.actions.find(action => action.type === 'draw_card');
			const cellEffect = cellAction ? {
				type: cellAction.result.effectType,
				data: cellAction.data
			} : undefined;

			// Відправляємо результат всім гравцям
			this.io.to(gameId).emit(SOCKET_EVENTS.TURN_COMPLETED, {
				turn,
				nextPlayer,
				gameState: game,
				cellEffect
			});

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to execute turn';
			console.error('Error executing turn:', error);
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: errorMessage,
				code: 'EXECUTE_TURN_ERROR'
			});
		}
	}

	private async handleTurnCompleted(socket: Socket, data: { gameId: string; playerId: string }) {
		try {
			const { gameId, playerId } = data;

			console.log(`🎯 Player ${playerId} completing turn in game ${gameId}`);

			// Використовуємо новий метод з автоматичною обробкою фінансів
			const result = await this.gameService.endTurn(gameId, playerId);

			if (!result) {
				socket.emit(SOCKET_EVENTS.ERROR, {
					message: 'Не вдалося завершити хід',
					code: 'TURN_COMPLETION_FAILED'
				});
				return;
			}

			console.log(`✅ Turn completed: ${playerId} → ${result.game.currentPlayer} (Turn #${result.game.turn})`);
			console.log(`💰 Monthly finances processed:`, result.monthlyFinances);

			// Відправляємо оновлення всім гравцям з фінансовою інформацією
			this.io.to(gameId).emit(SOCKET_EVENTS.TURN_COMPLETED, {
				turn: result.game.turn,
				currentPlayer: result.game.currentPlayer,
				monthlyFinances: result.monthlyFinances,
				gameState: result.game
			});

			// Відправляємо спеціальну подію для оновлення фінансів
			if (result.monthlyFinances) {
				this.io.to(gameId).emit('player-finances-updated', {
					playerId,
					finances: result.game.players.find(p => p.id === playerId)?.finances,
					monthlyFlow: result.monthlyFinances
				});
			}

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to complete turn';
			console.error('Error completing turn:', error);
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: errorMessage,
				code: 'TURN_COMPLETION_ERROR'
			});
		}
	}

	private async handleBuyDeal(socket: Socket, data: { gameId: string; playerId: string; dealId: string }) {
		try {
			const { gameId, playerId, dealId } = data;

			console.log(`🛒 Player ${playerId} buying deal ${dealId} in game ${gameId}`);

			const game = await this.gameService.getGame(gameId);
			
			if (!game) {
				socket.emit(SOCKET_EVENTS.ERROR, {
					message: 'Гру не знайдено',
					code: 'GAME_NOT_FOUND'
				});
				return;
			}

			const player = game.players.find(p => p.id === playerId);
			
			// Логуємо фінанси ДО покупки
			if (player) {
				console.log(`💰 BEFORE purchase - Player ${player.name}:`, {
					cash: player.finances.cash,
					passiveIncome: player.finances.passiveIncome,
					expenses: player.finances.expenses,
					assetsCount: player.finances.assets.length
				});
			}

			const result = await GameMechanicsService.buyDeal(game, playerId, dealId);

			if (result.success) {
				// Логуємо фінанси ПІСЛЯ покупки
				if (player) {
					console.log(`💰 AFTER purchase - Player ${player.name}:`, {
						cash: player.finances.cash,
						passiveIncome: player.finances.passiveIncome,
						expenses: player.finances.expenses,
						assetsCount: player.finances.assets.length
					});
				}
				console.log(`✅ Sending DEAL_COMPLETED event for player ${playerId}`);

				// Зберігаємо змінений стан гри
				await this.gameService.updateGame(gameId, game);

				// Відправляємо успішний результат
				this.io.to(gameId).emit(SOCKET_EVENTS.DEAL_COMPLETED, {
					playerId,
					dealId,
					result,
					gameState: game
				});

				// Генеруємо нові угоди якщо потрібно
				const availableDeals = game.deals.filter(d => d.isAvailable);
				if (availableDeals.length < 3) {
					const newDeals = GameMechanicsService.generateDeals(game, 2);
					await this.gameService.updateGame(gameId, game);
					this.io.to(gameId).emit(SOCKET_EVENTS.NEW_DEALS, newDeals);
				}
			} else {
				// Відправляємо помилку тільки гравцю
				socket.emit(SOCKET_EVENTS.ERROR, {
					message: result.message,
					code: 'DEAL_PURCHASE_FAILED'
				});
			}

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to buy deal';
			console.error('Error buying deal:', error);
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: errorMessage,
				code: 'BUY_DEAL_ERROR'
			});
		}
	}

	private async handleMoveToFastTrack(socket: Socket, data: { gameId: string; playerId: string }) {
		try {
			const { gameId, playerId } = data;

			console.log(`Player ${playerId} moving to fast track in game ${gameId}`);

			const game = await this.gameService.getGame(gameId);
			const player = game.players.find(p => p.id === playerId);

			if (!player) {
				socket.emit(SOCKET_EVENTS.ERROR, {
					message: 'Гравця не знайдено',
					code: 'PLAYER_NOT_FOUND'
				});
				return;
			}

			if (!GameMechanicsService.checkFastTrackEligibility(player)) {
				socket.emit(SOCKET_EVENTS.ERROR, {
					message: 'Не відповідаєте умовам переходу на швидку доріжку',
					code: 'FAST_TRACK_NOT_ELIGIBLE'
				});
				return;
			}

			GameMechanicsService.moveToFastTrack(player);
			await this.gameService.updateGame(gameId, game);

			// Повідомляємо всіх про перехід на швидку доріжку
			this.io.to(gameId).emit(SOCKET_EVENTS.FAST_TRACK_MOVED, {
				playerId,
				player,
				gameState: game
			});

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to move to fast track';
			console.error('Error moving to fast track:', error);
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: errorMessage,
				code: 'FAST_TRACK_ERROR'
			});
		}
	}

	private async handleGenerateDeals(socket: Socket, data: { gameId: string; count?: number }) {
		try {
			const { gameId, count = 4 } = data;

			console.log(`Generating ${count} new deals for game ${gameId}`);

			const game = await this.gameService.getGame(gameId);
			const newDeals = GameMechanicsService.generateDeals(game, count);

			await this.gameService.updateGame(gameId, game);

			// Відправляємо нові угоди всім гравцям
			this.io.to(gameId).emit(SOCKET_EVENTS.NEW_DEALS, newDeals);

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to generate deals';
			console.error('Error generating deals:', error);
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: errorMessage,
				code: 'GENERATE_DEALS_ERROR'
			});
		}
	}

	private async handleDisconnect(socket: Socket) {
		try {
			console.log(`Game client disconnected: ${socket.id}`);

			// Знаходимо гравця по socket ID
			let disconnectedPlayerId: string | undefined;
			for (const [playerId, socketId] of this.playerSockets.entries()) {
				if (socketId === socket.id) {
					disconnectedPlayerId = playerId;
					break;
				}
			}

			if (disconnectedPlayerId) {
				console.log(`Player ${disconnectedPlayerId} disconnected`);

				// Видаляємо з реєстру сокетів
				this.playerSockets.delete(disconnectedPlayerId);

				// Знаходимо ігри, в яких був цей гравець
				const rooms = Array.from(socket.rooms);
				for (const room of rooms) {
					if (room !== socket.id) { // Пропускаємо власну кімнату сокета
						try {
							// Повідомляємо інших гравців про відключення
							socket.to(room).emit(SOCKET_EVENTS.PLAYER_DISCONNECTED, {
								playerId: disconnectedPlayerId
							});

							// Опціонально: можна встановити статус гравця як відключений,
							// але не видаляти з гри, щоб він міг повернутися
							const game = await this.gameService.getGame(room);
							if (game) {
								const player = game.players.find(p => p.id === disconnectedPlayerId);
								if (player) {
									player.isConnected = false;
									await this.gameService.updateGame(room, game);

									// Повідомляємо про зміну статусу
									this.io.to(room).emit(SOCKET_EVENTS.GAME_STATE, game);
								}
							}
						} catch (error) {
							console.error(`Error handling disconnect for room ${room}:`, error);
						}
					}
				}
			}
		} catch (error) {
			console.error('Error handling disconnect:', error);
		}
	}

	// Допоміжні методи
	getSocketByPlayerId(playerId: string): Socket | undefined {
		const socketId = this.playerSockets.get(playerId);
		if (socketId) {
			return this.io.sockets.get(socketId);
		}
		return undefined;
	}

	// Метод для очищення старих сокетів
	cleanupDisconnectedSockets() {
		const activeSockets = Array.from(this.io.sockets.keys());
		for (const [playerId, socketId] of this.playerSockets.entries()) {
			if (!activeSockets.includes(socketId)) {
				console.log(`Cleaning up stale socket for player ${playerId}`);
				this.playerSockets.delete(playerId);
			}
		}
	}

	// Метод для повторного підключення гравця
	async reconnectPlayer(socket: Socket, playerId: string, gameId: string) {
		try {
			console.log(`Player ${playerId} reconnecting to game ${gameId}`);

			// Оновлюємо реєстр сокетів
			this.playerSockets.set(playerId, socket.id);

			// Додаємо до кімнати
			socket.join(gameId);

			// Оновлюємо статус гравця
			const game = await this.gameService.getGame(gameId);
			const player = game.players.find(p => p.id === playerId);
			if (player) {
				player.isConnected = true;
				await this.gameService.updateGame(gameId, game);

				// Відправляємо поточний стан гри
				socket.emit(SOCKET_EVENTS.GAME_STATE, game);

				// Повідомляємо інших про повернення
				socket.to(gameId).emit(SOCKET_EVENTS.PLAYER_RECONNECTED, {
					playerId,
					player
				});
			}

			return true;
		} catch (error) {
			console.error('Error reconnecting player:', error);
			return false;
		}
	}

	// Public method to emit game started event (called from REST API)
	emitGameStarted(gameId: string, gameState: any) {
		console.log(`Emitting GAME_STARTED event for game ${gameId}`);

		// Emit to all players in the game room
		this.io.to(gameId).emit(SOCKET_EVENTS.GAME_STARTED, {
			gameState
		});
	}

	// Lobby event handlers
	private async handlePlayerReady(socket: Socket, data: { gameId: string; playerId: string; isReady: boolean }) {
		try {
			const { gameId, playerId, isReady } = data;

			console.log(`Player ${playerId} setting ready status to ${isReady} in game ${gameId}`);

			// Update player ready status
			await this.gameService.updatePlayerReady(gameId, playerId, isReady);
			const game = await this.gameService.getGame(gameId);

			// Broadcast updated game state
			this.io.to(gameId).emit(SOCKET_EVENTS.GAME_STATE, game);

			// Notify about ready status change
			const eventType = isReady ? SOCKET_EVENTS.PLAYER_READY : SOCKET_EVENTS.PLAYER_NOT_READY;
			socket.to(gameId).emit(eventType, { playerId, isReady });

		} catch (error) {
			console.error('Error handling player ready:', error);
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: 'Не вдалося оновити статус готовності',
				code: 'READY_UPDATE_FAILED'
			});
		}
	}

	private async handleProfessionSelected(socket: Socket, data: { gameId: string; playerId: string; profession: string }) {
		try {
			const { gameId, playerId, profession } = data;

			console.log(`Player ${playerId} selecting profession ${profession} in game ${gameId}`);

			// Update player profession
			await this.gameService.updatePlayerProfession(gameId, playerId, profession);
			const game = await this.gameService.getGame(gameId);

			// Broadcast updated game state
			this.io.to(gameId).emit(SOCKET_EVENTS.GAME_STATE, game);

			// Notify about profession selection
			socket.to(gameId).emit(SOCKET_EVENTS.PROFESSION_SELECTED, {
				playerId,
				profession,
				playerName: game.players.find(p => p.id === playerId)?.name
			});

		} catch (error) {
			console.error('Error handling profession selection:', error);
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: 'Не вдалося обрати професію',
				code: 'PROFESSION_SELECTION_FAILED'
			});
		}
	}

	// Card action handlers
	private async handlePayExpense(socket: Socket, data: { gameId: string; playerId: string; amount: number; reason?: string }) {
		try {
			const { gameId, playerId, amount, reason } = data;

			console.log(`Player ${playerId} paying expense $${amount} in game ${gameId}`);

			// Використовуємо новий метод з автоматичною обробкою боргів
			const result = await this.gameService.processExpensePayment(gameId, playerId, amount, reason);

			if (!result) {
				socket.emit(SOCKET_EVENTS.ERROR, {
					message: 'Не вдалося обробити платіж',
					code: 'EXPENSE_PAYMENT_FAILED'
				});
				return;
			}

			console.log(`✅ Expense payment processed: ${result.message}`);

			// Повідомляємо всіх гравців про сплату витрат
			this.io.to(gameId).emit(SOCKET_EVENTS.EXPENSE_PAID, {
				playerId,
				amount,
				newCashBalance: result.newCashBalance,
				message: result.message,
				transaction: result.transaction,
				debtAdded: result.debtAdded,
				gameState: await this.gameService.getGame(gameId)
			});

			// Якщо додався борг, повідомляємо про це окремо
			if (result.debtAdded && result.debtAdded > 0) {
				this.io.to(gameId).emit('debt-warning', {
					playerId,
					debtAmount: result.debtAdded,
					message: `⚠️ Гравець ${playerId} взяв в борг $${result.debtAdded.toLocaleString()}`
				});
			}

		} catch (error) {
			console.error('Error handling expense payment:', error);
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: error instanceof Error ? error.message : 'Не вдалося сплатити витрати',
				code: 'EXPENSE_PAYMENT_FAILED'
			});
		}
	}

	private async handleCharityChoice(socket: Socket, data: { gameId: string; playerId: string; choice: string; amount?: number }) {
		try {
			const { gameId, playerId, choice, amount = 0 } = data;

			console.log(`Player ${playerId} chose charity option ${choice} (${amount}) in game ${gameId}`);

			const donate = choice !== 'skip' && amount > 0;
			
			// Використовуємо новий метод для обробки благодійності
			const result = await this.gameService.processCharityChoice(gameId, playerId, donate, amount);

			if (!result) {
				socket.emit(SOCKET_EVENTS.ERROR, {
					message: 'Не вдалося обробити благодійність',
					code: 'CHARITY_PROCESSING_FAILED'
				});
				return;
			}

			console.log(`✅ Charity choice processed: ${result.message}`);

			// Повідомляємо всіх гравців про результат благодійності
			this.io.to(gameId).emit(SOCKET_EVENTS.CHARITY_COMPLETED, {
				playerId,
				choice,
				amount,
				success: result.success,
				newCashBalance: result.newCashBalance,
				message: result.message,
				transaction: result.transaction,
				gameState: await this.gameService.getGame(gameId)
			});

			// Додаємо спеціальне повідомлення за щедрість
			if (donate && amount >= 1000) {
				this.io.to(gameId).emit('special-bonus', {
					playerId,
					type: 'generous_donation',
					message: '✨ Щедрий благодійний внесок буде винагороджений!',
					amount
				});
			}

		} catch (error) {
			console.error('Error handling charity choice:', error);
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: error instanceof Error ? error.message : 'Не вдалося обробити благодійність',
				code: 'CHARITY_CHOICE_FAILED'
			});
		}
	}

	private async handleMarketAction(socket: Socket, data: { gameId: string; playerId: string; action: string; data?: any }) {
		try {
			const { gameId, playerId, action, data: actionData } = data;

			console.log(`Player ${playerId} performing market action ${action} in game ${gameId}`);

			const game = await this.gameService.getGame(gameId);
			
			if (!game) {
				socket.emit(SOCKET_EVENTS.ERROR, {
					message: 'Гру не знайдено',
					code: 'GAME_NOT_FOUND'
				});
				return;
			}

			const player = game.players.find(p => p.id === playerId);

			if (!player) {
				socket.emit(SOCKET_EVENTS.ERROR, {
					message: 'Гравця не знайдено',
					code: 'PLAYER_NOT_FOUND'
				});
				return;
			}

			// Тут можна додати специфічну логіку для ринкових дій
			// Наприклад, продаж активів за підвищеною ціною
			let result = { success: true, message: 'Дія виконана' };

			if (action === 'execute' && actionData?.card) {
				// Логіка виконання ринкової картки
				const card = actionData.card;
				console.log(`Executing market card: ${card.title}`);

				// Тут можна додати конкретну логіку залежно від типу карти
				if (card.cashFlow && card.cashFlow > 0) {
					player.finances.cash += card.cashFlow;
					result.message = `Отримано $${card.cashFlow}`;
				} else if (card.cost && card.cost > 0) {
					// Якщо це витрати
					if (player.finances.cash >= card.cost) {
						player.finances.cash -= card.cost;
						result.message = `Сплачено $${card.cost}`;
					} else {
						result = { success: false, message: 'Недостатньо коштів' };
					}
				}
			}

			if (result.success) {
				await this.gameService.updateGame(gameId, game);
			}

			// Повідомляємо всіх гравців
			this.io.to(gameId).emit(SOCKET_EVENTS.MARKET_ACTION_COMPLETED, {
				playerId,
				action,
				result,
				gameState: game
			});

		} catch (error) {
			console.error('Error handling market action:', error);
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: 'Не вдалося виконати ринкову дію',
				code: 'MARKET_ACTION_FAILED'
			});
		}
	}
}
