import { useState, useEffect, useCallback, useRef } from "react";
import type { ChatMessage } from "@shared/services/types";
import { storage } from "@shared/utils/storage";

interface UseWebSocketReturn {
  isConnected: boolean;
  error: string | null;
  connect: (roomId: number) => void;
  disconnect: () => void;
  sendMessage: (message: string) => void;
  onMessage: (callback: (message: ChatMessage) => void) => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const messageCallbackRef = useRef<((message: ChatMessage) => void) | null>(
    null
  );
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentRoomIdRef = useRef<number | null>(null);

  const connect = useCallback((roomId: number) => {
    const token = storage.getToken();
    if (!token) {
      setError("No authentication token available");
      return;
    }

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      currentRoomIdRef.current = roomId;
      const wsUrl = `ws://localhost:8080/api/chat/ws?token=${encodeURIComponent(
        token
      )}&room_id=${roomId}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected to room:", roomId);
        setIsConnected(true);
        setError(null);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: ChatMessage = JSON.parse(event.data);
          if (messageCallbackRef.current) {
            messageCallbackRef.current(message);
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log("WebSocket disconnected:", event);
        setIsConnected(false);

        // Auto-reconnect if not intentionally closed
        if (event.code !== 1000 && currentRoomIdRef.current) {
          setError("Connection lost. Attempting to reconnect...");
          reconnectTimeoutRef.current = setTimeout(() => {
            if (currentRoomIdRef.current) {
              connect(currentRoomIdRef.current);
            }
          }, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("WebSocket connection error");
        setIsConnected(false);
      };
    } catch (err) {
      console.error("Failed to create WebSocket connection:", err);
      setError("Failed to establish connection");
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    currentRoomIdRef.current = null;

    if (wsRef.current) {
      wsRef.current.close(1000); // Normal closure
      wsRef.current = null;
    }

    setIsConnected(false);
    setError(null);
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "message",
          content: message,
        })
      );
    } else {
      setError("WebSocket is not connected");
    }
  }, []);

  const onMessage = useCallback((callback: (message: ChatMessage) => void) => {
    messageCallbackRef.current = callback;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    error,
    connect,
    disconnect,
    sendMessage,
    onMessage,
  };
};
