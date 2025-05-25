import { useState } from "react";
import { Lock } from "lucide-react";
import { API } from "../config/axios";
import { toast } from "react-toastify";

const ZaloPasswordReset = ({ phone, lang, tempToken }) => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const normalizePhoneNumber = (phoneInput) => {
    // Nếu bắt đầu bằng +84 thì giữ nguyên
    if (phoneInput.startsWith("+84")) {
      return phoneInput;
    }
    // Nếu bắt đầu bằng 0 thì bỏ 0 và thêm +84
    if (phoneInput.startsWith("0")) {
      return `+84${phoneInput.slice(1)}`;
    }
  };

  const texts = {
    vi: {
      title: "Zalo",
      instruction:
        "Nhập mã xác thực được gửi đến số điện thoại của bạn để đặt lại mật khẩu.",
      phonePrefix: "(+84)",
      codePlaceholder: "Nhập mã kích hoạt",
      passwordPlaceholder: "Vui lòng nhập mật khẩu.",
      confirmPasswordPlaceholder: "Nhập lại mật khẩu",
      submit: "Xác nhận",
    },
    en: {
      title: "Zalo",
      instruction:
        "Enter the verification code sent to your phone number to reset your password.",
      phonePrefix: "(+84)",
      codePlaceholder: "Enter activation code",
      passwordPlaceholder: "Enter new password.",
      confirmPasswordPlaceholder: "Confirm new password",
      submit: "Confirm",
    },
  };

  const t = texts[lang];

  const handleVerifyOTP = async () => {
    try {
      const normalizedPhone = normalizePhoneNumber(phone);
      const response = await API.post("/auth/forgot-password/verify-otp", {
        phoneNumber: normalizedPhone,
        otp,
        tempToken,
      });
      console.log(response.data);
      return response.data.resetToken;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Xác minh OTP thất bại");
    }
  };

  const isValidPassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{6,32}$/;
    return regex.test(password);
  };

  const handleResetPassword = async (resetToken) => {
    try {
      if (!isValidPassword(newPassword)) {
        toast.error(
          "Mật khẩu phải chứa chữ cái, số, ký tự đặc biệt, và dài 6-32 ký tự.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          }
        );
      }
      if (newPassword !== confirmPassword) {
        toast.error(
          "Mật khẩu và xác nhận mật khẩu không khớp. Vui lòng thử lại.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          }
        );
      }
      const normalizedPhone = normalizePhoneNumber(phone);
      const response = await API.post("/auth/forgot-password/reset", {
        phoneNumber: normalizedPhone,
        newPassword,
        confirmPassword,
        resetToken,
      });
      return response.data.message;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Đặt lại mật khẩu thất bại"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const resetToken = await handleVerifyOTP();
      const successMessage = await handleResetPassword(resetToken);
      setSuccess(successMessage);
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f6fd] px-4">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}
      <div className="bg-white p-6 rounded-xl shadow-md w-[22%]">
        <h2 className="text-center text-blue-600 font-bold text-xl mb-4">
          {t.title}
        </h2>
        <p className="text-center text-gray-700 mb-4">
          {t.instruction}
          <br />
          <span className="text-blue-600 font-medium">{phone}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t.codePlaceholder}
            className="w-full mb-3 px-3 py-2 border rounded"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <div className="relative mb-3">
            <Lock className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder={t.passwordPlaceholder}
              className="w-full px-10 py-2 border rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="relative mb-4">
            <Lock className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder={t.confirmPasswordPlaceholder}
              className="w-full px-10 py-2 border rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            {t.submit}
          </button>
        </form>
      </div>

      <div className="mt-8 text-sm text-gray-600">
        <span
          className={`cursor-pointer hover:underline ${
            lang === "vi" ? "font-semibold text-[#0068ff]" : ""
          }`}
          onClick={() => setLang("vi")}
        >
          Tiếng Việt
        </span>{" "}
        |{" "}
        <span
          className={`cursor-pointer hover:underline ${
            lang === "en" ? "font-semibold text-[#0068ff]" : ""
          }`}
          onClick={() => setLang("en")}
        >
          English
        </span>
      </div>
    </div>
  );
};

export default ZaloPasswordReset;
