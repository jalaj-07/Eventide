import React, { useState, useEffect, useRef, useMemo } from "react";
import { Event } from "../types";
import {
  Search,
  Filter,
  Map as MapIcon,
  List,
  Calendar,
  Navigation,
  X,
  Crosshair,
  Clock,
  IndianRupee,
  RotateCcw,
  Sun,
  Moon,
  Sunrise,
  MapPin,
  Globe,
  Music,
  Cpu,
  Users,
  Heart,
  Palette,
  Utensils,
  Plus,
  Minus,
  Move,
  CalendarDays,
  ArrowDownUp,
} from "lucide-react";
import EventCard, { RsvpStatus } from "./EventCard";
import { Backend } from "../services/backend";
import { useToast } from "./ToastContext";
import { useSearchParams, Link } from "react-router-dom";
import EditEventModal from "./EditEventModal";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import confetti from "canvas-confetti";
import AIRecommender from "./AIRecommender";

// Fix Default Leaflet Icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const EventCardSkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm h-full flex flex-col animate-pulse">
    <div className="h-64 bg-slate-200"></div>
    <div className="p-6 flex-1 space-y-4">
      <div className="flex gap-4">
        <div className="w-16 h-16 bg-slate-200 rounded-2xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="h-4 bg-slate-200 rounded w-full"></div>
      <div className="h-10 bg-slate-200 rounded-xl w-full mt-auto"></div>
    </div>
  </div>
);

// Types for Map Clustering


const DEFAULT_LOCATION = { lat: 30.2672, lng: -97.7431 }; // Austin, TX

const EventDiscovery: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState("All");
  const [activeView, setActiveView] = useState<"list" | "map">("list");
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");
  const [searchParams, setSearchParams] = useSearchParams();

  // Search State with Debounce
  const [searchInputValue, setSearchInputValue] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  // Advanced Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxDistance, setMaxDistance] = useState<number>(100); // Miles
  const [timeOfDay, setTimeOfDay] = useState<string>("Any"); // Any, Morning, Afternoon, Evening
  const [maxPrice, setMaxPrice] = useState<number>(10000); // Slider Value

  // Sorting State
  const [sortBy, setSortBy] = useState<"date" | "popularity" | "price">("date");

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "default" | "locating" | "found"
  >("default");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null); // For Map

  // Edit Modal State
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Map Interaction State
  const [viewState, setViewState] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Easter Egg States
  const [matrixMode, setMatrixMode] = useState(false);

  // Data State
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvps, setRsvps] = useState<Record<string, RsvpStatus>>({});
  const { addToast } = useToast();

  // Sync with URL params
  useEffect(() => {
    const query = searchParams.get("q");
    if (query !== null) {
      setSearchInputValue(query);
      setDebouncedSearchQuery(query);
    }
  }, [searchParams]);

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchInputValue);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInputValue]);

  // Easter Egg Effects for Search
  useEffect(() => {
    const term = debouncedSearchQuery.toLowerCase().trim();

    if (term === "party" || term === "confetti" || term === "celebrate") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    if (term === "matrix") {
      setMatrixMode(true);
    } else if (matrixMode && term !== "matrix") {
      setMatrixMode(false);
    }
  }, [debouncedSearchQuery]);

  // Search Suggestion Logic
  useEffect(() => {
    if (debouncedSearchQuery.length > 1) {
      const matches = events
        .filter(
          (e) =>
            e.title
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase()) ||
            e.category
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase()) ||
            e.location
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase())
        )
        .map((e) => e.title)
        .slice(0, 5);
      setSearchSuggestions(Array.from(new Set(matches)));
    } else {
      setSearchSuggestions([]);
    }
  }, [debouncedSearchQuery, events]);

  const handleSearchSelect = (term: string) => {
    setSearchInputValue(term);
    setDebouncedSearchQuery(term);
    setSearchSuggestions([]);
    setSearchParams((prev) => {
      prev.set("q", term);
      return prev;
    });
  };

  // Initialize RSVP Data & Geolocation & Fetch Events
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        // Simulate network delay for realism
        await new Promise((resolve) => setTimeout(resolve, 800));

        const [eventList, clientData] = await Promise.all([
          Backend.API.getEvents(),
          Backend.API.getClientDashboard(),
        ]);

        if (isMounted) {
          setEvents(eventList);
          if (clientData.rsvps) setRsvps(clientData.rsvps);
          setLoading(false);
        }
      } catch (e) {
        console.error("Failed to load data", e);
        if (isMounted) setLoading(false);
      }
    };
    loadData();

    // Real-time Subscription for general updates (Refresh events)
    const unsubscribeGeneral = Backend.API.subscribe("CLIENT", () => {
      console.log("Received real-time update: Refreshing events...");
      loadData(); 
      addToast("New events available!", "info");
    });

    // Subscribe to client-specific updates (e.g., RSVPs)
    const unsubscribeClient = Backend.API.subscribe("CLIENT", (data) => {
      if (isMounted && data.rsvps) setRsvps(data.rsvps);
    });

    // Attempt to Get User Location on Mount
    if (navigator.geolocation) {
      if (isMounted) setLocationStatus("locating");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isMounted) {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setLocationStatus("found");
          }
        },
        () => {
          console.log("Location access denied/error, using default.");
          if (isMounted) setLocationStatus("default");
        }
      );
    }

    return () => {
      isMounted = false;
      unsubscribeGeneral();
      unsubscribeClient();
    };
  }, [addToast]);

  // --- Map Interaction Logic ---

  // Global Drag Listeners to prevent sticking when mouse leaves div
  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        const newX = e.clientX - dragStartRef.current.x;
        const newY = e.clientY - dragStartRef.current.y;
        setViewState((prev) => ({ ...prev, x: newX, y: newY }));
      }
    };
    const handleGlobalUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleGlobalMove);
      window.addEventListener("mouseup", handleGlobalUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleGlobalMove);
      window.removeEventListener("mouseup", handleGlobalUp);
    };
  }, [isDragging]);

  // Non-passive wheel listener to prevent default scrolling while zooming
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      if (activeView === "map") {
        e.preventDefault();
        const scaleAdjustment = e.deltaY > 0 ? -0.2 : 0.2;
        setViewState((prev) => {
          const newScale = Math.min(
            Math.max(1, prev.scale + scaleAdjustment),
            8
          ); // Max zoom 8x, Min 1x
          return { ...prev, scale: newScale };
        });
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [activeView]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeView !== "map") return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - viewState.x,
      y: e.clientY - viewState.y,
    };
  };

  const handleZoom = (delta: number) => {
    setViewState((prev) => {
      const newScale = Math.min(Math.max(1, prev.scale + delta), 8);
      return { ...prev, scale: newScale };
    });
  };

  const resetView = () => {
    setViewState({ scale: 1, x: 0, y: 0 });
  };

  const centerOnLocation = () => {
    if (!userLocation) {
      if (navigator.geolocation) {
        addToast("Requesting location...", "info");
        setLocationStatus("locating");
        navigator.geolocation.getCurrentPosition(
          (p) => {
            setUserLocation({
              lat: p.coords.latitude,
              lng: p.coords.longitude,
            });
            setLocationStatus("found");
            addToast("Location found! Centering map.", "success");

            if (mapContainerRef.current) {
              setViewState({ scale: 3, x: 0, y: 0 });
            }
          },
          () => {
            addToast("Could not access location", "error");
            setLocationStatus("default");
          }
        );
      } else {
        addToast("Location not supported", "error");
      }
      return;
    }

    setViewState({
      scale: 3,
      x: 0,
      y: 0,
    });
    addToast("Centered on your location", "success");
  };





  const handleRsvpChange = async (eventId: string, status: RsvpStatus) => {
    // Optimistic Update
    setRsvps((prev) => {
      const next = { ...prev };
      if (status === null) delete next[eventId];
      else next[eventId] = status;
      return next;
    });

    try {
      await Backend.API.updateRsvp(eventId, status);
      if (status === "attending")
        addToast("RSVP Confirmed! You are going.", "success");
      else if (status === "interested")
        addToast("Event saved to your interests.", "info");
      else addToast("RSVP removed.", "info");
    } catch (e) {
      addToast("Failed to update RSVP", "error");
    }
  };

  const handleEditSave = async (updatedEvent: Partial<Event>) => {
    if (!editingEvent) return;
    try {
      const result = await Backend.API.updateEvent(
        editingEvent.id,
        updatedEvent
      );
      setEvents((prev) => prev.map((e) => (e.id === result.id ? result : e)));
      addToast("Event updated successfully", "success");
    } catch (error) {
      addToast("Failed to update event", "error");
    }
  };

  const getPriceValue = (priceStr: string | undefined) => {
    if (!priceStr || priceStr === "Free") return 0;
    const num = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  // Filter & Sort Logic
  const filteredEvents = useMemo(() => {
    let result = events.filter((e) => {
      // 1. Search
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        if (
          !e.title.toLowerCase().includes(query) &&
          !e.description.toLowerCase().includes(query) &&
          !e.location.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      // 2. Category
      if (filterCategory !== "All" && e.category !== filterCategory)
        return false;

      // 3. Date Range
      if (startDate) {
        const eventTime = new Date(e.date).getTime();
        const startTime = new Date(startDate).setHours(0, 0, 0, 0);
        if (eventTime < startTime) return false;
      }
      if (endDate) {
        const eventTime = new Date(e.date).getTime();
        const endTime = new Date(endDate).setHours(23, 59, 59, 999);
        if (eventTime > endTime) return false;
      }

      // 4. Time of Day
      if (timeOfDay !== "Any") {
        const hour = new Date(e.date).getHours();
        if (timeOfDay === "Morning") {
          if (hour < 5 || hour >= 12) return false;
        } else if (timeOfDay === "Afternoon") {
          if (hour < 12 || hour >= 17) return false;
        } else if (timeOfDay === "Evening") {
          if (hour < 17 && hour < 5) return false; // Basic check for evening/night
        }
      }

      // 5. Price
      const priceVal = getPriceValue(e.price);
      if (priceVal > maxPrice) return false;

      // 6. Distance (Use fallback if location denied)
      if (maxDistance < 100) {
        if (e.coordinates) {
          const userLat = userLocation
            ? userLocation.lat
            : DEFAULT_LOCATION.lat;
          const userLng = userLocation
            ? userLocation.lng
            : DEFAULT_LOCATION.lng;
          const R = 3958.8; // Radius of earth in Miles
          const dLat = ((e.coordinates.lat - userLat) * Math.PI) / 180;
          const dLon = ((e.coordinates.lng - userLng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((userLat * Math.PI) / 180) *
              Math.cos((e.coordinates.lat * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const d = R * c;
          if (d > maxDistance) return false;
        }
      }
      return true;
    });

    // 7. Sort
    return result.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === "popularity") {
        return b.attendees - a.attendees;
      } else if (sortBy === "price") {
        return getPriceValue(a.price) - getPriceValue(b.price);
      }
      return 0;
    });
  }, [
    events,
    debouncedSearchQuery,
    filterCategory,
    startDate,
    endDate,
    maxDistance,
    timeOfDay,
    maxPrice,
    userLocation,
    sortBy,
  ]);



  const clearAllFilters = () => {
    setStartDate("");
    setEndDate("");
    setMaxDistance(100);
    setFilterCategory("All");
    setSearchInputValue("");
    setDebouncedSearchQuery("");
    setTimeOfDay("Any");
    setMaxPrice(10000);
    setSortBy("date");
    addToast("All filters cleared", "info");
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Music":
        return <Music size={14} />;
      case "Tech":
        return <Cpu size={14} />;
      case "Social":
        return <Users size={14} />;
      case "Wedding":
        return <Heart size={14} />;
      case "Art":
        return <Palette size={14} />;
      case "Food":
        return <Utensils size={14} />;
      default:
        return <MapPin size={14} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Music":
        return "bg-violet-500";
      case "Tech":
        return "bg-blue-500";
      case "Social":
        return "bg-orange-500";
      case "Wedding":
        return "bg-pink-500";
      case "Art":
        return "bg-red-500";
      case "Food":
        return "bg-green-500";
      default:
        return "bg-slate-900";
    }
  };

  const timeOptions = [
    { label: "Any", icon: Clock, desc: "All Day" },
    { label: "Morning", icon: Sunrise, desc: "5AM - 12PM" },
    { label: "Afternoon", icon: Sun, desc: "12PM - 5PM" },
    { label: "Evening", icon: Moon, desc: "5PM - Late" },
  ];

  return (
    <div
      className={`pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto min-h-screen ${
        matrixMode ? "bg-black" : ""
      }`}
    >
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-end mb-8 gap-6">
        <div className="w-full lg:w-1/2">
          <h1
            className={`text-4xl font-extrabold mb-2 ${
              matrixMode ? "text-[#00ff41] font-mono" : "text-slate-900 dark:text-white"
            }`}
          >
            {matrixMode ? "SYSTEM_SEARCH_PROTOCOL" : "Discover Experiences"}
          </h1>
          <p
            className={`text-lg ${
              matrixMode ? "text-[#008f11] font-mono" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {matrixMode
              ? "Scanning for events in local sector..."
              : "Curated events for you based on your interests."}
          </p>
          


          <div className="relative mt-6 max-w-lg">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                  matrixMode ? "text-[#00ff41]" : "text-slate-400"
                }`}
                size={20}
              />
              <input
                type="text"
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                placeholder={
                  matrixMode
                    ? "ENTER_QUERY..."
                    : "Search events, locations, or vibes..."
                }
                className={`w-full pl-12 pr-10 py-4 border rounded-2xl shadow-sm outline-none font-medium transition-all ${
                  matrixMode
                    ? "bg-black border-[#00ff41] text-[#00ff41] placeholder-[#008f11] font-mono focus:shadow-[0_0_10px_#00ff41]"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                }`}
              />
              {searchInputValue && (
                <button
                  onClick={() => {
                    setSearchInputValue("");
                    setDebouncedSearchQuery("");
                  }}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full transition ${
                    matrixMode
                      ? "text-[#00ff41] hover:text-white"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-fade-in-up">
                {searchSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchSelect(suggestion)}
                    className="w-full text-left px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm flex items-center gap-2 transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0"
                  >
                    <Search size={14} className="text-slate-400" /> {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
          <div className="flex p-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
            <button
              onClick={() => setActiveView("list")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeView === "list"
                  ? "bg-slate-900 dark:bg-slate-700 text-white shadow-md"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <List size={18} /> List
            </button>
            <button
              onClick={() => setActiveView("map")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeView === "map"
                  ? "bg-slate-900 dark:bg-slate-700 text-white shadow-md"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <MapIcon size={18} /> Map
            </button>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-5 py-3 border rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition ${
              showFilters
                ? "bg-primary border-primary text-white"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {/* AI Recommender Box - Moved for Full Width */}
      {!matrixMode && (
        <div className="mb-8 animate-fade-in-up">
           <AIRecommender 
             onRecommend={(filters) => {
               if (filters.category) setFilterCategory(filters.category);
               if (filters.maxPrice) setMaxPrice(filters.maxPrice);
               if (filters.search) {
                   setSearchInputValue(filters.search); 
                   setDebouncedSearchQuery(filters.search);
               } else if(filters.description) {
                   setSearchInputValue(filters.description);
                   setDebouncedSearchQuery(filters.description);
               }
               addToast("AI Filters Applied!", "success");
             }} 
           />
        </div>
      )}

      {/* Advanced Filters Panel */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          showFilters
            ? "max-h-[800px] opacity-100 mb-8 transform translate-y-0"
            : "max-h-0 opacity-0 mb-0 transform -translate-y-4"
        }`}
      >
        <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl relative">
          <div className="flex justify-between items-center mb-8 border-b border-slate-50 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-xl">Refine Search</h3>
            <button
              onClick={clearAllFilters}
              className="text-sm font-bold text-red-500 hover:text-red-600 transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Column 1: Date & Distance (5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                  <CalendarDays size={14} /> Date Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                      <Calendar size={18} />
                    </div>
                    <span className="absolute -top-2 left-3 bg-white dark:bg-slate-900 px-1 text-[10px] font-bold text-slate-400 group-focus-within:text-primary transition-colors">
                      FROM
                    </span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium text-slate-700 text-sm shadow-sm transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                      <Calendar size={18} />
                    </div>
                    <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 group-focus-within:text-primary transition-colors">
                      TO
                    </span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium text-slate-700 text-sm shadow-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                    <Navigation size={14} /> Max Distance
                  </label>
                  <span className="text-xs font-bold text-primary bg-indigo-50 px-2 py-1 rounded-md flex items-center gap-1">
                    {!userLocation && locationStatus !== "found" ? (
                      <span className="text-orange-500">Using Default</span>
                    ) : (
                      <Navigation size={10} />
                    )}
                    {maxDistance < 100 ? `${maxDistance} miles` : "Global"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={maxDistance}
                  onChange={(e) => {
                    setMaxDistance(parseInt(e.target.value));
                    if (!userLocation && navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (p) => {
                          setUserLocation({
                            lat: p.coords.latitude,
                            lng: p.coords.longitude,
                          });
                          setLocationStatus("found");
                        },
                        () => setLocationStatus("default")
                      );
                    }
                  }}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>1 mi</span>
                  <span>25 mi</span>
                  <span>50 mi</span>
                  <span>100+ mi</span>
                </div>
              </div>
            </div>

            {/* Column 2: Time of Day (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                <Clock size={14} /> Time of Day
              </label>
              <div className="grid grid-cols-2 gap-3 h-full pb-2">
                {timeOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => setTimeOfDay(option.label)}
                    className={`relative p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 text-center group ${
                      timeOfDay === option.label
                        ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20 transform scale-105 z-10"
                        : "bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
                    }`}
                  >
                    <option.icon
                      size={22}
                      className={
                        timeOfDay === option.label
                          ? "text-white"
                          : "text-slate-400 group-hover:text-slate-600 transition-colors"
                      }
                    />
                    <span className="text-xs font-bold">{option.label}</span>
                    <span
                      className={`text-[10px] ${
                        timeOfDay === option.label
                          ? "text-slate-300"
                          : "text-slate-400 opacity-70"
                      }`}
                    >
                      {option.desc}
                    </span>
                    {timeOfDay === option.label && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Column 3: Price (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                <IndianRupee size={14} /> Max Price
              </label>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col items-center justify-center h-[160px]">
                <div className="text-3xl font-extrabold text-slate-900 mb-2">
                  {maxPrice >= 10000 ? "Any" : `₹${maxPrice}`}
                </div>
                <span className="text-xs text-slate-500 font-medium mb-6">
                  Maximum budget
                </span>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-8 no-scrollbar">
        {["All", "Music", "Tech", "Social", "Wedding", "Art", "Food"].map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                filterCategory === cat
                  ? "bg-primary text-white border-primary shadow-lg shadow-indigo-500/25"
                  : matrixMode
                  ? "bg-black text-[#00ff41] border-[#00ff41] hover:bg-[#003300]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          )
        )}
      </div>

      {/* Content View Switch */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : activeView === "list" ? (
        <div>

          <div className="flex justify-between items-center mb-6 animate-fade-in-up">
            <p className={matrixMode ? "text-[#008f11]" : "text-slate-500"}>
              Showing{" "}
              <span
                className={`font-bold ${
                  matrixMode ? "text-[#00ff41]" : "text-slate-900"
                }`}
              >
                {filteredEvents.length}
              </span>{" "}
              events
            </p>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-sm text-slate-500 flex items-center gap-1">
                <ArrowDownUp size={14} /> Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-600 outline-none cursor-pointer p-1"
              >
                <option value="date">Date (Soonest)</option>
                <option value="popularity">Popularity (Most Attendees)</option>
                <option value="price">Price (Low to High)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, idx) => (
                <div
                  id={`event-card-${event.id}`}
                  key={event.id}
                  className={`h-full ${
                    matrixMode
                      ? "matrix-mode rounded-[2rem] overflow-hidden transition-all duration-500"
                      : ""
                  }`}
                >
                  <EventCard
                    event={event}
                    rsvpStatus={rsvps[event.id] || null}
                    userLocation={userLocation || DEFAULT_LOCATION}
                    onRsvp={(status) => handleRsvpChange(event.id, status)}
                    onEdit={(ev) => setEditingEvent(ev)}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  No events found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-primary transition"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Enhanced Map View Implementation */
        <div
          ref={mapContainerRef}
          className={`h-[700px] w-full rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative bg-slate-100 dark:bg-slate-900 animate-fade-in-up group select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          onClick={() => setSelectedEventId(null)}
          onMouseDown={handleMouseDown}
          onMouseLeave={() => setIsDragging(false)}
        >
          {/* Map Filters Overlay */}
          <div className="absolute top-6 left-6 z-30 flex gap-2 overflow-x-auto max-w-[calc(100%-150px)] no-scrollbar pb-2">
            {["All", "Music", "Tech", "Social", "Wedding"].map((cat) => (
              <button
                key={cat}
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterCategory(cat);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md transition-all whitespace-nowrap border ${
                  filterCategory === cat
                    ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20"
                    : "bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-white border-white/20 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Glassmorphic Map Controls */}
          <div className="absolute top-6 right-6 z-30 flex flex-col gap-3">
            {/* Type Toggle */}
            <div className="flex bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700 p-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMapType("standard");
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  mapType === "standard"
                    ? "bg-slate-900 dark:bg-slate-700 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <MapIcon size={14} /> Default
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMapType("satellite");
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  mapType === "satellite"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Globe size={14} /> Satellite
              </button>
            </div>
          </div>

          {/* Zoom Controls & Location Button */}
          <div className="absolute bottom-8 right-8 z-30 flex flex-col gap-2 items-end">
            <div className="flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700 overflow-hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoom(0.5);
                }}
                className="w-12 h-12 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition active:bg-slate-200 dark:active:bg-slate-700"
                title="Zoom In"
              >
                <Plus size={20} />
              </button>
              <div className="h-px bg-slate-200 w-full"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoom(-0.5);
                }}
                className="w-12 h-12 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition active:bg-slate-200 dark:active:bg-slate-700"
                title="Zoom Out"
              >
                <Minus size={20} />
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                resetView();
              }}
              className="w-12 h-12 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-110 transition active:scale-95"
              title="Reset View"
            >
              <RotateCcw size={18} />
            </button>

            {/* Center on Location Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                centerOnLocation();
              }}
              className={`w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center font-bold transition hover:scale-110 active:scale-95 border border-white/20 dark:border-slate-700 relative group ${
                locationStatus === "found"
                  ? "bg-blue-500 text-white shadow-blue-500/30"
                  : locationStatus === "locating"
                  ? "bg-white/90 dark:bg-slate-900/90 text-blue-500 animate-pulse"
                  : "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl text-slate-600 dark:text-slate-300"
              }`}
              title="Center on My Location"
            >
              <Crosshair
                size={20}
                className={locationStatus === "locating" ? "animate-spin" : ""}
              />
              <span className="absolute right-full mr-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Locate Me
              </span>
            </button>
          </div>

          {/* Interactive Map Layer Container (Leaflet) */}
          <div className="absolute inset-0 z-0 bg-slate-100 dark:bg-slate-900">
             <MapContainer
               center={[DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng]}
               zoom={13}
               style={{ height: "100%", width: "100%" }}
               zoomControl={false}
             >
                {/* Tile Layer Switch */}
               {mapType === 'satellite' ? (
                   <TileLayer
                    attribution='&copy; Google Maps'
                    url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
                   />
               ) : (
                   <TileLayer
                    attribution='&copy; Google Maps'
                    url="http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}"
                   />
               )}

               {/* Events Markers */}
               {events.map((event: any) => (
                   <Marker 
                     key={event.id}
                     position={[event.lat || DEFAULT_LOCATION.lat, event.lng || DEFAULT_LOCATION.lng]}
                     icon={L.divIcon({
                         className: "custom-marker-icon",
                         html: `<div class="w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-4 border-white ${getCategoryColor(event.category)} text-white transform hover:scale-110 transition-transform">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${getCategoryIcon(event.category).props.children}</svg>
                                </div>`,
                         iconSize: [40, 40],
                         iconAnchor: [20, 20]
                     })}
                     eventHandlers={{
                         click: () => setSelectedEventId(event.id)
                     }}
                   >
                     {selectedEventId === event.id && (
                        <Popup className="custom-popup" closeButton={false} offset={[0, -20]}>
                           <div className="w-64 p-0 overflow-hidden rounded-2xl group cursor-pointer" onClick={() => {
                               // Navigate to event
                           }}>
                               <div className="h-32 relative">
                                  <img src={event.imageUrl} className="w-full h-full object-cover" />
                                  <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-bold uppercase">{event.category}</div>
                               </div>
                               <div className="p-3">
                                  <h4 className="font-bold text-slate-800 text-sm mb-1">{event.title}</h4>
                                  <div className="flex justify-between items-center text-xs text-slate-500">
                                      <span>{new Date(event.date).toLocaleDateString()}</span>
                                      <span className="font-bold text-slate-900">{event.price}</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 mt-3">
                                     <Link to={`/event/${event.id}`} className="bg-slate-900 text-white text-center py-2 rounded-lg font-bold hover:bg-primary transition">View</Link>
                                     <button className="border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50">List</button>
                                  </div>
                               </div>
                           </div>
                        </Popup>
                     )}
                   </Marker>
               ))}
               
               {/* User Location */}
               {userLocation && (
                   <Marker 
                    position={[userLocation.lat, userLocation.lng]}
                    icon={L.divIcon({
                        className: "user-location-pulse",
                        html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>',
                        iconSize: [16, 16]
                    })}
                   />
               )}
             </MapContainer>
          </div>

          {/* Hint Overlay */}
          {viewState.scale === 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400 shadow-sm pointer-events-none flex items-center gap-2">
              <Move size={12} /> Drag to pan • Scroll to zoom
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

export default EventDiscovery;
