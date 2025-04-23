import { X, Plus, MoreHorizontal, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

import AddMemberGroup from "./AddMemberGroup";

const members = [
  {
    id: 1,
    name: "Bạn",
    role: "Trưởng nhóm",
    avatar: "/public/user.jpg",
    isFriend: true,
  },
  { id: 2, name: "Trntb", avatar: "/public/user.jpg", isFriend: false },
  { id: 3, name: "Hai Anh", avatar: "/public/user.jpg", isFriend: true },
  { id: 4, name: "Khôi Nguyên", avatar: "/public/user.jpg", isFriend: true },
];

const ListMember = ({ onClose }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [currentMember, setCurrentMember] = useState(null);
  const [showAddMemberGroup, setShowAddMemberGroup] = useState(false);
  const menuRef = useRef(null);

  const toggleAddMemberGroup = () => {
    setShowAddMemberGroup(!showAddMemberGroup);
  };

  // Hàm xử lý chuột phải
  const handleContextMenu = (event, member) => {
    event.preventDefault();
    setCurrentMember(member);
    setMenuPosition({ x: event.clientX, y: event.clientY });
    setMenuVisible(true);
  };

  // Hàm xử lý khi chọn một tùy chọn trong menu
  const handleMenuOptionClick = (option) => {
    setMenuVisible(false); // Ẩn menu sau khi chọn
    if (option === "addViceGroup") {
      console.log(`Thêm nhóm phó cho ${currentMember.name}`);
      // Thực hiện hành động thêm nhóm phó
    } else if (option === "removeFromGroup") {
      console.log(`Xóa ${currentMember.name} khỏi nhóm`);
      // Thực hiện hành động xóa khỏi nhóm
    } else if (option === "leaveGroup") {
      console.log(`${currentMember.name} đã rời nhóm`);
      // Thực hiện hành động rời nhóm
    }
  };

  // Đóng menu nếu click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="w-[360px] h-[460px] bg-white rounded-lg shadow-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button
            className="text-gray-600 hover:text-black p-1"
            onClick={onClose}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <p className="font-medium">Danh sách thành viên</p>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Thêm thành viên */}
        <Button
          className="w-full bg-gray-100 text-sm text-black flex items-center justify-center gap-2 hover:bg-gray-200"
          onClick={toggleAddMemberGroup}
        >
          <Plus size={16} />
          Thêm thành viên
        </Button>

        {/* Danh sách */}
        <p className="text-sm mt-4 mb-2 text-gray-700">
          Danh sách thành viên ({members.length})
        </p>

        {/* Thành viên */}
        <div className="flex flex-col gap-3">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={m.avatar}
                  alt="avatar"
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium">{m.name}</p>
                  {m.role && <p className="text-xs text-gray-500">{m.role}</p>}
                </div>
              </div>
              <div
                className="flex justify-end mb-2"
                onContextMenu={(e) => handleContextMenu(e, m)} // Bắt sự kiện chuột phải
              >
                <MoreHorizontal className="text-gray-500" />
              </div>
              {!m.isFriend && (
                <Button className="text-sm bg-blue-100 text-blue-600 hover:bg-blue-200">
                  Kết bạn
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Menu tùy chỉnh */}
        {menuVisible && (
          <div
            ref={menuRef}
            className="absolute bg-white border rounded shadow-lg"
            style={{ top: menuPosition.y, left: menuPosition.x }}
          >
            <ul>
              {currentMember?.role !== "Trưởng nhóm" && (
                <>
                  <li
                    className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => handleMenuOptionClick("addViceGroup")} // Thêm nhóm phó
                  >
                    Thêm nhóm phó
                  </li>
                  <li
                    className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => handleMenuOptionClick("removeFromGroup")}
                  >
                    Xóa khỏi nhóm
                  </li>
                </>
              )}
              {currentMember?.role === "Trưởng nhóm" && (
                <li
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleMenuOptionClick("leaveGroup")}
                >
                  Rời nhóm
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      {/* Hiển thị */}
      {showAddMemberGroup && <AddMemberGroup onClose={toggleAddMemberGroup} />}
    </div>
  );
};

export default ListMember;
