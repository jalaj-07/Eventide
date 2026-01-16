import React, { useState, useEffect } from "react";
import { Event } from "../types";
import { Backend } from "../services/backend";
import EventCard, { RsvpStatus } from "./EventCard";
import {
  Loader2,
  CalendarX,
  ArrowRight,
  CheckCircle,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "./ToastContext";

const MyEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, RsvpStatus>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"attending" | "interested">(
    "attending"
  );
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allEvents, clientData] = await Promise.all([
          Backend.API.getEvents(),
          Backend.API.getClientDashboard(),
        ]);

        const userRsvps = clientData.rsvps || {};
        setRsvps(userRsvps);

        // Filter events where user has an RSVP status
        const myEventList = allEvents.filter((event) => userRsvps[event.id]);
        setEvents(myEventList);
      } catch (err) {
        console.error("Failed to load my events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Subscribe to updates in case user removes RSVP
    const unsubscribe = Backend.API.subscribe("CLIENT", (data) => {
      if (data.rsvps) {
        setRsvps(data.rsvps);
        setEvents((prev) => prev.filter((e) => data.rsvps[e.id]));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleRsvpChange = async (eventId: string, status: RsvpStatus) => {
    // Optimistic Update
    setRsvps((prev) => {
      const next = { ...prev };
      if (status === null) delete next[eventId];
      else next[eventId] = status;
      return next;
    });

    // If status is null (removed), allow it to disappear from the list after delay
    if (status === null) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    }

    try {
      await Backend.API.updateRsvp(eventId, status);
      if (status === null) addToast("Removed from My Events", "info");
      else addToast("RSVP Updated", "success");
    } catch (e) {
      addToast("Failed to update RSVP", "error");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  const attendingEvents = events.filter((e) => rsvps[e.id] === "attending");
  const interestedEvents = events.filter((e) => rsvps[e.id] === "interested");
  const currentEvents =
    activeTab === "attending" ? attendingEvents : interestedEvents;

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Events</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your upcoming plans and saved interests.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex">
          <button
            onClick={() => setActiveTab("attending")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "attending"
                ? "bg-slate-900 dark:bg-slate-700 text-white shadow-md"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <CheckCircle size={16} /> Going ({attendingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab("interested")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "interested"
                ? "bg-yellow-400 text-slate-900 shadow-md"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Star size={16} /> Interested ({interestedEvents.length})
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in-up">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <CalendarX size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No upcoming events
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            You haven't RSVP'd to any events yet. Explore what's happening
            around you!
          </p>
          <Link
            to="/discovery"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-full font-bold hover:bg-primary transition shadow-lg hover:shadow-primary/30"
          >
            Discover Events <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="animate-fade-in-up">
          {currentEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentEvents.map((event, idx) => (
                <EventCard
                  key={event.id}
                  event={event}
                  rsvpStatus={activeTab}
                  onRsvp={(status) => handleRsvpChange(event.id, status)}
                  style={{ animationDelay: `${idx * 50}ms` }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 font-medium">
                No events in this list yet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyEvents;
