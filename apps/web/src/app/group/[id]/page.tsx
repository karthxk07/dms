"use client";
import React, {
  useState,
  useEffect,
  Key,
  FormEventHandler,
  FormEvent,
} from "react";
import { redirect, useParams } from "next/navigation";
import { Home, Menu, Plus, Search, Trash, Users, X } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import ParticipantsSidebar from "@/app/components/group/ParticipantsSidebar";

interface File {
  id: Key;
  name: string;
  url: string;
}

const GroupFilesDashboard = () => {
  const { id: groupId } = useParams();
  const [files, setFiles] = useState<File[] | null>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<HTMLInputElement | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showParticipants, setShowParticipants] = useState<boolean>(false);

  useEffect(() => {
    fetchFiles();
  }, [groupId, fetchFiles]);

  useEffect(() => {
    if (error) {
      console.log(error);

      // If using react-toastify
      toast.error(error, {
        position: "top-right",
        autoClose: 7000,
        hideProgressBar: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [error]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/group/getfiles/${groupId}`,
        { withCredentials: true }
      );
      setFiles(response.data as File[]);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  const initiateGoogleAuth = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_SERVER_URL}/gapi/auth/google`)
      .then((res) => {
        console.log(res);
        window.location.href = res.data as string;
      })
      .catch((error) => {
        console.error("Error initiating auth:", error);
        setError("Failed to initiate Google authorization");
      });
  };

  const handleFileUpload: FormEventHandler<HTMLFormElement> = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    try {
      if (selectedFile) {
        setIsUploading(true);
        setError("");

        // Upload to Google Drive
        const metadata = {
          name: selectedFile.name,
          mimeType: selectedFile.type,
        };

        const formData = new FormData();
        formData.append(
          "metadata",
          new Blob([JSON.stringify(metadata)], { type: "application/json" })
        );
        formData.append("file", selectedFile);

        // Upload file to Google Drive
        const driveResponse = await fetch(
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${Cookies.get("google_accessToken")}`,
            },
            body: formData,
          }
        );

        if (!driveResponse.ok) {
          throw new Error("Failed to upload to Google Drive");
        }

        const driveResult = await driveResponse.json();

        // Set file permissions
        await fetch(
          `https://www.googleapis.com/drive/v3/files/${driveResult.id}/permissions`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${Cookies.get("google_accessToken")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              role: "reader",
              type: "anyone",
            }),
          }
        );

        // Add file to your backend
        await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/group/addFile/${groupId}`,
          {
            groupId,
            fileUrl: `https://drive.google.com/file/d/${driveResult.id}/view`,
            fileName: selectedFile.name,
          },
          { withCredentials: true }
        );

        // Refresh file list
        await fetchFiles();

        // Reset form
        setSelectedFile(null);
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const filteredFiles = files!.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteFileHandler = async (fileId: Key) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/group/deleteFile/${groupId}/${fileId}`,
        { withCredentials: true }
      );

      //Refresh file list after deletion (if you implemented the deletion in your backend)
      await fetchFiles();
      console.log("afa");
      setError(
        "Please delete this file from your Google Drive manually. For security reasons, we cannot delete files directly from your Google Drive account."
      );
    } catch (error) {
      console.error("Error handling file deletion:", error);
      setError("Failed to process file deletion request. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer />
      {/* Upload Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Upload File
              </h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files![0])}
                  className="w-full p-2 border rounded-lg"
                />{" "}
              </div>

              {!Cookies.get("google_accessToken") && (
                <button
                  type="button"
                  onClick={initiateGoogleAuth}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Authorize Google Drive
                </button>
              )}

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !Cookies.get("google_accessToken")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topbar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <a onClick={() => redirect("/")}>
                <Home className="font-bold text-stone-600 text-3xl cursor-pointer" />
              </a>
            </div>
            <div className="relative flex-grow max-w-xl ml-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="ml-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="h-5 w-5 mr-1" />
              Add File
            </button>
            <div className="relative ml-3">
              <a
                className="rounded-full "
                onMouseEnter={() => setShowMenu(true)}
                onMouseLeave={() => setShowMenu(false)}
              >
                <Menu className="h-5 w-5 text-gray-600 hover:bg-gray-100 rounded-full" />
                {showMenu && (
                  <div className="absolute -start-1/2  w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <button
                      onClick={() => {
                        setShowParticipants(!showParticipants);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {showParticipants
                        ? "Hide Participants"
                        : "Show Participants"}
                    </button>
                  </div>
                )}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchQuery
                    ? "No files found matching your search"
                    : "No files available"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-white rounded-lg flex shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg flex-grow font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {file.name}
                    </a>
                    <button
                      onClick={() => {
                        deleteFileHandler(file.id);
                      }}
                    >
                      <Trash className="text-stone-600 " />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showParticipants && <ParticipantsSidebar groupId={groupId} />}
    </div>
  );
};

export default GroupFilesDashboard;
