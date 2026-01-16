import React, { useState, useEffect } from "react";
import {
  Search,
  Menu,
  X,
  LayoutDashboard,
  Store,
  Bell,
  LogOut,
  Briefcase,
  FileText,
  Settings,
  CalendarCheck,
  MessageSquare,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, UserRole } from "../types";
import ThemeToggle from "./ThemeToggle";
import { useToast } from "./ToastContext";

// --- Animation Component ---
const LogoSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [particles, setParticles] = useState<
    {
      id: number;
      x: number;
      y: number;
      delay: number;
      size: number;
      color: string;
      rotation: number;
    }[]
  >([]);

  useEffect(() => {
    // Generate particles (Tiny stars)
    const colors = [
      "text-yellow-300",
      "text-amber-200",
      "text-white",
      "text-indigo-200",
      "text-orange-200",
    ];
    const newParticles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      // X spread: wider for the burst
      x: (Math.random() - 0.5) * window.innerWidth * 0.7,
      // Y drop distance: mostly down, increased for longer animation
      y: window.innerHeight * 0.6 + Math.random() * 400,
      delay: Math.random() * 1.5, // Increased delay spread for more staggering
      size: Math.random() * 8 + 3, // 3px to 11px
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360, // Random rotation target
    }));
    setParticles(newParticles);

    // Sequence
    const timers = [
      setTimeout(() => setStep(1), 50), // Zoom in Star
      setTimeout(() => setStep(2), 800), // Explode particles
      setTimeout(() => setStep(3), 1600), // Text reveal
      // Significantly extended fade out to allow users to see the slow fall
      setTimeout(() => setStep(4), 7500),
      setTimeout(onComplete, 8500), // Unmount & Navigate
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-1000 ${
        step === 4 ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative flex flex-col items-center justify-center h-full w-full overflow-hidden">
        {/* Central Shining Star */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) ${
            step >= 1 ? "scale-[1] opacity-100" : "scale-0 opacity-0"
          } ${step >= 3 ? "-translate-y-32" : "-translate-y-1/2"}`}
        >
          {" "}
          {/* Moves up when text appears */}
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="url(#starGradient)"
              className="w-48 h-48 drop-shadow-[0_0_80px_rgba(250,204,21,0.8)] animate-pulse-slow"
            >
              <defs>
                <linearGradient
                  id="starGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#fff" />
                  <stop offset="40%" stopColor="#fcd34d" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
            {/* Inner Shine */}
            <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full animate-pulse"></div>
            {/* Sparkle overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-full h-full bg-yellow-400/10 blur-3xl rounded-full animate-ping"
                style={{ animationDuration: "3s" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Particles Container */}
        {step >= 2 && (
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((p) => (
              <div
                key={p.id}
                className={`absolute ${p.color}`}
                style={
                  {
                    left: "50%",
                    top: "45%", // Start slightly higher than center so they fall past it
                    width: p.size,
                    height: p.size,
                    "--tx": `${p.x}px`,
                    "--ty": `${p.y}px`,
                    "--rot": `${p.rotation}deg`,
                    // Extremely slow animation: 12 seconds
                    animation: `particleFall 12s cubic-bezier(0.2, 0.6, 0.3, 1) forwards ${p.delay}s`,
                  } as React.CSSProperties
                }
              >
                {/* Use star shape for particles too */}
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-full h-full drop-shadow-md"
                >
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                </svg>
              </div>
            ))}
          </div>
        )}

        {/* Text Container */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 mt-20 flex flex-col items-center gap-6 transition-all duration-1000 transform ${
            step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
          }`}
        >
          <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-indigo-200 tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
            Eventide
          </h1>

          <div className="flex flex-col items-center gap-4">
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
            <p className="text-sm md:text-lg text-indigo-100 font-medium tracking-[0.3em] uppercase text-center max-w-lg leading-relaxed px-4 drop-shadow-lg">
              Connecting people through
              <br />
              shared experiences
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes particleFall {
          0% { 
            transform: translate(-50%, -50%) scale(0) rotate(0deg); 
            opacity: 0; 
          }
          10% { 
            opacity: 1; 
            transform: translate(calc(-50% + var(--tx) * 0.1), calc(-50% - 30px)) scale(1.2) rotate(45deg); 
          }
          100% { 
            transform: translate(calc(-50% + var(--tx)), var(--ty)) scale(0.5) rotate(var(--rot)); 
            opacity: 0; 
          }
        }
      `}</style>
    </div>
  );
};

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSplash, setShowSplash] = useState(false);
  const [spinning, setSpinning] = useState(false); // Easter Egg State

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync search input with URL params if we are on discovery page
  useEffect(() => {
    if (location.pathname === "/discovery") {
      const params = new URLSearchParams(location.search);
      const q = params.get("q");
      if (q !== null) setSearchQuery(q);
    } else {
      setSearchQuery("");
    }
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
    navigate("/");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setSearchQuery(newVal);

    // If already on discovery, live update the URL to trigger filter
    if (location.pathname === "/discovery") {
      navigate(`/discovery?q=${encodeURIComponent(newVal)}`, { replace: true });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.pathname !== "/discovery") {
      navigate(`/discovery?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Easter Egg: Rapid clicks (detail count >= 3) triggers spin instead of splash
    if (e.detail >= 3) {
      setSpinning(true);
      setTimeout(() => setSpinning(false), 1000); // 1s spin duration
    } else {
      // Trigger animation, navigation happens on complete
      setShowSplash(true);
    }
  };

  const navLinkClass = (path: string) =>
    `relative px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg group flex items-center gap-2 ${
      location.pathname === path
        ? "text-primary bg-indigo-50/80 dark:bg-indigo-900/30"
        : "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
    }`;

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case UserRole.VENDOR:
        return (
          <span className="bg-pink-100 text-pink-700 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border border-pink-200 ml-2">
            Vendor
          </span>
        );
      case UserRole.PLANNER:
        return (
          <span className="bg-purple-100 text-purple-700 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border border-purple-200 ml-2">
            Planner
          </span>
        );
      case UserRole.CLIENT:
        return (
          <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border border-blue-200 ml-2">
            Client
          </span>
        );
      default:
        return null;
    }
  };

  // Define navigation items per role
  const renderNavLinks = () => {
    if (!user) {
      return (
        <Link to="/" className={navLinkClass("/")}>
          Home
        </Link>
      );
    }

    const commonLinks = user.role === UserRole.CLIENT ? (
      <Link to="/marketplace" className={navLinkClass("/marketplace")}>
        <Store className="w-4 h-4" /> Marketplace
      </Link>
    ) : null;

    // Dashboard Links
    let dashboardLink = null;
    if (user.role === UserRole.CLIENT) {
      dashboardLink = (
        <Link
          to="/client/dashboard"
          className={navLinkClass("/client/dashboard")}
        >
          <LayoutDashboard className="w-4 h-4" /> My Planning
        </Link>
      );
    } else if (user.role === UserRole.VENDOR) {
      dashboardLink = (
        <Link
          to="/vendor/dashboard"
          className={navLinkClass("/vendor/dashboard")}
        >
          <Briefcase className="w-4 h-4" /> Vendor Dashboard
        </Link>
      );
    } else if (user.role === UserRole.PLANNER) {
      dashboardLink = (
        <Link
          to="/planner/dashboard"
          className={navLinkClass("/planner/dashboard")}
        >
          <FileText className="w-4 h-4" /> Planner Workspace
        </Link>
      );
    }

    return (
      <>
        {user.role === UserRole.CLIENT && (
          <Link to="/discovery" className={navLinkClass("/discovery")}>
            <Search className="w-4 h-4" /> Discovery
          </Link>
        )}
        {user.role === UserRole.CLIENT && (
          <Link to="/my-events" className={navLinkClass("/my-events")}>
            <CalendarCheck className="w-4 h-4" /> My Events
          </Link>
        )}
        {dashboardLink}
        {commonLinks}
        <Link to="/chat" className={navLinkClass("/chat")}>
           <MessageSquare className="w-4 h-4" /> Messages
        </Link>
      </>
    );
  };

  return (
    <>
      {showSplash && (
        <LogoSplash
          onComplete={() => {
            setShowSplash(false);
            navigate("/");
          }}
        />
      )}

      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent ${
          scrolled || isOpen
            ? "glass border-gray-200/50 dark:border-slate-800/50 shadow-sm dark:bg-slate-950/80"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link
              to="/"
              onClick={handleLogoClick}
              className="flex items-center gap-2 group flex-shrink-0 cursor-pointer select-none"
            >
              <div
                className={`w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-110 group-active:scale-95 duration-300 relative overflow-hidden ${
                  spinning ? "animate-barrel-roll" : ""
                }`}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 text-white relative z-10"
                >
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                  <circle cx="18.5" cy="5.5" r="1.5" className="opacity-70" />
                  <circle cx="5.5" cy="18.5" r="1" className="opacity-70" />
                </svg>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-none">
                    Eventide
                  </span>
                  {user && getRoleBadge()}
                </div>
              </div>
            </Link>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form
                onSubmit={handleSearchSubmit}
                className="relative w-full group"
              >
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search events..."
                  className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-full pl-10 pr-4 py-2 text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white transition-all"
                />
              </form>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {renderNavLinks()}
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              {user ? (
                <>
                  <div className="relative">
                    <button 
                      onClick={() => addToast("No new notifications", "info")}
                      className="relative p-2 text-slate-500 hover:text-primary transition-colors"
                    >
                      <Bell className="w-5 h-5" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
                    </button>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>

                  {/* User Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold overflow-hidden border border-slate-200 dark:border-slate-700">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{user.name.charAt(0)}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300 max-w-[100px] truncate">
                        {user.name.split(" ")[0]}
                      </span>
                    </button>

                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setUserMenuOpen(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-1 z-20 animate-fade-in-up">
                          <Link
                            to="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Settings size={16} /> Profile Settings
                          </Link>
                          {user.role === UserRole.CLIENT && (
                            <Link
                              to="/my-events"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                              <CalendarCheck size={16} /> My Events
                            </Link>
                          )}
                          <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                          >
                            <LogOut size={16} /> Sign Out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile toggle */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden glass dark:bg-slate-950/95 border-t border-gray-100 dark:border-slate-800 animate-fade-in-up">
            <div className="px-4 pt-4 pb-2">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search events..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-slate-900 dark:text-white"
                />
              </form>
            </div>
            <div className="px-4 pt-2 pb-6 space-y-2">
              {!user && (
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors"
                >
                  Home
                </Link>
              )}

              {/* Mobile Navigation Links */}
              {user && (
                <>
                  {user.role === UserRole.CLIENT && (
                    <Link
                      to="/discovery"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-slate-600 font-medium"
                    >
                      Discovery
                    </Link>
                  )}

                  {user.role === UserRole.CLIENT && (
                    <>
                      <Link
                        to="/my-events"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 text-slate-600 font-medium"
                      >
                        My Events
                      </Link>
                      <Link
                        to="/client/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors"
                      >
                        My Planning
                      </Link>
                    </>
                  )}
                  {user.role === UserRole.VENDOR && (
                    <Link
                      to="/vendor/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-slate-600 font-medium"
                    >
                      Vendor Dashboard
                    </Link>
                  )}
                  {user.role === UserRole.PLANNER && (
                    <Link
                      to="/planner/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-slate-600 font-medium"
                    >
                      Planner Workspace
                    </Link>
                  )}

                  {user.role === UserRole.CLIENT && (
                    <Link
                      to="/marketplace"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-slate-600 font-medium"
                    >
                      Marketplace
                    </Link>
                  )}

                  <Link
                    to="/chat"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-slate-600 font-medium"
                  >
                    Messages
                  </Link>

                  <Link
                    to="/chat"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-slate-600 font-medium"
                  >
                    Messages
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors"
                  >
                    <Settings size={16} /> Profile Settings
                  </Link>
                </>
              )}

              <div className="pt-4 mt-4 border-t border-gray-100">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3 rounded-xl font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-medium shadow-md transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
