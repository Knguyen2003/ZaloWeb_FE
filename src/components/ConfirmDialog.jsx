import { X } from "lucide-react";

const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-[360px] p-6 relative">
                <button onClick={onCancel} className="absolute top-2 right-2 text-gray-500 hover:text-black">
                    <X size={20} />
                </button>
                <h2 className="text-lg font-semibold mb-4">{title}</h2>
                <p className="text-sm text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
