import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { toast } from "sonner";
import { Menu, Send, Info } from "lucide-react";
import EmojiPicker from "./EmojiPicker"; // Or your emoji picker lib
import ProfilePicture from "../assets/ProfileConnect.jpg"; // Default profile picture

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ChatArea = ({ selectedChat, openSidebar, openUserProfile }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showDeleteFor, setShowDeleteFor] = useState(null);

  const { currentUser } = useAuth();
  const {
    socket,
    onlineUsers,
    typingUsers,
    sendMessage,
    sendTyping,
    sendStopTyping,
  } = useSocket();

  const messagesEndRef = useRef(null);
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (!socket) return;
    socket.on("receiveMessage", (msg) => {
      if (!selectedChat) return;
      const isRelevant = selectedChat.isGroup
        ? msg.group === selectedChat._id
        : (msg.sender === selectedChat._id &&
            msg.receiver === currentUser._id) ||
          (msg.sender === currentUser._id && msg.receiver === selectedChat._id);
      if (isRelevant) setMessages((prev) => [...prev, msg]);
    });
    return () => socket.off("receiveMessage");
  }, [socket, selectedChat, currentUser]);

  useEffect(() => {
    const close = () => setShowDeleteFor(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
    (async () => {
      try {
        const url = selectedChat.isGroup
          ? `${API_URL}/messages/group/${selectedChat._id}`
          : `${API_URL}/messages/${selectedChat._id}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        setMessages(data);

        if (!selectedChat.isGroup) {
          await fetch(`${API_URL}/messages/read/${selectedChat._id}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${currentUser.token}` },
          });
        } else {
          socket.emit("joinGroup", { groupId: selectedChat._id });
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not load chat.");
      }
    })();

    return () => {
      if (selectedChat.isGroup)
        socket.emit("leaveGroup", { groupId: selectedChat._id });
    };
  }, [selectedChat, currentUser, socket]);

  useEffect(scrollToBottom, [messages]);

  const handleTyping = () => {
    if (!selectedChat) return;
    if (!isTyping) {
      sendTyping({
        senderId: currentUser._id,
        receiverId: selectedChat.isGroup ? null : selectedChat._id,
        groupId: selectedChat.isGroup ? selectedChat._id : null,
      });
      setIsTyping(true);
    }
    clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      sendStopTyping({
        senderId: currentUser._id,
        receiverId: selectedChat.isGroup ? null : selectedChat._id,
        groupId: selectedChat.isGroup ? selectedChat._id : null,
      });
      setIsTyping(false);
    }, 1000);
    setTypingTimeout(timeout);
  };

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    const payload = {
      senderId: currentUser._id,
      text: trimmed,
      ...(selectedChat.isGroup
        ? { groupId: selectedChat._id }
        : { receiverId: selectedChat._id }),
    };
    sendMessage(payload);
    setNewMessage("");
    if (isTyping) handleTyping();
  };
  const handleDeleteMessage = async (messageId) => {
    try {
      const res = await fetch(`${API_URL}/messages/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete message");
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      toast.success("Message deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete message.");
    }
  };
  const handleDeleteForMe = async (messageId) => {
    try {
      const res = await fetch(`${API_URL}/messages/hide/${messageId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete message for me");
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      toast.success("Deleted for you.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete for you.");
    }
  };

  // Format a timestamp into "Today", "Yesterday", or "11 July 2025"
const formatDate = (ts) => {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  // Return in format: 11 July 2025
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Format a timestamp into "02:15 PM" or "14:15" depending on preference
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // Change to false for 24-hour format
  });
};


  const grouped = messages.reduce((acc, m) => {
    const key = formatDate(m.createdAt);
    (acc[key] = acc[key] || []).push(m);
    return acc;
  }, {});

  const isReceiverTyping = selectedChat?.isGroup
    ? typingUsers[`group-${selectedChat._id}`]
    : typingUsers[selectedChat?._id];

  if (!selectedChat)
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50">
        <h2 className="text-3xl font-semibold text-gray-800">
          Welcome to Connect
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Select a conversation to start chatting
        </p>
        <button
          className="mt-6 px-5 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-900"
          onClick={openSidebar}
        >
          View Conversations
        </button>
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-black text-white">
        {/* Left Section: Menu + Profile */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu (Mobile only) */}
          <button
            className="block md:hidden"
            onClick={openSidebar}
            title="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Profile Picture */}
          <img
            src={ProfilePicture}
            alt="User"
            className="w-10 h-10 rounded-full border-2 border-gray-500"
          />

          {/* Name & Status */}
          <div
            className="flex flex-col cursor-pointer"
            onClick={() =>
              !selectedChat.isGroup && openUserProfile?.(selectedChat)
            }
          >
            <h3 className="text-md font-semibold">
              {selectedChat.username || selectedChat.name}
            </h3>

            {/* Online / Offline */}
            {!selectedChat.isGroup && (
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`h-2 w-2 rounded-full ${
                    onlineUsers.includes(selectedChat._id)
                      ? "bg-green-400"
                      : "bg-red-500"
                  }`}
                ></span>
                <span className="uppercase tracking-wide font-medium">
                  {onlineUsers.includes(selectedChat._id)
                    ? "Online"
                    : "Offline"}
                </span>
              </div>
            )}

            {/* Group Members Count */}
            {selectedChat.isGroup && (
              <p className="text-xs text-gray-300">
                {selectedChat.members?.length || 0} members
              </p>
            )}
          </div>
        </div>

        {/* Right Section: Info or Tag */}
        <div>
          {selectedChat.isGroup ? (
            <span className="text-xs px-3 py-1 rounded-full bg-purple-600 text-white font-semibold shadow-sm">
              Group
            </span>
          ) : (
            <button
              onClick={() => openUserProfile?.(selectedChat)}
              className="text-white hover:text-blue-400 transition"
              title="View Profile"
            >
              <Info />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin">
        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date}>
            <div className="sticky top-0 z-0 mb-2 text-center text-xs font-semibold text-gray-500 bg-white py-1">
              {date}
            </div>
            {msgs.map((msg, idx) => {
              const isSender = msg.sender === currentUser._id;
              return (
                <div
                  key={idx}
                  className={`relative group flex ${
                    isSender ? "justify-end" : "justify-start"
                  } px-2`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setShowDeleteFor(msg._id); // ✅ NEW: allow right-click for all messages
                  }}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 mb-2 rounded-2xl border shadow-md relative ${
                      isSender
                        ? "bg-black text-white border-black rounded-br-sm self-end"
                        : "bg-gray-100 text-black border-gray-300 rounded-bl-sm self-start"
                    }`}
                  >
                    {selectedChat.isGroup && !isSender && (
                      <div className="text-xs font-semibold text-gray-600 mb-1">
                        {msg.sender.username || "User"}
                      </div>
                    )}

                    <p className="whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>

                    <div className="text-[10px] text-right mt-1 text-gray-400">
                      {formatTime(msg.createdAt)}
                    </div>

                    {/* Delete Popup Menu */}
                    {showDeleteFor === msg._id && (
                      <div
                        className={`absolute ${
                          isSender ? "right-0" : "left-0"
                        } top-full mt-1 bg-white border shadow-lg rounded-md text-sm z-50 min-w-[150px]`}
                      >
                        {isSender && (
                          <button
                            onClick={() => {
                              handleDeleteMessage(msg._id);
                              setShowDeleteFor(null);
                            }}
                            className="w-full px-4 py-2 hover:bg-red-100 text-red-600 text-left"
                          >
                            Delete for Everyone
                          </button>
                        )}
                        <button
                          onClick={() => {
                            handleDeleteForMe(msg._id);
                            setShowDeleteFor(null);
                          }}
                          className="w-full px-4 py-2 hover:bg-gray-100 text-gray-800 text-left"
                        >
                          Delete for Me
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {isReceiverTyping && (
          <div className="text-sm italic text-gray-400 px-2">Typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-4 py-3 border-t bg-white"
      >
        <textarea
          rows={1}
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          placeholder="Type a message..."
          className="flex-1 resize-none rounded-full border px-4 py-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
        />
        <EmojiPicker
          onEmojiSelect={(emoji) => setNewMessage((p) => p + emoji)}
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-2 rounded-full bg-black text-white hover:bg-gray-900 transition disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatArea;
