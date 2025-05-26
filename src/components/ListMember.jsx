import { X, Plus, MoreHorizontal, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import AddMemberGroup from "./AddMemberGroup";
import {
  removeMemberFromGroup,
  setGroupDeputy,
  setGroupLeader,
  removeGroupDeputy,
} from "../services/api/conversation.service";
import { toast } from "react-toastify";
import { getSocket } from "../services/socket";

const ListMember = ({ onClose, conversation }) => {
  const user = JSON.parse(localStorage.getItem("user")).user;
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [currentMember, setCurrentMember] = useState(null);
  const [showAddMemberGroup, setShowAddMemberGroup] = useState(false);
  const menuRef = useRef(null);
  const [updatedConversation, setUpdatedConversation] = useState(conversation);

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

  const handelLeaveGroup = async (memberId) => {
    try {
      await removeMemberFromGroup(conversation._id, memberId);
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  //Hàm đổi nhóm phó
  const handleSetDeputy = async (conversationId, memberId) => {
    try {
      const response = await setGroupDeputy(conversationId, memberId);
      setUpdatedConversation((prev) => ({
        ...prev,
        groupDeputy: response.conversation.groupDeputy,
      }));

      toast.success("Chỉ định phó nhóm thành công!");
    } catch (error) {
      alert(error.message);
    }
  };

  //Hàm đổi nhóm trưởng
  const handleSetLeader = async (conversationId, memberId) => {
    try {
      const response = await setGroupLeader(conversationId, memberId);
      setUpdatedConversation((prev) => ({
        ...prev,
        groupLeader: response.conversation.groupLeader,
      }));

      toast.success("Đổi nhóm trưởng thành công!");
    } catch (error) {
      alert(error.message);
    }
  };

  //Xóa phó nhóm
  const handleRemoveDeputy = async (conversationId) => {
    try {
      const response = await removeGroupDeputy(conversationId);
      setUpdatedConversation((prev) => ({
        ...prev,
        groupDeputy: response.conversation.groupDeputy,
      }));

      toast.success("Xóa phó nhóm thành công!");
    } catch (error) {
      alert(error.message);
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

  useEffect(() => {
    const socket = getSocket();

    const handleUpdateDeputy = (newConvo) => {
      if (newConvo._id === updatedConversation._id) {
        setUpdatedConversation((prev) => ({
          ...prev,
          groupDeputy: newConvo.groupDeputy,
        }));
      }
    };

    const handleUpdateLeader = (newConvo) => {
      if (newConvo._id === updatedConversation._id) {
        setUpdatedConversation((prev) => ({
          ...prev,
          groupLeader: newConvo.groupLeader,
        }));
      }
    };

    socket.on("updateGroupDeputy", handleUpdateDeputy);
    socket.on("newGroupLeader", handleUpdateLeader);
    socket.on("removeGroupDeputy", handleUpdateDeputy);

    return () => {
      socket.off("updateGroupDeputy", handleUpdateDeputy);
      socket.off("newGroupLeader", handleUpdateLeader);
      socket.on("removeGroupDeputy", handleUpdateDeputy);
    };
  }, [updatedConversation._id]);

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
          Danh sách thành viên ({updatedConversation.participants.length})
        </p>

        {/* Thành viên */}
        <div className="flex flex-col gap-3">
          {updatedConversation.participants.map((m) => (
            <div key={m._id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {m.profilePic ? (
                  <img
                    src={m.profilePic}
                    alt="avatar"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                    {m.fullName
                      ?.split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{m.fullName}</p>
                  {m._id === updatedConversation.groupLeader && (
                    <p className="text-xs text-gray-500">Trưởng nhóm</p>
                  )}
                  {m._id === updatedConversation.groupDeputy &&
                    m._id !== updatedConversation.groupLeader && (
                      <p className="text-xs text-gray-500">Phó nhóm</p>
                    )}
                </div>
              </div>
              {m._id !== user._id &&
                // Nếu người dùng là trưởng nhóm, luôn được hiển thị menu với người khác
                (user._id === updatedConversation.groupLeader ||
                  // Nếu là phó nhóm và người đang xét KHÔNG PHẢI là trưởng nhóm
                  (user._id === updatedConversation.groupDeputy &&
                    m._id !== updatedConversation.groupLeader)) && (
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={(e) => handleContextMenu(e, m)}
                      className="p-2 rounded hover:bg-gray-100"
                    >
                      <MoreHorizontal className="text-gray-500 w-5 h-5" />
                    </button>
                  </div>
                )}

              {m._id !== user._id && (
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
              {user._id === updatedConversation.groupLeader
                ? currentMember._id !== user._id && (
                    <>
                      {/* Đổi nhóm trưởng */}
                      <li
                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                        onClick={() =>
                          handleSetLeader(conversation._id, currentMember._id)
                        }
                      >
                        Đổi nhóm trưởng
                      </li>

                      {/* Nếu currentMember là phó nhóm -> chỉ có thể xóa quyền phó nhóm, KHÔNG thể xóa khỏi nhóm */}
                      {currentMember._id ===
                        updatedConversation.groupDeputy && (
                        <li
                          className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                          onClick={() => handleRemoveDeputy(conversation._id)}
                        >
                          Xóa quyền phó nhóm
                        </li>
                      )}

                      {/* Nếu currentMember không phải trưởng hoặc phó nhóm */}
                      {![
                        updatedConversation.groupLeader,
                        updatedConversation.groupDeputy,
                      ].includes(currentMember._id) && (
                        <>
                          <li
                            className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                            onClick={() =>
                              handleSetDeputy(
                                conversation._id,
                                currentMember._id
                              )
                            }
                          >
                            Chỉ định phó nhóm
                          </li>
                          <li
                            className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                            onClick={() => handelLeaveGroup(currentMember._id)}
                          >
                            Xóa khỏi nhóm
                          </li>
                        </>
                      )}
                    </>
                  )
                : user._id === updatedConversation.groupDeputy
                ? // Phó nhóm
                  currentMember._id !== updatedConversation.groupLeader &&
                  currentMember._id !== updatedConversation.groupDeputy && (
                    <>
                      <li
                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => handelLeaveGroup(currentMember._id)}
                      >
                        Xóa khỏi nhóm
                      </li>
                    </>
                  )
                : null}
            </ul>
          </div>
        )}
      </div>
      {/* Hiển thị */}
      {showAddMemberGroup && (
        <AddMemberGroup
          onClose={toggleAddMemberGroup}
          conversation={conversation}
        />
      )}
    </div>
  );
};

export default ListMember;
