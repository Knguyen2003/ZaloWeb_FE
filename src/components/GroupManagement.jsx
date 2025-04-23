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

const GroupManagement = ({ onClose }) => {
  const members = [
    { id: 1, avatar: "/public/user.jpg" },
    { id: 2, avatar: "/public/user.jpg" },
    { id: 3, avatar: "/public/user.jpg" },
    { id: 4, avatar: "/public/user.jpg" },
  ];

  const [showUpdateModel, setUpdateModel] = useState(false);
  const [showListMember, setShowListMember] = useState(false);
  const [showAuthorizationGroup, setShowAuthorizationGroup] = useState(false);
  const [showUpdateGroup, setShowUpdateGroup] = useState(false);

  const toggleUpdateModel = () => {
    setUpdateModel(!showUpdateModel);
  };

  const toggleListMember = () => {
    setShowListMember(!showListMember);
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
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300 shadow-md">
              <img
                src={"/user.jpg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 left-14 bg-white p-1 rounded-full shadow-md cursor-pointer hover:bg-gray-200 border">
              <Camera className="w-5 h-5 text-gray-600" />
              <input type="file" className="hidden" />
            </button>
          </div>
          <div className="flex justify-between gap-1">
            <p className="font-medium">Phan Nguyễn Khôi Nguyên, An...</p>
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
            Thành viên ({members.length})
          </p>
          <div className="flex gap-2">
            {members.map((m) => (
              <img
                key={m.id}
                src={m.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            ))}
            <Button variant="ghost" size="icon" onClick={toggleListMember}>
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Ảnh và Video*/}
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
          <Button
            variant="outline"
            className="w-full"
            onClick={toggleAuthorizationGroup}
          >
            <Settings className="mr-2" size={16} />
            Quản lý nhóm
          </Button>
          <Button variant="outline" className="w-full">
            <OctagonX className="mr-2" size={16} />
            Giải tán nhóm
          </Button>
          <Button variant="outline" className="w-full">
            <LogOut className="mr-2" size={16} />
            Rời nhóm
          </Button>
        </div>
      </div>
      {/* hiển thị */}
      {showUpdateModel && <GroupManagement onClose={toggleUpdateModel} />}
      {showListMember && <ListMember onClose={toggleListMember} />}
      {showAuthorizationGroup && (
        <AuthorizationGroup onClose={toggleAuthorizationGroup} />
      )}
      {showUpdateGroup && <UpdateGroup onClose={toggleUpdateGroup} />}
    </div>
  );
};

export default GroupManagement;
