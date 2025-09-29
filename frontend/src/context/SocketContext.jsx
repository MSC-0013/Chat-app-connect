import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.startsWith('http://localhost')
  ? 'http://localhost:5000'
  : API_URL.replace(/\/api\/?$/, '');

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?._id) {
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket'], // use websocket
        forceNew: true,
      });
      setSocket(newSocket);

      return () => newSocket.disconnect();
    }
  }, [currentUser]);

  useEffect(() => {
    if (socket && currentUser?._id) {
      socket.emit('join', { userId: currentUser._id });

      // Receive full online users list
      socket.on('onlineUsers', (users) => {
        console.log('Online users received:', users);
        setOnlineUsers(users);
      });

      // Typing events
      socket.on('userTyping', ({ userId, groupId }) => {
        setTypingUsers(prev => ({ ...prev, [groupId ? `group-${groupId}` : userId]: true }));
      });
      socket.on('userStopTyping', ({ userId, groupId }) => {
        setTypingUsers(prev => {
          const newTyping = { ...prev };
          delete newTyping[groupId ? `group-${groupId}` : userId];
          return newTyping;
        });
      });

      return () => {
        socket.off('onlineUsers');
        socket.off('userTyping');
        socket.off('userStopTyping');
      };
    }
  }, [socket, currentUser]);

  const sendMessage = (data) => socket?.emit('sendMessage', data);
  const sendTyping = (data) => socket?.emit('typing', data);
  const sendStopTyping = (data) => socket?.emit('stopTyping', data);
  const joinGroup = (groupId) => socket?.emit('joinGroup', { groupId });
  const leaveGroup = (groupId) => socket?.emit('leaveGroup', { groupId });

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

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
