import React from 'react';
import { ErrorLogger } from '../services/errorLogger';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error with context
    const errorId = ErrorLogger.logError(error, {
      componentStack: errorInfo.componentStack,
      context: 'ErrorBoundary',
      timestamp: new Date().toISOString()
    });

    this.setState({
      error,
      errorInfo,
      errorId
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '2rem',
          background: 'var(--bg1)',
          color: 'var(--t1)',
          fontFamily: 'var(--fd)'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>
            Something went wrong
          </h1>
          <p style={{ 
            fontSize: '0.95rem', 
            color: 'var(--t2)', 
            marginBottom: '1.5rem',
            textAlign: 'center',
            maxWidth: '500px'
          }}>
            An unexpected error occurred. Our team has been notified (Error ID: <code style={{ 
              background: 'var(--bg2)', 
              padding: '0.2rem 0.5rem', 
              borderRadius: '0.4rem',
              fontSize: '0.85rem'
            }}>{this.state.errorId}</code>).
          </p>

          {(import.meta.env?.DEV || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development')) && (
            <details style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'var(--bg2)',
              borderRadius: '0.75rem',
              border: '1px solid var(--bdr)',
              width: '100%',
              maxWidth: '600px',
              textAlign: 'left',
              cursor: 'pointer'
            }}>
              <summary style={{ fontWeight: 600, marginBottom: '0.5rem', cursor: 'pointer' }}>
                Error Details (Development)
              </summary>
              <pre style={{
                background: 'var(--bg3)',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                overflow: 'auto',
                fontSize: '0.75rem',
                color: 'var(--t2)',
                maxHeight: '300px'
              }}>
                {this.state.error?.toString()}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--g4)',
              color: '#000',
              border: 'none',
              borderRadius: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            🏠 Go Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
