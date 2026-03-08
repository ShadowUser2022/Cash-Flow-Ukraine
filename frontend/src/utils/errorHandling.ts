// Error handling utilities for the Cash Flow Ukraine game

export interface GameError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
}

export const ErrorCodes = {
  // Connection errors
  CONNECTION_LOST: 'CONNECTION_LOST',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  SOCKET_ERROR: 'SOCKET_ERROR',
  
  // Game errors
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  GAME_FULL: 'GAME_FULL',
  INVALID_GAME_STATE: 'INVALID_GAME_STATE',
  PLAYER_NOT_FOUND: 'PLAYER_NOT_FOUND',
  
  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Financial errors
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  INVALID_TRANSACTION: 'INVALID_TRANSACTION',
  
  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

export const createError = (
  code: keyof typeof ErrorCodes,
  message: string,
  details?: any,
  recoverable: boolean = true
): GameError => ({
  code,
  message,
  details,
  timestamp: new Date(),
  recoverable,
});

export const getErrorMessage = (error: GameError): string => {
  const errorMessages: Record<string, string> = {
    [ErrorCodes.CONNECTION_LOST]: 'З\'єднання з сервером втрачено. Спробуйте підключитися знову.',
    [ErrorCodes.CONNECTION_FAILED]: 'Не вдалося підключитися до сервера. Перевірте інтернет-з\'єднання.',
    [ErrorCodes.SOCKET_ERROR]: 'Помилка з\'єднання. Будь ласка, перезавантажте сторінку.',
    [ErrorCodes.GAME_NOT_FOUND]: 'Гра з таким кодом не знайдена. Перевірте правильність коду.',
    [ErrorCodes.GAME_FULL]: 'Гра заповнена. Спробуйте приєднатися до іншої гри.',
    [ErrorCodes.INVALID_GAME_STATE]: 'Некоректний стан гри. Оновіть сторінку.',
    [ErrorCodes.PLAYER_NOT_FOUND]: 'Гравець не знайдений. Приєднайтеся до гри заново.',
    [ErrorCodes.INVALID_INPUT]: 'Некоректні дані. Перевірте введену інформацію.',
    [ErrorCodes.MISSING_REQUIRED_FIELD]: 'Заповніть всі обов\'язкові поля.',
    [ErrorCodes.INSUFFICIENT_FUNDS]: 'Недостатньо коштів для виконання операції.',
    [ErrorCodes.INVALID_TRANSACTION]: 'Некоректна транзакція. Спробуйте ще раз.',
    [ErrorCodes.NETWORK_ERROR]: 'Помилка мережі. Перевірте інтернет-з\'єднання.',
    [ErrorCodes.UNKNOWN_ERROR]: 'Сталася невідома помилка. Спробуйте пізніше.',
  };

  return errorMessages[error.code] || error.message || 'Невідома помилка';
};

export const isRecoverableError = (error: GameError): boolean => {
  return error.recoverable && ![
    ErrorCodes.INVALID_GAME_STATE,
    ErrorCodes.UNKNOWN_ERROR
  ].includes(error.code as any);
};

export const logError = (error: GameError | Error, context?: string) => {
  const timestamp = new Date().toISOString();
  const errorInfo = error instanceof Error ? {
    code: ErrorCodes.UNKNOWN_ERROR,
    message: error.message,
    details: { 
      stack: error.stack,
      name: error.name
    },
    timestamp: new Date(),
    recoverable: false
  } : error;

  console.error(`[${timestamp}] ${context ? `[${context}] ` : ''}Error:`, {
    code: errorInfo.code,
    message: errorInfo.message,
    details: errorInfo.details,
    recoverable: errorInfo.recoverable
  });

  // TODO: Send to error monitoring service in production
  // if (import.meta.env.PROD) {
  //   sendToErrorService(errorInfo, context);
  // }
};

// Helper to wrap async functions with error handling
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error as Error, context);
      return null;
    }
  };
};

// Retry logic for recoverable errors
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};
