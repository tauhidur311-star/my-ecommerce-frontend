class SSEService {
  constructor() {
    this.eventSource = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.connected = false;
  }

  connect() {
    if (this.eventSource) {
      this.disconnect();
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found for SSE connection');
      return;
    }

    try {
      // Create EventSource with auth header (using query param since EventSource doesn't support headers)
      const url = `/api/sse/events?token=${encodeURIComponent(token)}`;
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = (event) => {
        console.log('SSE connection opened');
        this.connected = true;
        this.reconnectAttempts = 0;
        this.emit('connection', { status: 'connected' });
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit('message', data);
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      this.eventSource.onerror = (event) => {
        console.error('SSE connection error:', event);
        this.connected = false;
        this.emit('connection', { status: 'error', event });

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`SSE reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            this.connect();
          }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
        } else {
          console.error('Max SSE reconnection attempts reached');
          this.emit('connection', { status: 'failed' });
        }
      };

      // Listen for specific events
      this.setupEventListeners();

    } catch (error) {
      console.error('Error creating SSE connection:', error);
    }
  }

  setupEventListeners() {
    if (!this.eventSource) return;

    // Connected event
    this.eventSource.addEventListener('connected', (event) => {
      const data = JSON.parse(event.data);
      console.log('SSE connected:', data);
      this.emit('connected', data);
    });

    // Template published
    this.eventSource.addEventListener('template_published', (event) => {
      const data = JSON.parse(event.data);
      console.log('Template published:', data);
      this.emit('template_published', data);
    });

    // Template updated
    this.eventSource.addEventListener('template_updated', (event) => {
      const data = JSON.parse(event.data);
      console.log('Template updated:', data);
      this.emit('template_updated', data);
    });

    // Asset uploaded
    this.eventSource.addEventListener('asset_uploaded', (event) => {
      const data = JSON.parse(event.data);
      console.log('Asset uploaded:', data);
      this.emit('asset_uploaded', data);
    });

    // Reusable block created
    this.eventSource.addEventListener('reusable_block_created', (event) => {
      const data = JSON.parse(event.data);
      console.log('Reusable block created:', data);
      this.emit('reusable_block_created', data);
    });

    // Ping/pong for keep-alive
    this.eventSource.addEventListener('ping', (event) => {
      // Just acknowledge the ping
      console.debug('SSE ping received');
    });
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.connected = false;
      console.log('SSE connection closed');
      this.emit('connection', { status: 'disconnected' });
    }
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(eventType);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }

  off(eventType, callback) {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  emit(eventType, data) {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in SSE event listener for ${eventType}:`, error);
        }
      });
    }
  }

  isConnected() {
    return this.connected && this.eventSource && this.eventSource.readyState === EventSource.OPEN;
  }

  getConnectionState() {
    if (!this.eventSource) return 'disconnected';
    
    switch (this.eventSource.readyState) {
      case EventSource.CONNECTING: return 'connecting';
      case EventSource.OPEN: return 'connected';
      case EventSource.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }
}

// Singleton instance
const sseService = new SSEService();

// Auto-connect when module is imported (if token exists)
if (typeof window !== 'undefined' && localStorage.getItem('token')) {
  sseService.connect();
}

export default sseService;