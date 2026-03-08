import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const WebSocketContext = createContext();

// Fallback to mock WebSocket if server unavailable
class MockSocket {
  on() {}
  off() {}
  emit() {}
  disconnect() {}
  connect() {}
}

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const reconnectTimeout = useRef(null);

  useEffect(() => {
    // Try to connect to real Socket.io server (fallback to mock after 3s)
    const realSocket = io('http://localhost:5000', {
      autoConnect: false,
      reconnection: false,
      timeout: 3000
    });

    let hasConnected = false;

    realSocket.on('connect', () => {
      console.log('✓ Connected to WebSocket server');
      setIsConnected(true);
      setSocket(realSocket);
      hasConnected = true;
      setReconnectAttempts(0);
    });

    realSocket.on('connect_error', (error) => {
      console.warn('WebSocket connection failed:', error.message);
      if (!hasConnected) {
        // Fallback to mock socket after timeout
        setTimeout(() => {
          if (!hasConnected) {
            console.log('⚠ Using mock WebSocket (server unavailable)');
            setSocket(new MockSocket());
            setIsConnected(true); // Consider mock as "connected"
          }
        }, 3000);
      }
    });

    realSocket.connect();

    // Reconnection logic
    const attemptReconnect = () => {
      if (reconnectAttempts < 5 && !isConnected) {
        console.log(`🔁 Reconnecting... (attempt ${reconnectAttempts + 1})`);
        realSocket.connect();
        setReconnectAttempts(prev => prev + 1);
        reconnectTimeout.current = setTimeout(attemptReconnect, Math.min(5000, 1000 * (reconnectAttempts + 1)));
      }
    };

    if (!isConnected) {
      reconnectTimeout.current = setTimeout(attemptReconnect, 3000);
    }

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      realSocket.disconnect();
    };
  }, [reconnectAttempts, isConnected]);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, reconnectAttempts }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};