import { useState } from "react";
import {
  X,
  Copy,
  Share2,
  MoreHorizontal,
  Pencil,
  Camera,
  LogOut,
  Settings,
  OctagonX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ListMember from "./ListMember";
import AuthorizationGroup from "./AuthorizationGroup";
import UpdateGroup from "./UpdateGroup";
import GroupAvatar from "./GroupAvatar";
import ChangeLeaderGroup from "./ChangeLeaderGroup";
import ConfirmDialog from "./ConfirmDialog"; // import confirm dialog mới
import { Avatar } from "@/components/ui/avatar";
import { leaveGroup, deleteGroup } from "../services/api/conversation.service";
import { toast } from "react-toastify";

const GroupManagement = ({ onClose, conversation }) => {
  const user = JSON.parse(localStorage.getItem("user")).user;
  const [showUpdateModel, setUpdateModel] = useState(false);
  const [showListMember, setShowListMember] = useState(false);
  const [showAuthorizationGroup, setShowAuthorizationGroup] = useState(false);
  const [showUpdateGroup, setShowUpdateGroup] = useState(false);
  const [showChangeLeader, setShowChangeLeader] = useState(false);

  // trạng thái mới để hiển thị confirm dialog rời nhóm
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  // lưu newLeaderId tạm (thường là null khi không có đổi trưởng nhóm)
  const [pendingNewLeaderId, setPendingNewLeaderId] = useState(null);

  const toggleUpdateModel = () => {
    setUpdateModel(!showUpdateModel);
  };

  const toggleListMember = () => {
    setShowListMember(!showListMember);
  };

  const toggleChangeLeader = () => {
    setShowChangeLeader(!showChangeLeader);
  };

  const toggleAuthorizationGroup = () => {
    setShowAuthorizationGroup(!showAuthorizationGroup);
  };

  const toggleUpdateGroup = () => {
    setShowUpdateGroup(!showUpdateGroup);
  };

  const groupLink = "https://zalo.me/g/lgdegb320";

  const handleCopy = () => {
    navigator.clipboard.writeText(groupLink);
    alert("Đã sao chép liên kết nhóm!");
  };

  // Hàm xử lý khi user nhấn rời nhóm
  // thay vì confirm cũ, giờ chuyển sang show confirm dialog
  const handleRequestLeaveGroup = (newLeaderId = null) => {
    if (conversation.groupLeader === user._id && !newLeaderId) {
      setShowChangeLeader(true);
      return;
    }
    setPendingNewLeaderId(newLeaderId);
    setShowConfirmLeave(true);
  };

  // Xử lý khi user xác nhận rời nhóm trong confirm dialog
  const handleConfirmLeaveGroup = async () => {
    setShowConfirmLeave(false);
    try {
      await leaveGroup(conversation._id, pendingNewLeaderId);
      toast.error("Bạn đã rời nhóm thành công!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      onClose();
    } catch (error) {
      console.error("Leave group error:", error);
      alert(error.message || "Đã xảy ra lỗi khi rời nhóm.");
    }
  };

  const handleCancelLeaveGroup = () => {
    setShowConfirmLeave(false);
    setPendingNewLeaderId(null);
  };

  const handleSelectNewLeader = (user) => {
    handleRequestLeaveGroup(user._id);
    toggleChangeLeader();
  };

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup(conversation._id);
      onClose();
    } catch (err) {
      console.error("Lỗi khi xóa nhóm:", err.message);
      alert("Không thể xóa nhóm");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="w-[450px] h-[720px] bg-white rounded shadow-lg p-4 flex flex-col gap-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Thông tin nhóm</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <hr className="border-t border-gray-300 w-full" />

        {/* Ảnh đại diện + Tên nhóm */}
        <div className="flex items-center gap-4">
          <div className="relative w-fit">
            <Avatar className="h-14 w-14 border border-gray-300">
              {conversation.avatar ? (
                <img
                  src={conversation.avatar}
                  alt="avatar"
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : conversation.isGroup ? (
                <GroupAvatar chat={conversation} />
              ) : (
                <div className="h-10 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                  {conversation.name
                    ?.split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
            </Avatar>
            <button className="absolute bottom-0 left-10 bg-white p-1 rounded-full shadow-md cursor-pointer hover:bg-gray-200 border">
              <Camera className="w-5 h-5 text-gray-600" />
              <input type="file" className="hidden" />
            </button>
          </div>
          <div className="flex justify-between gap-1">
            <p className="font-medium">{conversation.groupName}</p>
            <button
              className="text-blue-600 hover:underline text-sm"
              onClick={toggleUpdateGroup}
            >
              <span className="flex items-center text-sm text-black font-semibold">
                <Pencil className="w-3 h-3 text-black hover:text-blue-800" />_
              </span>
            </button>
          </div>
        </div>

        <Button
          className="bg-[#e5e7eb] hover:bg-[#d1d5db] text-black "
          onClick={onClose}
        >
          Nhắn tin
        </Button>

        {/* Danh sách thành viên */}
        <div className="flex flex-col gap-2 mt-2">
          <p className="text-sm font-medium mb-1">
            Thành viên ({conversation.participants.length})
          </p>
          <div className="flex gap-2">
            {conversation.participants.map((m) =>
              m.profilePic ? (
                <img
                  key={m._id}
                  src={m.profilePic}
                  alt="avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div
                  key={m._id}
                  className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold"
                >
                  {m.fullName
                    ?.split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )
            )}
            <Button variant="ghost" size="icon" onClick={toggleListMember}>
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Ảnh và Video */}
        <div>
          <p className="text-sm font-medium mb-1">Ảnh và Video</p>
          <div className="flex flex-col items-center gap-2 border border-gray-300 rounded p-8 bg-gray-50">
            <p className="font-thin">Chưa có ảnh và video</p>
            <p className="font-thin">được chia sẻ trong nhóm này</p>
          </div>
        </div>

        {/* Link tham gia nhóm */}
        <div>
          <p className="text-sm font-medium mb-1">Link tham gia nhóm</p>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 border border-gray-300 rounded w-full text-sm text-gray-700 bg-gray-100 truncate">
              {groupLink}
            </div>
            <Button variant="outline" size="icon" onClick={handleCopy}>
              <Copy size={16} />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 size={16} />
            </Button>
          </div>
        </div>

        {/* Hành động */}
        <div className="flex flex-col gap-2 mt-auto">
          {conversation.groupLeader === user._id ? (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={toggleAuthorizationGroup}
              >
                <Settings className="mr-2" size={16} />
                Quản lý nhóm
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleRequestLeaveGroup(null)}
              >
                <LogOut className="mr-2" size={16} />
                Rời nhóm
              </Button>
              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 border-red-600"
                onClick={handleDeleteGroup}
              >
                <OctagonX className="mr-2" size={16} />
                Giải tán nhóm
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleRequestLeaveGroup(null)}
            >
              <LogOut className="mr-2" size={16} />
              Rời nhóm
            </Button>
          )}
        </div>
      </div>

      {/* Hiển thị các modal/ dialog khác */}
      {showUpdateModel && <GroupManagement onClose={toggleUpdateModel} />}
      {showListMember && (
        <ListMember onClose={toggleListMember} conversation={conversation} />
      )}
      {showAuthorizationGroup && (
        <AuthorizationGroup onClose={toggleAuthorizationGroup} />
      )}
      {showUpdateGroup && <UpdateGroup onClose={toggleUpdateGroup} />}
      {showChangeLeader && (
        <ChangeLeaderGroup
          onClose={toggleChangeLeader}
          onSelect={handleSelectNewLeader}
          conversation={conversation}
        />
      )}

      {/* Confirm dialog rời nhóm */}
      {showConfirmLeave && (
        <ConfirmDialog
          title="Xác nhận rời nhóm"
          message="Bạn có chắc chắn muốn rời nhóm?"
          onConfirm={handleConfirmLeaveGroup}
          onCancel={handleCancelLeaveGroup}
        />
      )}
    </div>
  );
};

export default GroupManagement;
