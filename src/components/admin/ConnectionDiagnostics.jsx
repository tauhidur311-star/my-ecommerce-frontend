import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import GlassCard from '../ui/glass/GlassCard';

const ConnectionDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState({
    backend: { status: 'checking', message: 'Testing connection...', url: '' },
    sse: { status: 'checking', message: 'Testing SSE connection...', url: '' },
    websocket: { status: 'checking', message: 'Testing WebSocket connection...', url: '' }
  });

  const runDiagnostics = async () => {
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const wsUrl = process.env.REACT_APP_WS_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000';

    // Test Backend API
    try {
      const response = await fetch(`${backendUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDiagnostics(prev => ({
          ...prev,
          backend: {
            status: 'success',
            message: `Backend connected (${response.status})`,
            url: backendUrl
          }
        }));
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        backend: {
          status: 'error',
          message: `Backend connection failed: ${error.message}`,
          url: backendUrl
        }
      }));
    }

    // Test SSE Connection
    try {
      const sseUrl = `${backendUrl}/api/sse/system/status`;
      const eventSource = new EventSource(sseUrl);
      
      const timeout = setTimeout(() => {
        eventSource.close();
        setDiagnostics(prev => ({
          ...prev,
          sse: {
            status: 'error',
            message: 'SSE connection timeout',
            url: sseUrl
          }
        }));
      }, 10000);

      eventSource.onopen = () => {
        clearTimeout(timeout);
        eventSource.close();
        setDiagnostics(prev => ({
          ...prev,
          sse: {
            status: 'success',
            message: 'SSE connection successful',
            url: sseUrl
          }
        }));
      };

      eventSource.onerror = (error) => {
        clearTimeout(timeout);
        eventSource.close();
        setDiagnostics(prev => ({
          ...prev,
          sse: {
            status: 'error',
            message: 'SSE connection failed',
            url: sseUrl
          }
        }));
      };
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        sse: {
          status: 'error',
          message: `SSE error: ${error.message}`,
          url: `${backendUrl}/api/sse/system/status`
        }
      }));
    }

    // Test WebSocket (placeholder - actual implementation would need socket.io)
    setDiagnostics(prev => ({
      ...prev,
      websocket: {
        status: 'warning',
        message: 'WebSocket test not implemented',
        url: wsUrl
      }
    }));
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <WifiOff className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Connection Diagnostics</h3>
        <button
          onClick={runDiagnostics}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retest
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(diagnostics).map(([key, test]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <div>
                  <h4 className="font-medium text-gray-900 capitalize">{key} Connection</h4>
                  <p className="text-sm text-gray-600">{test.message}</p>
                </div>
              </div>
            </div>
            {test.url && (
              <div className="mt-2 text-xs text-gray-500">
                <strong>URL:</strong> {test.url}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
        <h4 className="font-medium text-gray-900 mb-2">Environment Variables:</h4>
        <div className="space-y-1 text-gray-600">
          <div><strong>REACT_APP_API_URL:</strong> {process.env.REACT_APP_API_URL || 'Not set'}</div>
          <div><strong>REACT_APP_WS_URL:</strong> {process.env.REACT_APP_WS_URL || 'Not set'}</div>
          <div><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'Not set'}</div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ConnectionDiagnostics;