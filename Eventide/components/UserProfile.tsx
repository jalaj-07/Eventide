import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  MessageSquare,
  Edit,
} from "lucide-react";
import { Backend } from "../services/backend";
import { User, Event } from "../types";
import EventCard from "./EventCard";

const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 pt-24 pb-12 animate-pulse">
    <div className="h-48 bg-slate-200 rounded-3xl mb-8"></div>
    <div className="flex gap-8 mb-8">
      <div className="w-32 h-32 rounded-full bg-slate-200 -mt-16 border-4 border-white"></div>
      <div className="flex-1 space-y-3 mt-2">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      </div>
    </div>
    <div className="h-64 bg-slate-200 rounded-2xl"></div>
  </div>
);

const UserProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMe, setIsMe] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const [events, setEvents] = useState<{ upcoming: Event[]; past: Event[] }>({
    upcoming: [],
    past: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const sessionUser = Backend.Auth.getSession();
      const targetId = id === "me" || !id ? sessionUser?.id : id;
      const isCurrentUser = sessionUser?.id === targetId;
      setIsMe(isCurrentUser);

      if (!targetId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch User Data
        const fetchedUser = isCurrentUser
          ? sessionUser
          : await Backend.API.getUser(targetId);

        // Fetch User Events (Only relevant if we have a way to track others' events, currently only 'me' via Client Dashboard)
        let upcoming: Event[] = [];
        let past: Event[] = [];

        if (isCurrentUser) {
          const dashboard = await Backend.API.getClientDashboard();
          const allEvents = await Backend.API.getEvents();
          const myRsvps = dashboard.rsvps || {};

          const myEventList = allEvents.filter((e) => myRsvps[e.id]);
          const now = new Date();

          upcoming = myEventList.filter((e) => new Date(e.date) >= now);
          past = myEventList.filter((e) => new Date(e.date) < now);
        } else {
          // Mock logic for other users as backend doesn't expose public RSVP lists yet
          // Using mock data for demo consistency
          const allEvents = await Backend.API.getEvents();
          past = allEvents.slice(0, 3);
          upcoming = allEvents.slice(3, 5);
        }

        setUser(
          fetchedUser || {
            id: "ghost",
            name: "Unknown User",
            role: "CLIENT" as any,
            avatar: "",
            email: "",
          }
        );
        setEvents({ upcoming, past });
      } catch (e) {
        console.error("Profile load error", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return <div className="pt-32 text-center">User not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 animate-fade-in-up transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition mb-6 font-medium"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 mb-8 transition-colors duration-300">
          <div className="h-48 bg-gradient-to-r from-primary via-indigo-500 to-purple-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          </div>

          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row justify-between items-end -mt-16 mb-6">
              <div className="flex items-end gap-6">
                <div className="p-1.5 bg-white rounded-full shadow-lg">
                  <img
                    className="w-32 h-32 rounded-full object-cover border-4 border-slate-50 dark:border-slate-900 bg-slate-100 dark:bg-slate-800"
                  />
                </div>
                <div className="mb-4">
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {user.name}
                  </h1>
                  <div className="flex items-center gap-4 text-slate-500 mt-1">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <MapPin size={16} /> Austin, TX
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-sm font-medium">Joined 2023</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-4 md:mb-0 mt-4 md:mt-0 w-full md:w-auto">
                {isMe ? (
                  <Link
                    to="/profile"
                    className="flex-1 md:flex-none px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2"
                  >
                    <Edit size={18} /> Edit Profile
                  </Link>
                ) : (
                  <button className="flex-1 md:flex-none px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-primary transition shadow-md flex items-center justify-center gap-2">
                    <MessageSquare size={18} /> Message
                  </button>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-slate-100 dark:border-slate-800 mb-8">
              <div className="text-center border-r border-slate-100 dark:border-slate-800 last:border-0">
                <span className="block text-2xl font-bold text-slate-900 dark:text-white">
                  {events.past.length}
                </span>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Events Attended
                </span>
              </div>
              <div className="text-center border-r border-slate-100 dark:border-slate-800 last:border-0">
                <span className="block text-2xl font-bold text-slate-900 dark:text-white">
                  {events.upcoming.length}
                </span>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Upcoming
                </span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-slate-900 dark:text-white">
                  4.9
                </span>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Trust Score
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="max-w-2xl">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">About</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Passionate about music festivals, tech workshops, and community
                gatherings. Looking to connect with like-minded people and
                discover unique local experiences.
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                {["Music", "Technology", "Art", "Foodie"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg uppercase tracking-wide"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Events Tabs */}
        <div>
          <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800 mb-6">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`pb-4 text-sm font-bold transition-all relative ${
                activeTab === "upcoming"
                  ? "text-primary"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              Upcoming Plans
              {activeTab === "upcoming" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`pb-4 text-sm font-bold transition-all relative ${
                activeTab === "past"
                  ? "text-primary"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              Past History
              {activeTab === "past" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === "upcoming" ? events.upcoming : events.past).map(
              (event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  rsvpStatus={isMe ? "attending" : null}
                />
              )
            )}
            {(activeTab === "upcoming" ? events.upcoming : events.past)
              .length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 italic">
                No {activeTab} events found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
