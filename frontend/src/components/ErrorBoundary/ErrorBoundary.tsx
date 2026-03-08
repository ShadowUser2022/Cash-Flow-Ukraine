import { Component, type ErrorInfo, type ReactNode } from 'react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console and potentially send to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // TODO: Send error to monitoring service (Sentry, LogRocket, etc.)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-container">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Щось пішло не так</h2>
            <p className="error-message">
              Виникла неочікувана помилка. Будь ласка, спробуйте перезавантажити сторінку.
            </p>
            
            <div className="error-actions">
              <button 
                className="retry-button" 
                onClick={this.handleRetry}
              >
                🔄 Спробувати знову
              </button>
              <button 
                className="reload-button" 
                onClick={() => window.location.reload()}
              >
                🔃 Перезавантажити сторінку
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Деталі помилки (тільки в режимі розробки)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
