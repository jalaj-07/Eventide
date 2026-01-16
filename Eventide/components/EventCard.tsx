import React, { useState } from "react";
import { Event } from "../types";
import {
  MapPin,
  Heart,
  Calendar,
  CheckCircle,
  Star,
  CalendarPlus,
  ArrowUpRight,
  Loader2,
  Edit2,
  Navigation,
} from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ToastContext";

export type RsvpStatus = "attending" | "interested" | null;

interface EventCardProps {
  event: Event;
  style?: React.CSSProperties;
  rsvpStatus?: RsvpStatus;
  userLocation?: { lat: number; lng: number } | null;
  onRsvp?: (status: RsvpStatus) => Promise<void> | void;
  onEdit?: (event: Event) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  style,
  rsvpStatus,
  userLocation,
  onRsvp,
  onEdit,
}) => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState<
    "attending" | "interested" | null
  >(null);

  // Safe Date Parsing
  let dateObj = new Date(event.date);
  if (isNaN(dateObj.getTime())) {
      dateObj = new Date(); // Fallback to now
  }
  
  const month = dateObj.toLocaleString("default", { month: "short" });
  const day = dateObj.getDate();
  const time = dateObj.toLocaleTimeString("default", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const calculateDistance = () => {
    if (!userLocation || !event.coordinates) return null;

    const R = 3958.8; // Radius of earth in Miles
    const dLat = ((event.coordinates.lat - userLocation.lat) * Math.PI) / 180;
    const dLon = ((event.coordinates.lng - userLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLocation.lat * Math.PI) / 180) *
        Math.cos((event.coordinates.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1); // One decimal place
  };

  const distance = calculateDistance();

  const handleRsvpClick = async (e: React.MouseEvent, status: RsvpStatus) => {
    e.preventDefault();
    e.stopPropagation();

    if (onRsvp) {
      const targetState = status === "attending" ? "attending" : "interested";
      setProcessing(targetState);

      try {
        await onRsvp(rsvpStatus === status ? null : status);
      } finally {
        setProcessing(null);
      }
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) onEdit(event);
  };

  const handleActionClick = async (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (action === "calendar") {
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
        `URL:${window.location.origin}/#/event/${event.id}`,
        `DTSTART:${formatDate(start)}`,
        `DTEND:${formatDate(end)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description
          .substring(0, 150)
          .replace(/\n/g, "\\n")}...`,
        `LOCATION:${event.location}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");

      const blob = new Blob([icsContent], {
        type: "text/calendar;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${event.title.replace(/\s+/g, "_")}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast("Event added to your calendar file", "success");
    } else if (action === "share") {
      const shareUrl = `${window.location.origin}/#/event/${event.id}`;
      const shareData = {
        title: event.title,
        text: `Check out ${event.title} on Eventide!`,
        url: shareUrl,
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
          addToast("Shared successfully!", "success");
        } catch (err) {
          // User cancelled or share failed
        }
      } else {
        try {
          await navigator.clipboard.writeText(shareUrl);
          addToast("Event link copied to clipboard!", "info");
        } catch (e) {
          addToast("Failed to copy link", "error");
        }
      }
    } else if (action === "wishlist") {
      addToast("Added to favorites!", "success");
    }
  };

  const navigateToEvent = () => {
    navigate(`/event/${event.id}`);
  };

  return (
    <div
      onClick={navigateToEvent}
      className={`group bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border shadow-sm transition-all duration-300 ease-out transform hover:-translate-y-2 hover:shadow-2xl relative flex flex-col h-full cursor-pointer ${
        rsvpStatus === "attending"
          ? "border-green-400 ring-2 ring-green-100 dark:ring-green-900/30"
          : rsvpStatus === "interested"
          ? "border-yellow-400 ring-2 ring-yellow-100 dark:ring-yellow-900/30"
          : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
      }`}
      style={style}
    >
      {/* Image Area */}
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-80"></div>

        <button
          aria-label="Add to favorites"
          className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all z-10 hover:scale-110"
          onClick={(e) => handleActionClick(e, "wishlist")}
        >
          <Heart size={20} />
        </button>

        {/* Top RSVP Badge - Contextual overlay */}
        {rsvpStatus && (
          <div className="absolute top-4 left-4 z-10 animate-fade-in-up">
            {rsvpStatus === "attending" ? (
              <span className="bg-green-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 border border-green-400/50 backdrop-blur-sm">
                <CheckCircle
                  size={14}
                  fill="currentColor"
                  className="text-white"
                />{" "}
                Going
              </span>
            ) : (
              <span className="bg-yellow-400 text-slate-900 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 border border-yellow-300/50 backdrop-blur-sm">
                <Star
                  size={14}
                  fill="currentColor"
                  className="text-slate-900"
                />{" "}
                Interested
              </span>
            )}
          </div>
        )}

        <div className="absolute bottom-4 left-4 text-white">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-[10px] font-bold mb-2 uppercase tracking-wide shadow-sm">
            {event.category}
          </span>
        </div>

        {onEdit && (
          <button
            onClick={handleEditClick}
            className="absolute bottom-4 right-4 bg-white text-slate-900 p-2.5 rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors z-20"
            title="Edit Event"
          >
            <Edit2 size={18} />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex gap-4 mb-4">
          <div className="text-center bg-slate-50 dark:bg-slate-800 rounded-2xl px-3 py-3 h-fit border border-slate-200 dark:border-slate-700 min-w-[70px]">
            <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {month}
            </span>
            <span className="block text-2xl font-extrabold text-slate-900 dark:text-white leading-none mt-1">
              {day}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            {/* Title with inline Status Indicator */}
            <div className="flex flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {event.title}
                </h3>
              </div>

              {rsvpStatus && (
                <div className="flex mt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                      rsvpStatus === "attending"
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-yellow-50 text-yellow-600 border-yellow-200"
                    }`}
                  >
                    {rsvpStatus === "attending" ? (
                      <CheckCircle size={10} />
                    ) : (
                      <Star size={10} />
                    )}
                    {rsvpStatus === "attending" ? "Confirmed" : "Saved"}
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2 font-medium">
              <Calendar size={14} className="text-primary" /> {time}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 truncate">
              <MapPin size={14} className="text-primary flex-shrink-0" />{" "}
              <span className="truncate">{event.location}</span>
            </p>

            {/* Distance Display */}
            {distance && (
              <p className="text-xs text-primary font-bold mt-2 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md w-fit">
                <Navigation size={10} /> {distance} mi away
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto space-y-5">
          {/* Attendees & Price row */}
          <div className="flex items-center justify-between">
            <div className="flex -space-x-3 items-center">
              {[1, 2, 3].map((i) => (
                <img
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 ring-1 ring-slate-100 dark:ring-slate-800 object-cover"
                  src={`https://ui-avatars.com/api/?name=User+${i}&background=random`}
                  alt="Attendee"
                />
              ))}
              <span className="text-xs text-slate-500 font-bold ml-4 bg-slate-100 px-2 py-1 rounded-md">
                +{event.attendees > 3 ? event.attendees - 3 : 0} others
              </span>
            </div>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg">
              {event.price || "Free"}
            </span>
          </div>

          {/* Action Buttons Grid */}
          <div className="pt-5 border-t border-slate-100 grid grid-cols-4 gap-2">
            {/* RSVP Actions */}
            <button
              onClick={(e) => handleRsvpClick(e, "attending")}
              disabled={processing !== null}
              className={`col-span-1 rounded-xl transition-all flex items-center justify-center py-3 hover:scale-105 active:scale-95 ${
                rsvpStatus === "attending"
                  ? "bg-green-600 text-white shadow-lg shadow-green-600/20"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 border border-transparent hover:border-green-200 dark:hover:border-green-800"
              }`}
              title="Mark as Attending"
            >
              {processing === "attending" ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <CheckCircle size={20} />
              )}
            </button>

            <button
              onClick={(e) => handleRsvpClick(e, "interested")}
              disabled={processing !== null}
              className={`col-span-1 rounded-xl transition-all flex items-center justify-center py-3 hover:scale-105 active:scale-95 ${
                rsvpStatus === "interested"
                  ? "bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-400/20"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 border border-transparent hover:border-yellow-200 dark:hover:border-yellow-800"
              }`}
              title="Mark as Interested"
            >
              {processing === "interested" ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Star
                  size={20}
                  fill={rsvpStatus === "interested" ? "currentColor" : "none"}
                />
              )}
            </button>

            {/* Utility Actions */}
            <button
              onClick={(e) => handleActionClick(e, "calendar")}
              className="col-span-1 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center hover:scale-105 active:scale-95 shadow-sm hover:shadow-indigo-500/30"
              title="Add to Calendar"
            >
              <CalendarPlus size={20} />
            </button>

            <button
              onClick={(e) => handleActionClick(e, "share")}
              className="col-span-1 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all flex items-center justify-center hover:scale-105 active:scale-95 shadow-sm hover:shadow-slate-900/20"
              title="Share Event"
            >
              <ArrowUpRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
