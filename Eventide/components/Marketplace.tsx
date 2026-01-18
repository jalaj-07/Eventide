import React, { useState, useEffect } from "react";
import { Vendor, UserRole } from "../types";
import {
  Star,
  ShieldCheck,
  Filter,
  ChevronDown,
  CheckCircle,
  Loader2,
  X,
  MapPin,
  Globe,
  Phone,
  Mail,
  Image,
  Calendar,
  Briefcase,
  Package,
} from "lucide-react";
import { useToast } from "./ToastContext";
import { Backend } from "../services/backend";
import { useNavigate } from "react-router-dom";

const Marketplace: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"vendors" | "services">("vendors");
  const [loading, setLoading] = useState(true);

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  // Interaction State
  const [contactingId, setContactingId] = useState<string | null>(null);
  const [contactedVendors, setContactedVendors] = useState<Set<string>>(
    new Set()
  );
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null); // For Modal

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const vendorList = await Backend.API.getVendors();
        setVendors(vendorList);
        
        // Fetch Services
        if (Backend.API.Services.getAllServices) {
            const servicesList = await Backend.API.Services.getAllServices();
            setAllServices(servicesList);
        }
      } catch (e) {
        console.error("Failed to load vendors", e);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();

    // Real-time Subscription
    const unsubscribe = Backend.API.subscribe("CLIENT", () => {
      console.log("Received real-time update: Refreshing vendors...");
      fetchVendors();
      addToast("Vendor list updated!", "info");
    });

    return () => {
        unsubscribe(); // API.subscribe returns the unsubscribe function directly
    };
  }, []);

  const handleContact = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); // Prevent modal opening if contact button clicked
    if (contactedVendors.has(id)) return;

    setContactingId(id);
    setTimeout(() => {
      setContactingId(null);
      setContactedVendors((prev) => new Set(prev).add(id));
      addToast(`Inquiry sent to ${name}!`, "success");
    }, 1500);
  };

  const handlePortfolioClick = (e: React.MouseEvent, vendor: Vendor) => {
    e.stopPropagation();
    setSelectedVendor(vendor);
  };

  // Filter Logic
  const filteredVendors = vendors.filter((v) => {
    if (selectedCategory !== "All" && v.category !== selectedCategory)
      return false;
    if (selectedPrice && v.priceRange !== selectedPrice) return false;
    if (selectedPrice && v.priceRange !== selectedPrice) return false;
    return true;
  });

  const filteredServices = allServices.filter(s => {
      // Find the vendor for this service to check category
      const vendor = vendors.find(v => v.id === s.providerId);
      if (selectedCategory !== "All") {
          // If we want to filter services by their vendor's category (or if service has category?)
          // Service doesn't have category in the interface currently, so use Vendor's.
          if (!vendor || vendor.category !== selectedCategory) return false;
      }
      return true;
  });

  // Modal Data State
  const [vendorReviews, setVendorReviews] = useState<any[]>([]);
  const [vendorPortfolio, setVendorPortfolio] = useState<any[]>([]);
  const [vendorServices, setVendorServices] = useState<any[]>([]); 
  const [vendorPackages, setVendorPackages] = useState<any[]>([]); // New State
  const [vendorEvents, setVendorEvents] = useState<any[]>([]); 
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (selectedVendor) {
        const fetchDetails = async () => {
            setLoadingDetails(true);
            
            // Initialize with defaults
            let reviews: any[] = [], portfolio: any[] = [], services: any[] = [], packages: any[] = [], allEvents: any[] = [];

            // 1. Fetch Reviews
            try {
                 reviews = await Backend.API.Reviews.getReviews(selectedVendor.id);
            } catch (e) {
                console.warn("Failed to fetch reviews", e);
            }

            // 2. Fetch Portfolio
            try {
                 portfolio = await Backend.API.Portfolio.getPortfolio(selectedVendor.id);
            } catch (e) {
                console.warn("Failed to fetch portfolio", e);
            }

            // 3. Fetch Services
            try {
                 services = await Backend.API.Services.getServices(selectedVendor.id);
            } catch (e) {
                console.warn("Failed to fetch services", e);
            }

            // 4. Fetch Packages
            try {
                if (Backend.API.Packages && Backend.API.Packages.getPackages) {
                    packages = await Backend.API.Packages.getPackages(selectedVendor.id);
                }
            } catch (e) {
                 console.warn("Failed to fetch packages", e);
            }

            // 5. Fetch Events
            try {
                allEvents = await Backend.API.getEvents();
            } catch (e) {
                console.warn("Failed to fetch events", e);
            }

            setVendorReviews(reviews || []);
            setVendorPortfolio(portfolio || []);
            setVendorServices(services || []);
            setVendorPackages(packages || []);
            
            // Filter events safely
            try {
                const relevantEvents = (allEvents || []).filter((e: any) => {
                    return e.organizerId == selectedVendor.id || e.providerId == selectedVendor.id;
                });
                setVendorEvents(relevantEvents);
            } catch (err) {
                console.warn("Error filtering events", err);
                setVendorEvents([]);
            }

            setLoadingDetails(false);
        };

        fetchDetails();

        // Increment View Count
        Backend.API.incrementVendorViews(selectedVendor.id).catch(err => console.error("Failed to increment views", err));
    }
  }, [selectedVendor]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }


  // Portfolio images - hardcoded safe list for demo (Fallback)
  const FALLBACK_PORTFOLIO = [
    "https://images.unsplash.com/photo-1519225421980-715cb0202128?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=500&q=80",
  ];

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
        {/* ... existing headers ... */}
        <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">
          The Eventide Network
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
          Find World-Class Vendors
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400">
          Connect with verified professionals. From{" "}
          <span className="text-slate-900 dark:text-white font-semibold">Guided Planning</span>{" "}
          to <span className="text-slate-900 dark:text-white font-semibold">DIY</span>{" "}
          execution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ... existing sidebar ... */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm sticky top-24 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </h3>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedPrice(null);
                }}
                className="text-xs text-primary font-medium cursor-pointer hover:underline"
              >
                Reset
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                  Service Type
                </label>
                <div className="space-y-3">
                  {[
                    "All",
                    "Planners",
                    "Catering",
                    "Photography",
                    "Decoration",
                    "Venues",
                    "Music",
                  ].map((type) => (
                    <label
                      key={type}
                      className="flex items-center space-x-3 cursor-pointer group"
                    >
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === type}
                          onChange={() => setSelectedCategory(type)}
                          className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:bg-primary checked:border-primary transition-colors"
                        />
                        <div className="absolute w-2.5 h-2.5 bg-white rounded-full left-1.5 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"></div>
                      </div>
                      <span
                        className={`text-sm group-hover:text-slate-900 dark:group-hover:text-white transition-colors ${
                          selectedCategory === type
                            ? "font-bold text-slate-900 dark:text-white"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                  Price Range
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["₹", "₹₹", "₹₹₹", "₹₹₹₹"].map((price) => (
                    <button
                      key={price}
                      onClick={() =>
                        setSelectedPrice(selectedPrice === price ? null : price)
                      }
                      className={`px-1 py-2 border rounded-lg text-sm font-medium transition focus:ring-2 focus:ring-primary focus:ring-opacity-50 ${
                        selectedPrice === price
                          ? "bg-primary text-white border-primary"
                          : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="lg:col-span-9">
          <div className="flex justify-between items-center mb-6 animate-fade-in-up">
            <p className="text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {viewMode === "vendors" ? filteredVendors.length : filteredServices.length}
              </span>{" "}
              top rated {viewMode === "vendors" ? "professionals" : "services"}
            </p>
            
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mr-4">
                <button 
                  onClick={() => setViewMode("vendors")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${viewMode === "vendors" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
                >
                    Vendors
                </button>
                <button 
                    onClick={() => setViewMode("services")}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition flex items-center gap-2 ${viewMode === "services" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
                >
                    Services
                </button>
            </div>

            <button className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
              Sort by: Recommended <ChevronDown size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {viewMode === "vendors" ? (
                <>
                    {filteredVendors.map((vendor, index) => (
                    <div
                        key={vendor.id}
                        onClick={() => setSelectedVendor(vendor)}
                        className="group bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up cursor-pointer"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="relative h-56 overflow-hidden rounded-2xl">
                        <img
                            src={vendor.imageUrl}
                            alt={vendor.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1 shadow-sm">
                            <Star
                            size={12}
                            className="fill-yellow-400 text-yellow-400"
                            />{" "}
                            {vendor.rating}
                        </div>
                        {vendor.verified && (
                            <div className="absolute bottom-3 left-3 bg-blue-600/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1 shadow-sm">
                            <ShieldCheck size={12} /> Verified Pro
                            </div>
                        )}
                        </div>

                        <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                            {vendor.name}
                            </h3>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">
                            {vendor.category} •{" "}
                            <span className="text-slate-400 dark:text-slate-500">{vendor.priceRange}</span>
                        </p>

                        <div className="flex gap-2 mb-3">
                            {(vendor.serviceCount || 0) > 0 && (
                                <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded font-medium">
                                    {vendor.serviceCount} Services
                                </span>
                            )}
                            {(vendor.eventCount || 0) > 0 && (
                                <span className="text-xs bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-2 py-1 rounded font-medium">
                                    {vendor.eventCount} Events
                                </span>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                            onClick={(e) => handlePortfolioClick(e, vendor)}
                            className="flex-1 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-95"
                            >
                            Portfolio
                            </button>
                            <button
                            onClick={(e) => handleContact(e, vendor.id, vendor.name)}
                            disabled={
                                contactedVendors.has(vendor.id) ||
                                contactingId === vendor.id
                            }
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:scale-100 ${
                                contactedVendors.has(vendor.id)
                                ? "bg-green-100 text-green-700 shadow-none cursor-default"
                                : "bg-slate-900 text-white hover:bg-primary"
                            }`}
                            >
                            {contactingId === vendor.id ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : contactedVendors.has(vendor.id) ? (
                                <>
                                <CheckCircle size={16} /> Sent
                                </>
                            ) : (
                                "Contact"
                            )}
                            </button>
                        </div>
                        </div>
                    </div>
                    ))}
                </>
            ) : (
                <>
                    {filteredServices.map((service, index) => {
                        const vendor = vendors.find(v => v.id === service.providerId);
                        return (
                            <div
                                key={service.id}
                                className="group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                            {service.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            {vendor && (
                                                <span 
                                                    onClick={() => setSelectedVendor(vendor)}
                                                    className="text-xs font-bold text-slate-500 hover:text-primary cursor-pointer flex items-center gap-1"
                                                >
                                                    <img src={vendor.imageUrl} className="w-4 h-4 rounded-full" alt="" />
                                                    {vendor.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg text-sm font-bold">
                                        ₹{service.price}
                                        {service.pricingUnit && service.pricingUnit !== 'fixed' && <span className="text-xs font-normal opacity-75">/{service.pricingUnit}</span>}
                                    </span>
                                </div>
                                
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
                                    {service.description}
                                </p>

                                <button
                                    onClick={(e) => {
                                        const vendorName = vendor ? vendor.name : "Vendor";
                                        handleContact(e, service.id, `${vendorName} about ${service.title}`);
                                    }}
                                    disabled={
                                        contactedVendors.has(service.id) ||
                                        contactingId === service.id
                                    }
                                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:scale-100 ${
                                        contactedVendors.has(service.id)
                                        ? "bg-green-100 text-green-700 shadow-none cursor-default"
                                        : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90"
                                    }`}
                                >
                                   {contactingId === service.id ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : contactedVendors.has(service.id) ? (
                                        <>
                                            <CheckCircle size={16} /> Inquiry Sent
                                        </>
                                    ) : (
                                        "Inquire Now"
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </>
            )}

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-secondary to-pink-600 rounded-3xl p-8 text-white flex flex-col justify-center items-center text-center relative overflow-hidden group animate-fade-in-up">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-3">Join as a Vendor</h3>
                <p className="mb-8 text-pink-100 text-sm leading-relaxed max-w-xs mx-auto">
                  Boost your business visibility and manage bookings
                  effortlessly with Eventide Pro.
                </p>
                <button
                  onClick={() =>
                    navigate("/login", {
                      state: { role: UserRole.VENDOR, mode: "signup" },
                    })
                  }
                  className="bg-white text-pink-600 px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-xl"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Portfolio Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setSelectedVendor(null)}
          ></div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl animate-fade-in-up">
            {/* Close Button */}
            <button
              onClick={() => setSelectedVendor(null)}
              className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition z-20 shadow-sm"
            >
              <X size={24} />
            </button>

            {/* Hero Header */}
            <div className="h-64 relative">
              <img
                src={selectedVendor.imageUrl}
                alt={selectedVendor.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-3xl font-extrabold mb-2">
                  {selectedVendor.name}
                </h2>
                <div className="flex items-center gap-4 text-sm font-medium opacity-90">
                  <span className="bg-primary px-2 py-0.5 rounded text-white font-bold uppercase text-xs tracking-wide">
                    {selectedVendor.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={16} /> Bangalore, India
                  </span>
                  <span className="flex items-center gap-1">
                    <Star
                      size={16}
                      className="text-yellow-400 fill-yellow-400"
                    />{" "}
                    {selectedVendor.rating} ({vendorReviews.length} Reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left: About & Portfolio */}
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    About
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    We are dedicated to making your special day unforgettable.
                    With over 5 years of experience in the industry,{" "}
                    {selectedVendor!.name} brings creativity, passion, and
                    attention to detail to every project. Whether it's an
                    intimate gathering or a grand celebration, we tailor our
                    services to your unique vision.
                  </p>
                </section>

                {/* Services Section */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Briefcase size={20} /> Services
                        </h3>
                    </div>
                     {loadingDetails ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-400" /></div>
                     ) : vendorServices.length === 0 ? (
                        <p className="text-slate-500 italic text-sm border-l-2 border-slate-200 pl-3">No specific services listed.</p>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vendorServices.map((service: any) => (
                                <div key={service.id} className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{service.title}</h4>
                                        <span className="font-extrabold text-primary bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg text-sm">
                                            ₹{service.price}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
                                        {service.description}
                                    </p>
                                    <button 
                                        onClick={(e) => handleContact(e, selectedVendor!.id, `${selectedVendor!.name} about ${service.title}`)}
                                        className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors flex items-center gap-1"
                                    >
                                        Inquire about this <CheckCircle size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                     )}
                </section>

                {/* Packages Section */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Package size={20} /> Packages
                         </h3>
                    </div>
                     {loadingDetails ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-400" /></div>
                     ) : vendorPackages.length === 0 ? (
                        <p className="text-slate-500 italic text-sm border-l-2 border-slate-200 pl-3">No packages available.</p>
                     ) : (
                         <div className="grid grid-cols-1 gap-4">
                            {vendorPackages.map((pkg: any) => (
                                <div key={pkg.id} className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 relative overflow-hidden group hover:shadow-md transition-all">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Package size={64} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-2">
                                           <h4 className="font-bold text-lg text-slate-900 dark:text-white">{pkg.name}</h4>
                                           <span className="bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-indigo-600 dark:text-indigo-400 font-bold text-sm shadow-sm">
                                               Starts at ₹{pkg.price}
                                           </span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                                            {pkg.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {pkg.features && pkg.features.split(',').map((feat: string, i: number) => (
                                                 <span key={i} className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                                     {feat.trim()}
                                                 </span>
                                            ))}
                                        </div>
                                         <button 
                                            onClick={(e) => handleContact(e, selectedVendor!.id, `Enquiry about ${pkg.name} Package`)}
                                            className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-sm"
                                        >
                                            Request Package
                                        </button>
                                    </div>
                                </div>
                            ))}
                         </div>
                     )}
                </section>

                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Image size={20} /> Portfolio
                        </h3>
                    </div>
                  
                  {loadingDetails ? (
                      <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {(vendorPortfolio.length > 0 ? vendorPortfolio : FALLBACK_PORTFOLIO).map((item: any, i) => (
                        <div
                            key={i}
                            className="rounded-xl overflow-hidden h-48 group relative"
                        >
                            <img
                            src={typeof item === 'string' ? item : item.mediaUrl}
                            alt={`Portfolio item ${i}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        ))}
                    </div>
                  )}
                </section>

                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Calendar size={20} /> Upcoming Events
                        </h3>
                    </div>



                     {loadingDetails ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-400" /></div>
                     ) : vendorEvents.length === 0 ? (
                        <p className="text-slate-500 italic text-sm border-l-2 border-slate-200 pl-3">This vendor has no upcoming public events.</p>
                     ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {vendorEvents.map(event => (
                                <div key={event.id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition cursor-pointer" onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/events?q=${event.title}`); // Navigate to event discovery
                                }}>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 line-clamp-1">{event.title}</h4>
                                    <p className="text-xs text-slate-500 mb-2">{new Date(event.date).toLocaleDateString()}</p>
                                    <div className="flex items-center gap-2 text-xs font-bold text-primary">
                                        View Event &rarr;
                                    </div>
                                </div>
                            ))}
                        </div>
                     )}
                </section>

                <section>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Client Reviews
                  </h3>
                   {loadingDetails ? (
                       <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-400" /></div>
                   ) : vendorReviews.length === 0 ? (
                       <p className="text-slate-500 italic">No reviews yet.</p>
                   ) : (
                      <div className="space-y-4">
                        {vendorReviews.map((review: any) => (
                          <div key={review.id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <img src={review.clientAvatar} alt={review.clientName} className="w-6 h-6 rounded-full" />
                              <span className="font-bold text-sm text-slate-900 dark:text-white">{review.clientName}</span>
                              <div className="flex text-yellow-400 ml-auto">
                                {[...Array(5)].map((_, idx) => (
                                  <Star
                                    key={idx}
                                    size={14}
                                    className={`fill-current ${idx < review.rating ? "text-yellow-400" : "text-slate-300 dark:text-slate-600"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              "{review.text}"
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                              {new Date(review.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                   )}
                </section>
              </div>

              {/* Right: Contact & Info */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm sticky top-0">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      Starting from
                    </span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedVendor!.priceRange === "₹"
                        ? "₹10,000"
                        : selectedVendor!.priceRange === "₹₹"
                        ? "₹25,000"
                        : "₹50,000+"}
                    </span>
                  </div>
                  <button
                    onClick={(e) =>
                      handleContact(e, selectedVendor!.id, selectedVendor!.name)
                    }
                    disabled={contactedVendors.has(selectedVendor!.id)}
                    className={`w-full py-3.5 rounded-xl font-bold shadow-lg transition-all mb-4 flex items-center justify-center gap-2 ${
                      contactedVendors.has(selectedVendor!.id)
                        ? "bg-green-100 text-green-700 cursor-default"
                        : "bg-slate-900 text-white hover:bg-primary"
                    }`}
                  >
                    {contactedVendors.has(selectedVendor!.id) ? (
                      <>
                        <CheckCircle size={18} /> Inquiry Sent
                      </>
                    ) : (
                      "Request Quote"
                    )}
                  </button>
                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                      <Globe size={16} className="text-primary" />{" "}
                      <span>www.website.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-primary" />{" "}
                      <span>+91 98765 43210</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-primary" />{" "}
                      <span>
                        contact@
                        {selectedVendor!.name.toLowerCase().replace(/\s/g, "")}
                        .com
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
