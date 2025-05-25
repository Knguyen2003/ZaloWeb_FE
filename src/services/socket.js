import { io } from "socket.io-client";
import { authService } from "../services/api/auth.service";

let socket = null;

const handleLogout = async () => {
  try {
    await authService.logout();
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

export const initializeSocket = (userId) => {
  if (!socket) {
    socket = io("http://localhost:5001/", {
      query: {
        userId,
        deviceType: "web",
      },
    });

    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("friendRequest", (data) => {
      console.log("Received friend request:", data);
      // Xử lý thông báo lời mời kết bạn
      // Ví dụ: dispatch action để cập nhật UI
    });

    socket.on("friendRequestAccepted", (data) => {
      console.log("Friend request accepted:", data);
      // Xử lý thông báo chấp nhận kết bạn
    });

    //Tự động đăng xuất khi cùng thiết bị
    socket.on("forceLogout", (data) => {
      handleLogout();
    });

    socket.on("newMessage", (message) => {});

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
      handleLogout();
    });
  }
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
