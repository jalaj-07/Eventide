import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Event } from "../types";
import {
  MapPin,
  Calendar,
  Clock,
  Share2,
  Users,
  ArrowLeft,
  Heart,
  CheckCircle,
  Loader2,
  Star,
  MessageSquare,
  Edit,
  Trash2,
  Download,
  X,
  CreditCard,
  Minus,
  Plus,
  Mail,
  Phone,
  Globe,
  Navigation,
  ChevronRight,
  Ticket,
  CloudSun,
  CalendarPlus,
} from "lucide-react";
import { useToast } from "./ToastContext";
import { Backend } from "../services/backend";
import EventCard, { RsvpStatus } from "./EventCard";
import EventChat from "./EventChat";

import EditEventModal from "./EditEventModal";
import CreatePlanModal from "./CreatePlanModal";
import LiveMap from "./LiveMap";
import ImageWithFallback from "./ImageWithFallback";

const EventDetailsSkeleton = () => (
  <div className="pt-24 pb-20 bg-white dark:bg-slate-950 min-h-screen animate-pulse">
    <div className="h-[400px] w-full bg-slate-200 dark:bg-slate-800"></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
          </div>
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        </div>
        <div className="lg:col-span-1">
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        </div>
      </div>
    </div>
  </div>
);

const EventDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Event Data State
  const [event, setEvent] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);

  // User State
  const [allRsvps, setAllRsvps] = useState<Record<string, RsvpStatus>>({});
  const [isOrganizer, setIsOrganizer] = useState(false);

  // Modals
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const [cancelling, setCancelling] = useState(false);

  // Booking State
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoadingEvent(true);
      try {
        // Simulate slight delay for skeleton demo
        await new Promise((r) => setTimeout(r, 600));

        const eventData = await Backend.API.getEvent(id);
        const allEvents = await Backend.API.getEvents();
        const clientData = await Backend.API.getClientDashboard();
        const user = Backend.Auth.getSession();

        if (eventData) {
          setEvent(eventData);

          // Filter related events: same category, excluding current
          setRelatedEvents(
            allEvents
              .filter(
                (e) =>
                  e.category === eventData.category && e.id !== eventData.id
              )
              .slice(0, 4)
          );
        }

        if (clientData.rsvps) {
          setAllRsvps(clientData.rsvps);
        }

        // Check if user is organizer (Mock logic)
        if (user) {
          // For demo, assume admin/planner rights for logged in user to show controls
          setIsOrganizer(true);
        }
      } catch (e) {
        console.error("Failed to fetch event data", e);
      } finally {
        setLoadingEvent(false);
      }
    };
    loadData();

    const unsubscribe = Backend.API.subscribe("CLIENT", (data) => {
      if (data.rsvps) setAllRsvps(data.rsvps);
    });
    return () => unsubscribe();
  }, [id]);

  if (loadingEvent) {
    return <EventDetailsSkeleton />;
  }

  if (!event) {
    return (
      <div className="pt-32 text-center text-slate-500">Event not found.</div>
    );
  }

  const dateObj = new Date(event.date);
  const currentRsvp = allRsvps[event.id] || null;

  // --- Handlers ---

  const handleUpdateRsvp = async (eventId: string, status: RsvpStatus) => {
    setAllRsvps((prev) => {
      const next = { ...prev };
      if (status === null) delete next[eventId];
      else next[eventId] = status;
      return next;
    });

    try {
      await Backend.API.updateRsvp(eventId, status);
      if (status === "attending")
        addToast(`You are going to ${event.title}!`, "success");
      else if (status === "interested")
        addToast(`Marked as interested`, "info");
      else addToast("RSVP Removed", "info");
    } catch (e) {
      addToast("Could not update RSVP", "error");
    }
  };

  const handleBookingConfirm = async () => {
    if (!event) return;
    setProcessingPayment(true);
    
    // Check Wallet Balance
    const user = Backend.Auth.getSession();
    const totalCost = getPriceValue() * ticketQuantity * 1.05; // Including service fee (logic matches UI)

    if (user) {
        const storedWallet = localStorage.getItem(`wallet_${user.id}`);
        let balance = 0;
        let transactions = [];
        
        if (storedWallet) {
            const data = JSON.parse(storedWallet);
            balance = data.balance || 0;
            transactions = data.transactions || [];
        }

        if (balance < totalCost) {
            addToast("Insufficient funds in Vault. Please add money.", "error");
            setProcessingPayment(false);
            return;
        }

        // Deduct from Wallet
        const newBalance = balance - totalCost;
        const newTx = {
            id: `tx-${Date.now()}`,
            type: "debit",
            amount: totalCost,
            description: `Booked Event: ${event.title}`,
            date: new Date().toISOString(),
            status: "completed"
        };

        localStorage.setItem(`wallet_${user.id}`, JSON.stringify({
            balance: newBalance,
            transactions: [newTx, ...transactions]
        }));
    }

    try {
        // Create Payment Record
        await Backend.API.Payments.createPayment({
            amount: totalCost,
            currency: "INR",
            method: "Wallet", 
            providerId: event.organizerId 
        });

        await handleUpdateRsvp(event.id, "attending");
        addToast("Tickets booked successfully! Debited from Vault.", "success");
    } catch (e) {
        addToast("Payment failed. Please try again.", "error");
    } finally {
        setProcessingPayment(false);
        setShowBookingModal(false);
    }
  };

  const addToGoogleCalendar = () => {
    if (!event) return;
    const start = new Date(event.date)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");
    const end = new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${start}/${end}&details=${encodeURIComponent(
      event.description
    )}&location=${encodeURIComponent(event.location)}`;
    window.open(url, "_blank");
  };

  const downloadIcs = () => {
    if (!event) return;
    const formatDate = (date: Date) =>
      date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const start = new Date(event.date);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const now = formatDate(new Date());

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Eventide//NONSGML Eventide//EN",
      "BEGIN:VEVENT",
      `UID:${event.id}@eventide.com`,
      `DTSTAMP:${now}`,
      `URL:${window.location.href}`,
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
      `LOCATION:${event.location}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${event.title.replace(/\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("ICS file downloaded", "success");
  };

  const handleShareEvent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out ${event.title} on Eventide!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        addToast("Link copied to clipboard!", "info");
      } catch (err) {
        addToast("Failed to copy link", "error");
      }
    }
  };

  const handleEditSave = async (updatedEvent: Partial<Event>) => {
    try {
      const updated = await Backend.API.updateEvent(event.id, updatedEvent);
      setEvent(updated);
      addToast("Event details updated successfully", "success");
    } catch (err) {
      addToast("Failed to update event", "error");
      throw err;
    }
  };

  const handleCancelEvent = async () => {
    setCancelling(true);
    try {
      await Backend.API.cancelEvent(event.id);
      addToast("Event cancelled successfully. Attendees notified.", "info");
      navigate("/discovery");
    } catch (err) {
      addToast("Failed to cancel event", "error");
      setCancelling(false);
    }
  };

  const getPriceValue = () => {
    if (!event || !event.price || event.price === "Free") return 0;
    const num = parseFloat(event.price.replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  return (
    <div className="pt-24 pb-20 bg-white dark:bg-slate-950 min-h-screen animate-fade-in-up transition-colors duration-300">

      {/* Hero Image Section */}
      <div className="relative h-[400px] lg:h-[500px] w-full overflow-hidden group">
        <ImageWithFallback
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        {/* Navigation */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            to="/discovery"
            className="flex items-center gap-2 text-white/90 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full transition-all border border-white/10"
          >
            <ArrowLeft size={18} /> Back
          </Link>
        </div>

        {/* Organizer: Action Buttons */}
        {isOrganizer && (
          <div className="absolute top-6 right-6 z-20 flex gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-white/90 backdrop-blur-md text-slate-900 px-4 py-2 rounded-full hover:bg-white hover:text-primary transition shadow-lg flex items-center gap-2 font-bold text-sm"
              title="Edit Event"
            >
              <Edit size={16} /> Edit
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              className="bg-red-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full hover:bg-red-600 transition shadow-lg flex items-center gap-2 font-bold text-sm"
              title="Cancel Event"
            >
              <Trash2 size={16} /> Cancel
            </button>
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 lg:p-16 text-white max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="px-3 py-1 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg mb-4 inline-block shadow-lg shadow-indigo-900/20">
                {event.category}
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-tight drop-shadow-md">
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-6 text-white/90 font-medium">
                <span className="flex items-center gap-2 backdrop-blur-sm bg-black/10 px-3 py-1 rounded-lg">
                  <Calendar size={20} />{" "}
                  {dateObj.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-2 backdrop-blur-sm bg-black/10 px-3 py-1 rounded-lg">
                  <Clock size={20} />{" "}
                  {dateObj.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <span className="flex items-center gap-2 backdrop-blur-sm bg-black/10 px-3 py-1 rounded-lg">
                  <MapPin size={20} /> {event.location}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleShareEvent}
                className="bg-white/10 backdrop-blur-md p-4 rounded-full hover:bg-white/20 transition text-white border border-white/10"
                title="Share Event"
              >
                <Share2 size={24} />
              </button>
              <button
                onClick={() => addToast("Added to favorites!", "success")}
                className="bg-white/10 backdrop-blur-md p-4 rounded-full hover:bg-white/20 transition text-white border border-white/10"
                title="Favorite"
              >
                <Heart size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <section>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                About this Event
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </section>

            {/* Photo Gallery */}
            {event.gallery && event.gallery.length > 0 && (
              <section className="animate-fade-in-up">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Event Gallery
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {event.gallery.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`relative rounded-2xl overflow-hidden group cursor-pointer ${idx === 0 ? 'md:col-span-2 md:row-span-2 h-[400px]' : 'h-[190px]'}`}
                    >
                      <ImageWithFallback
                        src={img}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500"></div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Organizer Info */}
            <section>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Organizer
              </h3>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-2xl font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
                  {event.organizer.charAt(0)}
                </div>
                <div className="flex-grow text-center md:text-left">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    {event.organizer}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                    Hosted by {event.organizer}
                  </p>

                  {event.organizerContact && (
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      {event.organizerContact.email && (
                        <a
                          href={`mailto:${event.organizerContact.email}`}
                          className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition"
                        >
                          <Mail size={16} /> {event.organizerContact.email}
                        </a>
                      )}
                      {event.organizerContact.phone && (
                        <a
                          href={`tel:${event.organizerContact.phone}`}
                          className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition"
                        >
                          <Phone size={16} /> {event.organizerContact.phone}
                        </a>
                      )}
                      {event.organizerContact.website && (
                        <a
                          href={`https://${event.organizerContact.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition"
                        >
                          <Globe size={16} /> Website
                        </a>
                      )}
                    </div>
                  )}
                  
                  <Link 
                     to="/chat" 
                     className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-sm"
                  >
                     <MessageSquare size={16} /> Message Organizer
                  </Link>
                </div>
              </div>
            </section>

            {/* Event Chat */}
            {currentRsvp === "attending" && (
              <section className="animate-fade-in-up">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <MessageSquare className="text-primary" /> Live Discussion
                </h3>
                <EventChat eventId={event.id} />
              </section>
            )}

            {/* Attendees List */}
            <section className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users size={24} className="text-primary" /> Who's going
                </h3>
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {event.attendees} confirmed
                </span>
              </div>

              <div className="flex overflow-x-auto gap-4 pb-4 -mx-2 px-2 scrollbar-hide snap-x">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="min-w-[180px] bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center hover:shadow-md transition snap-center group"
                  >
                    <div className="relative mb-3">
                      <ImageWithFallback
                        src={`https://ui-avatars.com/api/?name=User+${i}&background=random`}
                        alt="User"
                        className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 dark:border-slate-700 group-hover:border-indigo-50 dark:group-hover:border-indigo-900 transition-colors"
                      />
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white truncate w-full text-sm mb-1">
                      Attendee {i}
                    </p>
                    <p className="text-xs text-slate-400 mb-4">Member</p>
                    <button
                      onClick={() => navigate(`/profile/${i}`)}
                      className="px-4 py-2 text-xs font-bold text-primary bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition w-full flex items-center justify-center gap-1"
                    >
                      View Profile <ChevronRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Map Location */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Location</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="flex items-center gap-2 text-sm font-bold text-primary bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                  >
                    <CalendarPlus size={16} /> Plan with Friends
                  </button>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      event.location
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition"
                  >
                    <Navigation size={16} /> Get Directions
                  </a>
                </div>
                </div>

              <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800 h-[400px] w-full bg-slate-100 dark:bg-slate-800 relative group">
                <LiveMap 
                    eventId={event.id}
                    eventLat={event.coordinates?.lat || 28.6139} // Fallback to New Delhi
                    eventLng={event.coordinates?.lng || 77.2090} 
                    isLive={isLive} 
                />
                
                {!isLive && (
                    <button 
                        onClick={() => setIsLive(true)}
                        className="absolute bottom-4 left-4 bg-white dark:bg-slate-800 text-primary px-4 py-2 rounded-xl shadow-md text-sm font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition z-[400]"
                    >
                        <MapPin size={16} /> Go Live
                    </button>
                )}
                 {isLive && (
                    <button 
                        onClick={() => setIsLive(false)}
                        className="absolute bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-xl shadow-md text-sm font-bold flex items-center gap-2 hover:bg-red-600 transition z-[1000]"
                    >
                        <X size={16} /> Stop Sharing
                    </button>
                )}

                <div className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-md text-xs font-bold text-slate-800 dark:text-slate-200 pointer-events-none z-[400]">
                  {event.location}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Booking Card */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Price per person
                </span>
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {event.price || "Free"}
                </span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-slate-400" size={20} />
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                        Date
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {dateObj.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Clock className="text-slate-400" size={20} />
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                        Time
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {dateObj.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Weather Widget (Mock) */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <CloudSun className="text-blue-500 dark:text-blue-400" size={20} />
                    <div>
                      <p className="text-xs font-bold text-blue-400 uppercase">
                        Forecast
                      </p>
                      <p className="font-bold text-blue-900 dark:text-blue-100">Sunny, 24°C</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RSVP Buttons Section */}
              <div className="space-y-4">
                {currentRsvp === "attending" && (
                  <div className="w-full py-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-2xl font-bold text-lg border border-green-200 dark:border-green-800 flex items-center justify-center gap-2 animate-fade-in-up">
                    <CheckCircle size={24} />
                    <span>You're Going!</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      currentRsvp === "attending"
                        ? handleUpdateRsvp(event.id, null)
                        : setShowBookingModal(true)
                    }
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                      currentRsvp === "attending"
                        ? "bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-100"
                        : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-primary dark:hover:bg-slate-200"
                    }`}
                  >
                    {currentRsvp === "attending" ? (
                      <X size={18} />
                    ) : (
                      <Ticket size={18} />
                    )}
                    {currentRsvp === "attending" ? "Cancel" : "Book Now"}
                  </button>

                  <button
                    onClick={() =>
                      handleUpdateRsvp(
                        event.id,
                        currentRsvp === "interested" ? null : "interested"
                      )
                    }
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border shadow-sm active:scale-95 ${
                      currentRsvp === "interested"
                        ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Star
                      size={18}
                      className={
                        currentRsvp === "interested" ? "fill-current" : ""
                      }
                    />
                    Interested
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={addToGoogleCalendar}
                    className="py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2 text-sm"
                  >
                    <CalendarPlus size={16} /> Google Cal
                  </button>
                  <button
                    onClick={downloadIcs}
                    className="py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2 text-sm"
                  >
                    <Download size={16} /> ICS File
                  </button>
                </div>


                <button
                  onClick={() => setShowPlanModal(true)}
                  className="w-full py-3 mt-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-primary dark:text-indigo-400 rounded-xl font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition flex items-center justify-center gap-2 text-sm"
                >
                    <Users size={16} /> Create Private Plan
                </button>
              </div>

              <p className="text-center text-xs text-slate-400 mt-4">
                No hidden fees. Cancel anytime.
              </p>

              {/* QR Code Section */}
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-2 text-sm uppercase tracking-wide">
                  Event Check-in
                </h3>
                <div className="bg-white p-3 inline-block rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm group cursor-pointer hover:shadow-md transition">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      window.location.href
                    )}`}
                    alt="Event QR"
                    className="w-32 h-32 opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-3 font-medium">
                  Scan to view details on mobile
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Events */}
      {relatedEvents.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 border-t border-slate-100 dark:border-slate-800 pt-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedEvents.map((related) => (
              <EventCard
                key={related.id}
                event={related}
                rsvpStatus={allRsvps[related.id] || null}
                onRsvp={(status) => handleUpdateRsvp(related.id, status)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {event && (
        <EditEventModal
          event={event}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSave}
        />
      )}

       {/* Create Plan Modal */}
      {event && (
        <CreatePlanModal
            eventId={event.id}
            eventName={event.title}
            isOpen={showPlanModal}
            onClose={() => setShowPlanModal(false)}
            onPlanCreated={() => {
                // Optional: navigate to dashboard or show success
            }}
        />
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowBookingModal(false)}
          ></div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg relative z-10 shadow-2xl animate-fade-in-up overflow-hidden">
            <div className="bg-slate-900 dark:bg-slate-950 p-6 text-white relative">
              <button
                onClick={() => setShowBookingModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold mb-1">Complete Booking</h2>
              <p className="text-white/70 text-sm">{event.title}</p>
            </div>

            <div className="p-6">
              {/* Ticket Selection */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-slate-900 dark:text-white">
                    General Admission
                  </span>
                  <span className="font-bold text-primary">{event.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Select Quantity
                  </span>
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 p-1">
                    <button
                      onClick={() =>
                        setTicketQuantity(Math.max(1, ticketQuantity - 1))
                      }
                      className="p-2 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-md text-slate-500 dark:text-slate-300 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-bold text-slate-900 dark:text-white w-6 text-center">
                      {ticketQuantity}
                    </span>
                    <button
                      onClick={() =>
                        setTicketQuantity(Math.min(10, ticketQuantity + 1))
                      }
                      className="p-2 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-md text-slate-900 dark:text-white transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium">
                    ₹{(getPriceValue() * ticketQuantity).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Service Fee</span>
                  <span className="font-medium">
                    ₹{(getPriceValue() * ticketQuantity * 0.05).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white">
                  <span>Total</span>
                  <span>
                    ₹
                    {(getPriceValue() * ticketQuantity * 1.05).toLocaleString(
                      undefined,
                      { maximumFractionDigits: 0 }
                    )}
                  </span>
                </div>
              </div>

              {/* Payment Mock */}
              <button
                onClick={handleBookingConfirm}
                disabled={processingPayment}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-primary transition shadow-lg flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} /> Pay & Confirm
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                <CheckCircle size={12} /> Secure transaction
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
            onClick={() => setShowCancelModal(false)}
          ></div>
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 w-full max-w-sm relative z-10 shadow-2xl animate-fade-in-up border border-slate-100 dark:border-slate-800 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-red-500/20 shadow-lg">
              <Trash2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Cancel Event?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Are you sure you want to cancel{" "}
              <span className="font-bold text-slate-900 dark:text-white">{event.title}</span>?
              <br />
              <span className="text-xs text-red-500 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded-lg mt-2 inline-block">
                This action cannot be undone.
              </span>
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleCancelEvent}
                disabled={cancelling}
                className="w-full py-3.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-600/30 flex justify-center items-center gap-2"
              >
                {cancelling ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Confirm Cancellation"
                )}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Keep Event
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default EventDetails;
