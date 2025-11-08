import { useState, useEffect, useRef, useCallback } from "react";

interface UseTypingIndicatorProps {
  roomId: number;
  socket: WebSocket | null;
}

interface UseTypingIndicatorReturn {
  typingUsers: string[]; // Array of user names who are typing
  notifyTyping: () => void; // Call when user types
}

/**
 * Phase 2.2: Typing Indicator Hook
 *
 * Usage:
 * ```tsx
 * const { typingUsers, notifyTyping } = useTypingIndicator(roomId, socket);
 *
 * // In input onChange
 * <input onChange={(e) => { setText(e.target.value); notifyTyping(); }} />
 *
 * // Display typing users
 * {typingUsers.length > 0 && (
 *   <div>{typingUsers.join(', ')} đang nhập...</div>
 * )}
 * ```
 */
export const useTypingIndicator = ({
  roomId,
  socket,
}: UseTypingIndicatorProps): UseTypingIndicatorReturn => {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const autoRemoveTimeoutsRef = useRef<
    Map<string, ReturnType<typeof setTimeout>>
  >(new Map());

  // Listen for typing events from WebSocket
  useEffect(() => {
    if (!socket) {
      console.warn("⚠️ [useTypingIndicator] No socket provided");
      return;
    }

    const timeouts = autoRemoveTimeoutsRef.current;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        // Handle typing_start event
        if (data.type === "typing_start" && data.room_id === roomId) {
          const userName = data.user_name;
          console.log(
            `⌨️ [useTypingIndicator] ${userName} started typing in room ${roomId}`
          );

          setTypingUsers((prev) =>
            prev.includes(userName) ? prev : [...prev, userName]
          );

          // Auto-remove after 3 seconds (in case typing_stop event is lost)
          const existingTimeout = timeouts.get(userName);
          if (existingTimeout) {
            clearTimeout(existingTimeout);
          }

          const timeout = setTimeout(() => {
            console.log(
              `⏱️ [useTypingIndicator] Auto-removing ${userName} (timeout)`
            );
            setTypingUsers((prev) => prev.filter((u) => u !== userName));
            timeouts.delete(userName);
          }, 3000);

          timeouts.set(userName, timeout);
        }

        // Handle typing_stop event
        if (data.type === "typing_stop" && data.room_id === roomId) {
          const userName = data.user_name;
          console.log(
            `🛑 [useTypingIndicator] ${userName} stopped typing in room ${roomId}`
          );

          setTypingUsers((prev) => prev.filter((u) => u !== userName));

          // Clear auto-remove timeout
          const existingTimeout = timeouts.get(userName);
          if (existingTimeout) {
            clearTimeout(existingTimeout);
            timeouts.delete(userName);
          }
        }
      } catch (error) {
        console.error(
          "❌ [useTypingIndicator] Error parsing WebSocket message:",
          error
        );
      }
    };

    console.log(`✅ [useTypingIndicator] Adding listener for room ${roomId}`);
    socket.addEventListener("message", handleMessage);

    return () => {
      console.log(
        `🧹 [useTypingIndicator] Removing listener for room ${roomId}`
      );
      socket.removeEventListener("message", handleMessage);

      // Clear all auto-remove timeouts
      timeouts.forEach((timeout) => clearTimeout(timeout));
      timeouts.clear();
    };
  }, [socket, roomId]);

  // Send typing notification (debounced)
  const notifyTyping = useCallback(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn(
        "⚠️ [useTypingIndicator] Cannot send typing event: socket not ready"
      );
      return;
    }

    // Send typing_start event
    socket.send(
      JSON.stringify({
        type: "typing_start",
        room_id: roomId,
      })
    );

    console.log(`📤 [useTypingIndicator] Sent typing_start for room ${roomId}`);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-send typing_stop after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "typing_stop",
            room_id: roomId,
          })
        );
        console.log(
          `📤 [useTypingIndicator] Sent typing_stop (auto) for room ${roomId}`
        );
      }
    }, 2000);
  }, [socket, roomId]);

  return { typingUsers, notifyTyping };
};
