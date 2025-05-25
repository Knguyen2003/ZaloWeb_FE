import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "../services/api/auth.service";

const ChangePassword = ({ isOpen, onClose }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,32}$/;
        if (currentPassword === newPassword) {
            setError("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
            setSuccess("");
            return;
        }

        if (!passwordRegex.test(newPassword)) {
            setError(
                "Mật khẩu mới không hợp lệ. Phải chứa chữ cái, số, ký tự đặc biệt và có độ dài từ 6 đến 32 ký tự."
            );
            setSuccess("");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError("Mật khẩu mới và mật khẩu xác nhận không khớp.");
            setSuccess("");
            return;
        }
        try {
            await authService.updatePassword(currentPassword, newPassword);
            toast.success("Cập nhật mật khẩu thành công!");
            setError("");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            onClose();
        } catch (err) {
            setError(err.message || "Đã có lỗi xảy ra.");
            setSuccess("");
        }
    };

    const handleCancel = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setError("");
        setSuccess("");
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-[450px]">
                <div className="flex justify-between items-center border-b border-gray-200 px-5 py-3 rounded-t-lg">
                    <h2 className="text-xl font-semibold text-gray-950">Cập nhật mật khẩu</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-900 transition"
                        aria-label="Đóng"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-5 py-4">
                    <p className=" text-gray-600 mb-4 text-18">
                        <strong className="text-22">Lưu ý:</strong> Mật khẩu phải chứa chữ cái, số, ký tự đặc biệt và có độ dài từ 6 đến 32 ký tự
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="current-password"
                                className="block text-gray-950 font-medium mb-1"
                            >
                                Mật khẩu hiện tại
                            </label>
                            <input
                                id="current-password"
                                type="password"
                                placeholder="Nhập mật khẩu hiện tại"
                                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="new-password"
                                className="block text-gray-950 font-medium mb-1"
                            >
                                Mật khẩu mới
                            </label>
                            <input
                                id="new-password"
                                type="password"
                                placeholder="Nhập mật khẩu mới"
                                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="confirm-new-password"
                                className="block text-gray-950 font-medium mb-1"
                            >
                                Nhập lại mật khẩu mới
                            </label>
                            <input
                                id="confirm-new-password"
                                type="password"
                                placeholder="Xác nhận mật khẩu mới"
                                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        {(error || success) && (
                            <p
                                className={`text-xs font-medium ${error ? "text-red-600" : "text-green-600"
                                    }`}
                                role="alert"
                            >
                                {error || success}
                            </p>
                        )}

                        <div className="flex justify-end gap-3 mt-2">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-3 rounded-md bg-gray-200 hover:bg-gray-300 text-sm transition"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={
                                    !currentPassword || !newPassword || !confirmNewPassword
                                }
                                className={`px-4 py-1.5 rounded-md text-white text-sm transition ${!currentPassword || !newPassword || !confirmNewPassword
                                    ? "bg-blue-300 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                            >
                                Cập nhật
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
