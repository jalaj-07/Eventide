import React, { useState, useEffect, useRef } from "react";
import { Backend } from "../services/backend";
import { useToast } from "./ToastContext";
import { User, UserRole } from "../types";
import {
  Send,
  Video,
  Phone,
  MoreVertical,
  Search,
  ArrowLeft,
  Mic,
  MicOff,
  VideoOff,
  Minimize2,
} from "lucide-react";

interface ChatSystemProps {
  initialConversationId?: string;
}

const ChatSystem: React.FC<ChatSystemProps> = ({ initialConversationId }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversationId || null
  );
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Video Call State
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const init = async () => {
      const user = Backend.Auth.getSession();
      setCurrentUser(user);
      if (!user) return;

      const convos = await Backend.API.DirectMessages.getConversations();
      setConversations(convos);
      setLoading(false);

      if (convos.length > 0 && !activeConversationId) {
        setActiveConversationId(convos[0].id);
      }
    };
    init();

    // Subscribe to DM updates
    const unsubscribe = Backend.API.subscribe("DM", (msg: any) => {
       // Refresh messages if it's the active conversation
       if (activeConversationIdRef.current === msg.conversationId) {
          setMessages((prev) => [...prev, msg]);
          if(msg.type === 'video_call_start') {
             setIsVideoCallActive(true);
          }
       }
       // Refresh list to show last message update
       Backend.API.DirectMessages.getConversations().then(setConversations);
    });

    return () => unsubscribe();
  }, []);

  // Ref for cleanup in event listener
  const activeConversationIdRef = useRef(activeConversationId);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
    if (activeConversationId) {
      Backend.API.DirectMessages.getMessages(activeConversationId).then(setMessages);
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Video Call Timer
  useEffect(() => {
    let interval: any;
    if (isVideoCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isVideoCallActive]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;

    try {
      await Backend.API.DirectMessages.sendMessage(activeConversationId, newMessage);
      setNewMessage("");
    } catch (err) {
      addToast("Failed to send message", "error");
    }
  };

  const startVideoCall = () => {
    if(!activeConversationId) return;
    setIsVideoCallActive(true);
    Backend.API.DirectMessages.sendMessage(activeConversationId, "Started a video call", "video_call_start");
  };

  const endVideoCall = () => {
    setIsVideoCallActive(false);
    if(activeConversationId) {
       Backend.API.DirectMessages.sendMessage(activeConversationId, `Call ended • ${formatDuration(callDuration)}`, "video_call_end");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const activeConvo = conversations.find((c) => c.id === activeConversationId);
  const otherParticipant = activeConvo?.participants.find((p: any) => p.id !== currentUser?.id) || { name: "Unknown", avatar: "" };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="fixed inset-x-0 bottom-0 top-[72px] bg-slate-50 dark:bg-slate-950 overflow-hidden z-0 flex">
      {/* Sidebar - List */}
      <div className={`w-full md:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold dark:text-white mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((convo) => {
            const participant = convo.participants.find((p: any) => p.id !== currentUser?.id) || { name: "Unknown", avatar: "" };
            const isActive = convo.id === activeConversationId;
            return (
              <div
                key={convo.id}
                onClick={() => setActiveConversationId(convo.id)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                  isActive ? "bg-indigo-50 dark:bg-indigo-900/20 border-r-4 border-primary" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="relative">
                  <img src={participant.avatar} alt="" className="w-12 h-12 rounded-full object-cover bg-slate-200" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{participant.name}</h3>
                    {convo.lastMessage && (
                       <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                         {new Date(convo.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {convo.lastMessage?.text || "No messages yet"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeConversationId ? (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 relative">
          {/* Header */}
          <div className="h-16 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveConversationId(null)}
                className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300"
              >
                  <ArrowLeft size={20} />
              </button>
              <img src={otherParticipant.avatar} alt="" className="w-10 h-10 rounded-full" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{otherParticipant.name}</h3>
                <span className="text-xs text-green-500 font-medium">Online</span>
              </div>
            </div>

            <div className="flex items-center gap-2">

               {currentUser?.role === UserRole.CLIENT && (
                 <button 
                    onClick={startVideoCall}
                    className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-primary dark:text-indigo-400 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                    title="Start Video Call"
                  >
                    <Video size={20} />
                 </button>
               )}
               <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full transition">
                  <Phone size={20} />
               </button>
               <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full transition">
                  <MoreVertical size={20} />
               </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-950/50">
             {messages.map((msg) => {
               const isMe = msg.senderId === currentUser?.id;
               const isVideoSystemMsg = msg.type && msg.type.includes('video');

               if(isVideoSystemMsg) {
                 return (
                    <div key={msg.id} className="flex justify-center my-4">
                       <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-full font-medium">
                          {msg.text}
                       </span>
                    </div>
                 );
               }

               return (
                 <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                   <div className={`max-w-[70%] ${isMe ? "order-1" : "order-2"}`}>
                      <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        isMe 
                          ? "bg-primary text-white rounded-tr-none" 
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none"
                      }`}>
                        {msg.text}
                      </div>
                      <span className={`text-[10px] text-slate-400 mt-1 block ${isMe ? "text-right" : "text-left"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                   </div>
                 </div>
               );
             })}
             <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
             <form onSubmit={handleSendMessage} className="relative max-w-4xl mx-auto flex items-center gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 pl-6 pr-4 py-3.5 bg-slate-100 dark:bg-slate-800 rounded-full border-transparent focus:bg-white dark:focus:bg-slate-950 border focus:border-primary outline-none transition-all dark:text-white shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3.5 bg-primary text-white rounded-full shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all transform hover:scale-105 active:scale-95"
                >
                  <Send size={18} />
                </button>
             </form>
          </div>

          {/* Video Call Overlay */}
          {isVideoCallActive && (
            <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col animate-fade-in">
               <div className="flex-1 relative overflow-hidden">
                  {/* Remote Video (Mock Main) */}
                  <img 
                    src={otherParticipant.avatar || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1600"} 
                    className="w-full h-full object-cover opacity-80"
                    alt="Remote"
                  />
                  
                  {/* Local Video (PIP) */}
                  {!isVideoOff && (
                    <div className="absolute bottom-24 right-6 w-32 h-48 bg-black rounded-xl border-2 border-white/20 shadow-2xl overflow-hidden">
                       <img 
                         src={currentUser?.avatar} 
                         className="w-full h-full object-cover"
                         alt="Me"
                       />
                    </div>
                  )}

                  {/* Status Overlay */}
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white font-mono text-sm">
                    {formatDuration(callDuration)}
                  </div>
               </div>

               {/* Controls */}
               <div className="h-24 bg-slate-950 flex items-center justify-center gap-6">
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-4 rounded-full transition ${isMuted ? 'bg-white text-slate-900' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                  >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                  </button>
                  
                  <button 
                    onClick={endVideoCall}
                    className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg shadow-red-500/30 transform hover:scale-110"
                  >
                    <Phone size={32} className="rotate-[135deg]" />
                  </button>

                  <button 
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`p-4 rounded-full transition ${isVideoOff ? 'bg-white text-slate-900' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                  >
                    {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                  </button>
               </div>
               
               <button 
                 onClick={() => setIsVideoCallActive(false)}
                 className="absolute top-6 right-6 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 backdrop-blur-sm"
               >
                 <Minimize2 size={20} />
               </button>
            </div>
          )}

        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center flex-col text-slate-400 bg-slate-50 dark:bg-slate-950">
           <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Send size={40} className="text-slate-300 dark:text-slate-600" />
           </div>
           <p className="text-lg font-medium">Select a conversation to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default ChatSystem;
