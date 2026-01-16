import React, { useEffect, useState, useMemo } from "react";
import {
  Layout,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  GripVertical,
  Briefcase,
  Package,
  Layers,
  Edit,
  Save,
  Trash2,
  Upload,
  Globe,
  MapPin,
  ShieldCheck,
  Star,
  Loader2,
  Kanban,
  Store,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useToast } from "./ToastContext";
import { Backend } from "../services/backend";
import { useNavigate } from "react-router-dom";
import { generateEventAdvice } from "../services/geminiService";
import { Vendor, Event } from "../types";

const PlannerDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "kanban" | "services" | "packages" | "profile" | "portfolio" | "events">("overview");
  const navigate = useNavigate();
  const { addToast } = useToast();

  // New Profile Features State
  const [services, setServices] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [myEvents, setMyEvents] = useState<Event[]>([]);

  const [editingProfile, setEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState<any>({});

  const [newService, setNewService] = useState({ title: "", description: "", price: "", pricingUnit: "fixed" });
  const [isAddingService, setIsAddingService] = useState(false);

  const [newPackage, setNewPackage] = useState({ name: "", description: "", price: "", features: "" });
  const [isAddingPackage, setIsAddingPackage] = useState(false);

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

  // New Project Form State
  const [newProject, setNewProject] = useState({
    name: "",
    client: "",
    date: "",
  });
  const [creating, setCreating] = useState(false);

  // Sorting & Selection State
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "date", direction: "asc" });
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);

  // AI Theme State
  const [aiThemes, setAiThemes] = useState<string | null>(null);
  const [loadingThemes, setLoadingThemes] = useState(false);

  // Kanban State
  const [kanbanTasks, setKanbanTasks] = useState([
    {
      id: "t1",
      title: "Finalize Venue Contract",
      project: "Summer Gala",
      status: "todo",
      priority: "high",
    },
    {
      id: "t2",
      title: "Tasting Session Menu",
      project: "Golden Jubilee",
      status: "in-progress",
      priority: "medium",
    },
    {
      id: "t3",
      title: "Send Deposit to DJ",
      project: "Summer Gala",
      status: "done",
      priority: "high",
    },
    {
      id: "t4",
      title: "Draft Floor Plan",
      project: "Tech Launch",
      status: "todo",
      priority: "low",
    },
  ]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  useEffect(() => {
    // Initial Fetch
    const fetchData = async () => {
      const [dashboardData, vendorList, allEvents] = await Promise.all([
        Backend.API.getPlannerDashboard(),
        Backend.API.getVendors(),
        Backend.API.getEvents()
      ]);
      setData(dashboardData);
      setAllVendors(vendorList);

      // Fetch Planner Specific Data
      const user = Backend.Auth.getSession();
      if (user) {
          setProfileData(user.providerProfile || {});
          
          const [serv, pkgs, port] = await Promise.all([
             Backend.API.Services.getServices(user.id),
             Backend.API.Packages.getPackages(user.id),
             Backend.API.Portfolio.getPortfolio(user.id),
          ]);
          setServices(serv);
          setPackages(pkgs);
          setPortfolio(port);

          // Filter my events
          setMyEvents(allEvents.filter((e: Event) => e.organizerId === user.id || e.plannerId === user.id));
      }

      setLoading(false);
    };
    fetchData();

    // Realtime Subscription
    const unsubscribe = Backend.API.subscribe("PLANNER", (updatedData) => {
      setData(updatedData);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await Backend.API.createProject(newProject);
      setShowNewProjectModal(false);
      setNewProject({ name: "", client: "", date: "" });
      // Data updates via subscription
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  // --- Sorting Logic ---
  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedProjects = useMemo(() => {
    if (!data?.projects) return [];

    return [...data.projects].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle Date Sorting
      if (sortConfig.key === "date") {
        // Mock date parsing (assuming "Mon DD" or ISO)
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
        // If invalid date (e.g. mock data "Dec 20"), try adding current year
        if (isNaN(aVal))
          aVal = new Date(`${a.date}, ${new Date().getFullYear()}`).getTime();
        if (isNaN(bVal))
          bVal = new Date(`${b.date}, ${new Date().getFullYear()}`).getTime();
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // --- AI Themes ---
  const generateThemes = async () => {
    if (!selectedProject) return;
    setLoadingThemes(true);
    setAiThemes(null);
    try {
      const prompt = `Suggest 3 creative and unique event themes for a project named "${selectedProject.name}" for client "${selectedProject.client}". Provide a short description for each. Format as a simple list.`;
      const response = await generateEventAdvice(prompt);
      setAiThemes(response);
    } catch (e) {
      setAiThemes("Could not generate themes at this time.");
    } finally {
      setLoadingThemes(false);
    }
  };

  // --- Vendor Suggestions ---
  const suggestedVendors = useMemo(() => {
    if (!selectedProject) return [];
    // Simple heuristic based on project name/category match
    const keywords = selectedProject.name.toLowerCase().split(" ");
    return allVendors
      .filter(
        (v) =>
          keywords.some(
            (k: string) =>
              v.category.toLowerCase().includes(k) ||
              v.name.toLowerCase().includes(k)
          ) || v.rating >= 4.8 // Or just show top rated
      )
      .slice(0, 3);
  }, [selectedProject, allVendors]);

  // --- Kanban DnD ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (
    e: React.DragEvent,
    targetStatus: string,
    targetIndex?: number
  ) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const taskToMove = kanbanTasks.find((t) => t.id === draggedTaskId);
    if (!taskToMove) return;

    // Remove from old position
    let newTasks = kanbanTasks.filter((t) => t.id !== draggedTaskId);

    // Update status
    const updatedTask = { ...taskToMove, status: targetStatus };

    // Insert at specific index or append
    if (targetIndex !== undefined) {
      // Find the correct insertion point within the filtered list of that status
      const statusTasks = newTasks.filter((t) => t.status === targetStatus);
      statusTasks.splice(targetIndex, 0, updatedTask);

      // Reconstruct full list
      const otherTasks = newTasks.filter((t) => t.status !== targetStatus);
      setKanbanTasks([...otherTasks, ...statusTasks]);
    } else {
      setKanbanTasks([...newTasks, updatedTask]);
    }

    setDraggedTaskId(null);
  };

  const getDaysLeft = (dateStr: string) => {
    let date = new Date(dateStr);
    if (isNaN(date.getTime()))
      date = new Date(`${dateStr}, ${new Date().getFullYear()}`);
    const diff = date.getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days;
  };

  // --- Handlers for New Features ---
  
  const handleAddService = async () => {
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

  const handleDeleteService = async (id: string) => {
      try {
           const user = Backend.Auth.getSession();
           if(user){
               await Backend.API.Services.deleteService(user.id, id);
               setServices(services.filter(s => s.id !== id));
               addToast("Service deleted", "success");
           }
      } catch(e){ addToast("Failed to delete", "error"); }
  };

  const handleAddPackage = async () => {
      if (!newPackage.name || !newPackage.price) {
          addToast("Please fill in required fields", "info");
          return;
      }
      setIsAddingPackage(true);
      try {
          const user = Backend.Auth.getSession();
          if (user) {
              const pkgItem = await Backend.API.Packages.addPackage(user.id, {
                  name: newPackage.name,
                  description: newPackage.description,
                  price: parseFloat(newPackage.price),
                  features: newPackage.features.split(',').map(f => f.trim()).filter(f => f)
              });
              setPackages([...packages, pkgItem]);
              setNewPackage({ name: "", description: "", price: "", features: "" });
              addToast("Package created successfully", "success");
          }
      } catch (e) {
           addToast("Failed to create package", "error");
      } finally {
          setIsAddingPackage(false);
      }
  };

  const handleDeletePackage = async (id: string) => {
    try {
        const user = Backend.Auth.getSession();
        if(user){
            await Backend.API.Packages.deletePackage(user.id, id);
            setPackages(packages.filter(p => p.id !== id));
            addToast("Package deleted", "success");
        }
   } catch(e){ addToast("Failed to delete", "error"); }
  };

  const handleUpdateProfile = async () => {
      setLoading(true);
      try {
           const user = Backend.Auth.getSession();
           if (user) {
               user.providerProfile = { ...user.providerProfile, ...tempProfile };
               localStorage.setItem("eventide_session", JSON.stringify(user));
               
               // Also update user in DB
               const users = JSON.parse(localStorage.getItem("eventide_users") || "[]");
               const idx = users.findIndex((u: any) => u.id === user.id);
               if (idx !== -1) {
                   users[idx] = user;
                   localStorage.setItem("eventide_users", JSON.stringify(users));
               }
               
               setProfileData(user.providerProfile);
               setEditingProfile(false);
               addToast("Agency profile updated", "success");
           }
      } catch (e) {
          addToast("Update failed", "error");
      } finally {
          setLoading(false);
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

  const handleCreateEvent = async () => {
      console.log("Attempting to create event from Planner...", newEvent);
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

  if (loading || !data) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto space-y-8 animate-fade-in-up relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Planner Workspace
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Managing{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {data.projects.length} active projects
            </span>
            .
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "overview"
                  ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("kanban")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "kanban"
                  ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Kanban size={16} /> Board
            </button>
            <button
               onClick={() => setActiveTab("services")}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                 activeTab === "services"
                   ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                   : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
               }`}
             >
               <Briefcase size={16} /> Services
             </button>
            <button
               onClick={() => setActiveTab("packages")}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                 activeTab === "packages"
                   ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                   : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
               }`}
             >
               <Package size={16} /> Packages
             </button>
             <button
               onClick={() => setActiveTab("portfolio")}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                 activeTab === "portfolio"
                   ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                   : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
               }`}
             >
               <Layers size={16} /> Portfolio
             </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === "profile"
                    ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Store size={16} /> Profile
              </button>
              <button
                onClick={() => setActiveTab("events")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === "events"
                    ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Calendar size={16} /> Events
              </button>
          </div>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="bg-primary text-white px-5 py-2 rounded-xl font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 flex items-center gap-2 active:scale-95"
          >
            <Plus size={18} /> New Project
          </button>
        </div>
      </div>

      {activeTab === "overview" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
          {/* Project List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Sorting Controls */}
            <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
              {["date", "client", "status", "progress"].map((key) => (
                <button
                  key={key}
                onClick={() => handleSort(key)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition border ${
                    sortConfig.key === key
                      ? "bg-white dark:bg-slate-800 border-primary text-primary shadow-sm"
                      : "bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {key}
                  {sortConfig.key === key &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowUp size={12} />
                    ) : (
                      <ArrowDown size={12} />
                    ))}
                </button>
              ))}
            </div>

            {data.projects.length === 0 && (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">
                  No active projects. Start a new one!
                </p>
              </div>
            )}

            {sortedProjects.map((project: any) => {
              const daysLeft = getDaysLeft(project.date);
              const isSelected = selectedProject?.id === project.id;

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-500/20"
                      : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-white dark:bg-indigo-900/50 text-primary"
                            : "bg-indigo-50 dark:bg-slate-700 text-primary"
                        }`}
                      >
                        <Layout size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {project.client}
                        </p>
                      </div>
                    </div>

                    {/* Deadline Badge */}
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                        daysLeft < 7
                          ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30"
                          : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-600"
                      }`}
                    >
                      <Clock size={12} />
                      {daysLeft < 0
                        ? "Overdue"
                        : daysLeft === 0
                        ? "Due Today"
                        : `${daysLeft} days left`}
                    </div>
                  </div>

                  <div className="mb-4 relative z-10">
                    <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200/50 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          project.status === "At Risk"
                            ? "bg-red-500"
                            : project.status === "Planning"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 relative z-10">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        project.status === "At Risk"
                          ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30"
                          : project.status === "Planning"
                          ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/30"
                          : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30"
                      }`}
                    >
                      {project.status}
                    </span>
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <img
                          key={i}
                          className="w-6 h-6 rounded-full border-2 border-white"
                          src={`https://ui-avatars.com/api/?name=${project.client.substring(
                            0,
                            2
                          )}+${i}&background=random`}
                          alt="Collaborator"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                      Due: {project.date}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar Details Panel */}
          <div className="space-y-6">
            {selectedProject ? (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl animate-fade-in-up sticky top-24">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      {selectedProject.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Project Details</p>
                  </div>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full dark:text-slate-400"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* AI Theme Generator */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Sparkles size={14} className="text-purple-500" /> AI
                      Themes
                    </h4>
                    <button
                      onClick={generateThemes}
                      disabled={loadingThemes}
                      className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-lg font-bold hover:bg-purple-100 transition"
                    >
                      {loadingThemes ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        "Generate"
                      )}
                    </button>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl text-sm text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 min-h-[80px]">
                    {aiThemes ? (
                      <div className="whitespace-pre-line leading-relaxed">
                        {aiThemes}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic text-xs">
                        Click generate to get theme ideas based on project
                        details.
                      </p>
                    )}
                  </div>
                </div>

                {/* Vendor Suggestions */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Store size={14} className="text-blue-500" /> Recommended
                    Vendors
                  </h4>
                  <div className="space-y-3">
                    {suggestedVendors.length > 0 ? (
                      suggestedVendors.map((vendor) => (
                        <div
                          key={vendor.id}
                          className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl hover:shadow-sm transition cursor-pointer"
                          onClick={() => navigate("/marketplace")}
                        >
                          <img
                            src={vendor.imageUrl}
                            className="w-10 h-10 rounded-lg object-cover"
                            alt={vendor.name}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {vendor.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {vendor.category} • {vendor.rating} ★
                            </p>
                          </div>
                          <ArrowRight size={14} className="text-slate-300" />
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        No specific recommendations found.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-xl">
                  <h3 className="font-bold text-lg mb-4">Daily Digest</h3>
                  <div className="space-y-4">
                    {data.alerts.map((alert: any) => (
                      <div key={alert.id} className="flex items-start gap-3">
                        {alert.type === "warning" ? (
                          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{alert.text}</p>
                          <span className="text-xs text-slate-400">
                            {alert.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm opacity-60 pointer-events-none">
                  <p className="text-center text-sm text-slate-400">
                    Select a project to see AI insights & suggestions.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : activeTab === "services" ? (
         <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in-up">
             <div className="flex justify-between items-center mb-8">
                 <div>
                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Agency Services</h2>
                     <p className="text-slate-500 dark:text-slate-400 text-sm">Define individual services offered by your agency.</p>
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
                         placeholder="Service Title (e.g. Venue Sourcing)" 
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
                           placeholder="Short description..."
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
      ) : activeTab === "packages" ? (
         <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in-up">
             <div className="flex justify-between items-center mb-8">
                 <div>
                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Event Packages</h2>
                     <p className="text-slate-500 dark:text-slate-400 text-sm">Bundle your services into attractive packages.</p>
                 </div>
             </div>
             
             {/* Add Package Form */}
             <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl mb-8 border border-slate-100 dark:border-slate-700">
                 <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                     <Plus size={20} className="text-primary" /> Create New Package
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Package Name</label>
                         <input 
                            value={newPackage.name}
                            onChange={(e) => setNewPackage({...newPackage, name: e.target.value})}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                            placeholder="e.g. Gold Wedding Package"
                         />
                     </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Starting Price (₹)</label>
                         <input 
                            type="number"
                            value={newPackage.price}
                            onChange={(e) => setNewPackage({...newPackage, price: e.target.value})}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                            placeholder="50000"
                         />
                     </div>
                      <div className="md:col-span-2">
                         <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Description</label>
                         <textarea 
                            value={newPackage.description}
                            onChange={(e) => setNewPackage({...newPackage, description: e.target.value})}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Describe what's included..."
                         />
                     </div>
                     <div className="md:col-span-2">
                         <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Features (Comma separated)</label>
                         <input 
                            value={newPackage.features}
                            onChange={(e) => setNewPackage({...newPackage, features: e.target.value})}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Full Coordination, Decor Setup, Vendor Management, Day-of Support"
                         />
                     </div>
                 </div>
                 <div className="flex justify-end mt-4">
                     <button 
                         onClick={handleAddPackage}
                         disabled={isAddingPackage}
                         className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-600 transition disabled:opacity-50"
                     >
                         {isAddingPackage ? <Loader2 className="animate-spin" /> : "Create Package"}
                     </button>
                 </div>
             </div>

             {/* Packages List */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {packages.length === 0 ? (
                     <div className="col-span-full text-center py-12 text-slate-400 italic">No packages available.</div>
                 ) : (
                     packages.map(pkg => (
                         <div key={pkg.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-6 rounded-3xl flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all">
                             <div className="flex justify-between items-start mb-4">
                                 <h4 className="font-bold text-xl text-slate-900 dark:text-white">{pkg.name}</h4>
                                 <button 
                                     onClick={() => handleDeletePackage(pkg.id)}
                                     className="text-slate-400 hover:text-red-500 transition"
                                 >
                                     <Trash2 size={16} />
                                 </button>
                             </div>
                             <div className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                                 ₹{pkg.price.toLocaleString()}
                             </div>
                             <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-grow">{pkg.description}</p>
                             <ul className="space-y-2 mb-6">
                                 {pkg.features.map((feature: string, idx: number) => (
                                     <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                         <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                         {feature}
                                     </li>
                                 ))}
                             </ul>
                             <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                                 Edit Details
                             </button>
                         </div>
                     ))
                 )}
             </div>
         </div>
      ) : activeTab === "portfolio" ? (
         <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in-up">
              <div className="flex justify-between items-center mb-8">
                  <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Past Events Portfolio</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Showcase your successful event executions.</p>
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
                          Your portfolio is empty. Upload photos of your events!
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
      ) : activeTab === "profile" ? (
         <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in-up">
                <div className="flex justify-between items-start mb-8">
                   <div>
                       <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Agency Profile</h2>
                       <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your agency details and public info.</p>
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
                                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Agency / Planner Name</label>
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
                                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Years of Experience</label>
                                 <input 
                                     type="number"
                                     className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border rounded-xl"
                                     value={tempProfile.yearsOfExperience || 1}
                                     onChange={(e) => setTempProfile({...tempProfile, yearsOfExperience: parseInt(e.target.value)})}
                                 />
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
                                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Agency Description</label>
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
                                      {profileData?.businessName || "Your Agency"}
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
                              <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wide mb-4">Agency Stats</h4>
                              <div className="space-y-4">
                                  <div className="flex justify-between">
                                      <span className="text-sm font-medium">Rating</span>
                                      <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                                          <Star size={14} className="fill-current" /> {profileData?.rating || "5.0"}
                                      </div>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-sm font-medium">Team Size</span>
                                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                          {profileData?.providerType === "AGENCY" ? "Multi-member" : "Solo Planner"}
                                      </span>
                                  </div>
                                   <div className="flex justify-between">
                                      <span className="text-sm font-medium">Experience</span>
                                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{profileData?.yearsOfExperience || 0} Years</span>
                                  </div>
                              </div>
                          </div>
                    </div>
                )}
           </div>
      ) : (
        <div
          className="flex gap-6 overflow-x-auto pb-6 animate-fade-in-up"
          style={{ minHeight: "600px" }}
        >
          {["todo", "in-progress", "done"].map((status) => {
            const statusTasks = kanbanTasks.filter((t) => t.status === status);

            return (
              <div
                key={status}
                className="min-w-[320px] flex-1"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status, statusTasks.length)} // Default drop at end of column
              >
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="font-bold text-slate-900 dark:text-white capitalize text-lg">
                    {status.replace("-", " ")}
                  </h3>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full text-xs font-bold">
                    {statusTasks.length}
                  </span>
                </div>

                <div className="bg-slate-50/50 dark:bg-slate-800/50 p-3 rounded-3xl min-h-[500px] border border-slate-100/50 dark:border-slate-700/50 space-y-3 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800">
                  {statusTasks.map((task, index) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDrop={(e) => {
                        e.stopPropagation(); // Stop bubbling to column drop
                        handleDrop(e, status, index);
                      }}
                      className={`bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 group hover:shadow-md transition cursor-grab active:cursor-grabbing relative ${
                        draggedTaskId === task.id ? "opacity-50" : ""
                      }`}
                    >
                      <div className="absolute top-4 right-4 text-slate-300 opacity-0 group-hover:opacity-100">
                        <GripVertical size={16} />
                      </div>
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                            task.priority === "high"
                              ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                              : task.priority === "medium"
                              ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                              : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1 pr-6">
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-400 mb-3">
                        {task.project}
                      </p>
                      <div className="flex -space-x-2">
                        <img
                          className="w-6 h-6 rounded-full border-2 border-white"
                          src="https://ui-avatars.com/api/?name=User+1&background=random"
                          alt=""
                        />
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 font-bold text-sm hover:border-primary hover:text-primary transition flex items-center justify-center gap-2">
                    <Plus size={16} /> Add Task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowNewProjectModal(false)}
          ></div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md relative z-10 shadow-2xl animate-fade-in-up">
            <button
              onClick={() => setShowNewProjectModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Start New Project
            </h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Project Name
                </label>
                <input
                  required
                  type="text"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g. Summer Gala 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Client Name
                </label>
                <input
                  required
                  type="text"
                  value={newProject.client}
                  onChange={(e) =>
                    setNewProject({ ...newProject, client: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Deadline
                </label>
                <input
                  required
                  type="date"
                  value={newProject.date}
                  onChange={(e) =>
                    setNewProject({ ...newProject, date: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-primary transition shadow-lg mt-4 flex justify-center"
              >
                {creating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Create Project"
                )}
              </button>
            </form>
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
                           className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-600 transition disabled:opacity-50"
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

export default PlannerDashboard;
