import { useState, useEffect } from "react";
import { X, Camera, Search } from "lucide-react";
import { friendService } from "../services/api/friend.service";
import { createGroup } from "../services/api/conversation.service";

const CreateGroup = ({ onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupAvatar, setGroupAvatar] = useState(null); // ảnh nhóm
  const [friendList, setFriendList] = useState([]); // Danh sách bạn bè
  const [avatarFile, setAvatarFile] = useState(null); // File ảnh nhóm

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const friends = await friendService.getFriends();
        setFriendList(friends.data);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchFriends();
  }, []);

  const toggleUser = (user) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u._id === user._id);
      if (exists) return prev.filter((u) => u._id !== user._id);
      return [...prev, user];
    });
  };

  const handleCreateGroup = async () => {
    try {
      const participantIds = selectedUsers.map((user) => user._id);
      const formData = new FormData();
      formData.append("groupName", groupName);
      formData.append("participantIds", JSON.stringify(participantIds));
      if (avatarFile) {
        formData.append("groupAvatar", avatarFile);
      }
      const response = await createGroup(formData);
      onClose();
    } catch (error) {
      console.error("Lỗi khi tạo nhóm:", error.message);
      alert("Không thể tạo nhóm. Vui lòng thử lại.");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupAvatar(reader.result); // Cập nhật ảnh đại diện nhóm
      };
      reader.readAsDataURL(file);
    }
  };

  const sortedUsers = [...friendList].sort((a, b) =>
    a.fullName.localeCompare(b.fullName, "vi")
  );

  const isSelected = (id) =>
    selectedUsers.findIndex((u) => u._id === id) !== -1;

  const isCreateGroupDisabled = selectedUsers.length < 2;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="w-[500px] h-[650px] bg-white rounded shadow-lg p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tạo nhóm</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <hr className="border-t border-gray-300 w-full" />

        {/* PHẦN TRÊN: Nhập tên nhóm */}
        <div className="flex items-center gap-3">
          <button className="p-1 rounded-full hover:bg-gray-100">
            {groupAvatar ? (
              <img
                src={groupAvatar}
                alt="avatar"
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <Camera className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Nhập tên nhóm"
            className="flex-1 p-2 border-b rounded-lg focus:outline-none focus:border-blue-500"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
            id="group-avatar-upload"
          />
          <label htmlFor="group-avatar-upload" className="cursor-pointer">
            <Camera className="w-5 h-5 text-gray-400" />
          </label>
        </div>

        {/* PHẦN TÌM KIẾM */}
        <div className="relative">
          <input
            placeholder="Nhập tên, số điện thoại, hoặc danh sách số điện thoại"
            className="w-full px-10 py-2 border rounded text-sm focus:outline-none"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
        </div>

        {/* PHẦN CHÍNH: Trò chuyện gần đây + Đã chọn */}
        <div className="flex flex-1 gap-4 overflow-hidden transition-all duration-300">
          <div className="flex-1 overflow-y-auto pr-1 border-r">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Trò chuyện gần đây
            </p>
            {sortedUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 py-2 cursor-pointer"
                onClick={() => toggleUser(user)}
              >
                <input
                  type="checkbox"
                  checked={isSelected(user._id)}
                  readOnly
                />
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="avatar"
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                    {user.fullName
                      ?.split(" ")
                      .map((word) => word[0])
                      .join(" ")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <span>{user.fullName}</span>
              </div>
            ))}
          </div>

          {selectedUsers.length > 0 && (
            <div className="w-1/2 overflow-y-auto pl-2">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-medium text-gray-700">
                  Đã chọn {selectedUsers.length}/100
                </h2>
              </div>
              <div className="space-y-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded"
                  >
                    <div className="flex items-center gap-2">
                      {user.profilePic ? (
                        <img
                          src={user.profilePic}
                          alt="avatar"
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                          {user.fullName
                            ?.split(" ")
                            .map((word) => word[0])
                            .join(" ")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                      <span>{user.fullName}</span>
                    </div>
                    <button onClick={() => toggleUser(user)}>
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <hr className="border-t border-gray-300 w-full my-4" />

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-auto">
          <button
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            onClick={handleCreateGroup}
            className={`px-4 py-2 text-sm text-white rounded hover:bg-blue-700 transition-all duration-200 ${
              isCreateGroupDisabled
                ? "bg-blue-300 cursor-not-allowed opacity-50"
                : "bg-blue-600"
            }`}
            disabled={isCreateGroupDisabled}
          >
            Tạo nhóm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
