import React from "react";
import { useSocket } from "../context/SocketContext";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Calendar,
  Circle,
  Mail,
  UserPlus,
  List,
} from "lucide-react";
import ProfilePicture from "../assets/ProfileConnect.jpg";

const UserProfile = ({ user, isOpen, onClose, onStartChat }) => {
  const { onlineUsers } = useSocket();
  const isOnline = user && onlineUsers.includes(user._id);

  if (!isOpen || !user) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 max-w-2xl w-full rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-blue-600 dark:text-white">
            User Profile
          </h2>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-6 p-6"
        >
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <img
              src={user.profilePicture || ProfilePicture}
              alt={user.username}
              className="w-24 h-24 rounded-full border-4 border-blue-500 dark:border-blue-300 shadow-md object-cover"
            />
            <div
              className={`mt-2 text-xs font-medium px-3 py-1 rounded-full text-center ${
                isOnline ? "bg-green-500 text-white" : "bg-gray-400 text-white"
              }`}
            >
              <Circle size={8} className="inline-block mr-1" />
              {isOnline ? "Online" : "Offline"}
            </div>
          </div>

          {/* Username & Info */}
          <div className="flex-1 space-y-3">
            <div className="text-2xl font-semibold text-gray-800 dark:text-white">
              {user.username}
            </div>

            {user.bio && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {user.bio}
              </div>
            )}

            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                <span>Joined: {formatDate(user.createdAt || new Date())}</span>
              </div>
              {!isOnline && user.lastSeen && (
                <div className="flex items-center gap-2">
                  <Circle size={16} className="text-gray-500" />
                  <span>Last seen: {formatDate(user.lastSeen)}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Buttons */}
        <div className="px-6 pb-4 grid grid-cols-2 gap-3">
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => {
              onStartChat(user);
              onClose();
            }}
          >
            <MessageSquare size={16} /> Start Chat
          </button>

          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            <UserPlus size={16} /> Add Friend
          </button>

          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            <List size={16} /> View Posts
          </button>

          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
            <Mail size={16} /> Send Email
          </button>
        </div>

        {/* Close Button */}
        <div className="p-4 border-t text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
