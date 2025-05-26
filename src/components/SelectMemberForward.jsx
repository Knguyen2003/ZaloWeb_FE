import { useState, useEffect, useMemo } from "react";
import { X, ChevronLeft, Search } from "lucide-react";
import { getConversationList } from "../services/api/conversation.service";
import { messageService } from "../services/api/message.service";
import { toast } from "react-toastify";

const ForwardMessage = ({ onClose, message }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [chatItems, setChatItems] = useState([]);
  const [alreadyInGroup, setAlreadyInGroup] = useState(new Set()); // Nhóm không được chọn lại
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const res = await getConversationList();
        const conversations = res.data || [];
        setChatItems(conversations);

        // Lấy tất cả id nhóm để disable chọn lại
        const groupIds = new Set(
          conversations.filter((c) => c.type === "group").map((c) => c._id)
        );
        setAlreadyInGroup(groupIds);

        setError(null);
      } catch (err) {
        setError("Không thể tải danh sách cuộc trò chuyện");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const toggleUser = (user) => {
    if (alreadyInGroup.has(user._id)) return;

    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u._id === user._id);

      // Giới hạn chọn tối đa 100 người
      if (!exists && prev.length >= 100) return prev;

      if (exists) {
        // Bỏ chọn
        return prev.filter((u) => u._id !== user._id);
      } else {
        // Thêm chọn
        return [...prev, user];
      }
    });
  };

  const handleForward = async () => {
    const targetConversationIds = selectedUsers.map((u) => u._id);
    try {
      await messageService.forwardMessage({
        originalMessageId: message._id,
        senderId: user.user._id,
        targetConversationIds,
      });
      toast.success("Chuyển tiếp tin nhắn thành công!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi chuyển tiếp tin nhắn.");
    }
  };

  // Lọc và sắp xếp danh sách cuộc trò chuyện theo tên hoặc số điện thoại
  const filteredSortedUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return chatItems
      .filter((c) => {
        const name = (c.fullName || c.name || "").toLowerCase();
        const phone = (c.phoneNumber || "").toLowerCase();
        return name.includes(term) || phone.includes(term);
      })
      .sort((a, b) => {
        const nameA = (a.fullName || a.name || "").toLowerCase();
        const nameB = (b.fullName || b.name || "").toLowerCase();
        return nameA.localeCompare(nameB, "vi");
      });
  }, [chatItems, searchTerm]);

  const isSelected = (id) => selectedUsers.some((u) => u._id === id);
  const isCreateGroupDisabled = selectedUsers.length < 1;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="w-[500px] h-[650px] bg-white rounded shadow-lg p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button
            className="text-gray-600 hover:text-black p-1"
            onClick={onClose}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">
            Chọn cuộc trò chuyện muốn chuyển tiếp
          </h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <hr className="border-t border-gray-300 w-full" />

        {/* Search input */}
        <div className="relative">
          <input
            placeholder="Nhập tên, số điện thoại, hoặc danh sách số điện thoại"
            className="w-full px-10 py-2 border rounded text-sm focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
        </div>

        {/* Danh sách cuộc trò chuyện và đã chọn */}
        <div className="flex flex-1 gap-4 overflow-hidden transition-all duration-300">
          {/* Danh sách cuộc trò chuyện */}
          <div className="flex-1 overflow-y-auto pr-1 border-r">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Cuộc trò chuyện gần đây
            </p>

            {isLoading && <p className="text-sm text-gray-500">Đang tải...</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {!isLoading && filteredSortedUsers.length === 0 && (
              <p className="text-sm text-gray-400">
                Không tìm thấy cuộc trò chuyện.
              </p>
            )}

            {!isLoading &&
              filteredSortedUsers.map((user) => (
                <div
                  key={user._id}
                  className={`flex items-center gap-3 py-2 cursor-pointer ${
                    alreadyInGroup.has(user._id) ? "opacity-50" : ""
                  }`}
                  onClick={() => toggleUser(user)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected(user._id)}
                    readOnly
                    disabled={alreadyInGroup.has(user._id)}
                  />
                  {user.avatar && user.avatar.trim() !== "" ? (
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : user.groupName === "Cloud của tôi" ? (
                    <img
                      src="/cloud.jpg"
                      alt="cloud avatar"
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                      {(user.fullName || user.name)
                        ?.split(" ")
                        .map((word) => word[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                  <span>{user.name || user.groupName}</span>
                </div>
              ))}
          </div>

          {/* Danh sách đã chọn */}
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
                      {user.avatar && user.avatar.trim() !== "" ? (
                        <img
                          src={user.avatar}
                          alt="avatar"
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                          {(user.fullName || user.name)
                            ?.split(" ")
                            .map((word) => word[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                      )}
                      <span>{user.fullName || user.name}</span>
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
            onClick={handleForward}
            disabled={isCreateGroupDisabled}
            className={`px-4 py-2 text-sm text-white rounded transition-all duration-200 ${
              isCreateGroupDisabled
                ? "bg-blue-300 cursor-not-allowed opacity-50"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardMessage;
