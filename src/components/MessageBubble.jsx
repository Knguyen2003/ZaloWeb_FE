import { useState, useRef, useEffect } from "react";
import { FolderIcon, Download, Forward } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { FileIcon as FileIconReact, defaultStyles } from "react-file-icon";
import MessageImage from "./MessageImage";
import MessageFolder from "./MessageFolder";
import { messageService } from "../services/api/message.service";
import SelectMemberForward from "./SelectMemberForward";

const MessageBubble = ({
  message,
  user,
  getFileExtension,
  group,
  selectedMessageId,
  setSelectedMessageId,
}) => {
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const isSender = message.senderId?._id === user._id;
  const messageRef = useRef(null);

  // Sửa tên state cho đúng chính tả
  const [showSelectMemberForward, setSelectMemberForward] = useState(false);

  //Hiển thị nút chuyển tiếp (bật modal chọn thành viên)
  const handleMessageClick = (e) => {
    e.stopPropagation();
    setSelectedMessageId(message._id);
  };

  // Thu hồi tin nhắn
  const handleRecallMessage = async () => {
    try {
      await messageService.recallMessage(message._id);
    } catch (error) {
      console.error("Lỗi khi thu hồi tin nhắn:", error.message);
    }
  };

  // Xóa tin nhắn phía tôi
  const handleDeleteForMe = async () => {
    try {
      await messageService.deleteMessage(message._id);
    } catch (error) {
      console.error("Lỗi khi xoá tin nhắn phía tôi:", error.message);
    }
  };

  // Chuột phải mở menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setIsContextMenuOpen(true);
  };

  // Đóng menu khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (messageRef.current && !messageRef.current.contains(e.target)) {
        setIsContextMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <div
        ref={messageRef}
        className={`flex ${isSender ? "justify-end" : "justify-start"}`}
      >
        {selectedMessageId === message._id &&
          isSender &&
          message.status !== "recalled" && (
            <div className="flex flex-col justify-end">
              <div className="flex flex-row gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectMemberForward(true)}
                >
                  <Forward className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

        <div
          className="bg-blue-50 rounded-lg p-3 max-w-[90%]"
          onContextMenu={handleContextMenu}
          onClick={handleMessageClick}
        >
          {!isSender && group && (
            <p className="text-sm text-gray-500">{message.senderId.fullName}</p>
          )}

          {message.messageType === "text" ? (
            <div>
              <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                <p
                  className={`text-sm ${message.status === "recalled" ? "text-gray-400 italic" : ""
                    }`}
                >
                  {message.status === "recalled"
                    ? "Tin nhắn đã được thu hồi"
                    : message.content}
                </p>
              </pre>
              <span className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : message.messageType === "image" ? (
            <MessageImage message={message} isSender={isSender} />
          ) : message.messageType === "video" ? (
            <div>
              <video controls className="max-w-xs rounded-lg shadow-md">
                <source src={message.fileInfo.fileUrl} type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ video.
              </video>
              <span className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : message.messageType === "audio" ? (
            <div>
              <audio controls className="w-full">
                <source src={message.fileInfo.fileUrl} type="audio/mpeg" />
                Trình duyệt của bạn không hỗ trợ âm thanh.
              </audio>
              <span className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : message.messageType === "file" ? (
            <div className="w-fit">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 flex items-center justify-center">
                  <FileIconReact
                    extension={getFileExtension(message.fileInfo?.fileName)}
                    {...defaultStyles[
                    getFileExtension(message.fileInfo?.fileName)
                    ]}
                  />
                </div>

                <div>
                  <p className="font-medium text-sm truncate">
                    {message.fileInfo?.fileName}
                  </p>

                  <div className="flex items-center justify-between ">
                    <span className="text-xs text-muted-foreground mr-8">
                      {message.fileInfo?.fileSize} KB
                      <span className="text-green-600 font-medium ml-2">
                        ✓ Đã có trên máy
                      </span>
                    </span>
                    {/* NUT DOWNLOAD */}
                    <span className="flex items-center">
                      <Button variant="ghost" size="icon">
                        <FolderIcon className="h-5 w-5 hover:text-blue-600 " />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          try {
                            const response = await fetch(
                              message.fileInfo?.fileUrl
                            );
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);

                            const a = document.createElement("a");
                            a.href = url;
                            a.download =
                              message.fileInfo?.fileName || "download";
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error("Tải file thất bại:", error);
                          }
                        }}
                      >
                        <Download className="h-5 w-5 hover:text-blue-600" />
                      </Button>
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : message.messageType === "folder" ? (
            <MessageFolder
              folderInfo={message.folderInfo}
              createdAt={message.createdAt}
            />
          ) : null}
        </div>

        {selectedMessageId === message._id &&
          isSender === false &&
          message.status !== "recalled" && (
            <div className="flex flex-col justify-end">
              <div className="flex flex-row gap-2">
                <Button variant="ghost" size="icon" onClick={() => setSelectMemberForward(true)}>
                  <Forward className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
      </div>

      {/* Modal chọn thành viên chuyển tiếp */}
      {showSelectMemberForward && (
        <SelectMemberForward
          message={message}
          onClose={() => setSelectMemberForward(false)}
        />
      )}

      {/* Context Menu xuất hiện tại vị trí chuột */}
      {isContextMenuOpen && (
        <DropdownMenu open>
          <DropdownMenuContent
            style={{
              position: "fixed",
              top: contextMenuPosition.y,
              left: contextMenuPosition.x,
              zIndex: 9999,
            }}
            className="bg-white border rounded-md shadow-lg"
          >
            {message.status !== "recalled" && (
              <DropdownMenuItem onClick={handleDeleteForMe}>
                Chia sẻ
              </DropdownMenuItem>
            )}
            {isSender && message.status !== "recalled" && (
              <DropdownMenuItem
                onClick={handleRecallMessage}
                className="text-red-500"
              >
                Thu hồi tin nhắn
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleDeleteForMe}
              className="text-red-500"
            >
              Xóa chỉ phía tôi
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};

export default MessageBubble;
