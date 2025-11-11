// Enhanced Error Logging Service for Robust Debugging
import toast from 'react-hot-toast';

class ErrorLogger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.errorHistory = [];
    this.maxHistorySize = 50;
  }

  // Log error with detailed information
  logError(error, context = '', additionalData = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      context,
      message: error.message || 'Unknown error',
      stack: error.stack,
      name: error.name,
      code: error.code,
      status: error.status || error.response?.status,
      url: error.config?.url || window.location.href,
      method: error.config?.method,
      requestData: error.config?.data,
      responseData: error.response?.data,
      userAgent: navigator.userAgent,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      additionalData,
      severity: this.determineSeverity(error)
    };

    // Add to error history
    this.errorHistory.unshift(errorInfo);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.pop();
    }

    // Console logging
    console.group(`🚨 Error in ${context || 'Unknown Context'}`);
    console.error('Error Object:', error);
    console.table(errorInfo);
    console.groupEnd();

    return errorInfo;
  }

  // Show user-friendly error dialog with debug info
  showErrorDialog(error, context = '', userMessage = null) {
    const errorInfo = this.logError(error, context);
    
    const defaultMessage = this.getUserFriendlyMessage(error);
    const displayMessage = userMessage || defaultMessage;
    
    // Show toast notification
    toast.error(displayMessage, {
      duration: 5000,
      style: {
        background: '#FEE2E2',
        color: '#DC2626',
        border: '1px solid #FECACA'
      }
    });

    // Show detailed debug dialog in development
    if (this.isDevelopment) {
      this.showDebugDialog(errorInfo);
    }

    return errorInfo;
  }

  // Show detailed debug dialog
  showDebugDialog(errorInfo) {
    const debugMessage = `
🔍 DEBUG INFO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ Time: ${errorInfo.timestamp}
🏷️  Context: ${errorInfo.context}
📝 Message: ${errorInfo.message}
🔢 Status: ${errorInfo.status || 'N/A'}
🌐 URL: ${errorInfo.url}
🔧 Method: ${errorInfo.method || 'N/A'}
👤 User ID: ${errorInfo.userId || 'N/A'}
🔑 Session ID: ${errorInfo.sessionId || 'N/A'}
⚠️  Severity: ${errorInfo.severity}

📊 REQUEST DATA:
${JSON.stringify(errorInfo.requestData, null, 2)}

📋 RESPONSE DATA:
${JSON.stringify(errorInfo.responseData, null, 2)}

🔬 STACK TRACE:
${errorInfo.stack || 'No stack trace available'}

📱 USER AGENT:
${errorInfo.userAgent}

💾 ADDITIONAL DATA:
${JSON.stringify(errorInfo.additionalData, null, 2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;

    // Create and show debug dialog
    const dialog = document.createElement('div');
    dialog.innerHTML = `
      <div style="
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%; 
        background: rgba(0,0,0,0.8); 
        z-index: 10000; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        font-family: 'Courier New', monospace;
      ">
        <div style="
          background: #1a1a1a; 
          color: #00ff00; 
          padding: 20px; 
          border-radius: 8px; 
          max-width: 90vw; 
          max-height: 90vh; 
          overflow: auto;
          border: 2px solid #333;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: #ff6b6b;">🚨 ERROR DEBUG DIALOG</h3>
            <button onclick="this.parentElement.parentElement.parentElement.remove()" 
              style="
                background: #ff4444; 
                color: white; 
                border: none; 
                padding: 5px 10px; 
                border-radius: 4px; 
                cursor: pointer;
                font-family: inherit;
              ">
              ✕ Close
            </button>
          </div>
          <pre style="
            white-space: pre-wrap; 
            word-wrap: break-word; 
            font-size: 12px; 
            line-height: 1.4;
            margin: 0;
            color: #00ff00;
          ">${debugMessage}</pre>
          <div style="margin-top: 15px; text-align: center;">
            <button onclick="navigator.clipboard.writeText(\`${debugMessage.replace(/`/g, '\\`')}\`)" 
              style="
                background: #4CAF50; 
                color: white; 
                border: none; 
                padding: 8px 16px; 
                border-radius: 4px; 
                cursor: pointer;
                margin-right: 10px;
                font-family: inherit;
              ">
              📋 Copy Error Info
            </button>
            <button onclick="window.errorLogger.downloadErrorLog()" 
              style="
                background: #2196F3; 
                color: white; 
                border: none; 
                padding: 8px 16px; 
                border-radius: 4px; 
                cursor: pointer;
                font-family: inherit;
              ">
              💾 Download Error History
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (dialog.parentElement) {
        dialog.remove();
      }
    }, 30000);
  }

  // Determine error severity
  determineSeverity(error) {
    const status = error.status || error.response?.status;
    
    if (status >= 500) return 'CRITICAL';
    if (status >= 400) return 'ERROR';
    if (status >= 300) return 'WARNING';
    if (error.name === 'NetworkError') return 'NETWORK';
    if (error.name === 'TypeError') return 'TYPE';
    
    return 'INFO';
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error) {
    const status = error.status || error.response?.status;
    
    const messageMap = {
      400: 'Invalid request. Please check your input.',
      401: 'Authentication required. Please log in.',
      403: 'Access denied. You don\'t have permission.',
      404: 'Resource not found. The page or data doesn\'t exist.',
      422: 'Validation failed. Please check your data.',
      429: 'Too many requests. Please wait and try again.',
      500: 'Server error. Please try again later.',
      502: 'Service unavailable. Please try again later.',
      503: 'Server maintenance. Please try again later.',
      504: 'Request timeout. Please check your connection.'
    };

    if (status && messageMap[status]) {
      return messageMap[status];
    }

    if (error.message) {
      // Clean up common error messages
      if (error.message.includes('Network Error')) {
        return 'Connection failed. Please check your internet connection.';
      }
      if (error.message.includes('timeout')) {
        return 'Request timed out. Please try again.';
      }
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  // Get current user ID
  getCurrentUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user._id || user.id || null;
    } catch {
      return null;
    }
  }

  // Get session ID
  getSessionId() {
    try {
      return localStorage.getItem('sessionId') || 
             sessionStorage.getItem('sessionId') || 
             'session-' + Date.now();
    } catch {
      return null;
    }
  }

  // Download error history
  downloadErrorLog() {
    const logData = {
      exportDate: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
      errors: this.errorHistory
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-log-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Get error history
  getErrorHistory() {
    return [...this.errorHistory];
  }

  // Clear error history
  clearErrorHistory() {
    this.errorHistory = [];
  }

  // Network monitoring
  startNetworkMonitoring() {
    window.addEventListener('online', () => {
      toast.success('Connection restored', {
        icon: '🌐',
        style: { background: '#D1FAE5', color: '#065F46' }
      });
    });

    window.addEventListener('offline', () => {
      toast.error('Connection lost', {
        icon: '📡',
        style: { background: '#FEE2E2', color: '#DC2626' }
      });
    });
  }
}

// Create global instance
const errorLogger = new ErrorLogger();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.errorLogger = errorLogger;
}

export default errorLogger;