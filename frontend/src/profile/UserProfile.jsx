import React from 'react';
import { useSocket } from '../context/SocketContext';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Calendar,
  Circle,
  Mail,
  UserPlus,
  List
} from 'lucide-react';

const UserProfile = ({ user, isOpen, onClose, onStartChat }) => {
  const { onlineUsers } = useSocket();
  const isOnline = user && onlineUsers.includes(user._id);

  if (!isOpen || !user) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 max-w-3xl w-full rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-white">User Profile</h2>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-row gap-6 p-6"
        >
          {/* Left: Avatar & Status */}
          <div className="flex flex-col items-center min-w-[220px]">
            <img
              src={user.profilePicture}
              alt={user.username}
              className="w-28 h-28 rounded-full border-4 border-blue-500 dark:border-blue-300 shadow-lg mb-3 object-cover"
            />
            <div
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                isOnline ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
              }`}
            >
              <Circle size={8} className="inline-block mr-1" />
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>

          {/* Right: Info & Actions */}
          <div className="flex-1 space-y-4">
            <div className="text-xl font-bold text-gray-800 dark:text-white">{user.username}</div>

            {user.bio && (
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md shadow-sm text-gray-700 dark:text-gray-200">
                {user.bio}
              </div>
            )}

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <Calendar size={16} className="mr-2 text-blue-500" />
                Joined: {formatDate(user.createdAt || new Date())}
              </div>
              {!isOnline && user.lastSeen && (
                <div className="flex items-center">
                  <Circle size={16} className="mr-2 text-gray-500" />
                  Last seen: {formatDate(user.lastSeen)}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-3">
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
          </div>
        </motion.div>

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
