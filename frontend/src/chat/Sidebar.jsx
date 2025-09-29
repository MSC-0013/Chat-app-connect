import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { Search, LogOut, Users } from "lucide-react";
import ProfileEditor from "../profile/ProfileEditor";
import CreateGroupModal from "../groups/CreateGroupModal";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DefaultProfile from "../assets/ProfileConnect.jpg";
import DefaultGroup from "../assets/7533464.jpg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Sidebar = ({ selectedChat, setSelectedChat, closeMobileSidebar }) => {
  const [activeTab, setActiveTab] = useState("chats");
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const { currentUser, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.token) {
      fetchContacts();
      fetchGroups();
    }
  }, [currentUser]);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_URL}/users/contacts/all`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch contacts");
      setContacts(await res.json());
    } catch {
      toast.error("Failed to load contacts");
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/groups`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch groups");
      setGroups(await res.json());
    } catch {
      toast.error("Failed to load groups");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`${API_URL}/users/search/${searchTerm}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      if (!res.ok) throw new Error("Search failed");
      setSearchResults(await res.json());
      setActiveTab("search");
    } catch {
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const addContact = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/users/contacts/add/${userId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      if (!res.ok) throw new Error("Failed to add contact");
      toast.success("Contact added");
      fetchContacts();
      setActiveTab("chats");
    } catch {
      toast.error("Failed to add contact");
    }
  };

  const selectChat = (chat, isGroup = false) => {
    setSelectedChat({ ...chat, isGroup });
    closeMobileSidebar();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <div className="h-full flex flex-col bg-black text-white border-r border-gray-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => setIsProfileOpen(true)}
            >
              <img
                src={currentUser?.profilePicture || DefaultProfile}
                alt="Avatar"
                className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover"
              />
              <span className="font-semibold truncate max-w-[120px]">
                {currentUser?.username || "User"}
              </span>
            </div>
            <button onClick={() => setConfirmLogout(true)}>
              <LogOut size={20} />
            </button>
          </div>
          <form onSubmit={handleSearch} className="mt-4 flex space-x-2">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded flex items-center justify-center"
            >
              {isSearching ? "..." : <Search size={16} />}
            </button>
          </form>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-900 text-sm font-medium">
          {["chats", "groups", "search"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 transition ${
                activeTab === tab ? "bg-blue-700" : "hover:bg-gray-800"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-scroll p-2 space-y-2 invisible-scrollbar">
          {activeTab === "chats" &&
            contacts.map((contact) => (
              <div
                key={contact._id}
                onClick={() => selectChat(contact)}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-800 ${
                  selectedChat?._id === contact._id ? "bg-blue-800" : ""
                }`}
              >
                <img
                  src={contact.profilePicture || DefaultProfile}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="truncate">
                  <p className="truncate">{contact.username}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {contact.bio || "No bio available"}
                  </p>
                </div>
              </div>
            ))}

          {activeTab === "groups" &&
            groups.map((group) => (
              <div
                key={group._id}
                onClick={() => selectChat(group, true)}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-800 ${
                  selectedChat?._id === group._id ? "bg-blue-800" : ""
                }`}
              >
                <img
                  src={group.picture || DefaultGroup}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="truncate">
                  <p className="truncate">{group.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {group.description || "No description"}
                  </p>
                </div>
              </div>
            ))}

          {activeTab === "search" &&
            searchResults.map((user) => {
              const isContact = contacts.some((c) => c._id === user._id);
              return (
                <div
                  key={user._id}
                  className="flex items-center gap-3 p-2 rounded bg-gray-800"
                >
                  <img
                    src={user.profilePicture || DefaultProfile}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 truncate">
                    <p className="truncate">{user.username}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {user.bio || "No bio available"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      isContact ? selectChat(user) : addContact(user._id)
                    }
                    className="px-2 py-1 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isContact ? "Chat" : "Add"}
                  </button>
                </div>
              );
            })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={() => setIsCreateGroupOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Users size={16} /> Create Group
          </button>
        </div>
      </div>

      {/* Modals */}
      <ProfileEditor
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={() => {
          fetchGroups();
          setActiveTab("groups");
        }}
      />

      {/* Confirm Logout */}
      {confirmLogout && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg text-white space-y-4 w-[90%] max-w-sm">
            <h2 className="text-lg font-semibold">Confirm Logout</h2>
            <p>Are you sure you want to logout?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmLogout(false)}
                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                No
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setConfirmLogout(false);
                }}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
