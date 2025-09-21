import { useState, useCallback } from "react";
import { roomsApi } from "@shared/services/api";
import type { ChatMessage } from "@shared/services/types";

interface UseMessagesReturn {
  messages: Record<number, ChatMessage[]>;
  isLoading: boolean;
  error: string | null;
  loadRoomMessages: (roomId: number) => Promise<void>;
  sendMessage: (roomId: number, content: string) => Promise<ChatMessage>;
  addMessage: (roomId: number, message: ChatMessage) => void;
}

export const useMessages = (): UseMessagesReturn => {
  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const sendMessage = useCallback(async (roomId: number, content: string) => {
    if (!content.trim()) {
      throw new Error("Tin nhắn không được để trống");
    }

    setError(null);
    try {
      const newMessage = await roomsApi.sendMessage(roomId, content.trim());

      // Add message to local state immediately
      setMessages((prev) => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), newMessage],
      }));

      return newMessage;
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Không thể gửi tin nhắn");
      throw err;
    }
  }, []);

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
  };
};
