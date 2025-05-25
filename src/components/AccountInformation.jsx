import { useState, useEffect } from "react";
import {
  Pencil,
  ChevronLeft,
  X,
  Users,
  Share2,
  Ban,
  AlertTriangle,
} from "lucide-react";
import { friendService } from "../services/api/friend.service";
import PropTypes from "prop-types";
import { getSocket } from "../services/socket";

const AccountInformation = ({ isOpen, onClose, onReturn, user }) => {
  const [friendStatus, setFriendStatus] = useState(null);
  const [showAvatarPopup, setShowAvatarPopup] = useState(false);

  const userLogin = JSON.parse(localStorage.getItem("user"));

  console.log("userLogin", userLogin.user._id);

  useEffect(() => {
    const socket = getSocket();

    const fetchStatus = async () => {
      if (!user?._id) return;
      try {
        const statusData = await friendService.getFriendStatus(user._id);
        setFriendStatus(statusData.data);
      } catch (error) {
        setFriendStatus(null);
      }
    };
    if (socket) {
      socket.on("friendRequest", fetchStatus);
      socket.on("friendRequestAccepted", fetchStatus);
    }

    if (isOpen) {
      fetchStatus();
    }

    return () => {
      if (socket) {
        socket.off("friendRequest", fetchStatus);
        socket.off("friendRequestAccepted", fetchStatus);
      }
    };
  }, [isOpen, user]);

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-xl shadow-lg w-[360px] max-w-full overflow-hidden p-4">
          <p className="text-center text-red-500">
            Không tìm thấy thông tin người dùng
          </p>
        </div>
      </div>
    );
  }

  const handleSendFriendRequest = async () => {
    if (!user?.phoneNumber) {
      setErrorMessage("Không có số điện thoại người dùng.");
      return;
    }

    try {
      const res = await friendService.sendRequest(user.phoneNumber);
      setFriendStatus({
        status: "pending",
        targetUser: user._id,
      });
    } catch (err) {
      setErrorMessage(err.message || "Gửi lời mời kết bạn thất bại");
    }
  };

  const handelAcceptFriendRequest = async () => {
    try {
      const res = await friendService.acceptRequest(friendStatus._id);
      setFriendStatus({
        status: "accepted",
        targetUser: user._id,
      });
    } catch (err) {
      setErrorMessage(err.message || "Chấp nhận mời kết bạn thất bại");
    }
  };

  // Hàm định dạng ngày tháng
  const formatDate = (isoDateStr) => {
    const date = new Date(isoDateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Hàm định dạng giới tính
  const formatGender = (gender) => {
    switch (gender) {
      case "Male":
        return "Nam";
      case "Female":
        return "Nữ";
      case "Other":
        return "Khác";
      default:
        return "Không xác định";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg w-[360px] max-w-full min-h-[76vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b">
          <button onClick={onReturn} className="text-gray-700 hover:text-black">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-800">Thông tin cá nhân</span>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung */}
        <div className="flex flex-col gap-4 p-4">
          {/* Ảnh bìa */}
          <div
            className="h-32 bg-cover bg-center relative"
            style={{
              backgroundImage: `url('${user.coverImage || "https://picsum.photos/200"
                }')`,
              backgroundColor: "transparent",
            }}
          ></div>

          {/* Avatar và tên */}
          <div className=" -mt-12">
            <div className="relative flex justify-start">
              <div className="w-20 h-20 rounded-full border-2 border-white shadow-md overflow-hidden" onDoubleClick={() => setShowAvatarPopup(true)}>
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full object-cover bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                    {user.fullName
                      ?.split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex items-center ml-2 mt-6">
                <h4 className="text-base font-semibold mr-1.5">
                  {user.fullName}
                </h4>
              </div>
            </div>
          </div>

          {/* Nút Kết bạn / Nhắn tin */}

          {userLogin.user._id !== user._id && (
            <div className="flex flex-col justify-center items-center gap-2 mt-1 px-4">
              {/* Khi chưa có friendStatus (null) */}

              {!friendStatus && (
                <div
                  className="flex justify-center gap-2 w-full"
                  onClick={handleSendFriendRequest}
                >
                  <button className="flex-1 py-1 rounded-md border font-medium text-sm hover:bg-gray-100">
                    Kết bạn
                  </button>
                  <button className="flex-1 py-1 rounded-md bg-blue-100 text-blue-700 font-medium text-sm hover:bg-blue-200">
                    Nhắn tin
                  </button>
                </div>
              )}

              {/* Khi đã là bạn bè */}
              {friendStatus?.status === "accepted" && (
                <button className="w-full py-1 rounded-md bg-blue-100 text-blue-700 font-medium text-sm hover:bg-blue-200">
                  Nhắn tin
                </button>
              )}

              {/* Khi đang chờ xác nhận và người dùng hiện tại là người được gửi lời mời (người nhận) */}
              {friendStatus?.status === "pending" &&
                friendStatus?.targetUser !== user._id && (
                  <div className="flex justify-center gap-2 w-full">
                    <button
                      className="flex-1 py-1 rounded-md border font-medium text-sm hover:bg-gray-100"
                      onClick={handelAcceptFriendRequest}
                    >
                      Chấp nhận
                    </button>
                    <button className="flex-1 py-1 rounded-md bg-blue-100 text-blue-700 font-medium text-sm hover:bg-blue-200">
                      Nhắn tin
                    </button>
                  </div>
                )}

              {/* Khi đang chờ xác nhận và người dùng hiện tại là người đã gửi lời mời */}
              {friendStatus?.status === "pending" &&
                friendStatus?.targetUser === user._id && (
                  <>
                    <p className="text-xs text-gray-500 text-center">
                      Bạn đã gửi lời mời kết bạn và đang chờ người này xác nhận
                    </p>
                    <div className="flex justify-center gap-2 w-full">
                      <button className="flex-1 py-1 rounded-md bg-blue-100 text-blue-700 font-medium text-sm hover:bg-blue-200">
                        Nhắn tin
                      </button>
                      <button className="flex-1 py-1 rounded-md border font-medium text-sm hover:bg-gray-100 text-red-500 hover:text-red-600">
                        Hủy lời mời
                      </button>
                    </div>
                  </>
                )}
            </div>
          )}

          <div className="w-full border-t-4 mt-1 border-gray-300"></div>

          {/* Thông tin cá nhân */}
          <div className="space-y-2 text-sm">
            <h3 className="text-gray-700 font-semibold">Thông tin cá nhân</h3>
            <div className="flex text-xs">
              <span className="text-gray-500">Giới tính</span>
              <span className="ml-14">{formatGender(user.gender)}</span>
            </div>
            <div className="flex text-xs">
              <span className="text-gray-500">Ngày sinh</span>
              <span className="ml-12">{formatDate(user.dateOfBirth)}</span>
            </div>
          </div>

          <div className="w-full border-t-4 mt-1 border-gray-300"></div>

          {/* Ghi chú */}
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-4 h-4" />
              <span>Nhóm chung (0)</span>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <Share2 className="w-4 h-4" />
              <span>Chia sẻ danh thiếp</span>
            </div>

            <div className="flex items-center gap-2 text-gray-700 cursor-pointer hover:text-red-600">
              <Ban className="w-4 h-4" />
              <span>Chặn tin nhắn và cuộc gọi</span>
            </div>

            <div className="flex items-center gap-2 text-gray-700 cursor-pointer hover:text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span>Báo xấu</span>
            </div>
          </div>
        </div>

        {showAvatarPopup && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            onClick={() => setShowAvatarPopup(false)}
          >
            <div
              className="bg-transparent p-4 rounded-lg shadow-none"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={user.profilePic || "/user.jpg"}
                alt="Avatar lớn"
                className="w-[400px] h-[400px] object-cover rounded-full shadow-lg border-4 border-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

AccountInformation.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onReturn: PropTypes.func,
};

export default AccountInformation;
