import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
  MessageSquare,
  FileText,
  CheckSquare,
  Cloud,
  Briefcase,
  Settings,
} from "lucide-react";
import NavItem from "./ui/NavItem";
import { authService } from "../services/api/auth.service";

const MenuHome = ({ onOpenProfileModal, onOpenChangePasswordModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"))?.user;

  // Thêm ref cho avatar và menu popup
  const avatarRef = useRef(null);
  const menuRef = useRef(null);

  // Toggle menu khi click avatar
  const openMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Đóng menu
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  // Đóng menu nếu click ra ngoài avatar và popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        avatarRef.current &&
        !avatarRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 flex flex-col items-center bg-blue-600 text-white py-4 z-50">
      {/* Avatar - Khi nhấn sẽ toggle menu */}
      <div className="relative">
        <div
          ref={avatarRef}
          className="w-10 h-10 mb-8 rounded-full overflow-hidden cursor-pointer"
          onClick={openMenu}
        >
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

        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute ml-14 top-0 w-64 bg-white text-black rounded-lg shadow-lg p-4 z-60"
          >
            <div className="flex items-center gap-3 border-b-2 pb-3">
              <div>
                <h3 className="font-semibold text-sm">{user.fullName}</h3>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <button
                onClick={() => {
                  closeMenu();
                  onOpenProfileModal();
                }}
                className="flex items-center gap-2 text-sm hover:bg-gray-100 p-2 rounded w-full text-left"
              >
                Hồ sơ của bạn
              </button>
              <a
                href="/settings"
                className="flex items-center gap-2 text-sm hover:bg-gray-100 p-2 rounded"
              >
                Cài đặt
              </a>
            </div>

            <div className="mt-3 text-xs border-t-2 pt-3">
              <button
                onClick={() => {
                  closeMenu();
                  onOpenChangePasswordModal();
                }}
                className="flex items-center gap-2 text-sm hover:bg-gray-100 p-2 rounded w-full text-left"
              >
                Cập nhật mật khẩu
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm hover:bg-gray-100 p-2 rounded w-full text-left"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Thanh điều hướng */}
      <nav className="flex-1 flex flex-col items-center gap-4">
        <NavItem
          href="../pages/Home/Home.jsx"
          icon={<MessageSquare />}
          label="Messages"
        />
        <NavItem href="/documents" icon={<FileText />} label="Documents" />
        <NavItem href="/tasks" icon={<CheckSquare />} label="Tasks" />
      </nav>

      <div className="flex flex-col items-center gap-4 mb-4">
        <NavItem href="/cloud" icon={<Cloud />} label="Cloud Storage" />
        <div className="w-8 h-px bg-blue-400 my-2" aria-hidden="true" />
        <NavItem href="/work" icon={<Briefcase />} label="Work" />
        <NavItem href="/settings" icon={<Settings />} label="Settings" />
      </div>
    </aside>
  );
};

MenuHome.propTypes = {
  onOpenProfileModal: PropTypes.func.isRequired,
  onOpenChangePasswordModal: PropTypes.func,
};

export default MenuHome;
