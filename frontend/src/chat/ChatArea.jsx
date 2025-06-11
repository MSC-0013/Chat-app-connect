import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { toast } from 'sonner';
import { Menu, Send, Info } from 'lucide-react';
import EmojiPicker from './EmojiPicker';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ChatArea = ({ selectedChat, openSidebar, openUserProfile }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const { currentUser } = useAuth();
  const { socket, onlineUsers, typingUsers, sendMessage, sendTyping, sendStopTyping } = useSocket();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (socket) {
      socket.on('receiveMessage', newMsg => {
        if (
          selectedChat && (
            (newMsg.sender === selectedChat._id && newMsg.receiver === currentUser._id) ||
            (newMsg.sender === currentUser._id && newMsg.receiver === selectedChat._id) ||
            (selectedChat.isGroup && newMsg.group === selectedChat._id)
          )
        ) {
          setMessages(prev => [...prev, newMsg]);
        }
      });
      return () => {
        socket.off('receiveMessage');
      };
    }
  }, [socket, selectedChat, currentUser]);

  useEffect(() => {
    if (selectedChat) {
      const fetchMessages = async () => {
        try {
          const endpoint = selectedChat.isGroup
            ? `${API_URL}/messages/group/${selectedChat._id}`
            : `${API_URL}/messages/${selectedChat._id}`;

          const res = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${currentUser.token}`
            }
          });

          if (!res.ok) throw new Error('Failed to fetch messages');
          const data = await res.json();
          setMessages(data);

          if (!selectedChat.isGroup) {
            await fetch(`${API_URL}/messages/read/${selectedChat._id}`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
          }

          if (selectedChat.isGroup && socket) {
            socket.emit('joinGroup', { groupId: selectedChat._id });
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
          toast.error('Failed to load messages');
        }
      };

      fetchMessages();

      return () => {
        if (selectedChat.isGroup && socket) {
          socket.emit('leaveGroup', { groupId: selectedChat._id });
        }
      };
    }
  }, [selectedChat, currentUser, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      if (selectedChat) {
        sendTyping({
          senderId: currentUser._id,
          receiverId: selectedChat.isGroup ? null : selectedChat._id,
          groupId: selectedChat.isGroup ? selectedChat._id : null
        });
      }
    }

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      setIsTyping(false);
      if (selectedChat) {
        sendStopTyping({
          senderId: currentUser._id,
          receiverId: selectedChat.isGroup ? null : selectedChat._id,
          groupId: selectedChat.isGroup ? selectedChat._id : null
        });
      }
    }, 1000);

    setTypingTimeout(timeout);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      senderId: currentUser._id,
      text: newMessage,
      ...(selectedChat.isGroup
        ? { groupId: selectedChat._id }
        : { receiverId: selectedChat._id })
    };

    sendMessage(messageData);
    setNewMessage('');

    if (isTyping) {
      setIsTyping(false);
      if (selectedChat) {
        sendStopTyping({
          senderId: currentUser._id,
          receiverId: selectedChat.isGroup ? null : selectedChat._id,
          groupId: selectedChat.isGroup ? selectedChat._id : null
        });
      }
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  const isReceiverTyping = selectedChat
    ? typingUsers[selectedChat.isGroup ? `group-${selectedChat._id}` : selectedChat._id]
    : false;

  const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(new Date().setDate(now.getDate() - 1)).toDateString() === date.toDateString();
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    const dateKey = formatDate(msg.createdAt);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {});

  if (!selectedChat) {
    return (
      <div style={{ textAlign: 'center', padding: 20 }}>
        <h2>Welcome to Connect</h2>
        <p>Select a conversation or search for someone to start chatting.</p>
        <button onClick={openSidebar}>View Conversations</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: 10, borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center' }}>
        <button onClick={openSidebar}>☰</button>
        <div onClick={() => !selectedChat.isGroup && openUserProfile?.(selectedChat)} style={{ marginLeft: 10 }}>
          <strong>{selectedChat.username || selectedChat.name}</strong><br />
          <small>{selectedChat.isGroup ? `${selectedChat.members?.length} members` : (onlineUsers.includes(selectedChat._id) ? 'Online' : 'Offline')}</small>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {selectedChat.isGroup ? (
            <span style={{ padding: '4px 10px', background: '#ddd', borderRadius: 5 }}>Group</span>
          ) : (
            <button onClick={() => openUserProfile?.(selectedChat)}>ℹ</button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div style={{ textAlign: 'center', margin: '10px 0' }}>
              <small>{date}</small>
            </div>
            {msgs.map((msg, i) => {
              const isSender = msg.sender === currentUser._id;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: isSender ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
                  <div style={{
                    maxWidth: '60%',
                    padding: 8,
                    borderRadius: 12,
                    background: isSender ? '#007bff' : '#ccc',
                    color: isSender ? 'white' : 'black'
                  }}>
                    {selectedChat.isGroup && !isSender && (
                      <div style={{ fontSize: 10, fontWeight: 'bold' }}>{msg.sender.username || 'User'}</div>
                    )}
                    <div>{msg.text}</div>
                    <div style={{ fontSize: 9, textAlign: 'right' }}>{formatTime(msg.createdAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing */}
        {isReceiverTyping && (
          <div style={{ fontStyle: 'italic', fontSize: 12, color: '#666' }}>Typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} style={{ padding: 10, borderTop: '1px solid #ccc', display: 'flex', alignItems: 'center' }}>
        <textarea
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          placeholder="Type a message..."
          style={{ flex: 1, resize: 'none', padding: 8, borderRadius: 5 }}
        />
        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        <button type="submit" disabled={!newMessage.trim()} style={{ marginLeft: 10 }}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatArea;
