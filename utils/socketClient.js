// utils/socketClient.js
let socket = null;

export const connectSocket = (roomId, onMessageCallback) => {
  socket = new WebSocket(`ws://localhost:3001/ws/${roomId}`);

  socket.onopen = () => {
    console.log("🟢 WebSocket connected to room:", roomId);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("📩 Received:", data);
      if (onMessageCallback) onMessageCallback(data);
    } catch (error) {
      console.error("❌ Parsing error:", error);
    }
  };

  socket.onerror = (error) => {
    console.error("🔴 WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("🔌 WebSocket connection closed");
  };
};

export const sendMessage = (payload) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  } else {
    console.warn("⚠️ WebSocket not connected");
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
