import { useState, useCallback, useRef, useEffect } from "react";
import { roomsApi } from "@shared/services/api";
import { useWebSocket } from "./useWebSocket";
import { ChatUtils } from "@shared/utils/chatUtils";
import { storage } from "@shared/utils/storage";
import type { ChatMessage } from "@shared/services/types";

interface UseMessagesReturn {
  messages: Record<number, ChatMessage[]>;
  isLoading: boolean;
  error: string | null;
  loadRoomMessages: (roomId: number) => Promise<void>;
  loadMoreMessages: (roomId: number) => Promise<void>; // 🆕 NEW: Load older messages
  hasMore: Record<number, boolean>; // 🆕 NEW: Track if more messages available
  sendMessage: (roomId: number, content: string) => Promise<void>;
  addMessage: (roomId: number, message: ChatMessage) => void;
  // 🔧 NEW LOGIC: Join/leave rooms without reconnecting
  joinRoom: (roomId: number) => void;
  leaveRoom: (roomId: number) => void;
  isConnected: boolean;
  onNewMessage: (callback: (message: ChatMessage) => void) => void; // 🆕 NEW: Allow parent to listen to messages
}

export const useMessages = (): UseMessagesReturn => {
  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<Record<number, boolean>>({}); // 🆕 Track pagination state
  const [cursors, setCursors] = useState<Record<number, number | null>>({}); // 🆕 Track cursors
  const currentRoomRef = useRef<number | null>(null);

  // WebSocket integration - for real-time receiving and sending
  const {
    isConnected,
    joinRoom: wsJoinRoom,
    leaveRoom: wsLeaveRoom,
    sendMessage: wsSendMessage,
    onMessage,
  } = useWebSocket();

  // 🆕 NEW: Allow parent to register callback for new messages
  const newMessageCallbackRef = useRef<((message: ChatMessage) => void) | null>(
    null
  );

  const onNewMessage = useCallback(
    (callback: (message: ChatMessage) => void) => {
      console.log("📝 [useMessages] Registering new message callback");
      newMessageCallbackRef.current = callback;
    },
    []
  );

  // Set up WebSocket message handler
  useEffect(() => {
    onMessage((message: ChatMessage) => {
      console.log("📨 [useMessages] Received WebSocket message:", message);

      // ✅ Notify parent FIRST (for room list updates)
      if (newMessageCallbackRef.current) {
        console.log("📢 [useMessages] Notifying parent about new message");
        newMessageCallbackRef.current(message);
      }

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

        // ✅ Phase 1.3: If message exists with negative ID (optimistic), replace it
        const optimisticIndex = roomMessages.findIndex(
          (m) => m.message_id < 0 && m.content === message.content
        );

        if (optimisticIndex !== -1) {
          console.log(
            "✅ [useMessages] Replacing optimistic message with real message:",
            message.message_id
          );
          const updated = [...roomMessages];
          updated[optimisticIndex] = { ...message, status: "sent" };
          return {
            ...prev,
            [message.room_id]: updated,
          };
        }

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
          [message.room_id]: [...roomMessages, { ...message, status: "sent" }],
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

  const loadRoomMessages = useCallback(
    async (roomId: number) => {
      // ✅ Phase 1.2: Check cache first - Don't reload if already loaded
      if (messages[roomId] && messages[roomId].length > 0) {
        console.log(
          `📦 [useMessages] Using cached messages for room ${roomId} (${messages[roomId].length} messages)`
        );
        return;
      }

      console.log(
        `📡 [useMessages] Loading messages from API for room ${roomId}...`
      );
      setIsLoading(true);
      setError(null);
      try {
        const response = await roomsApi.getRoomMessages(roomId);
        console.log(
          `✅ [useMessages] Loaded ${response.messages.length} messages for room ${roomId}`
        );
        setMessages((prev) => ({
          ...prev,
          [roomId]: response.messages,
        }));
        setHasMore((prev) => ({ ...prev, [roomId]: response.has_more }));
        setCursors((prev) => ({ ...prev, [roomId]: response.next_cursor }));
      } catch (err) {
        console.error("Failed to load messages:", err);
        setError("Không thể tải tin nhắn");
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  // 🆕 NEW: Load more (older) messages
  const loadMoreMessages = useCallback(
    async (roomId: number) => {
      const cursor = cursors[roomId];
      if (!cursor || !hasMore[roomId]) {
        console.log(`📦 [useMessages] No more messages for room ${roomId}`);
        return;
      }

      console.log(
        `📡 [useMessages] Loading more messages for room ${roomId} with cursor ${cursor}...`
      );
      setIsLoading(true);
      setError(null);
      try {
        const response = await roomsApi.getRoomMessages(roomId, cursor);
        console.log(
          `✅ [useMessages] Loaded ${response.messages.length} more messages for room ${roomId}`
        );
        setMessages((prev) => ({
          ...prev,
          [roomId]: [...response.messages, ...(prev[roomId] || [])], // Prepend older messages
        }));
        setHasMore((prev) => ({ ...prev, [roomId]: response.has_more }));
        setCursors((prev) => ({ ...prev, [roomId]: response.next_cursor }));
      } catch (err) {
        console.error("Failed to load more messages:", err);
        setError("Không thể tải thêm tin nhắn");
      } finally {
        setIsLoading(false);
      }
    },
    [cursors, hasMore]
  );

  // 🔧 Phase 1.3: Send messages with optimistic UI
  const sendMessage = useCallback(
    async (roomId: number, content: string): Promise<void> => {
      if (!content.trim()) {
        throw new Error("Tin nhắn không được để trống");
      }

      if (!isConnected) {
        throw new Error("Không có kết nối WebSocket");
      }

      setError(null);

      const currentUser = storage.getUser();
      if (!currentUser) {
        throw new Error("User not found");
      }

      // ✅ Create optimistic message with temporary negative ID
      const optimisticMessage: ChatMessage = {
        message_id: -Date.now(), // Negative ID = temporary
        room_id: roomId,
        user_uuid: currentUser.user_uuid,
        user_fullname: currentUser.user_fullname,
        user_email: currentUser.user_email,
        content: content.trim(),
        created_at: new Date().toISOString(),
        is_own: true,
        status: "sending",
      };

      console.log(
        "⚡ [useMessages] Adding optimistic message:",
        optimisticMessage
      );

      // ✅ Add to UI immediately (optimistic)
      setMessages((prev) => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), optimisticMessage],
      }));

      try {
        console.log(
          "📤 [useMessages] Sending message via WebSocket:",
          content.trim(),
          "to room:",
          roomId
        );

        // Send via WebSocket - the real message will come back and replace optimistic one
        wsSendMessage(content.trim(), roomId);

        // Real message will be received via onMessage callback
        // It will replace the optimistic message (matched by content)
      } catch (error) {
        console.error("❌ [useMessages] Failed to send message:", error);

        // ❌ If failed, mark as error
        setMessages((prev) => ({
          ...prev,
          [roomId]: prev[roomId].map((msg) =>
            msg.message_id === optimisticMessage.message_id
              ? { ...msg, status: "error" as const }
              : msg
          ),
        }));
        throw error;
      }
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
    loadMoreMessages, // 🆕 NEW
    hasMore, // 🆕 NEW
    sendMessage,
    addMessage,
    joinRoom,
    leaveRoom,
    isConnected,
    onNewMessage, // 🆕 NEW: Expose callback registration
  };
};
