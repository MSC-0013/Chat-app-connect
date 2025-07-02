import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { toast } from "sonner";
import { Menu, Send, Info } from "lucide-react";
import EmojiPicker from "./EmojiPicker"; // Or your emoji picker lib

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ChatArea = ({ selectedChat, openSidebar, openUserProfile }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

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
        : (msg.sender === selectedChat._id && msg.receiver === currentUser._id) ||
          (msg.sender === currentUser._id && msg.receiver === selectedChat._id);
      if (isRelevant) setMessages((prev) => [...prev, msg]);
    });
    return () => socket.off("receiveMessage");
  }, [socket, selectedChat, currentUser]);

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

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (ts) => {
    const d = new Date(ts),
      n = new Date();
    if (d.toDateString() === n.toDateString()) return "Today";
    const y = new Date(n).setDate(n.getDate() - 1);
    if (d.toDateString() === new Date(y).toDateString()) return "Yesterday";
    return d.toLocaleDateString();
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
        <h2 className="text-3xl font-semibold text-gray-800">Welcome to Connect</h2>
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
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b bg-white shadow-sm">
        <button onClick={openSidebar} className="text-black">
          <Menu />
        </button>
        <div
          onClick={() =>
            !selectedChat.isGroup && openUserProfile?.(selectedChat)
          }
          className="text-center cursor-pointer"
        >
          <h3 className="text-md font-semibold text-gray-800">
            {selectedChat.username || selectedChat.name}
          </h3>
          <p className="text-xs text-gray-500">
            {selectedChat.isGroup
              ? `${selectedChat.members?.length || 0} members`
              : onlineUsers.includes(selectedChat._id)
              ? "Online"
              : "Offline"}
          </p>
        </div>
        {selectedChat.isGroup ? (
          <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
            Group
          </span>
        ) : (
          <button
            onClick={() => openUserProfile?.(selectedChat)}
            className="text-gray-700"
          >
            <Info />
          </button>
        )}
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
                <div key={idx} className={`flex ${isSender ? "justify-end" : "justify-start"} px-2`}>
                  <div
                    className={`max-w-[75%] px-4 py-2 mb-2 rounded-xl border shadow-sm ${
                      isSender
                        ? "bg-black text-white border-black rounded-br-none"
                        : "bg-white text-black border-gray-400 rounded-bl-none"
                    }`}
                  >
                    {selectedChat.isGroup && !isSender && (
                      <div className="text-xs font-semibold text-gray-600 mb-1">
                        {msg.sender.username || "User"}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div className="text-[10px] text-right mt-1 text-gray-400">
                      {formatTime(msg.createdAt)}
                    </div>
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
        <EmojiPicker onEmojiSelect={(emoji) => setNewMessage((p) => p + emoji)} />
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
