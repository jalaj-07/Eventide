import React, { useEffect, useState } from "react";
import {
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import {
  CheckCircle,
  Video,
  FileText,
  TrendingUp,
  Users,
  IndianRupee,
  Loader2,
  Plus,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  MessageSquare,
  MoreVertical,
  Maximize2,
  Share,
  Search,
  Download,
  Filter,
  Mail,
  Edit2,
  Trash2,
  X,
  Star,
  Briefcase,
} from "lucide-react";
import { Backend } from "../services/backend";
import { useToast } from "./ToastContext";
import PaymentModal from "./PaymentModal";

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>({});
  const [tasks, setTasks] = useState<any[]>([]);
  // plans removed as we switched to 'projects' (shared)
  const [bookings, setBookings] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // activity removed as we removed simulated feed
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const { addToast } = useToast();

  // Meeting State
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Guest List State
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestSearch, setGuestSearch] = useState("");

  // Review State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: "" });

  // Payment State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<any>(null);

  const handleOpenReview = (booking: any) => {
    setSelectedBookingForReview(booking);
    setReviewForm({ rating: 5, text: "" });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedBookingForReview) return;
    setIsSubmittingReview(true);
    try {
        await Backend.API.Reviews.addReview({
            providerId: selectedBookingForReview.providerId || "unknown", // Fallback if providerId missing
            clientId: "u-current", // Mock current user
            clientName: "You",
            clientAvatar: "https://ui-avatars.com/api/?name=You&background=random",
            rating: reviewForm.rating,
            text: reviewForm.text
        });
        addToast("Review submitted successfully!", "success");
        setShowReviewModal(false);
    } catch (e) {
        console.error(e);
        addToast("Failed to submit review", "error");
    } finally {
        setIsSubmittingReview(false);
    }
  };

  // Guest List Logic
  const filteredGuests = (data.guests || []).filter(
    (g: any) =>
      g.name.toLowerCase().includes(guestSearch.toLowerCase()) ||
      g.email.toLowerCase().includes(guestSearch.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = Backend.Auth.getSession();
        const dashboardData = await Backend.API.getClientDashboard(currentUser?.id);
        setData(dashboardData); // Use the full object
        setTasks(dashboardData.upcomingTasks || []);
        setBookings(dashboardData.bookings || []);
        setProjects(dashboardData.projects || []);
        // Update guests if we had a state for it, or just use data.guests in render
        setLoading(false);
      } catch (e) {
        console.error("Failed to load dashboard", e);
      }
    };
    fetchData();

    // Realtime Subscription
    const unsubscribe = Backend.API.subscribe("CLIENT", (_updatedData) => {
        // We might need to re-fetch to get the full joined data, 
        // or backend sends full data in payload. 
        // backend.ts publish payload: publish("CLIENT_UPDATE", {}) -> empty object trigger
        
        // If the payload is empty (trigger), we re-fetch.
        // Or we can just re-run fetchData().
        fetchData();
    });

    return () => {
        unsubscribe();
    };
  }, []);

  // Call Timer
  useEffect(() => {
    let timer: any;
    if (showMeetingModal) {
      setCallDuration(0);
      timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [showMeetingModal]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setIsAddingTask(true);
    try {
      const newTask = await Backend.API.addTask(newTaskTitle);
      setTasks((prev) => [newTask, ...prev]);
      setNewTaskTitle("");
      addToast("Task added to your checklist", "success");
    } catch (err) {
      addToast("Failed to add task", "error");
    } finally {
      setIsAddingTask(false);
    }
  };

  const toggleTaskStatus = (taskId: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isCompleting = t.status !== "Completed";
          if (isCompleting) addToast("Task completed!", "success");
          return { ...t, status: isCompleting ? "Completed" : "Pending" };
        }
        return t;
      })
    );
  };

  const handleJoinCall = () => {
    addToast("Connecting to secure room...", "info");
    setTimeout(() => {
      setShowMeetingModal(true);
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border-white/50 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40">
      <div
        className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}
      >
        <Icon size={80} />
      </div>
      <div className="relative z-10">
        <div
          className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center mb-4 text-${
            color.split("-")[1]
          }-600`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Command Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-time overview of your "Golden Jubilee" event.
          </p>
        </div>
        <div className="flex gap-3">
          <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium animate-pulse-slow">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span> System
            Live
          </span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Budget"
          value={`₹${(data.totalSpent || 0).toLocaleString()}`}
          icon={IndianRupee}
          color="text-emerald-500 bg-emerald-500"
        />
        <StatCard
          title="Confirmed Guests"
          value={data.confirmedGuests || 0}
          icon={Users}
          color="text-blue-500 bg-blue-500"
        />
        <StatCard
          title="Pending Tasks"
          value={data.pendingTasks || 0}
          icon={CheckCircle}
          color="text-orange-500 bg-orange-500"
        />
        <StatCard
          title="Vendors Hired"
          value={data.vendorsHired || 0}
          icon={Briefcase}
          color="text-purple-500 bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Charts */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-6 rounded-3xl border-white/60 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Budget Allocation
              & Usage
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.metrics || []}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                    cursor={{ stroke: "#6366f1", strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between group hover:shadow-2xl transition-all duration-300">
              <div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1">Weekly Sync</h3>
                <p className="text-indigo-100 text-sm">
                  Join the planning room
                </p>
              </div>
              <button
                onClick={handleJoinCall}
                className="mt-6 w-full py-3 bg-white text-indigo-700 rounded-xl font-bold hover:bg-indigo-50 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Video size={18} /> Join Call Now
              </button>
            </div>

            <div className="glass-card rounded-3xl p-6 flex flex-col justify-between border-white/60 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40">
              <div>
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-2xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                  Guest List
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Manage RSVPs & Tables</p>
              </div>
              <button
                onClick={() => setShowGuestModal(true)}
                className="mt-6 w-full py-3 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:border-pink-200 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600 dark:hover:text-pink-400 transition active:scale-95"
              >
                View Details
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: Realtime Feed & Tasks */}
        <div className="space-y-8">
          {/* Realtime Activity */}
          <div className="glass-card p-6 rounded-3xl border-white/60 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40">
             {/* ... existing activity code ... */}
             <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Live Feed
            </h3>
            {/* ... */}
             <div className="space-y-4">
              {/* ... */}
             </div>
          </div>

          {/* SHARED PROJECT STATUS (Synced with Planner) */}
          <div className="glass-card p-6 rounded-3xl border-white/60 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
               <Video className="text-secondary" size={20} /> Active Projects
            </h3>
            {projects.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No active projects with Planner.</p>
            ) : (
                <div className="space-y-3">
                    {projects.map(proj => (
                        <div key={proj.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{proj.name}</h4>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Progress</span>
                                <span className="text-xs font-bold text-primary">{proj.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-1">
                                <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${proj.progress}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* SHARED BOOKINGS (Synced with Vendor) */}
          <div className="glass-card p-6 rounded-3xl border-white/60 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
               <FileText className="text-pink-500" size={20} /> Booking Requests
            </h3>
            {bookings.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No booking requests sent.</p>
            ) : (
                <div className="space-y-3">
                    {bookings.map(booking => (
                        <div key={booking.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex justify-between items-center group">
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{booking.vendorName}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{booking.date}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold capitalize ${
                                    booking.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                    booking.status === 'declined' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {booking.status}
                                </span>
                                {booking.status === 'accepted' && (
                                    <button 
                                        onClick={() => handleOpenReview(booking)}
                                        className="p-1.5 text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                        title="Leave a Review"
                                    >
                                        <Star size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* Tasks */}
          <div className="glass-card p-6 rounded-3xl border-white/60 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 dark:text-white">Checklist</h3>
              <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300">
                {tasks.filter((t: any) => t.status === "Completed").length}/
                {tasks.length}
              </span>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {tasks.map((task: any) => (
                <div
                  key={task.id}
                  onClick={() => toggleTaskStatus(task.id)}
                  className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700 select-none active:scale-98"
                >
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.status === "Completed"
                        ? "bg-green-100 border-green-500 text-green-600"
                        : "border-slate-300 dark:border-slate-600 text-transparent group-hover:border-primary"
                    }`}
                  >
                    {task.status === "Completed" && <CheckCircle size={14} />}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium transition-all ${
                        task.status === "Completed"
                          ? "text-slate-400 line-through decoration-slate-300 dark:decoration-slate-500"
                          : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-400">{task.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleAddTask}
              className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 relative"
            >
              <input
                type="text"
                placeholder="Add new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-700 dark:text-white outline-none transition-all"
              />
              <button
                type="submit"
                disabled={isAddingTask}
                className="absolute right-2 top-1/2 transform translate-y-[2px] -translate-y-1/2 p-1.5 bg-white dark:bg-slate-700 text-primary rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-indigo-700 dark:hover:text-indigo-400 transition"
              >
                {isAddingTask ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Meeting Room Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black animate-fade-in-up">
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md text-white">
                <Video size={24} />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-none">
                  Weekly Sync
                </h2>
                <p className="text-white/60 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {formatTime(callDuration)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-md">
                <Share size={20} />
              </button>
              <button className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-md">
                <Users size={20} />
              </button>
              <button className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-md">
                <MessageSquare size={20} />
              </button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="w-full h-full flex flex-col md:flex-row p-4 pt-24 pb-24 gap-4">
            {/* Main Speaker */}
            <div className="flex-1 relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
              {!isVideoOff ? (
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000"
                  alt="Speaker"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
                    YP
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white font-medium text-sm flex items-center gap-2">
                {isMuted ? (
                  <MicOff size={14} className="text-red-400" />
                ) : (
                  <Mic size={14} className="text-green-400" />
                )}
                Sarah Planner (Host)
              </div>
            </div>

            {/* Participants Strip (Vertical on Desktop) */}
            <div className="flex md:flex-col gap-4 overflow-auto">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="relative w-48 h-36 md:w-64 md:h-48 flex-shrink-0 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-lg"
                >
                  <img
                    src={`https://images.unsplash.com/photo-${
                      i === 1
                        ? "1560250097-0b93528c311a"
                        : i === 2
                        ? "1519085360753-af0119f7cbe7"
                        : "1500648767791-00dcc994a43e"
                    }?auto=format&fit=crop&w=400&q=80`}
                    className="w-full h-full object-cover opacity-80"
                    alt="Participant"
                  />
                  <div className="absolute bottom-2 left-2 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                    {i === 1
                      ? "Vendor Rep"
                      : i === 2
                      ? "Venue Manager"
                      : "Tech Support"}
                  </div>
                  <div className="absolute top-2 right-2 p-1 bg-black/50 rounded-full">
                    <MicOff size={12} className="text-white" />
                  </div>
                </div>
              ))}
              {/* Self View */}
              <div className="relative w-48 h-36 md:w-64 md:h-48 flex-shrink-0 bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-lg flex items-center justify-center">
                <p className="text-slate-500 text-sm font-medium">You</p>
                <div className="absolute bottom-2 left-2 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                  Me
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-3xl flex items-center gap-6 shadow-2xl z-20">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full transition-all ${
                isMuted
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-4 rounded-full transition-all ${
                isVideoOff
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>

            <button className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition">
              <Maximize2 size={24} />
            </button>

            <button className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition">
              <MoreVertical size={24} />
            </button>

            <button
              onClick={() => {
                setShowMeetingModal(false);
                addToast("Call Ended", "info");
              }}
              className="px-8 py-4 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition shadow-lg shadow-red-600/30 flex items-center gap-2 ml-4"
            >
              <PhoneOff size={24} />{" "}
              <span className="hidden sm:inline">End Call</span>
            </button>
          </div>
        </div>
      )}

      {/* Guest List Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowGuestModal(false)}
          ></div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl max-h-[90vh] relative z-10 shadow-2xl animate-fade-in-up overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Guest List Management
                </h2>
                <p className="text-slate-500 text-sm flex gap-3 mt-1">
                  <span className="flex items-center gap-1">
                    <Users size={14} /> {(data.guests || []).length} Total
                  </span>
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle size={14} />{" "}
                    {(data.guests || []).filter((g: any) => g.status === "Confirmed").length}{" "}
                    Confirmed
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowGuestModal(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Controls */}
            <div className="p-6 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-slate-50 dark:border-slate-800">
              <div className="relative w-full md:w-96 group">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-900 dark:text-white transition-all"
                />
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button className="flex items-center gap-2 px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <Filter size={18} /> Filter
                </button>
                <button className="flex items-center gap-2 px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <Download size={18} /> Export
                </button>
                <button className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-primary transition shadow-lg shadow-indigo-500/20 ml-auto md:ml-0">
                  <Plus size={18} /> Add Guest
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
              <table className="w-full">
                <thead className="text-left text-xs font-bold text-slate-400 uppercase tracking-wide bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
                  <tr>
                    <th className="py-4 pl-6 pr-4">Guest</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Group</th>
                    <th className="py-4 px-4">Seating</th>
                    <th className="py-4 px-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredGuests.map((guest: any) => (
                    <tr
                      key={guest.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group"
                    >
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={guest.avatar}
                            alt={guest.name}
                            className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-800"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">
                              {guest.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {guest.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            guest.status === "Confirmed"
                              ? "bg-green-100 text-green-700"
                              : guest.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {guest.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                          {guest.type}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              guest.table === "-"
                                ? "bg-slate-300"
                                : "bg-primary"
                            }`}
                          ></div>
                          {guest.table === "-" ? "Unassigned" : guest.table}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right pr-6">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-2 text-slate-400 hover:text-primary hover:bg-indigo-50 rounded-lg transition"
                            title="Message"
                          >
                            <Mail size={16} />
                          </button>
                          <button
                            className="p-2 text-slate-400 hover:text-primary hover:bg-indigo-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredGuests.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500 font-medium">
                    No guests found matching your search.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Review Modal */}
      {showReviewModal && selectedBookingForReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowReviewModal(false)}
          ></div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg relative z-10 shadow-2xl animate-fade-in-up p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Review {selectedBookingForReview.vendorName}
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Rating */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="transition transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={
                        star <= reviewForm.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300 dark:text-slate-600"
                      }
                    />
                  </button>
                ))}
              </div>

              {/* Text */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Your Feedback
                </label>
                <textarea
                  value={reviewForm.text}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, text: e.target.value })
                  }
                  placeholder="Share your experience..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none min-h-[100px] text-slate-900 dark:text-white"
                ></textarea>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmitReview}
                disabled={isSubmittingReview || !reviewForm.text}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-primary transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmittingReview ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={20} /> Submit Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedBookingForPayment && (
          <PaymentModal 
              amount={selectedBookingForPayment.budget ? parseInt(selectedBookingForPayment.budget.replace(/[^0-9]/g, '')) || 5000 : 5000}
              isOpen={paymentModalOpen}
              onClose={() => {
                  setPaymentModalOpen(false);
                  setSelectedBookingForPayment(null);
              }}
              onSuccess={() => {
                  addToast("Payment Successful!", "success");
                  // Ideally refresh bookings to show "Paid" status
              }}
              bookingId={selectedBookingForPayment.id}
          />
      )}
    </div>
  );
};

export default Dashboard;
