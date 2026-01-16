import React, { useEffect, useState } from "react";
import { Event } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle,
  Loader2,
  AlertTriangle,
  Calendar,
  Plus,
  Trash2,
  X,
  Clock,
  TrendingUp,
  MessageSquare,
  Star,
  Upload,
  Smartphone,
  ShieldCheck,
  Edit,
  Save,
  Globe,
  MapPin,
  CreditCard,
  Building2,
} from "lucide-react";
import { Backend } from "../services/backend";
import VendorMetrics from "./VendorMetrics";
import { useToast } from "./ToastContext";
import { useTheme } from "./ThemeContext";

const VendorDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const { addToast } = useToast();

  // Availability Modal State
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState("");
  const [savingAvailability, setSavingAvailability] = useState(false);

  // Confirmation Modal State
  const [confirmAction, setConfirmAction] = useState<{
    id: number;
    type: "accepted" | "declined";
    clientName: string;
  } | null>(null);

  // New Tabs State
  const [activeTab, setActiveTab] = useState<"overview" | "reviews" | "portfolio" | "payments" | "services" | "profile" | "events">("overview");
  const [reviews, setReviews] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null); // ProviderProfile
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  
  // Edit Profile State
  const [editingProfile, setEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState<any>({});

  // New Service State
  const [newService, setNewService] = useState({ title: "", description: "", price: "", pricingUnit: "fixed" });
  const [isAddingService, setIsAddingService] = useState(false);

  const [newPortfolioUrl, setNewPortfolioUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // New Event State
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
      title: "",
      date: "",
      location: "",
      category: "Music",
      price: "Free",
      description: "",
      imageUrl: ""
  });

  useEffect(() => {
    // Initial Fetch
    const fetchData = async () => {
      try {
        if (!Backend?.API) {
           console.error("Backend API is undefined");
           setLoading(false);
           return;
        }

        const dashboardData = await Backend.API.getVendorDashboard();
        setData(dashboardData);
        if (dashboardData.availability) {
          setBlockedDates(dashboardData.availability);
        }

        // Fetch User ID to get reviews/portfolio
        const user = Backend.Auth.getSession();
        if (user) {
            setProfileData(user.providerProfile || {});
            const [revs, port, pay, serv, allEvents] = await Promise.all([
                Backend.API.Reviews.getReviews(user.id),
                Backend.API.Portfolio.getPortfolio(user.id),
                Backend.API.Payments.getVendorPayments(user.id),
                Backend.API.Services.getServices(user.id),
                Backend.API.getEvents()
            ]);
            setReviews(revs);
            setPortfolio(port);
            setPayments(pay);
            setServices(serv);

            // Filter my events
            setMyEvents(allEvents.filter((e: Event) => e.organizerId === user.id));
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch vendor data", error);
        setLoading(false);
      }
    };
    fetchData();

    // Realtime Subscription
    let unsubscribe = () => {};
    if (Backend?.API?.subscribe) {
      try {
        unsubscribe = Backend.API.subscribe("VENDOR", (updatedData) => {
          if (updatedData) {
              setData(updatedData);
              if (updatedData.availability) {
                setBlockedDates(updatedData.availability);
              }
          }
        });
      } catch (err) {
        console.warn("Failed to subscribe to real-time updates", err);
      }
    }

    return () => {
      try {
        unsubscribe();
      } catch (err) {
        console.warn("Failed to unsubscribe", err);
      }
    };
  }, []);

  const initiateResponse = (
    id: number,
    type: "accepted" | "declined",
    clientName: string
  ) => {
    setConfirmAction({ id, type, clientName });
  };

  const handleConfirmResponse = async () => {
    if (!confirmAction) return;

    const { id, type } = confirmAction;
    setConfirmAction(null); // Close modal
    setProcessingId(id);

    try {
      await Backend.API.respondToBooking(id, type);
      addToast(
        type === "accepted" ? "Booking Accepted!" : "Booking Declined",
        type === "accepted" ? "success" : "info"
      );
    } catch (error) {
      console.error("Error updating booking", error);
      addToast("Error updating booking", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddDate = () => {
    if (dateInput && !blockedDates.includes(dateInput)) {
      setBlockedDates((prev) => [...prev, dateInput].sort());
      setDateInput("");
    } else if (blockedDates.includes(dateInput)) {
      addToast("Date already blocked", "info");
    }
  };

  const handleRemoveDate = (date: string) => {
    setBlockedDates((prev) => prev.filter((d) => d !== date));
  };

  const handleSaveAvailability = async () => {
    setSavingAvailability(true);
    try {
      await Backend.API.updateVendorAvailability(blockedDates);
      addToast("Availability updated successfully", "success");
      setShowAvailabilityModal(false);
    } catch (err) {
      addToast("Failed to update availability", "error");
    } finally {
      setSavingAvailability(false);
    }
  };

  const handleAddToPortfolio = async () => {
      if (!newPortfolioUrl) return;
      setIsUploading(true);
      try {
          const user = Backend.Auth.getSession();
          if (user) {
              const newItem = await Backend.API.Portfolio.addToPortfolio(user.id, {
                  mediaUrl: newPortfolioUrl,
                  mediaType: "Image",
                  title: "Portfolio Item",
                  albumId: "default"
              });
              setPortfolio([newItem, ...portfolio]);
              setNewPortfolioUrl("");
              addToast("Added to portfolio", "success");
          }
      } catch (e) {
          addToast("Failed to add item", "error");
      } finally {
          setIsUploading(false);
      }
  };

  const handleDeletePortfolio = async (itemId: string) => {
      try {
           const user = Backend.Auth.getSession();
           if (user) {
               await Backend.API.Portfolio.deleteItem(user.id, itemId);
               setPortfolio(portfolio.filter(p => p.id !== itemId));
               addToast("Item removed", "success");
           }
      } catch (e) {
           addToast("Failed to delete", "error");
      }
  };

  const handleAddService = async () => {
      // ... existing logic
    if (!newService.title || !newService.price) {
        addToast("Please fill in required fields", "info");
        return;
    }
    setIsAddingService(true);
    try {
        const user = Backend.Auth.getSession();
        if (user) {
            const serviceItem = await Backend.API.Services.addService(user.id, {
                title: newService.title,
                description: newService.description,
                price: parseFloat(newService.price),
                pricingUnit: newService.pricingUnit
            });
            setServices([...services, serviceItem]);
            setNewService({ title: "", description: "", price: "", pricingUnit: "fixed" });
            addToast("Service added successfully", "success");
        }
    } catch (e) {
        addToast("Failed to add service", "error");
    } finally {
        setIsAddingService(false);
    }
  };

  const handleCreateEvent = async () => {
      if (!newEvent.title || !newEvent.date || !newEvent.location) {
          addToast("Please fill in required fields", "info");
          return;
      }
      setIsAddingEvent(true);
      try {
          const user = Backend.Auth.getSession();
          if (user) {
              const created = await Backend.API.createEvent({
                  title: newEvent.title,
                  date: new Date(newEvent.date).toISOString(),
                  location: newEvent.location,
                  category: newEvent.category as any,
                  price: newEvent.price,
                  description: newEvent.description || "No description",
                  imageUrl: newEvent.imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000",
                  attendees: 0,
                  organizerId: user.id,
                  organizer: user.name, // Legacy
                  status: "Confirmed" // Default to Confirmed
              });
              setMyEvents([...myEvents, created]);
              setNewEvent({ title: "", date: "", location: "", category: "Music", price: "Free", description: "", imageUrl: "" });
              addToast("Public event listed!", "success");
          }
      } catch (e) {
          addToast("Failed to create event", "error");
      } finally {
          setIsAddingEvent(false);
      }
  };
    

  const handleDeleteService = async (id: string) => {
      try {
          const user = Backend.Auth.getSession();
          if (user) {
              await Backend.API.Services.deleteService(user.id, id);
              setServices(services.filter(s => s.id !== id));
              addToast("Service deleted", "success");
          }
      } catch (e) {
          addToast("Failed to delete", "error");
      }
  };

  const handleUpdateProfile = async () => {
      setLoading(true);
      try {
           const user = Backend.Auth.getSession();
           if (user) {
               // Update in Firestore
               await Backend.Auth.updateProviderProfile(user.id, tempProfile);
               
               // Update local session to reflect changes immediately
               const updatedUser = { ...user, providerProfile: { ...user.providerProfile, ...tempProfile } };
               localStorage.setItem("eventide_session", JSON.stringify(updatedUser)); // Legacy/Fallback sync
               
               setProfileData(updatedUser.providerProfile);
               setEditingProfile(false);
               addToast("Profile updated successfully", "success");
           }
      } catch (e) {
          console.error("Profile update failed", e);
          addToast("Update failed", "error");
      } finally {
          setLoading(false);
      }
  };

  if (loading) { return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>; }
  if (!data) { return <div className="min-h-screen pt-24 text-center">Failed to load dashboard data.</div>; }

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Vendor Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your bookings, reputation, and portfolio.
          </p>
        </div>
        <div className="flex gap-3">
             <button
                onClick={() => setShowAvailabilityModal(true)}
                className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm flex items-center gap-2"
                >
                <Calendar size={18} /> Availability
            </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
          {["overview", "services", "reviews", "portfolio", "payments", "profile", "events"].map((tab) => (
             <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-3 px-2 font-bold text-sm transition-colors relative whitespace-nowrap ${activeTab === tab ? "text-primary" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}
              >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
              </button>
          ))}
      </div>

      {activeTab === "overview" && (
        <>
            <VendorMetrics metrics={data.metrics} />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Earnings Chart */}
                <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center mb-8">
                    <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-xl flex items-center gap-2">
                        <TrendingUp className="text-pink-500" size={20} /> Weekly
                        Earnings
                    </h3>
                    <p className="text-slate-400 text-sm">
                        Income overview for the last 7 days
                    </p>
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                    Live Data
                    </span>
                </div>
                <div className="h-80 w-full">
                    {data.stats && data.stats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                        data={data.stats}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke={theme === "dark" ? "#1e293b" : "#f1f5f9"}
                        />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#94a3b8", fontSize: 12 }}
                            tickFormatter={(val) => `₹${val / 1000}k`}
                        />
                        <Tooltip
                            cursor={{ fill: "#f8fafc", radius: 8 }}
                            contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
                            padding: "12px",
                            }}
                            formatter={(value: any) => [
                            `₹${value.toLocaleString()}`,
                            "Income",
                            ]}
                        />
                        <Bar
                            dataKey="income"
                            fill="#ec4899"
                            radius={[6, 6, 6, 6]}
                            barSize={48}
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                        </BarChart>
                    </ResponsiveContainer>
                    ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        No earnings data available yet.
                    </div>
                    )}
                </div>
                </div>

                {/* New Booking Requests List */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full max-h-[500px]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xl">Requests</h3>
                    <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {(data.requests || []).length} Pending
                    </span>
                </div>

                <div className="space-y-4 overflow-y-auto pr-2 flex-grow custom-scrollbar">
                    {(!data.requests || data.requests.length === 0) && (
                    <div className="h-full flex flex-col items-center justify-center text-center py-8 opacity-60">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={32} className="text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">All caught up!</p>
                        <p className="text-xs text-slate-400">
                        No new booking requests at the moment.
                        </p>
                    </div>
                    )}
                    {(data.requests || []).map((req: any) => { /* ... existing request mapping ... */
                        const clientName = req.clientName || req.client || "Client";
                        return (
                            <div key={req.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/20 hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 font-bold shadow-sm">
                                    {clientName.charAt(0)}
                                    </div>
                                    <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                                        {clientName}
                                    </h4>
                                    <span className="text-xs text-slate-500 block mt-0.5">
                                        {req.event}
                                    </span>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                                    {req.budget}
                                </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4 bg-white/50 dark:bg-slate-700/50 p-2 rounded-lg border border-slate-100/50 dark:border-slate-700/50">
                                <Clock size={14} className="text-primary" />
                                Requested date:{" "}
                                <span className="font-medium text-slate-700 dark:text-slate-300">{req.date}</span>
                                </div>

                                {processingId === req.id ? (
                                <div className="flex justify-center py-2">
                                    <Loader2 className="animate-spin text-primary w-5 h-5" />
                                </div>
                                ) : (
                                <div className="grid grid-cols-2 gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() =>
                                        initiateResponse(req.id, "accepted", clientName)
                                        }
                                        className="py-2.5 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() =>
                                        initiateResponse(req.id, "declined", clientName)
                                        }
                                        className="py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 hover:border-red-100 transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                                    >
                                        Decline
                                    </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                </div>
            </div>
        </>
      )}

      {activeTab === "services" && (
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in-up">
               <div className="flex justify-between items-center mb-8">
                   <div>
                       <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Orchestrated Services</h2>
                       <p className="text-slate-500 dark:text-slate-400 text-sm">Define what you offer to clients.</p>
                   </div>
               </div>
               
               {/* Add Service Form */}
               <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl mb-8 border border-slate-100 dark:border-slate-700">
                   <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                       <Plus size={20} className="text-primary" /> Add New Service
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                       <input 
                           type="text" 
                           placeholder="Service Title (e.g. Wedding Photography)" 
                           value={newService.title}
                           onChange={(e) => setNewService({...newService, title: e.target.value})}
                           className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary lg:col-span-2"
                       />
                        <div className="relative">
                            <span className="absolute left-4 top-3 text-slate-400 font-bold">₹</span>
                            <input 
                                type="number" 
                                placeholder="Price" 
                                value={newService.price}
                                onChange={(e) => setNewService({...newService, price: e.target.value})}
                                className="w-full pl-8 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                            />
                       </div>
                        <select 
                             value={newService.pricingUnit}
                           onChange={(e) => setNewService({...newService, pricingUnit: e.target.value})}
                           className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="fixed">Fixed Price</option>
                            <option value="per hour">Per Hour</option>
                            <option value="per day">Per Day</option>
                            <option value="per person">Per Person</option>
                        </select>
                        <textarea 
                             placeholder="Short description of the service..."
                             value={newService.description}
                             onChange={(e) => setNewService({...newService, description: e.target.value})}
                             className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary w-full md:col-span-2 lg:col-span-4"
                             rows={2}
                        />
                   </div>
                   <div className="flex justify-end mt-4">
                       <button 
                           onClick={handleAddService}
                           disabled={isAddingService}
                           className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-600 transition disabled:opacity-50"
                       >
                           {isAddingService ? <Loader2 className="animate-spin" /> : "Add Service"}
                       </button>
                   </div>
               </div>

               {/* Services List */}
               <div className="space-y-4">
                   {services.length === 0 ? (
                       <div className="text-center py-12 text-slate-400 italic">No services listed yet.</div>
                   ) : (
                       services.map(service => (
                           <div key={service.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-6 rounded-2xl flex justify-between items-center group hover:shadow-lg transition-all">
                               <div>
                                   <div className="flex items-center gap-3 mb-1">
                                       <h4 className="font-bold text-lg text-slate-900 dark:text-white">{service.title}</h4>
                                       <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                                           ₹{service.price} {service.pricingUnit !== 'fixed' && `/ ${service.pricingUnit}`}
                                       </span>
                                   </div>
                                   <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">{service.description}</p>
                               </div>
                               <button 
                                   onClick={() => handleDeleteService(service.id)}
                                   className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
                               >
                                   <Trash2 size={18} />
                               </button>
                           </div>
                       ))
                   )}
               </div>
           </div>
      )}

      {activeTab === "profile" && (
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in-up">
                <div className="flex justify-between items-start mb-8">
                   <div>
                       <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Business Profile</h2>
                       <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your public appearance and details.</p>
                   </div>
                   {!editingProfile ? (
                       <button 
                           onClick={() => {
                               setTempProfile(profileData);
                               setEditingProfile(true);
                           }}
                           className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition"
                       >
                           <Edit size={16} /> Edit Profile
                       </button>
                   ) : (
                       <div className="flex gap-2">
                           <button 
                               onClick={() => setEditingProfile(false)}
                               className="px-4 py-2 text-slate-500 font-bold text-sm hover:text-slate-800"
                           >
                               Cancel
                           </button>
                           <button 
                               onClick={handleUpdateProfile}
                               className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-700 transition"
                           >
                               <Save size={16} /> Save Changes
                           </button>
                       </div>
                   )}
               </div>

                {editingProfile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Business Name</label>
                                 <input 
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border rounded-xl"
                                    value={tempProfile.businessName || ""}
                                    onChange={(e) => setTempProfile({...tempProfile, businessName: e.target.value})}
                                 />
                             </div>
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Website</label>
                                 <div className="relative">
                                    <Globe className="absolute left-4 top-3.5 text-slate-400" size={16} />
                                    <input 
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border rounded-xl"
                                        value={tempProfile.websiteUrl || ""}
                                        onChange={(e) => setTempProfile({...tempProfile, websiteUrl: e.target.value})}
                                    />
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Price Range</label>
                                 <select 
                                     className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border rounded-xl appearance-none"
                                     value={tempProfile.priceRange || "$$"}
                                     onChange={(e) => setTempProfile({...tempProfile, priceRange: e.target.value})}
                                 >
                                     <option value="$">$ (Budget)</option>
                                     <option value="$$">$$ (Standard)</option>
                                     <option value="$$$">$$$ (Premium)</option>
                                     <option value="$$$$">$$$$ (Luxury)</option>
                                 </select>
                             </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Locations (City/State)</label>
                                 <div className="relative">
                                    <MapPin className="absolute left-4 top-3.5 text-slate-400" size={16} />
                                    <input 
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border rounded-xl"
                                        value={tempProfile.city || ""}
                                        onChange={(e) => setTempProfile({...tempProfile, city: e.target.value})}
                                        placeholder="City, State"
                                    />
                                 </div>
                             </div>
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Description</label>
                                 <textarea 
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border rounded-xl h-32"
                                    value={tempProfile.businessDescription || ""}
                                    onChange={(e) => setTempProfile({...tempProfile, businessDescription: e.target.value})}
                                 />
                             </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="col-span-2 space-y-6">
                              <div>
                                  <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                      {profileData?.businessName || "Your Business"}
                                      {profileData?.verified && <ShieldCheck className="text-blue-500" size={18} />}
                                  </h3>
                                  <p className="text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                      {profileData?.businessDescription || "No description provided."}
                                  </p>
                              </div>
                              <div className="flex gap-4">
                                  {profileData?.websiteUrl && (
                                      <a href={profileData.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                                          <Globe size={16} /> Website
                                      </a>
                                  )}
                                  {profileData?.city && (
                                       <span className="flex items-center gap-2 text-slate-500 text-sm">
                                           <MapPin size={16} /> {profileData.city}
                                       </span>
                                  )}
                              </div>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl h-fit">
                              <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wide mb-4">Quick Stats</h4>
                              <div className="space-y-4">
                                  <div className="flex justify-between">
                                      <span className="text-sm font-medium">Rating</span>
                                      <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                                          <Star size={14} className="fill-current" /> {profileData?.rating || "N/A"}
                                      </div>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-sm font-medium">Price Tier</span>
                                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{profileData?.priceRange || "$$"}</span>
                                  </div>
                                   <div className="flex justify-between">
                                      <span className="text-sm font-medium">Experience</span>
                                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{profileData?.yearsOfExperience || 1} Years</span>
                                  </div>
                              </div>
                          </div>
                    </div>
                )}
           </div>
      )}


      {activeTab === "reviews" && (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in-up">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Client Reviews</h2>
              {reviews.length === 0 ? (
                  <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                          <MessageSquare size={32} />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">No reviews yet. Complete bookings to get rated!</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {reviews.map(review => (
                          <div key={review.id} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                              <div className="flex justify-between items-start mb-4">
                                  <div className="flex items-center gap-3">
                                      <img src={review.clientAvatar} alt={review.clientName} className="w-10 h-10 rounded-full" />
                                      <div>
                                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{review.clientName}</h4>
                                          <div className="flex text-yellow-400 text-xs">
                                              {[...Array(5)].map((_, i) => (
                                                  <Star key={i} size={12} className={i < review.rating ? "fill-current" : "text-slate-300 dark:text-slate-600"} />
                                              ))}
                                          </div>
                                      </div>
                                  </div>
                                  <span className="text-xs text-slate-400">{new Date(review.timestamp).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{review.text}"</p>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      {activeTab === "portfolio" && (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in-up">
              <div className="flex justify-between items-center mb-8">
                  <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Professional Portfolio</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Showcase your best work to potential clients.</p>
                  </div>
                  <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Paste Image URL..." 
                        value={newPortfolioUrl}
                        onChange={(e) => setNewPortfolioUrl(e.target.value)}
                        className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary w-64"
                      />
                      <button 
                        onClick={handleAddToPortfolio}
                        disabled={!newPortfolioUrl || isUploading}
                        className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
                      >
                          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                          Add Item
                      </button>
                  </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {portfolio.length === 0 ? (
                      <div className="col-span-full text-center py-12 text-slate-400 italic">
                          Your portfolio is empty. Add some photos to attract clients!
                      </div>
                  ) : (
                      portfolio.map((item) => (
                          <div key={item.id} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800">
                              <img src={item.mediaUrl} alt={item.title || "Portfolio Item"} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                              <button 
                                onClick={() => handleDeletePortfolio(item.id)}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600 shadow-lg"
                              >
                                  <Trash2 size={14} />
                              </button>
                          </div>
                      ))
                  )}
              </div>
          </div>
      )}

      {activeTab === "payments" && (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in-up">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Transaction History</h2>
              
               <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Transaction ID</th>
                      <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Amount</th>
                      <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Method</th>
                      <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Status</th>
                      <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {payments.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400 italic">No transactions found.</td>
                        </tr>
                    ) : (
                        payments.map((payment) => (
                            <tr key={payment.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                <td className="py-4 font-mono text-xs text-slate-500">{payment.id}</td>
                                <td className="py-4 font-bold text-slate-900 dark:text-white">
                                    ₹{payment.amount.toLocaleString()}
                                </td>
                                <td className="py-4">
                                   <div className="flex items-center gap-2">
                                       {payment.method === "Card" && <CreditCard size={16} className="text-blue-500" />}
                                       {payment.method === "UPI" && <Smartphone size={16} className="text-green-500" />}
                                       {payment.method === "EMI" && <Building2 size={16} className="text-orange-500" />}
                                       <span className="text-sm text-slate-700 dark:text-slate-300">{payment.method}</span>
                                   </div>
                                </td>
                                <td className="py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        payment.status === "Succeeded" ? "bg-green-100 text-green-700" :
                                        payment.status === "Failed" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                                    }`}>
                                        {payment.status}
                                    </span>
                                </td>
                                <td className="py-4 text-sm text-slate-500">
                                    {new Date(payment.paymentDate || new Date().toISOString()).toLocaleDateString()}
                                </td>
                            </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
          </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
            onClick={() => setConfirmAction(null)}
          ></div>
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 w-full max-w-sm relative z-10 shadow-2xl animate-fade-in-up transform scale-100 transition-all border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col items-center text-center mb-8">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl ${
                  confirmAction.type === "accepted"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 shadow-green-500/20"
                    : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shadow-red-500/20"
                }`}
              >
                {confirmAction.type === "accepted" ? (
                  <CheckCircle size={40} />
                ) : (
                  <AlertTriangle size={40} />
                )}
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
                {confirmAction.type === "accepted"
                  ? "Confirm Acceptance"
                  : "Decline Request?"}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Are you sure you want to{" "}
                {confirmAction.type === "accepted" ? "accept" : "decline"} the
                booking for <br />
                <span className="font-bold text-slate-900 text-base">
                  {confirmAction.clientName}
                </span>
                ?
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmResponse}
                className={`w-full py-4 text-white rounded-xl font-bold shadow-lg transition transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 ${
                  confirmAction.type === "accepted"
                    ? "bg-green-600 hover:bg-green-500 shadow-green-600/30"
                    : "bg-red-600 hover:bg-red-500 shadow-red-600/30"
                }`}
              >
                {confirmAction.type === "accepted"
                  ? "Yes, Accept Booking"
                  : "Yes, Decline Request"}
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                className="w-full py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setShowAvailabilityModal(false)}
          ></div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg relative z-10 shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar size={20} className="text-primary" /> Manage
                Availability
              </h3>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-500 mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-700">
                Block dates when you are fully booked. These dates will be
                disabled on your public calendar.
              </p>

              <div className="flex gap-3 mb-8">
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium text-slate-700 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleAddDate}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-primary transition flex items-center justify-center shadow-lg shadow-indigo-500/20"
                >
                  <Plus size={20} />{" "}
                  <span className="ml-2 hidden sm:inline">Add</span>
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center justify-between">
                  Blocked Dates <span>{blockedDates.length}</span>
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {blockedDates.length === 0 && (
                    <p className="text-sm text-slate-400 italic text-center py-4">
                      No dates blocked yet.
                    </p>
                  )}
                  {blockedDates.map((date) => (
                    <div
                      key={date}
                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-red-200 transition-colors group"
                    >
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {new Date(date).toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <button
                        onClick={() => handleRemoveDate(date)}
                        className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={handleSaveAvailability}
                  disabled={savingAvailability}
                  className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-primary transition shadow-lg hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {savingAvailability ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "events" && (
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in-up">
               <div className="flex justify-between items-center mb-8">
                   <div>
                       <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Public Events</h2>
                       <p className="text-slate-500 dark:text-slate-400 text-sm">Create and manage public events listed on the marketplace.</p>
                   </div>
               </div>

                {/* Add Event Form */}
               <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl mb-8 border border-slate-100 dark:border-slate-700">
                   <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                       <Plus size={20} className="text-primary" /> Create New Event
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       <input 
                           type="text" 
                           placeholder="Event Title" 
                           value={newEvent.title} 
                           onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                           className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                       />
                       <input 
                           type="datetime-local" 
                           value={newEvent.date} 
                           onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                           className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                       />
                       <input 
                           type="text" 
                           placeholder="Location" 
                           value={newEvent.location} 
                           onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                           className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                       />
                       <select 
                           value={newEvent.category} 
                           onChange={e => setNewEvent({...newEvent, category: e.target.value})}
                           className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                       >
                           <option value="Music">Music</option>
                           <option value="Tech">Tech</option>
                           <option value="Social">Social</option>
                           <option value="Art">Art</option>
                           <option value="Food">Food</option>
                           <option value="Wedding">Wedding</option>
                       </select>
                       <input 
                           type="text" 
                           placeholder="Price (e.g. Free, $20)" 
                           value={newEvent.price} 
                           onChange={e => setNewEvent({...newEvent, price: e.target.value})}
                           className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                       />
                       <input 
                           type="text" 
                           placeholder="Image URL" 
                           value={newEvent.imageUrl} 
                           onChange={e => setNewEvent({...newEvent, imageUrl: e.target.value})}
                           className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                       />
                       <textarea 
                           placeholder="Description..." 
                           value={newEvent.description} 
                           onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                           className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary md:col-span-2 lg:col-span-3 h-24"
                       />
                   </div>
                   <div className="flex justify-end mt-4">
                       <button 
                           onClick={handleCreateEvent}
                           disabled={isAddingEvent}
                           className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-600 transition disabled:opacity-50"
                       >
                           {isAddingEvent ? <Loader2 className="animate-spin" /> : "List Event"}
                       </button>
                   </div>
               </div>

               {/* Events List */}
               <div className="space-y-4">
                   {myEvents.length === 0 ? (
                       <div className="text-center py-12 text-slate-400 italic">No events listed. Create one above!</div>
                   ) : (
                       myEvents.map(event => (
                           <div key={event.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl flex gap-4 group hover:shadow-lg transition-all">
                               <img src={event.imageUrl} alt={event.title} className="w-32 h-24 object-cover rounded-xl" />
                               <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900 dark:text-white">{event.title}</h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{event.category}</span>
                                                <span>• {new Date(event.date).toLocaleDateString()}</span>
                                                <span>• {event.location}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-slate-900 dark:text-white block">{event.price}</span>
                                            <span className="text-xs text-slate-500">{event.attendees} attendees</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 line-clamp-2">{event.description}</p>
                               </div>
                           </div>
                       ))
                   )}
               </div>
           </div>
      )}

    </div>
  );
};

export default VendorDashboard;
