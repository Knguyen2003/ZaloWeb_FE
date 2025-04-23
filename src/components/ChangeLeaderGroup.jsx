import { useState } from "react";
import { X, ChevronLeft, Search } from "lucide-react";

const dummyUsers = [
  { id: 1, name: "Bảo Thông", avatar: "https://i.pravatar.cc/150?u=1" },
  { id: 2, name: "Dương Domic", avatar: "https://i.pravatar.cc/150?u=2" },
  { id: 3, name: "Ngô Thái Hiệp", avatar: "https://i.pravatar.cc/150?u=3" },
  { id: 4, name: "Khôi Nguyên", avatar: "https://i.pravatar.cc/150?u=4" },
  { id: 5, name: "Thanh Yến", avatar: "https://i.pravatar.cc/150?u=5" },
  { id: 6, name: "Ái Xuânn", avatar: "https://i.pravatar.cc/150?u=6" },
  { id: 7, name: "Anh Bảo", avatar: "https://i.pravatar.cc/150?u=7" },
  { id: 8, name: "Ánh Nguyệt", avatar: "https://i.pravatar.cc/150?u=8" },
];

const ChangeLeaderGroup = ({ onClose }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  const sortedUsers = [...dummyUsers].sort((a, b) =>
    a.name.localeCompare(b.name, "vi")
  );

  const toggleUser = (user) => {
    if (selectedUser && selectedUser.id === user.id) {
      setSelectedUser(null);
    } else {
      setSelectedUser(user);
    }
  };

  const isSelected = (id) => selectedUser?.id === id;

  const isCreateGroupDisabled = !selectedUser;

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
          <h2 className="text-lg font-semibold">Chuyển quyền nhóm trưởng</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <hr className="border-t border-gray-300 w-full" />

        <div className="relative">
          <input
            placeholder="Nhập tên, số điện thoại, hoặc danh sách số điện thoại"
            className="w-full px-10 py-2 border rounded text-sm focus:outline-none"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
        </div>

        <div className="flex flex-1 gap-4 overflow-hidden transition-all duration-300">
          <div className="flex-1 overflow-y-auto pr-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Danh sách thành viên nhóm
            </p>
            {sortedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 py-2 cursor-pointer"
                onClick={() => toggleUser(user)}
              >
                <input type="checkbox" checked={isSelected(user.id)} readOnly />
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span>{user.name}</span>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-t border-gray-300 w-full my-4" />

        <div className="flex justify-end gap-2 mt-auto">
          <button
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            onClick={() => console.log("Tạo nhóm")}
            className={`px-4 py-2 text-sm text-white rounded hover:bg-blue-700 transition-all duration-200 ${
              isCreateGroupDisabled
                ? "bg-blue-300 cursor-not-allowed opacity-50"
                : "bg-blue-600"
            }`}
            disabled={isCreateGroupDisabled}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeLeaderGroup;
