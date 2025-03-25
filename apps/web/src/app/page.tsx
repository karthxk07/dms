"use client";
import React, { useState, useEffect, Key } from "react";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Search,
  Plus,
  X,
  LogOut,
} from "lucide-react";
import axios, { AxiosError } from "axios";
import { redirect, useRouter } from "next/navigation";

const App = () => {
  interface Group {
    id: Key;
    name: string;
  }

  const router = useRouter();
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/group/getGroups`,
        {
          withCredentials: true,
        }
      );
      setAllGroups(response.data as Group[]);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Make GET request to signout endpoint
      await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/signout`, {
        withCredentials: true,
      });

      // Redirect to homepage after successful signout
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      // Still redirect even if there's an error
      router.push("/");
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      setError("Group name is required");
      return;
    }

    try {
      setIsCreating(true);
      setError("");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/group/create`,
        { name: newGroupName.trim() },
        { withCredentials: true }
      );

      setAllGroups([...allGroups, response.data as Group]);
      setNewGroupName("");
      setIsDialogOpen(false);
    } catch (error: unknown) {
      setError(
        ((error as AxiosError).response?.data as { message?: string })
          ?.message || "Failed to create group"
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Filter groups based on search query
  const filteredGroups = allGroups.filter((group: Group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGroups = filteredGroups.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Create Group Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Group
              </h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="groupName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Group Name
                </label>
                <input
                  id="groupName"
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={createGroup}
                  disabled={isCreating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Creating..." : "Create Group"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Topbar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-semibold text-gray-800">
              AIMK Document Management System
            </div>
            <div className="flex items-center  space-x-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search groups..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button
                onClick={() => setIsDialogOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="h-5 w-5 mr-1" />
                Create Group
              </button>
              <div className="relative ">
                <a
                  className="p-3 rounded-full "
                  onMouseEnter={() => setShowUserMenu(true)}
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <User className="h-5 w-5 text-gray-600 hover:bg-gray-100 rounded-full" />
                  {showUserMenu && (
                    <div className="absolute end-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
            <p className="text-gray-600">
              Manage your document groups and permissions
            </p>
          </div>
          <div className="text-gray-600">
            Total Groups: {filteredGroups.length}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredGroups.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchQuery
                    ? "No groups found matching your search"
                    : "No groups available"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedGroups.map((group: Group) => (
                  <div
                    key={group.id}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md hover:cursor-pointer transition-shadow duration-200"
                    onClick={() => {
                      console.log("clicked");
                      redirect(`/group/${group.id}`);
                    }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {group.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Group ID: {group.id}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {filteredGroups.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <span className="px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
