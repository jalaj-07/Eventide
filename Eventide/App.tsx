import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard"; // Client Dashboard
import VendorDashboard from "./components/VendorDashboard";
import PlannerDashboard from "./components/PlannerDashboard";
import EventDiscovery from "./components/EventDiscovery";
import EventDetails from "./components/EventDetails";
import Marketplace from "./components/Marketplace";
import Login from "./components/Login";
import ProfileSettings from "./components/ProfileSettings";
import UserProfile from "./components/UserProfile";
import MyEvents from "./components/MyEvents";
import ChatSystem from "./components/ChatSystem";
import { generateEventAdvice } from "./services/geminiService";
import { Backend } from "./services/backend";
import {
  Send,
  X,
  Bot,
  Sparkles,
  ArrowRight,
  Map,
  Users as UsersIcon,
  CheckCircle,
  Mail,
  Phone,
  Globe,
  Star,
  ShieldCheck,
  Zap,
  Heart,
  Calendar as CalendarIcon,
  IndianRupee,
} from "lucide-react";
import { ChatMessage, UserRole, User } from "./types";
import { ToastProvider, useToast } from "./components/ToastContext";
import { ThemeProvider } from "./components/ThemeContext";
import confetti from "canvas-confetti";
import MailingList from "./components/MailingList";

// --- Utility Components ---

const RevealOnScroll: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update state based on intersection to allow reverse transition
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.15 } // Slightly increased threshold for smoother toggle
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-1000 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {children}
    </div>
  );
};

// --- Static Content Pages ---

const StaticPage = ({
  title,
  subtitle,
  content,
}: {
  title: string;
  subtitle?: string;
  content: React.ReactNode;
}) => (
  <div className="max-w-5xl min-h-screen px-4 pt-32 pb-20 mx-auto sm:px-6 lg:px-8 animate-fade-in-up">
    <div className="mb-12 text-center">
      <h1 className="mb-4 text-4xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
      {subtitle && <p className="text-xl text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
    <div className="p-8 bg-white dark:bg-slate-900 border shadow-sm rounded-3xl border-slate-100 dark:border-slate-800 transition-colors">
      <div className="prose prose-lg dark:prose-invert text-slate-600 dark:text-slate-300 max-w-none">{content}</div>
    </div>
  </div>
);

const PricingPage = () => (
  <StaticPage
    title="Simple, Transparent Pricing"
    subtitle="Choose the plan that fits your needs."
    content={
      <div className="grid gap-8 mt-8 md:grid-cols-3 not-prose">
        <div className="flex flex-col p-6 border rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="mb-2 text-xl font-bold dark:text-white">Client</h3>
          <div className="mb-4 text-3xl font-bold dark:text-white">₹0</div>
          <ul className="flex-grow mb-6 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex gap-2">
              <CheckCircle size={16} className="flex-shrink-0 text-green-500" />{" "}
              Discover Local Events
            </li>
            <li className="flex gap-2">
              <CheckCircle size={16} className="flex-shrink-0 text-green-500" />{" "}
              Create Private Plans
            </li>
            <li className="flex gap-2">
              <CheckCircle size={16} className="flex-shrink-0 text-green-500" />{" "}
              Basic Support
            </li>
          </ul>
          <button className="w-full py-2 font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-white transition-colors">
            Current Plan
          </button>
        </div>
        <div className="relative flex flex-col p-6 transform bg-white dark:bg-slate-900 border-2 shadow-xl rounded-2xl border-primary md:-translate-y-4">
          <div className="absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white rounded-tr-lg bg-primary rounded-bl-xl">
            POPULAR
          </div>
          <h3 className="mb-2 text-xl font-bold text-primary">Vendor Pro</h3>
          <div className="mb-4 text-3xl font-bold dark:text-white">
            ₹2,999
            <span className="text-sm font-normal text-slate-400">/mo</span>
          </div>
          <ul className="flex-grow mb-6 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex gap-2">
              <CheckCircle size={16} className="flex-shrink-0 text-green-500" />{" "}
              Unlimited Event Listings
            </li>
            <li className="flex gap-2">
              <CheckCircle size={16} className="flex-shrink-0 text-green-500" />{" "}
              Advanced Analytics
            </li>
            <li className="flex gap-2">
              <CheckCircle size={16} className="flex-shrink-0 text-green-500" />{" "}
              Priority Support
            </li>
            <li className="flex gap-2">
              <CheckCircle size={16} className="flex-shrink-0 text-green-500" />{" "}
              Verified Badge
            </li>
          </ul>
          <button className="w-full py-2 font-bold text-white bg-primary rounded-xl hover:bg-indigo-700">
            Start 14-Day Trial
          </button>
        </div>
        <div className="flex flex-col p-6 border rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="mb-2 text-xl font-bold dark:text-white">Planner Suite</h3>
          <div className="mb-4 text-3xl font-bold dark:text-white">
            ₹4,999
            <span className="text-sm font-normal text-slate-400">/mo</span>
          </div>
          <ul className="flex-grow mb-6 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex gap-2">
              <CheckCircle size={16} className="flex-shrink-0 text-green-500" />{" "}
              Multi-project Management
            </li>
            <li className="flex gap-2">
              <CheckCircle size={16} className="flex-shrink-0 text-green-500" />{" "}
              Client Portals
            </li>
            <li className="flex gap-2">
              <CheckCircle size={16} className="flex-shrink-0 text-green-500" />{" "}
              Team Collaboration
            </li>
          </ul>
          <button className="w-full py-2 font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-white transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    }
  />
);

const AboutPage = () => (
  <StaticPage
    title="About Eventide"
    subtitle="Bridging the gap between digital planning and real-world experiences."
    content={
      <div className="space-y-6 text-lg">
        <p>
          Eventide was founded with a singular mission: to bring people
          together. In an era where digital connectivity is at an all-time high,
          genuine social interaction often suffers from administrative friction.
          We are changing that.
        </p>

        <div className="grid gap-6 my-8 md:grid-cols-2 not-prose">
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <h4 className="mb-2 font-bold text-slate-900 dark:text-white">Our Vision</h4>
            <p className="text-sm dark:text-slate-300">
              To be the world's leading social discovery engine, making every
              event accessible and every plan effortless.
            </p>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <h4 className="mb-2 font-bold text-slate-900 dark:text-white">Our Values</h4>
            <p className="text-sm dark:text-slate-300">
              Community first, transparency in business, and innovation in
              design.
            </p>
          </div>
        </div>
        <p>
          Whether you are a solo explorer in a new city, a couple planning your
          dream wedding, or a vendor looking to grow your business, Eventide is
          built for you.
        </p>
      </div>
    }
  />
);

const CareersPage = () => (
  <StaticPage
    title="Join Our Team"
    subtitle="Build the future of social connectivity."
    content={
      <div className="py-12 text-center not-prose">
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-indigo-100 rounded-full text-primary">
          <Sparkles size={40} />
        </div>
        <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
          We are hiring!
        </h3>
        <p className="mb-8 text-slate-500 dark:text-slate-400">
          We are looking for passionate engineers, designers, and product
          managers.
        </p>
        <div className="flex flex-col max-w-md gap-4 mx-auto">
          {[
            "Senior Frontend Engineer",
            "Backend Developer (Node.js)",
            "Product Designer",
          ].map((role) => (
            <div
              key={role}
              className="flex items-center justify-between p-4 transition border cursor-pointer border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary bg-slate-50 dark:bg-slate-900 group"
            >
              <span className="font-bold transition-colors text-slate-700 dark:text-slate-300 group-hover:text-primary">
                {role}
              </span>
              <ArrowRight
                size={16}
                className="text-slate-400 group-hover:text-primary"
              />
            </div>
          ))}
        </div>
      </div>
    }
  />
);

const ContactPage = () => (
  <StaticPage
    title="Contact Us"
    subtitle="We'd love to hear from you."
    content={
      <div className="grid gap-12 md:grid-cols-2 not-prose">
        <div>
          <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
            Get in touch
          </h3>
          <p className="mb-6 text-slate-600 dark:text-slate-300">
            Have a question about the platform? Need support with your vendor
            account? Our team is here to help.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <Mail className="w-5 h-5 text-primary" />{" "}
              <span>support@eventide.com</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <Phone className="w-5 h-5 text-primary" />{" "}
              <span>+91 123 456 7890</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <Globe className="w-5 h-5 text-primary" />{" "}
              <span>Bangalore, India</span>
            </div>
          </div>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-bold text-slate-700 dark:text-slate-300">
              Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border outline-none border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:border-primary"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-bold text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border outline-none border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:border-primary"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-bold text-slate-700 dark:text-slate-300">
              Message
            </label>
            <textarea className="w-full h-32 px-4 py-2 border outline-none border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:border-primary"></textarea>
          </div>
          <button
            type="button"
            className="w-full py-3 font-bold text-white transition bg-slate-900 dark:bg-indigo-600 rounded-xl hover:bg-primary dark:hover:bg-indigo-700"
          >
            Send Message
          </button>
        </form>
      </div>
    }
  />
);

const LegalPage = ({ type }: { type: "privacy" | "terms" }) => (
  <StaticPage
    title={type === "privacy" ? "Privacy Policy" : "Terms of Service"}
    subtitle={`Last updated: ${new Date().toLocaleDateString()}`}
    content={
      <div className="space-y-4 text-sm">
        <p>
          <strong>1. Introduction</strong>
          <br />
          Welcome to Eventide. By accessing our platform, you agree to these
          terms...
        </p>
        <p>
          <strong>2. Data Collection</strong>
          <br />
          We collect data to provide better services to all our users...
        </p>
        <p>
          <strong>3. User Responsibilities</strong>
          <br />
          Users are responsible for maintaining the confidentiality of their
          account...
        </p>
        <p className="italic text-slate-400">
          This is a placeholder for the full legal document.
        </p>
      </div>
    }
  />
);

// --- Modern Landing Page ---

const LandingPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (heroRef.current) {
      const { left, top, width, height } =
        heroRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      setMousePosition({ x, y });
    }
  };

  return (
    <div className="overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* 1. Hero Section with Parallax Effect */}
      <div
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 bg-white dark:bg-slate-950 overflow-hidden min-h-[90vh] flex items-center transition-colors duration-500"
      >
        {/* Dynamic Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-pink-200/30 dark:bg-pink-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[40%] bg-violet-200/30 dark:bg-violet-500/10 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-[0.03] dark:opacity-[0.05] dark:invert"></div>
        </div>

        <div className="relative z-10 w-full px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Hero Text */}
            <div className="space-y-8 text-center lg:text-left animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 text-sm font-semibold border rounded-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Now Available in Jaipur
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                The Platform for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 dark:from-indigo-400 dark:via-violet-400 dark:to-pink-400">
                  Shared Moments
                </span>
              </h1>
              <p className="max-w-lg mx-auto text-xl leading-relaxed text-slate-500 dark:text-slate-400 lg:mx-0">
                Clients, Vendors, and Planners united in one ecosystem. From
                discovery to booking, we make every event seamless.
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-white transition-all transform bg-slate-900 dark:bg-white dark:text-slate-900 rounded-2xl hover:bg-primary dark:hover:bg-indigo-50 hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1"
                >
                  Start Planning <ArrowRight size={20} />
                </Link>
                <Link
                  to="/marketplace"
                  className="px-8 py-4 text-lg font-bold transition-all transform bg-white dark:bg-slate-900 border text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-1"
                >
                  Explore Vendors
                </Link>
              </div>

              <div className="flex items-center justify-center gap-6 pt-8 text-sm font-medium lg:justify-start text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" /> Free for
                  Clients
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-blue-500" /> Verified
                  Pros
                </span>
              </div>
            </div>

            {/* Hero Visual - Parallax Dashboard */}
            <div className="relative hidden lg:block perspective-1000">
              <div
                className="relative w-full aspect-[4/3] transition-transform duration-100 ease-out"
                style={{
                  transform: `rotateY(${mousePosition.x * 10}deg) rotateX(${
                    -mousePosition.y * 10
                  }deg)`,
                }}
              >
                {/* Main Card */}
                <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border-4 border-slate-900/5 dark:border-slate-800 overflow-hidden z-10">
                  <img
                    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1600"
                    alt="Dashboard"
                    className="object-cover w-full h-full opacity-90"
                  />
                  {/* Overlay UI Mockup */}
                  <div className="absolute inset-0 flex items-end p-8 bg-gradient-to-b from-transparent to-black/60">
                    <div className="text-white">
                      <p className="mb-2 text-sm font-bold tracking-wider uppercase opacity-80">
                        Upcoming Event
                      </p>
                      <h3 className="text-3xl font-bold">
                        Summer Music Festival
                      </h3>
                      <div className="flex items-center gap-4 mt-4">
                        <span className="px-3 py-1 text-sm font-bold rounded-lg bg-white/20 backdrop-blur-md">
                          Aug 24
                        </span>
                        <div className="flex -space-x-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="w-8 h-8 border-2 border-transparent rounded-full bg-white/30"
                            />
                          ))}
                          <span className="flex items-center justify-center w-8 h-8 text-xs font-bold bg-white rounded-full text-slate-900">
                            +42
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Element 1 - Top Right */}
                <div
                  className="absolute -top-12 -right-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl z-20 animate-pulse-slow max-w-[200px]"
                  style={{
                    transform: `translateZ(50px) translateX(${
                      -mousePosition.x * 20
                    }px)`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 text-green-600 bg-green-100 rounded-full">
                      <IndianRupee size={20} />
                    </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          Budget Saved
                        </p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          ₹45,000
                        </p>
                      </div>
                  </div>
                </div>

                {/* Floating Element 2 - Bottom Left */}
                <div
                  className="absolute -bottom-8 -left-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl z-20 max-w-[240px]"
                  style={{
                    transform: `translateZ(80px) translateX(${
                      mousePosition.x * 30
                    }px)`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://ui-avatars.com/api/?name=Sarah+P&background=random"
                      className="w-10 h-10 rounded-full"
                      alt=""
                    />
                      <div>
                        <p className="text-xs font-bold text-primary">
                          New Message
                        </p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                          "The venue is confirmed!"
                        </p>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 overflow-hidden bg-white border-y border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex w-full overflow-hidden whitespace-nowrap mask-image-linear-gradient">
          <div className="flex animate-marquee min-w-full shrink-0 items-center justify-around gap-12 pr-12">
            {[
              "TechCrunch",
              "Forbes",
              "EventWeekly",
              "The Verge",
              "Wired",
              "WedMeGood",
            ].map((brand, i) => (
              <span
                key={i}
                className="text-2xl font-extrabold transition-all duration-300 cursor-default select-none text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                {brand}
              </span>
            ))}
             {[
               "TechCrunch",
               "Forbes",
               "EventWeekly",
               "The Verge",
               "Wired",
               "WedMeGood",
             ].map((brand, i) => (
              <span
                key={`dup-${i}`}
                className="text-2xl font-extrabold transition-all duration-300 cursor-default select-none text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                {brand}
              </span>
            ))}
          </div>
          <div className="flex animate-marquee min-w-full shrink-0 items-center justify-around gap-12 pr-12">
             {[
               "TechCrunch",
               "Forbes",
               "EventWeekly",
               "The Verge",
               "Wired",
               "WedMeGood",
             ].map((brand, i) => (
              <span
                key={`cal-${i}`}
                className="text-2xl font-extrabold transition-all duration-300 cursor-default select-none text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                {brand}
              </span>
            ))}
             {[
               "TechCrunch",
               "Forbes",
               "EventWeekly",
               "The Verge",
               "Wired",
               "WedMeGood",
             ].map((brand, i) => (
              <span
                key={`cal-dup-${i}`}
                className="text-2xl font-extrabold transition-all duration-300 cursor-default select-none text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Bento Grid Features */}
      <div className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="max-w-2xl mx-auto mb-16 text-center">
            <h2 className="mb-4 text-3xl font-extrabold md:text-4xl text-slate-900 dark:text-white">
              Everything you need, in one place.
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              We've dismantled the silos between clients, vendors, and planners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Card 1: Large Span */}
            <RevealOnScroll className="md:col-span-2 row-span-1 bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="relative z-10 max-w-sm">
                <div className="flex items-center justify-center w-12 h-12 mb-6 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl text-primary dark:text-indigo-300">
                  <Sparkles size={24} />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                  AI-Powered Planning
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Stuck for ideas? Our Gemini-powered assistant generates
                  themes, schedules, and vendor recommendations instantly.
                </p>
              </div>
              <div className="absolute bottom-0 right-0 w-1/2 h-full transition-opacity opacity-0 bg-gradient-to-l from-indigo-50 dark:from-indigo-900/20 to-transparent group-hover:opacity-100"></div>
              <div className="absolute w-64 h-64 transition-all rounded-full -bottom-10 -right-10 bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20"></div>
            </RevealOnScroll>

            {/* Card 2: Vertical */}
            <RevealOnScroll className="md:col-span-1 row-span-2 bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 rounded-[2rem] p-8 shadow-xl text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center justify-center w-12 h-12 mb-6 bg-white/10 backdrop-blur-md rounded-2xl">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="mb-2 text-2xl font-bold">Verified Vendors</h3>
                <p className="mb-8 text-slate-400">
                  Access a curated marketplace of top-tier professionals.
                  Reviews, portfolios, and pricing upfront.
                </p>

                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 transition border bg-white/5 rounded-xl border-white/10 hover:bg-white/10"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500"></div>
                      <div className="w-20 h-2 rounded-full bg-white/20"></div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealOnScroll>

            {/* Card 3 */}
            <RevealOnScroll className="md:col-span-1 bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 group hover:border-primary/30 transition-all">
              <div className="flex items-center justify-center w-12 h-12 mb-6 text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-300 rounded-2xl">
                <Heart size={24} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                Social Discovery
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Find events near you and see where your friends are going.
              </p>
            </RevealOnScroll>

            {/* Card 4 */}
            <RevealOnScroll className="md:col-span-1 bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 group hover:border-blue-300 transition-all">
              <div className="flex items-center justify-center w-12 h-12 mb-6 text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 rounded-2xl">
                <Zap size={24} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                Real-time Collaboration
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Chat, share files, and update timelines instantly.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </div>

      {/* 4. Interactive "How it Works" */}
      <div className="relative py-24 overflow-hidden bg-white dark:bg-slate-950 transition-colors">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="mb-16">
            <span className="text-sm font-bold tracking-wider uppercase text-primary">
              The Journey
            </span>
            <h2 className="mt-2 text-4xl font-extrabold text-slate-900 dark:text-white">
              From Idea to Reality
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                icon: Map,
                title: "Discover",
                desc: "Browse events or start a private project.",
                color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
              },
              {
                icon: UsersIcon,
                title: "Connect",
                desc: "Find vendors or invite guests easily.",
                color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
              },
              {
                icon: CalendarIcon,
                title: "Plan",
                desc: "Use our tools to manage budget & time.",
                color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300",
              },
              {
                icon: Star,
                title: "Experience",
                desc: "Enjoy the moment, we handle the rest.",
                color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300",
              },
            ].map((step, idx) => (
              <RevealOnScroll key={idx} className="cursor-default group">
                <div className="relative h-full pl-8 transition-colors duration-500 border-l-2 md:pl-0 md:pt-8 md:border-l-0 md:border-t-2 border-slate-100 dark:border-slate-800 group-hover:border-primary">
                  <span className="absolute -left-[9px] md:-top-[9px] md:left-0 w-4 h-4 rounded-full bg-white dark:bg-slate-950 border-4 border-slate-200 dark:border-slate-800 group-hover:border-primary transition-colors"></span>

                  <div
                    className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}
                  >
                    <step.icon size={24} />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="leading-relaxed text-slate-500 dark:text-slate-400">{step.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>

      {/* 5. CTA Section */}
      <div className="px-4 py-24 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-6xl mx-auto bg-slate-900 dark:bg-slate-900/50 dark:border dark:border-slate-800 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
          {/* Abstract Shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500 rounded-full blur-[100px] opacity-30"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="mb-8 text-4xl font-extrabold leading-tight text-white md:text-6xl">
              Ready to create <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
                unforgettable memories?
              </span>
            </h2>
            <p className="mb-12 text-xl text-slate-400">
              Join thousands of planners, vendors, and party-goers on Eventide
              today.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/login"
                className="px-10 py-4 text-lg font-bold transition-all bg-white rounded-full shadow-lg text-slate-900 hover:bg-slate-100 hover:scale-105 shadow-white/10"
              >
                Get Started Free
              </Link>
              <Link
                to="/contact"
                className="px-10 py-4 text-lg font-bold text-white transition-all bg-transparent border rounded-full border-slate-700 hover:bg-slate-800"
              >
                Contact Sales
              </Link>
            </div>
            <div className="mt-16">
                 <MailingList />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Assistant Component
const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "0",
      sender: "ai",
      text: "Hi! I'm Eventide AI. Need help planning your next big event?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    // Call Gemini Service
    const aiResponseText = await generateEventAdvice(userMsg.text);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: "ai",
      text: aiResponseText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);
  }, [inputValue]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 p-4 rounded-full bg-slate-900 text-white shadow-2xl hover:scale-110 transition-transform z-40 group ${
          isOpen ? "hidden" : "block"
        }`}
      >
        <div className="absolute inset-0 rounded-full opacity-0 bg-primary group-hover:opacity-20 animate-ping"></div>
        <Bot size={28} />
      </button>

      {isOpen && (
        <div className="fixed bottom-8 right-8 w-72 h-[400px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-50 flex flex-col border border-slate-100 dark:border-slate-800 overflow-hidden animate-fade-in-up ring-1 ring-slate-900/5 dark:ring-slate-100/10">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 text-white shadow-md bg-slate-900 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm">
                <Sparkles size={16} className="text-yellow-400" />
              </div>
              <div>
                <span className="block text-sm font-bold">Eventide AI</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>{" "}
                  Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center p-2 text-white transition rounded-full bg-white/10 hover:bg-white/20"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 space-y-4 overflow-y-auto bg-slate-50 dark:bg-slate-950">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "ai" && (
                  <div className="w-6 h-6 rounded-full bg-slate-900 flex-shrink-0 flex items-center justify-center text-white text-[10px] mr-2 mt-1">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-xs shadow-sm ${
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-slate-900 flex-shrink-0 flex items-center justify-center text-white text-[10px] mr-2 mt-1">
                  AI
                </div>
                <div className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-slate-800 border rounded-tl-none shadow-sm rounded-2xl border-slate-100 dark:border-slate-700">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask for ideas..."
                className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-full pl-4 pr-10 py-2.5 text-xs focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-700 transition-all outline-none text-slate-700 dark:text-white"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-primary text-white p-1.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
              >
                <Send size={14} />
              </button>
            </div>
            <div className="text-center mt-1.5">
              <span className="text-[9px] text-slate-400">
                Powered by Gemini AI
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Main App Controller
const AppController = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Initialize Backend & Restore Session via Firebase Listener
  useEffect(() => {
    Backend.init(); // Keep init for other mock data if needed (events/vendors)
    
    // Subscribe to Auth Changes
    Backend.Auth.onAuthStateChanged((user) => {
        setUser(user);
    });
  }, []);

  // Easter Egg: Global Konami Code Listener
  useEffect(() => {
    const keys: string[] = [];
    const konamiCode = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      keys.push(e.key);
      // Keep only the last N keys
      keys.splice(-konamiCode.length - 1, keys.length - konamiCode.length);

      if (keys.join("").includes(konamiCode.join(""))) {
        addToast("🎮 Cheat Code Activated: PARTY MODE!", "success");

        // Trigger massive confetti
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = {
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 9999,
        };

        const randomInRange = (min: number, max: number) =>
          Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);

          // Since particles fall down, start a bit higher than random
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          });
        }, 250);

        // Clear keys to prevent multi-trigger without re-typing
        keys.length = 0;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addToast]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    // Redirect based on role
    switch (loggedInUser.role) {
      case UserRole.CLIENT:
        navigate("/client/dashboard");
        break;
      case UserRole.VENDOR:
        navigate("/vendor/dashboard");
        break;
      case UserRole.PLANNER:
        navigate("/planner/dashboard");
        break;
    }
  };

  const handleLogout = async () => {
    await Backend.Auth.logout();
    setUser(null);
    navigate("/");
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser); // Triggers re-render and updates navbar
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 selection:bg-primary selection:text-white">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/marketplace"
            element={user ? <Marketplace /> : <Navigate to="/login" />}
          />
          <Route
            path="/discovery"
            element={user ? <EventDiscovery /> : <Navigate to="/login" />}
          />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route
             path="/chat"
             element={user ? <ChatSystem /> : <Navigate to="/login" />}
           />

          {/* Static Pages */}
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />

          {/* Protected Client Routes */}
          <Route
            path="/client/dashboard"
            element={
              user?.role === UserRole.CLIENT ? (
                <Dashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/my-events"
            element={
              user?.role === UserRole.CLIENT ? (
                <MyEvents />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Protected Vendor Routes */}
          <Route
            path="/vendor/dashboard"
            element={
              user?.role === UserRole.VENDOR ? (
                <VendorDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Protected Planner Routes */}
          <Route
            path="/planner/dashboard"
            element={
              user?.role === UserRole.PLANNER ? (
                <PlannerDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Profile Settings */}
          <Route
            path="/profile"
            element={
              user ? (
                <ProfileSettings onUpdateUser={handleUserUpdate} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Public User Profile */}
          <Route path="/profile/:id" element={<UserProfile />} />
        </Routes>
      </div>

      <AIAssistant />

      {/* Footer */}
      <footer className="py-12 mt-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 md:grid-cols-2">
            <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-white"
                >
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                  <circle cx="18.5" cy="5.5" r="1.5" className="opacity-70" />
                  <circle cx="5.5" cy="18.5" r="1" className="opacity-70" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">Eventide</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Connecting people through shared experiences.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-slate-900 dark:text-white">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/discovery" className="hover:text-primary">
                  Discovery
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-primary">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-primary">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-slate-900 dark:text-white">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/about" className="hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-primary">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-slate-900 dark:text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/privacy" className="hover:text-primary">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="px-6 pt-8 mx-auto text-sm text-center border-t max-w-7xl text-slate-400 border-slate-100 dark:border-slate-800">
          <p>© 2023 Eventide Platform. All rights reserved.</p>
        </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
      <Router>
        <ThemeProvider>
          <ToastProvider>
            <AppController />
          </ToastProvider>
        </ThemeProvider>
      </Router>
  );
};

export default App;
