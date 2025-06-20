import { useState, useEffect, useRef } from "react";
import {
  Smile,
  ImageIcon,
  Paperclip,
  FileSpreadsheet,
  Video,
  MessageSquare,
  MoreHorizontal,
  FolderIcon,
  FileIcon,
  SendHorizonal,
  ThumbsUp,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import GroupAvatar from "./GroupAvatar";
import { getSocket } from "../services/socket";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmojiPickerComponent from "./EmojiPickerComponent";
import { messageService } from "../services/api/message.service";
import MessageBubble from "../components/MessageBubble";
import AddMemberGroup from "./AddMemberGroup";
import GroupManagement from "./GroupManagement";
import { toast } from "react-toastify";
import CreateGroup from "./CreateGroup";

const ChatInterface = ({ conversation }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddMemberGroup, setShowAddMemberGroup] = useState(false);
  const [showGroupManagement, setShowGroupManagement] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const toggleAddMemberGroup = () => {
    setShowAddMemberGroup(!showAddMemberGroup);
  };

  const toggleCreateGroup = () => {
    setShowCreateGroup(!showCreateGroup);
  };

  const toggleGroupManagement = () => {
    setShowGroupManagement(!showGroupManagement);
  };

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const imgInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user")).user;

  // Lấy đuôi file
  const getFileExtension = (fileName) => {
    if (!fileName) return "";
    return fileName.split(".").pop();
  };

  // Xử lý chọn emoji
  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji);
  };

  // Gửi tin nhắn văn bản
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const newMessageData = {
      conversationId: conversation._id,
      content: newMessage,
    };

    try {
      const sentMessage = await messageService.sendMessage(newMessageData);
      setNewMessage("");
    } catch (error) {
      console.error("Gửi tin nhắn thất bại", error);
    }
  };

  // Gửi file
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1024MB

    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        "File vượt quá dung lượng tối đa 1024MB. Vui lòng chọn file nhỏ hơn.",
        {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        }
      );
      return;
    }
    setIsUploading(true);
    try {
      // Gửi file tới backend
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", conversation._id);
      formData.append("senderId", user._id);

      const response = await messageService.sendFileFolder(formData);
    } catch (error) {
      toast.error(
        "File vượt quá dung lượng tối đa 1024MB. Vui lòng chọn file nhỏ hơn.",
        {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        }
      );
    } finally {
      setIsUploading(false);
      fileInputRef.current.value = null;
    }
  };

  // Gửi folder
  const handleFolderChange = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log("Không có file nào được chọn");
      return;
    }

    const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1024MB

    // Kiểm tra từng file
    for (let file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" vượt quá giới hạn 1024MB.`, {
          position: "top-right",
        });
        return;
      }
    }
    setIsUploading(true);

    try {
      const firstFile = files[0];
      const folderName =
        firstFile.webkitRelativePath.split("/")[0] || "UnnamedFolder";

      const response = await messageService.sendFolder({
        conversationId: conversation._id,
        folderName,
        files: Array.from(files),
      });
    } catch (error) {
      toast.error("Không thể gửi folder quá 1024MB", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
    } finally {
      setIsUploading(false);
      folderInputRef.current.value = null;
    }
  };

  // Gửi ảnh
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      // Gửi file tới backend
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", conversation._id);
      formData.append("senderId", user._id);

      const response = await messageService.sendFileFolder(formData);
    } catch (error) {
      console.error("Lỗi khi gửi file:", error.message);
    } finally {
      setIsUploading(false);
      imgInputRef.current.value = null;
    }
  };

  const onDeleteMessage = (messageId) => {
    setMessages((prevMessages) =>
      prevMessages.filter((message) => message._id !== messageId)
    );
  };

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Khởi tạo socket và lấy tin nhắn ban đầu
  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (message) => {
      fetchMessages();
    };
    if (socket) {
      socket.on("newMessage", handleNewMessage);
    }

    // Lấy danh sách tin nhắn
    const fetchMessages = async () => {
      try {
        const data = await messageService.getMessagesByConversationId({
          conversationId: conversation._id,
          beforeMessageId: null,
          limit: 50,
        });
        setMessages(data.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy tin nhắn:", error);
      }
    };

    fetchMessages();

    return () => {
      if (socket) {
        socket.off("newMessage", handleNewMessage);
      }
    };
  }, [conversation._id]);

  // Xử lý nhấn Enter để gửi tin nhắn
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      {isUploading && (
        <div className="absolute inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
            <p className="text-white mt-4">Đang gửi. Vui lòng chờ...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-16 w-16 shrink-0 grow-0 basis-auto flex items-center justify-center">
            {conversation.avatar ? (
              <img
                src={conversation.avatar}
                alt="avatar"
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : conversation.isGroup ? (
              <GroupAvatar chat={conversation} />
            ) : (
              <div className="size-14 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                {conversation.name
                  ?.split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
          </Avatar>
          <span className="font-medium">
            {conversation.name && conversation.name.trim() !== ""
              ? conversation.name
              : conversation.groupName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={
              conversation.isGroup
                ? toggleAddMemberGroup // nếu là group
                : toggleCreateGroup // nếu không phải group
            }
          >
            <Users className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          {conversation.isGroup && (
            <Button variant="ghost" size="icon" onClick={toggleGroupManagement}>
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          )}
        </div>
      </header>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            group={conversation.isGroup}
            user={user}
            getFileExtension={getFileExtension}
            selectedMessageId={selectedMessageId}
            setSelectedMessageId={setSelectedMessageId}
            onDeleteMessage={onDeleteMessage}
          />
        ))}
      </div>

      {/* Input Area */}
      <div className="w-full flex mx-auto border-t">
        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex items-center gap-2 p-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Smile className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => imgInputRef.current.click()}
            >
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
            <input
              type="file"
              accept="image/*"
              ref={imgInputRef}
              className="hidden"
              onChange={handleImageChange}
            />
            {/* Chọn file và folder */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              type="file"
              ref={folderInputRef}
              className="hidden"
              webkitdirectory="true"
              directory="true"
              onChange={handleFolderChange}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="z-50 bg-white shadow-md border border-gray-200"
              >
                <DropdownMenuItem onClick={() => fileInputRef.current.click()}>
                  <FileIcon className="mr-2 h-4 w-4" />
                  Chọn File
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => folderInputRef.current.click()}
                >
                  <FolderIcon className="mr-2 h-4 w-4" />
                  Chọn Thư mục
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon">
              <FileSpreadsheet className="h-5 w-5 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>

          <div className="w-full flex items-center border-t gap-2 p-2">
            <input
              type="text"
              placeholder={`Nhập @, tin nhắn tới ${conversation.name}`}
              className="w-full outline-none flex-1"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <EmojiPickerComponent onEmojiSelect={handleEmojiSelect} />
            {newMessage.length === 0 ? (
              <button className=" text-gray-500 hover:text-gray-700">
                <ThumbsUp className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleSendMessage}
                className=" text-blue-500 hover:text-blue-700"
              >
                <SendHorizonal className="" />
              </button>
            )}
          </div>
        </div>
      </div>
      {showAddMemberGroup && (
        <AddMemberGroup
          onClose={toggleAddMemberGroup}
          conversation={conversation}
        />
      )}
      {showGroupManagement && (
        <GroupManagement
          onClose={toggleGroupManagement}
          conversation={conversation}
        />
      )}

      {showCreateGroup && <CreateGroup onClose={toggleCreateGroup} />}
    </div>
  );
};

export default ChatInterface;
