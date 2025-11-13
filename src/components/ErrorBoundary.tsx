import React, { Component, ReactNode, ErrorInfo } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug, 
  Mail,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  level?: 'page' | 'component' | 'section';
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    const { errorId } = this.state;
    
    this.setState({
      error,
      errorInfo
    });

    // Log error to external service or analytics
    this.logError(error, errorInfo, errorId);
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo, errorId);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, index) => prevProps.resetKeys?.[index] !== key)) {
        this.resetErrorBoundary();
      }
    }
    
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  logError = async (error: Error, errorInfo: ErrorInfo, errorId: string) => {
    try {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.group('🚨 Error Boundary Caught Error');
        console.error('Error ID:', errorId);
        console.error('Error:', error);
        console.error('Component Stack:', errorInfo.componentStack);
        console.error('Error Stack:', error.stack);
        console.groupEnd();
      }

      // Send to logging service in production
      if (process.env.NODE_ENV === 'production') {
        const errorData = {
          errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          userId: this.getUserId(),
          level: this.props.level || 'component'
        };

        // Send to analytics or error reporting service
        await fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(errorData)
        }).catch(() => {
          // Fallback: store in localStorage if network fails
          const errors = JSON.parse(localStorage.getItem('errorLogs') || '[]');
          errors.push(errorData);
          localStorage.setItem('errorLogs', JSON.stringify(errors.slice(-10))); // Keep last 10 errors
        });
      }
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  getUserId = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.id || 'unknown';
      }
    } catch {
      // Ignore errors
    }
    return 'anonymous';
  };

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      errorId: ''
    });
  };

  handleRetry = () => {
    this.resetErrorBoundary();
    
    // Slight delay to prevent immediate re-error
    this.resetTimeoutId = window.setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state;
    
    const subject = encodeURIComponent(`Bug Report - ${errorId}`);
    const body = encodeURIComponent(`
Error ID: ${errorId}
Error Message: ${error?.message}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}

Steps to reproduce:
1. 
2. 
3. 

Additional information:
${error?.stack || ''}
    `.trim());
    
    const mailtoLink = `mailto:support@styleshop.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  getErrorLevel = () => {
    const { level } = this.props;
    
    switch (level) {
      case 'page':
        return {
          title: 'Page Error',
          description: 'This page encountered an error and cannot be displayed.',
          icon: <AlertTriangle size={48} className="text-red-500" />
        };
      case 'section':
        return {
          title: 'Section Error',
          description: 'This section encountered an error.',
          icon: <AlertTriangle size={32} className="text-orange-500" />
        };
      default:
        return {
          title: 'Component Error',
          description: 'A component on this page encountered an error.',
          icon: <AlertTriangle size={24} className="text-yellow-500" />
        };
    }
  };

  render() {
    const { hasError, error, errorInfo, showDetails, errorId } = this.state;
    const { children, fallback, isolate, level } = this.props;
    
    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      const errorLevel = this.getErrorLevel();
      const isMinimalError = level === 'component';

      // Minimal error display for component-level errors
      if (isMinimalError) {
        return (
          <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-center">
              {errorLevel.icon}
              <p className="text-sm text-red-700 mt-2">Component failed to load</p>
              <button
                onClick={this.resetErrorBoundary}
                className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        );
      }

      // Full error page for page/section level errors
      return (
        <motion.div
          className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Error Icon */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              {errorLevel.icon}
            </motion.div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {errorLevel.title}
            </h1>

            {/* Error Description */}
            <p className="text-gray-600 mb-6">
              {errorLevel.description}
            </p>

            {/* Error ID */}
            <p className="text-sm text-gray-500 mb-6 font-mono">
              Error ID: {errorId}
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={20} />
                <span>Try Again</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Home size={20} />
                <span>Go Home</span>
              </button>

              <button
                onClick={this.handleReportBug}
                className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Mail size={20} />
                <span>Report Issue</span>
              </button>
            </div>

            {/* Error Details Toggle */}
            {(error || errorInfo) && (
              <div className="mt-6 text-left">
                <button
                  onClick={this.toggleDetails}
                  className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <span className="flex items-center space-x-1">
                    <Bug size={16} />
                    <span>Technical Details</span>
                  </span>
                  {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showDetails && (
                  <motion.div
                    className="mt-3 p-3 bg-gray-100 rounded-lg overflow-auto max-h-40 text-xs font-mono"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    {error && (
                      <div className="mb-2">
                        <strong>Error:</strong> {error.message}
                        {error.stack && (
                          <pre className="mt-1 whitespace-pre-wrap text-xs text-gray-600">
                            {error.stack}
                          </pre>
                        )}
                      </div>
                    )}
                    {errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs text-gray-600">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    // Render children normally if no error
    return isolate ? (
      <div className="error-boundary-isolate">
        {children}
      </div>
    ) : (
      <>{children}</>
    );
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }
}

// HOC for easier usage
export const withErrorBoundary = (
  Component: React.ComponentType<any>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: any) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook for programmatic error handling
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  return { captureError, resetError };
};

export default ErrorBoundary;