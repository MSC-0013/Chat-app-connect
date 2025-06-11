import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import { useAuth } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ChatLayout = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [viewingUserProfile, setViewingUserProfile] = useState(null);
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, loading, navigate]);

  // Block browser back button on chat page
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      window.history.pushState(null, null, window.location.pathname);
    };

    window.history.pushState(null, null, window.location.pathname); // Add dummy state
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState); // Clean up
    };
  }, []);

  const handleViewUserProfile = (user) => {
    setViewingUserProfile(user);
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-chat-primary animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SocketProvider>
      <div className="h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <div 
          className={`${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-in-out md:static fixed inset-y-0 left-0 z-40 w-full md:w-[320px] lg:w-[350px] bg-white shadow-md`}
        >
          <Sidebar 
            selectedChat={selectedChat} 
            setSelectedChat={setSelectedChat}
            closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
          />
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatArea 
            selectedChat={selectedChat} 
            openSidebar={() => setIsMobileSidebarOpen(true)}
            openUserProfile={handleViewUserProfile}
          />
        </div>
      </div>
    </SocketProvider>
  );
};

export default ChatLayout;
