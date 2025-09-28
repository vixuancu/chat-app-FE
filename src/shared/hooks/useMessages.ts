import { useState, useCallback, useRef, useEffect } from "react";
import { roomsApi } from "@shared/services/api";
import { useWebSocket } from "./useWebSocket";
import { ChatUtils } from "@shared/utils/chatUtils";
import type { ChatMessage } from "@shared/services/types";

interface UseMessagesReturn {
  messages: Record<number, ChatMessage[]>;
  isLoading: boolean;
  error: string | null;
  loadRoomMessages: (roomId: number) => Promise<void>;
  sendMessage: (roomId: number, content: string) => Promise<void>;
  addMessage: (roomId: number, message: ChatMessage) => void;
  // 🔧 NEW LOGIC: Join/leave rooms without reconnecting
  joinRoom: (roomId: number) => void;
  leaveRoom: (roomId: number) => void;
  isConnected: boolean;
}

export const useMessages = (): UseMessagesReturn => {
  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentRoomRef = useRef<number | null>(null);

  // WebSocket integration - for real-time receiving and sending
  const {
    isConnected,
    joinRoom: wsJoinRoom,
    leaveRoom: wsLeaveRoom,
    sendMessage: wsSendMessage,
    onMessage,
  } = useWebSocket();

  // Set up WebSocket message handler
  useEffect(() => {
    onMessage((message: ChatMessage) => {
      console.log("📨 [useMessages] Received WebSocket message:", message);

      // ✅ Validate message before processing
      if (!ChatUtils.isValidMessage(message)) {
        console.warn(
          "⚠️ [useMessages] Invalid message received, skipping:",
          message
        );
        return;
      }

      // Add message for any room (not just current room)
      // This ensures messages appear even if user switched rooms
      setMessages((prev) => {
        const roomMessages = prev[message.room_id] || [];

        // Check if message already exists to avoid duplicates
        const exists = roomMessages.find(
          (m) => m.message_id === message.message_id
        );

        if (exists) {
          console.log(
            "📨 [useMessages] Message already exists, skipping:",
            message.message_id
          );
          return prev;
        }

        console.log(
          "📨 [useMessages] Adding new message to room",
          message.room_id,
          ":",
          message.content
        );
        return {
          ...prev,
          [message.room_id]: [...roomMessages, message],
        };
      });
    });
  }, [onMessage]);

  // 🔧 NEW LOGIC: Join room without reconnecting WebSocket
  const joinRoom = useCallback(
    (roomId: number) => {
      console.log("� [useMessages] Joining room:", roomId);

      // Leave current room if exists
      if (currentRoomRef.current && currentRoomRef.current !== roomId) {
        console.log(
          "🚪 [useMessages] Leaving current room:",
          currentRoomRef.current
        );
        wsLeaveRoom(currentRoomRef.current);
      }

      // Join new room
      currentRoomRef.current = roomId;
      wsJoinRoom(roomId);
    },
    [wsJoinRoom, wsLeaveRoom]
  );

  const leaveRoom = useCallback(
    (roomId: number) => {
      console.log("� [useMessages] Leaving room:", roomId);
      if (currentRoomRef.current === roomId) {
        currentRoomRef.current = null;
      }
      wsLeaveRoom(roomId);
    },
    [wsLeaveRoom]
  );

  const loadRoomMessages = useCallback(async (roomId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const roomMessages = await roomsApi.getRoomMessages(roomId);
      setMessages((prev) => ({
        ...prev,
        [roomId]: roomMessages,
      }));
    } catch (err) {
      console.error("Failed to load messages:", err);
      setError("Không thể tải tin nhắn");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🔧 NEW LOGIC: Send messages via WebSocket only, receive real message back via WebSocket
  const sendMessage = useCallback(
    async (roomId: number, content: string): Promise<void> => {
      if (!content.trim()) {
        throw new Error("Tin nhắn không được để trống");
      }

      if (!isConnected) {
        throw new Error("Không có kết nối WebSocket");
      }

      setError(null);

      console.log(
        "📤 [useMessages] Sending message via WebSocket:",
        content.trim(),
        "to room:",
        roomId
      );

      // Send via WebSocket - the real message will come back via WebSocket event
      wsSendMessage(content.trim(), roomId);

      // Fire and forget - real message will be received via onMessage callback
    },
    [isConnected, wsSendMessage]
  );

  const addMessage = useCallback((roomId: number, message: ChatMessage) => {
    setMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), message],
    }));
  }, []);

  return {
    messages,
    isLoading,
    error,
    loadRoomMessages,
    sendMessage,
    addMessage,
    joinRoom,
    leaveRoom,
    isConnected,
  };
};
