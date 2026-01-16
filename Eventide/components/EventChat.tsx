import React, { useState, useEffect, useRef } from "react";
import { Backend } from "../services/backend";
import { EventChatMessage } from "../types";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "./ToastContext";

interface EventChatProps {
  eventId: string;
}

const EventChat: React.FC<EventChatProps> = ({ eventId }) => {
  const [messages, setMessages] = useState<EventChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Load initial messages
    const loadMessages = async () => {
      const msgs = await Backend.API.Chat.getMessages(eventId);
      setMessages(msgs);
      scrollToBottom();
    };
    loadMessages();

    // Subscribe to new messages
    const unsubscribe = Backend.API.subscribe("CHAT", (payload: any) => {
      if (payload.eventId === eventId) {
        setMessages((prev) => [...prev, payload.message]);
        scrollToBottom();
      }
    });

    return () => unsubscribe();
  }, [eventId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await Backend.API.Chat.sendMessage(eventId, newMessage);
      setNewMessage("");
    } catch (error) {
      addToast("Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-[500px] flex flex-col">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <MessageSquare className="text-primary" size={20} />
        <h3 className="font-bold text-slate-900">Attendee Chat</h3>
        <span className="ml-auto text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>{" "}
          Live
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <MessageSquare size={48} className="mb-2 opacity-20" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.userId === Backend.Auth.getSession()?.id;
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
            >
              <img
                src={msg.userAvatar}
                alt={msg.userName}
                className="w-8 h-8 rounded-full border border-slate-200 mt-1 flex-shrink-0"
              />
              <div
                className={`max-w-[75%] ${
                  isMe ? "items-end" : "items-start"
                } flex flex-col`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl text-sm ${
                    isMe
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-slate-100 text-slate-800 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {isMe ? "You" : msg.userName} •{" "}
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-slate-100 bg-slate-50"
      >
        <div className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-slate-900 text-white rounded-lg hover:bg-primary disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors"
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventChat;
