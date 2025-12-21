import { useEffect, useRef, useState, useCallback } from 'react';
import { WS_URL } from '@/lib/config';

interface WebSocketMessage {
    type: string;
    [key: string]: any;
}

interface UseWebSocketOptions {
    onMessage?: (message: WebSocketMessage) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Event) => void;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
    sendMessage: (message: WebSocketMessage) => void;
    isConnected: boolean;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
    reconnect: () => void;
}

/**
 * Custom React hook for WebSocket connections with auto-reconnection
 * 
 * @param userId - User identifier (email) for the WebSocket connection
 * @param options - Configuration options for the WebSocket
 * @returns WebSocket utilities and connection status
 * 
 * @example
 * ```tsx
 * const { sendMessage, isConnected } = useWebSocket(userEmail, {
 *   onMessage: (msg) => console.log('Received:', msg),
 *   onConnect: () => console.log('Connected!'),
 * });
 * ```
 */
export function useWebSocket(
    userId: string | null,
    options: UseWebSocketOptions = {}
): UseWebSocketReturn {
    const {
        onMessage,
        onConnect,
        onDisconnect,
        onError,
        reconnectInterval = 3000,
        maxReconnectAttempts = 5,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const shouldReconnectRef = useRef(true);

    /**
     * Send a message through the WebSocket connection
     */
    const sendMessage = useCallback((message: WebSocketMessage) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket is not connected. Message not sent:', message);
        }
    }, []);

    /**
     * Send heartbeat ping to keep connection alive
     */
    const sendHeartbeat = useCallback(() => {
        sendMessage({ type: 'ping' });
    }, [sendMessage]);

    /**
     * Connect to WebSocket server
     */
    const connect = useCallback(() => {
        if (!userId) {
            console.warn('Cannot connect WebSocket: userId is null');
            return;
        }

        // Close existing connection if any
        if (wsRef.current) {
            wsRef.current.close();
        }

        setConnectionStatus('connecting');

        try {
            // Determine WebSocket URL based on config
            const wsUrl = `${WS_URL}/ws/${encodeURIComponent(userId)}`;

            console.log('🔌 Connecting to WebSocket:', wsUrl);
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('✅ WebSocket connected');
                setIsConnected(true);
                setConnectionStatus('connected');
                reconnectAttemptsRef.current = 0;
                onConnect?.();

                // Start heartbeat
                const heartbeatInterval = setInterval(() => {
                    sendHeartbeat();
                }, 30000); // Every 30 seconds

                // Store interval ID for cleanup
                (ws as any).heartbeatInterval = heartbeatInterval;
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data) as WebSocketMessage;
                    console.log('📨 WebSocket message received:', message);
                    onMessage?.(message);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                setConnectionStatus('error');
                onError?.(error);
            };

            ws.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                setIsConnected(false);
                setConnectionStatus('disconnected');
                onDisconnect?.();

                // Clear heartbeat
                if ((ws as any).heartbeatInterval) {
                    clearInterval((ws as any).heartbeatInterval);
                }

                // Attempt reconnection if enabled
                if (shouldReconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
                    reconnectAttemptsRef.current += 1;
                    console.log(`🔄 Reconnecting... (Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, reconnectInterval);
                } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                    console.error('❌ Max reconnection attempts reached');
                    setConnectionStatus('error');
                }
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            setConnectionStatus('error');
        }
    }, [userId, onMessage, onConnect, onDisconnect, onError, reconnectInterval, maxReconnectAttempts, sendHeartbeat]);

    /**
     * Manually trigger reconnection
     */
    const reconnect = useCallback(() => {
        reconnectAttemptsRef.current = 0;
        connect();
    }, [connect]);

    /**
     * Setup and cleanup WebSocket connection
     */
    useEffect(() => {
        if (userId) {
            shouldReconnectRef.current = true;
            connect();
        }

        // Cleanup on unmount
        return () => {
            shouldReconnectRef.current = false;

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            if (wsRef.current) {
                // Clear heartbeat
                if ((wsRef.current as any).heartbeatInterval) {
                    clearInterval((wsRef.current as any).heartbeatInterval);
                }
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [userId, connect]);

    return {
        sendMessage,
        isConnected,
        connectionStatus,
        reconnect,
    };
}
