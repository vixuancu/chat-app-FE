import { useState, useCallback, useEffect } from "react";
import { roomsApi, adminApi } from "@shared/services/api";
import type { Room, User, ChatMessage } from "@shared/services/types";
import { storage } from "@shared/utils/storage";

interface UseRoomsReturn {
  rooms: Room[];
  isLoading: boolean;
  error: string | null;
  selectedRoom: Room | null;
  roomMembers: Record<number, User[]>;
  loadRooms: () => Promise<void>;
  createRoom: (name: string, isDirectChat?: boolean) => Promise<Room>;
  joinRoomByCode: (code: string) => Promise<Room>;
  selectRoom: (room: Room) => void;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>; // Add this
  loadRoomMembers: (roomId: number) => Promise<User[]>;
  deleteRoom: (roomId: number) => Promise<void>;
  updateRoomLastMessage: (roomId: number, message: ChatMessage) => void; // NEW: Update last message
  markRoomAsRead: (roomId: number) => void; // NEW: Mark room as read
}

interface UseRoomsOptions {
  socket?: WebSocket | null; // Accept WebSocket for real-time updates
}

export const useRooms = (options?: UseRoomsOptions): UseRoomsReturn => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomMembers, setRoomMembers] = useState<Record<number, User[]>>({});

  // ✅ NEW: Update last message for a room in real-time
  // ✅ NEW: Update last message for a room in real-time
  const updateRoomLastMessage = useCallback(
    (roomId: number, message: ChatMessage) => {
      console.log(
        `🔔 [useRooms] Updating last_message for room ${roomId}:`,
        message
      );

      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (room.room_id === roomId) {
            const currentUser = storage.getUser();
            // Use selectedRoom from closure, but we need current value
            // So we'll check this inside the setter
            const isCurrentRoomSelected = selectedRoom?.room_id === roomId;

            // Increment unread count only if:
            // 1. Message is from another user
            // 2. User is not currently viewing this room
            const shouldIncrementUnread =
              message.user_uuid !== currentUser?.user_uuid &&
              !isCurrentRoomSelected;

            console.log(`📊 [useRooms] Room ${roomId} update logic:`, {
              messageFrom: message.user_uuid,
              currentUser: currentUser?.user_uuid,
              isCurrentRoomSelected,
              shouldIncrementUnread,
              currentUnread: room.unread,
            });

            // Transform ChatMessage to Room.last_message format
            const lastMessage = {
              message_id: message.message_id,
              content: message.content,
              sender_name: message.user_fullname,
              sender_uuid: message.user_uuid,
              created_at: message.created_at,
              is_own: message.user_uuid === currentUser?.user_uuid,
            };

            const updated = {
              ...room,
              last_message: lastMessage,
              unread: shouldIncrementUnread
                ? (room.unread || 0) + 1
                : room.unread,
            };

            console.log(`✅ [useRooms] Updated room ${roomId}:`, {
              oldUnread: room.unread,
              newUnread: updated.unread,
              lastMessage: updated.last_message,
            });

            return updated;
          }
          return room;
        })
      );
    },
    [selectedRoom]
  );

  // ✅ NEW: Mark room as read when user views it
  const markRoomAsRead = useCallback(async (roomId: number) => {
    console.log(`👁️ [useRooms] Marking room ${roomId} as read`);

    // 1. Update local state immediately (optimistic)
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.room_id === roomId ? { ...room, unread: 0 } : room
      )
    );

    // 2. Call backend API to persist
    try {
      await roomsApi.markRoomAsRead(roomId);
      console.log(`✅ [useRooms] Room ${roomId} marked as read on backend`);
    } catch (error) {
      console.error(
        `❌ [useRooms] Failed to mark room ${roomId} as read:`,
        error
      );
      // Optionally: revert local state if API fails
    }
  }, []);

  // ✅ NEW: Listen to WebSocket events for real-time updates
  useEffect(() => {
    const socket = options?.socket;

    console.log("🔌 [useRooms] Setting up WebSocket listener:", {
      hasSocket: !!socket,
      readyState: socket?.readyState,
      url: socket?.url,
    });

    if (!socket) {
      console.warn(
        "⚠️ [useRooms] No socket provided - real-time updates disabled!"
      );
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("🔔 [useRooms] WebSocket event received:", {
          type: data.type,
          hasPayload: !!data.payload,
          payload: data.payload,
        });

        // Handle new message event
        if (data.type === "message" && data.payload) {
          const message = data.payload as ChatMessage;
          console.log(
            "💬 [useRooms] Updating last_message for room:",
            message.room_id
          );
          updateRoomLastMessage(message.room_id, message);
        }

        // Handle room update event
        if (data.type === "room_update" && data.payload) {
          const updatedRoom = data.payload as Room;
          console.log(
            "🏠 [useRooms] Room update event for room:",
            updatedRoom.room_id
          );
          setRooms((prevRooms) =>
            prevRooms.map((room) =>
              room.room_id === updatedRoom.room_id
                ? { ...room, ...updatedRoom }
                : room
            )
          );
        }
      } catch (error) {
        console.error("❌ [useRooms] Error parsing WebSocket message:", error);
      }
    };

    console.log("✅ [useRooms] Adding WebSocket message listener");
    socket.addEventListener("message", handleMessage);

    return () => {
      console.log("🧹 [useRooms] Removing WebSocket message listener");
      socket.removeEventListener("message", handleMessage);
    };
  }, [options?.socket, updateRoomLastMessage]);

  const loadRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(
        "🔄 [useRooms] Loading rooms with admin API for member_count..."
      );

      // Check if user is admin and use appropriate API
      const currentUser = storage.getUser();

      console.log("🔍 [useRooms] Current user:", currentUser);
      console.log("🔍 [useRooms] User role:", currentUser?.user_role);

      // Always use regular rooms API to get only joined rooms
      // Admin API returns ALL rooms in system (for management)
      // Regular API returns only rooms user has joined
      console.log(
        "👤 [useRooms] Using roomsApi.listRooms - shows only joined rooms"
      );
      const roomsData = await roomsApi.listRooms();

      // Check if backend already provides member_count to avoid unnecessary API calls
      console.log(
        "🔍 [useRooms] Checking if rooms have member_count from backend:",
        roomsData.map((r) => ({
          id: r.room_id,
          name: r.room_name,
          has_count: r.member_count !== undefined,
        }))
      );

      // Only fetch member count for rooms that don't have it
      const roomsNeedingMemberCount = roomsData.filter(
        (room) => room.member_count === undefined
      );

      if (roomsNeedingMemberCount.length === 0) {
        console.log(
          "✅ [useRooms] All rooms already have member_count from backend, skipping individual fetches"
        );
        setRooms(roomsData);
        return;
      }

      console.log(
        `📊 [useRooms] Need to fetch member_count for ${roomsNeedingMemberCount.length} rooms`
      );

      // If rooms don't have member_count, fetch it for each room
      const roomsWithMemberCount = await Promise.all(
        roomsData.map(async (room) => {
          if (room.member_count === undefined) {
            try {
              console.log(
                `🔍 [useRooms] Fetching members for room ${room.room_name} (ID: ${room.room_id})`
              );
              const members = await roomsApi.getRoomMembers(room.room_id);
              return {
                ...room,
                member_count: members.length,
              };
            } catch (error) {
              console.warn(
                `⚠️ [useRooms] Failed to get members for room ${room.room_id}:`,
                error
              );
              return room; // Return room without member_count if fetch fails
            }
          }
          return room;
        })
      );

      console.log(
        "📋 [useRooms] Loaded rooms with member counts:",
        roomsWithMemberCount
      );
      setRooms(roomsWithMemberCount);
    } catch (err) {
      console.error("Failed to load rooms:", err);
      setError("Không thể tải danh sách phòng");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRoom = useCallback(
    async (name: string, isDirectChat: boolean = false) => {
      setIsLoading(true);
      setError(null);
      try {
        const newRoom = await roomsApi.createRoom(name, isDirectChat);
        setRooms((prev) => [...prev, newRoom]);
        return newRoom;
      } catch (err) {
        console.error("Failed to create room:", err);
        setError("Không thể tạo phòng mới");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const joinRoomByCode = useCallback(async (code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const room = await roomsApi.joinRoomByCode(code);
      // Check if room already exists in list
      setRooms((prev) => {
        const exists = prev.find((r) => r.room_id === room.room_id);
        if (exists) return prev;
        return [...prev, room];
      });
      return room;
    } catch (err) {
      console.error("Failed to join room:", err);
      setError("Không thể tham gia phòng");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectRoom = useCallback((room: Room) => {
    setSelectedRoom(room);
  }, []);

  const loadRoomMembers = useCallback(async (roomId: number) => {
    try {
      const members = await roomsApi.getRoomMembers(roomId);
      setRoomMembers((prev) => ({
        ...prev,
        [roomId]: members,
      }));
      return members;
    } catch (err) {
      console.error("Failed to load room members:", err);
      throw err;
    }
  }, []);

  const deleteRoom = useCallback(
    async (roomId: number) => {
      if (!storage.isAdmin()) {
        throw new Error("Unauthorized: Admin access required");
      }

      setIsLoading(true);
      setError(null);
      try {
        await adminApi.deleteRoom(roomId);
        setRooms((prev) => prev.filter((room) => room.room_id !== roomId));
        if (selectedRoom?.room_id === roomId) {
          setSelectedRoom(null);
        }
      } catch (err) {
        console.error("Failed to delete room:", err);
        setError("Không thể xóa phòng");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedRoom]
  );

  // Note: Auto-load removed to prevent duplicate API calls
  // MainApp will explicitly call loadRooms when needed

  return {
    rooms,
    setRooms,
    isLoading,
    error,
    selectedRoom,
    roomMembers,
    loadRooms,
    createRoom,
    joinRoomByCode,
    selectRoom,
    loadRoomMembers,
    deleteRoom,
    updateRoomLastMessage,
    markRoomAsRead,
  };
};
