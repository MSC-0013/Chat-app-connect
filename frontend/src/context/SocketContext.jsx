import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const { currentUser } = useAuth();
  
  useEffect(() => {
    if (currentUser) {
      // Initialize socket connection
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [currentUser]);
  
  useEffect(() => {
    if (socket && currentUser) {
      // Join the socket with user data
      socket.emit('join', { userId: currentUser._id });
      
      // Listen for user status changes
      socket.on('userStatus', ({ userId, status }) => {
        if (status) {
          setOnlineUsers(prev => [...prev, userId]);
        } else {
          setOnlineUsers(prev => prev.filter(id => id !== userId));
        }
      });
      
      // Listen for typing events
      socket.on('userTyping', ({ userId, groupId }) => {
        setTypingUsers(prev => ({
          ...prev,
          [groupId ? `group-${groupId}` : userId]: true
        }));
      });
      
      // Listen for stop typing events
      socket.on('userStopTyping', ({ userId, groupId }) => {
        setTypingUsers(prev => {
          const newTypingUsers = { ...prev };
          delete newTypingUsers[groupId ? `group-${groupId}` : userId];
          return newTypingUsers;
        });
      });
      
      return () => {
        socket.off('userStatus');
        socket.off('userTyping');
        socket.off('userStopTyping');
      };
    }
  }, [socket, currentUser]);
  
  // Send a message
  const sendMessage = (messageData) => {
    if (socket) {
      socket.emit('sendMessage', messageData);
    }
  };
  
  // Indicate user is typing
  const sendTyping = (data) => {
    if (socket) {
      socket.emit('typing', data);
    }
  };
  
  // Indicate user stopped typing
  const sendStopTyping = (data) => {
    if (socket) {
      socket.emit('stopTyping', data);
    }
  };
  
  // Join a group chat
  const joinGroup = (groupId) => {
    if (socket) {
      socket.emit('joinGroup', { groupId });
    }
  };
  
  // Leave a group chat
  const leaveGroup = (groupId) => {
    if (socket) {
      socket.emit('leaveGroup', { groupId });
    }
  };
  
  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      typingUsers,
      sendMessage,
      sendTyping,
      sendStopTyping,
      joinGroup,
      leaveGroup
    }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
