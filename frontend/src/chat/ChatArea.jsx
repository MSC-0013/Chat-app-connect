import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { toast } from "sonner";
import { Menu, Send, Info } from "lucide-react";
import EmojiPicker from "./EmojiPicker";

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
    socket.on("receiveMessage", (newMsg) => {
      if (!selectedChat) return;
      const isRelevant = selectedChat.isGroup
        ? newMsg.group === selectedChat._id
        : (newMsg.sender === selectedChat._id &&
            newMsg.receiver === currentUser._id) ||
          (newMsg.sender === currentUser._id &&
            newMsg.receiver === selectedChat._id);
      if (isRelevant) setMessages((prev) => [...prev, newMsg]);
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

  if (!selectedChat)
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600">
        <h2 className="text-2xl font-bold tracking-wide">Welcome to Connect</h2>
        <p className="mt-1 text-sm text-gray-500">
          Select a conversation to start messaging
        </p>
        <button
          className="mt-5 px-4 py-2 border border-black text-black rounded hover:bg-black hover:text-white transition"
          onClick={openSidebar}
        >
          View Conversations
        </button>
      </div>
    );

  const isReceiverTyping = selectedChat.isGroup
    ? typingUsers[`group-${selectedChat._id}`]
    : typingUsers[selectedChat._id];

  return (
    <div className="flex flex-col h-full bg-gray-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black">
        <button onClick={openSidebar} className="text-black hover:opacity-70">
          <Menu size={22} />
        </button>
        <div
          onClick={() =>
            !selectedChat.isGroup && openUserProfile?.(selectedChat)
          }
          className="cursor-pointer text-center"
        >
          <h3 className="text-lg font-semibold">
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
        <div>
          {selectedChat.isGroup ? (
            <span className="text-xs border px-2 py-1 rounded-full text-gray-700">
              Group
            </span>
          ) : (
            <button
              onClick={() => openUserProfile?.(selectedChat)}
              className="text-black hover:opacity-70"
            >
              <Info size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin scrollbar-thumb-gray-400">
        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date}>
            <div className="text-center text-sm text-gray-500 mb-2">{date}</div>
            {msgs.map((msg, idx) => {
              const isSender = msg.sender === currentUser._id;
              return (
                <div
                  key={idx}
                  className={`flex ${
                    isSender ? "justify-end" : "justify-start"
                  } mb-2`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl border
        ${
          isSender
            ? "bg-black text-white border-black"
            : "bg-white text-black border-gray-300"
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
          <div className="italic text-sm text-gray-400">Typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-4 py-2 border-t border-black"
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
          placeholder="Type your message..."
          className="flex-1 resize-none px-3 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
        <EmojiPicker
          onEmojiSelect={(emoji) => setNewMessage((prev) => prev + emoji)}
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-2 bg-black text-white rounded-full disabled:opacity-50 hover:bg-gray-900 transition"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatArea;
