import { useState, useCallback, useEffect } from "react";
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
      const roomsData = await roomsApi.listRooms();
      setRooms(roomsData);
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

  // Auto-load rooms on mount
  useEffect(() => {
    if (storage.isAuthenticated()) {
      loadRooms();
    }
  }, [loadRooms]);

  return {
    rooms,
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
