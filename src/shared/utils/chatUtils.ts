// Chat utility functions for message validation and formatting
import type { Room, User } from "@shared/services/types";

export class ChatUtils {
  /**
   * Validate if room has a valid last message
   */
  static hasValidLastMessage(room: Room): boolean {
    return !!(
      room.last_message &&
      room.last_message.message_id > 0 &&
      room.last_message.content &&
      room.last_message.content.trim() !== "" &&
      room.last_message.sender_uuid !== "00000000-0000-0000-0000-000000000000"
    );
  }

  /**
   * Format last message for display with sender name
   */
  static formatLastMessage(room: Room, currentUser: User): string {
    if (!this.hasValidLastMessage(room)) {
      return "Chưa có tin nhắn nào";
    }

    const isOwn = room.last_message!.sender_uuid === currentUser.user_uuid;
    const senderName = isOwn
      ? "Bạn"
      : room.last_message!.sender_name || "Unknown";

    return `${senderName}: ${room.last_message!.content}`;
  }

  /**
   * Format timestamp to Vietnamese relative time
   */
  static formatTime(timestamp: string | null | undefined): string {
    if (!timestamp) return "";

    try {
      const date = new Date(timestamp);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn(
          "⚠️ [ChatUtils] Invalid date created from timestamp:",
          timestamp
        );
        return "";
      }

      const now = new Date();
      const diff = now.getTime() - date.getTime();

      if (diff < 60000) return "Vừa xong"; // < 1 minute
      if (diff < 3600000) return `${Math.floor(diff / 60000)} phút`; // < 1 hour
      if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ`; // < 1 day

      return date.toLocaleDateString("vi-VN");
    } catch (error) {
      console.warn("⚠️ [ChatUtils] Error parsing timestamp:", timestamp, error);
      return "";
    }
  }

  /**
   * Validate message data from WebSocket
   */
  static isValidMessage(
    messageData: unknown
  ): messageData is { content: string; user_uuid: string } {
    if (!messageData || typeof messageData !== "object") return false;

    const msg = messageData as Record<string, unknown>;
    return !!(
      msg.content &&
      msg.user_uuid &&
      typeof msg.content === "string" &&
      msg.content.trim() !== "" &&
      typeof msg.user_uuid === "string" &&
      msg.user_uuid !== "00000000-0000-0000-0000-000000000000"
    );
  }

  /**
   * Check if message is from current user
   */
  static isOwnMessage(
    messageData: { user_uuid: string },
    currentUser: User
  ): boolean {
    return messageData.user_uuid === currentUser.user_uuid;
  }
}
