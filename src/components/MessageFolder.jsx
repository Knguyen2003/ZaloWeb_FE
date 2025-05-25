// components/MessageFolder.jsx
import { Folder, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const MessageFolder = ({ folderInfo, createdAt }) => {
  const handleDownload = async () => {
    const zip = new JSZip();

    try {
      for (const file of folderInfo.files) {
        const response = await fetch(file.fileUrl);
        const blob = await response.blob();
        zip.file(file.fileName, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${folderInfo.folderName || "folder"}.zip`);
    } catch (error) {
      console.error("Tải thư mục thất bại:", error);
    }
  };

  function totalCapacity() {
    const tong = folderInfo.files.reduce((sum, file) => {
      return sum + (file.fileSize || 0);
    }, 0);

    return tong;
  }

  return (
    <div className="w-fit">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 flex items-center justify-center">
          <span className="text-4xl">📁</span>
        </div>

        <div>
          <p className="font-medium text-sm truncate">
            {folderInfo.folderName}
          </p>
          <div className="flex items-center justify-between ">
            <span className="text-xs text-muted-foreground mr-8">
              {totalCapacity()} KB
              <span className="text-green-600 font-medium ml-2">
                ✓ Đã có trên máy
              </span>
            </span>
            {/* NUT DOWNLOAD */}
            <span className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => alert("Mở thư mục")}
                className="hover:bg-gray-100"
              >
                <Folder className="w-5 h-5  hover:text-blue-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="hover:bg-gray-100"
              >
                <Download className="w-5 h-5  hover:text-blue-600" />
              </Button>
            </span>
          </div>
        </div>
      </div>
      <span className="text-xs text-gray-500">
        {new Date(createdAt).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
};

export default MessageFolder;
