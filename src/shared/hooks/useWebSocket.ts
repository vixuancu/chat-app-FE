import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatMessage } from "@shared/services/types";
import { storage } from "@shared/utils/storage";

interface UseWebSocketReturn {
  isConnected: boolean;
  error: string | null;
  isConnecting: boolean;
  connectOnce: () => void;
  disconnect: () => void;
  joinRoom: (roomId: number) => void;
  leaveRoom: (roomId: number) => void;
  sendMessage: (message: string, roomId: number) => void;
  onMessage: (callback: (message: ChatMessage) => void) => void;
  onRoomUpdate: (
    callback: (roomId: number, lastMessage: ChatMessage) => void
  ) => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentRoomIdRef = useRef<number | undefined>(undefined);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // 🔧 FIX: Queue for pending room operations
  const pendingRoomOperationsRef = useRef<
    Array<{ type: "join" | "leave"; roomId: number }>
  >([]);

  const messageCallbackRef = useRef<((message: ChatMessage) => void) | null>(
    null
  );
  const roomUpdateCallbackRef = useRef<
    ((roomId: number, lastMessage: ChatMessage) => void) | null
  >(null);

  const cleanup = useCallback(() => {
    console.log("🧹 [useWebSocket] Cleaning up WebSocket connection");

    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close(1000, "User disconnected");
        }
      } catch (err) {
        console.warn("⚠️ [useWebSocket] Error closing WebSocket:", err);
      } finally {
        wsRef.current = null;
      }
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // 🔧 FIX: Clear pending operations
    pendingRoomOperationsRef.current = [];

    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  // 🔧 FIX: Execute pending room operations when connected
  const executePendingOperations = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const operations = [...pendingRoomOperationsRef.current];
    pendingRoomOperationsRef.current = [];

    operations.forEach(({ type, roomId }) => {
      console.log(
        `🔄 [useWebSocket] Executing pending ${type} for room ${roomId}`
      );

      try {
        const payload = {
          type: type === "join" ? "join_room" : "leave_room",
          room_id: roomId,
        };
        wsRef.current!.send(JSON.stringify(payload));
      } catch (error) {
        console.error(
          `❌ [useWebSocket] Failed to execute pending ${type}:`,
          error
        );
      }
    });
  }, []);

  const connectWebSocket = useCallback(() => {
    if (isConnecting || isConnected) {
      console.log(
        "⚠️ [useWebSocket] Already connected/connecting, skipping..."
      );
      return;
    }

    const token = storage.getToken();
    if (!token) {
      setError("No authentication token found");
      return;
    }

    console.log("🔄 [useWebSocket] Connecting to WebSocket globally...");
    setIsConnecting(true);
    setError(null);

    cleanup();

    try {
      const wsUrl = `ws://localhost:8081/api/v1/chat/ws?token=${token}`;
      console.log(
        "🌐 [useWebSocket] WebSocket URL:",
        wsUrl.replace(token, "[TOKEN]")
      );

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("🔗 [useWebSocket] Connected to WebSocket successfully");
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // 🔧 FIX: Execute any pending room operations
        executePendingOperations();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 [useWebSocket] Received message:", data);

          switch (data.type) {
            case "new_message":
              if (data.data) {
                let messageData;

                if (typeof data.data === "string") {
                  try {
                    messageData = JSON.parse(data.data);
                  } catch (parseError) {
                    console.error(
                      "❌ [useWebSocket] Failed to parse message data string:",
                      parseError
                    );
                    return;
                  }
                } else {
                  messageData = data.data;
                }

                console.log(
                  "💬 [useWebSocket] Parsed message data:",
                  messageData
                );

                const currentUser = storage.getUser();
                const formattedMessage: ChatMessage = {
                  message_id: messageData.message_id,
                  room_id: messageData.room_id || data.room_id,
                  user_uuid: messageData.user_uuid || data.user_uuid,
                  user_fullname: messageData.user_fullname || "Unknown User",
                  user_email: messageData.user_email || "",
                  content: messageData.content,
                  created_at:
                    messageData.created_at ||
                    messageData.timestamp ||
                    new Date().toISOString(),
                  is_own: currentUser
                    ? (messageData.user_uuid || data.user_uuid) ===
                      currentUser.user_uuid
                    : false,
                };

                messageCallbackRef.current?.(formattedMessage);
                roomUpdateCallbackRef.current?.(
                  formattedMessage.room_id,
                  formattedMessage
                );
              }
              break;

            case "user_joined":
              console.log(
                "👋 [useWebSocket] User joined room:",
                data.room_id,
                data.user_uuid
              );
              break;

            case "user_left":
              console.log(
                "👋 [useWebSocket] User left room:",
                data.room_id,
                data.user_uuid
              );
              break;

            case "room_joined":
              console.log(
                "✅ [useWebSocket] Successfully joined room:",
                data.room_id
              );
              break;

            case "error":
              console.error("❌ [useWebSocket] Server error:", data.content);
              setError(data.content || "WebSocket server error");
              break;

            default:
              console.log(
                "ℹ️ [useWebSocket] Unhandled message type:",
                data.type
              );
          }
        } catch (err) {
          console.error(
            "❌ [useWebSocket] Failed to parse WebSocket message:",
            err
          );
        }
      };

      wsRef.current.onerror = (event) => {
        const ws = event.target as WebSocket;
        const errorDetails = {
          readyState: ws?.readyState,
          url: ws?.url?.replace(token, "[TOKEN]") || "unknown",
          timestamp: new Date().toISOString(),
        };

        console.error("❌ [useWebSocket] WebSocket error:", errorDetails);
        setError(`WebSocket connection failed to ${errorDetails.url}`);
        setIsConnecting(false);
      };

      wsRef.current.onclose = (event) => {
        console.log(
          `🔌 [useWebSocket] WebSocket closed - Code: ${event.code}, Reason: ${
            event.reason || "No reason"
          }`
        );
        setIsConnected(false);
        setIsConnecting(false);

        if (
          event.code !== 1000 &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current++;
          const delay = 2000 * reconnectAttemptsRef.current;

          console.log(
            `🔄 [useWebSocket] Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts}) in ${delay}ms...`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error("❌ [useWebSocket] Max reconnection attempts reached");
          setError("Connection lost. Please refresh the page.");
        }
      };
    } catch (err) {
      console.error("❌ [useWebSocket] Failed to create WebSocket:", err);
      setError(
        `Failed to create WebSocket connection: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      setIsConnecting(false);
    }
  }, [cleanup, isConnecting, isConnected, executePendingOperations]);

  const connectOnce = useCallback(() => {
    console.log("🌐 [useWebSocket] Connecting to global WebSocket...");
    currentRoomIdRef.current = undefined;
    connectWebSocket();
  }, [connectWebSocket]);

  // 🔧 FIX: Smart joinRoom with queue support
  const joinRoom = useCallback(
    (roomId: number) => {
      console.log("🚪 [useWebSocket] Attempting to join room:", roomId);

      // 🔧 FIX: If not connected, queue the operation
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.log(
          "⏳ [useWebSocket] WebSocket not ready, queuing join room operation"
        );

        // Remove any existing operation for this room
        pendingRoomOperationsRef.current =
          pendingRoomOperationsRef.current.filter(
            (op) => !(op.type === "join" && op.roomId === roomId)
          );

        // Add to queue
        pendingRoomOperationsRef.current.push({ type: "join", roomId });

        // Try to connect if not connecting
        if (!isConnecting && !isConnected) {
          console.log("🔄 [useWebSocket] Attempting to connect WebSocket...");
          connectWebSocket();
        }

        return;
      }

      currentRoomIdRef.current = roomId;

      try {
        const joinPayload = {
          type: "join_room",
          room_id: roomId,
        };
        console.log("📤 [useWebSocket] Sending join_room:", joinPayload);
        wsRef.current.send(JSON.stringify(joinPayload));
      } catch (error) {
        console.error("❌ [useWebSocket] Failed to join room:", error);
      }
    },
    [isConnecting, isConnected, connectWebSocket]
  );

  // 🔧 FIX: Smart leaveRoom with queue support
  const leaveRoom = useCallback((roomId: number) => {
    console.log("🚪 [useWebSocket] Attempting to leave room:", roomId);

    // 🔧 FIX: If not connected, queue the operation
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log(
        "⏳ [useWebSocket] WebSocket not ready, queuing leave room operation"
      );

      // Remove any existing operation for this room
      pendingRoomOperationsRef.current =
        pendingRoomOperationsRef.current.filter(
          (op) => !(op.type === "leave" && op.roomId === roomId)
        );

      // Add to queue
      pendingRoomOperationsRef.current.push({ type: "leave", roomId });

      return;
    }

    try {
      const leavePayload = {
        type: "leave_room",
        room_id: roomId,
      };
      console.log("📤 [useWebSocket] Sending leave_room:", leavePayload);
      wsRef.current.send(JSON.stringify(leavePayload));
    } catch (error) {
      console.error("❌ [useWebSocket] Failed to leave room:", error);
    }
  }, []);

  const disconnect = useCallback(() => {
    console.log("🔌 [useWebSocket] Manual disconnect requested");
    currentRoomIdRef.current = undefined;
    cleanup();
  }, [cleanup]);

  const sendMessage = useCallback((message: string, roomId: number) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn(
        "📤 [useWebSocket] WebSocket not connected, cannot send message"
      );
      return;
    }

    if (!message.trim() || message.length > 2000) {
      console.error("❌ [useWebSocket] Invalid message content");
      return;
    }

    try {
      const messagePayload = {
        type: "send_message",
        room_id: roomId,
        content: message.trim(),
      };

      console.log("📤 [useWebSocket] Sending message:", messagePayload);
      wsRef.current.send(JSON.stringify(messagePayload));
    } catch (error) {
      console.error("❌ [useWebSocket] Failed to send message:", error);
    }
  }, []);

  const onMessage = useCallback((callback: (message: ChatMessage) => void) => {
    messageCallbackRef.current = callback;
  }, []);

  const onRoomUpdate = useCallback(
    (callback: (roomId: number, lastMessage: ChatMessage) => void) => {
      roomUpdateCallbackRef.current = callback;
    },
    []
  );

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    isConnected,
    isConnecting,
    error,
    connectOnce,
    joinRoom,
    leaveRoom,
    disconnect,
    sendMessage,
    onMessage,
    onRoomUpdate,
  };
};
