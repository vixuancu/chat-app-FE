import { useState, useCallback } from "react";
import { roomsApi, adminApi } from "@shared/services/api";
import type { Room, User } from "@shared/services/types";
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
}

export const useRooms = (): UseRoomsReturn => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomMembers, setRoomMembers] = useState<Record<number, User[]>>({});

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
  };
};
