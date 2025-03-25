import { useState, useEffect, Key } from "react";
import axios, { AxiosError } from "axios";
import { UserIcon, XCircle, UserPlus, Check, Shield } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

interface User {
  id: Key;
  username: string;
}

const ParticipantSidebar = ({
  groupId,
}: {
  groupId: string | string[] | undefined;
}) => {
  const [participants, setParticipants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<Key | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/group/getUsers/${groupId}`,
          {
            withCredentials: true,
          }
        );
        console.log(response.data);
        setParticipants(response.data as User[]);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch participants:", err);
        setError("Failed to load participants");
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchParticipants();
    }
  }, [groupId]);

  useEffect(() => {
    if (error) {
      // If using react-toastify
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    setTimeout(() => {
      setError(null);
    }, 5000);
  }, [error]);

  const handleRemoveUser = async (userId: Key) => {
    try {
      setRemovingUserId(userId);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/group/removeUser/${groupId}`,
        {
          params: { userId },
          withCredentials: true,
        }
      );

      // Remove user from local state after successful deletion
      setParticipants(participants.filter((user) => user.id !== userId));
      toast.success("User removed successfully");
    } catch (err: unknown) {
      setError("Failed to remove user, " + (err as AxiosError).response?.data);
    } finally {
      setRemovingUserId(null);
    }
  };

  return (
    <div className="transition-all duration-500 ease-in-out fixed end-0 top-0 w-fit h-full border-l border-gray-200 bg-white shadow-sm">
      <ToastContainer />
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">Participants</h2>
      </div>

      <div className="p-2">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
          </div>
        ) : participants.length === 0 ? (
          <div className="text-gray-500 text-sm p-4">No participants found</div>
        ) : (
          <ul className="space-y-1">
            {participants.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <UserIcon size={16} className="text-gray-500" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {user.username}
                    </p>
                  </div>
                </div>

                <div className="relative group">
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    disabled={removingUserId === user.id}
                    className="text-red-500 hover:text-red-700 ml-2 transition-colors duration-200 focus:outline-none"
                    aria-label="Remove user"
                  >
                    {removingUserId === user.id ? (
                      <div className="animate-spin h-4 w-4 border-2 border-red-500 rounded-full border-t-transparent"></div>
                    ) : (
                      <XCircle size={18} />
                    )}
                  </button>

                  {/* Tooltip */}
                  <div
                    className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded px-2 py-1 
                                 right-0 transform translate-y-full -translate-x-1/4 mt-1 opacity-0 group-hover:opacity-100 
                                 transition-opacity duration-300"
                  >
                    Remove user
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Participant Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors duration-200"
        >
          <UserPlus size={16} />
          <span>Add Participant</span>
        </button>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <AddUserModal
          groupId={groupId}
          closeModal={() => setIsModalOpen(false)}
          onUserAdded={(newUser) => setParticipants([...participants, newUser])}
        />
      )}
    </div>
  );
};

interface AddUserModalProps {
  groupId: string | string[] | undefined;
  closeModal: () => void;
  onUserAdded: (user: User) => void;
}

const AddUserModal = ({
  groupId,
  closeModal,
  onUserAdded,
}: AddUserModalProps) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/user/getAllUsers`,
          { withCredentials: true }
        );
        setAllUsers(response.data as User[]);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  const handleAddUser = async () => {
    if (!selectedUser || !groupId) return;

    try {
      setAddingUser(true);
      const endpoint = isAdmin
        ? `${process.env.NEXT_PUBLIC_SERVER_URL}/group/addAdmin/${groupId}`
        : `${process.env.NEXT_PUBLIC_SERVER_URL}/group/addUser/${groupId}`;

      await axios.post(
        endpoint,
        { userId: selectedUser.id },
        { withCredentials: true }
      );

      toast.success(
        `User ${selectedUser.username} added successfully${isAdmin ? " as admin" : ""}`
      );
      onUserAdded(selectedUser);
      closeModal();
    } catch (err) {
      console.error("Failed to add user:", err);
      toast.error(
        `Failed to add user: ${(err as AxiosError).response?.data || "Unknown error"}`
      );
    } finally {
      setAddingUser(false);
    }
  };

  const filteredUsers = allUsers.filter((user) =>
    user.username.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Add Participant</h3>
        </div>

        {/* Modal Body */}
        <div className="p-4">
          {/* Search Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* User List */}
          <div className="max-h-60 overflow-y-auto mb-4 border border-gray-200 rounded-md">
            {loading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-gray-500 text-sm p-4 text-center">
                No users found
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <li
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                      selectedUser?.id === user.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <UserIcon size={16} className="text-gray-500" />
                      </div>
                      <span>{user.username}</span>
                    </div>
                    {selectedUser?.id === user.id && (
                      <Check size={18} className="text-blue-500" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Admin Toggle */}
          {selectedUser && (
            <div className="flex items-center mb-4">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isAdmin}
                    onChange={() => setIsAdmin(!isAdmin)}
                  />
                  <div
                    className={`block w-10 h-6 rounded-full ${isAdmin ? "bg-blue-500" : "bg-gray-300"}`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isAdmin ? "transform translate-x-4" : ""}`}
                  ></div>
                </div>
                <div className="flex items-center ml-3">
                  <Shield
                    size={16}
                    className={isAdmin ? "text-blue-500" : "text-gray-400"}
                  />
                  <span className="ml-2 text-sm font-medium">Add as Admin</span>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={closeModal}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleAddUser}
            disabled={!selectedUser || addingUser}
            className={`px-4 py-2 rounded-md text-white transition-colors duration-200 flex items-center ${
              !selectedUser || addingUser
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {addingUser ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                <span>Adding...</span>
              </>
            ) : (
              <span>Add User{isAdmin ? " as Admin" : ""}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantSidebar;
