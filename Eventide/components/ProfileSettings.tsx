import React, { useState, useEffect } from "react";
import { User } from "../types";
import { Backend } from "../services/backend";
import {
  Camera,
  Save,
  Loader2,
  User as UserIcon,
  Mail,
  Shield,
  CheckCircle,
  ZoomIn,
  ZoomOut,
  UploadCloud,
  Trash2,
  Wallet as WalletIcon
} from "lucide-react";
import Wallet from "./Wallet";

interface ProfileSettingsProps {
  onUpdateUser: (user: User) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onUpdateUser }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "wallet">("profile");

  // Form State
  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const fetchUser = async () => {
      const sessionUser = Backend.Auth.getSession();
      if (sessionUser) {
        setUser(sessionUser);
        setName(sessionUser.name);
        setAvatarPreview(sessionUser.avatar);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setZoomLevel(1); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSuccessMsg("");
    try {
      const updatedUser = await Backend.Auth.updateProfile(user.id, {
        name: name,
        avatar: avatarPreview,
      });
      setUser(updatedUser);
      onUpdateUser(updatedUser); 
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-24 text-center">User not found. Please log in.</div>
    );
  }

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-5xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
           <p className="text-slate-500 dark:text-slate-400">Manage your profile and preferences.</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
               onClick={() => setActiveTab("profile")}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "profile" ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
               <UserIcon size={16} /> Profile
            </button>
            <button
               onClick={() => setActiveTab("wallet")}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "wallet" ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
               <WalletIcon size={16} /> Vault
            </button>
        </div>
      </div>

      {activeTab === "wallet" ? (
          <Wallet user={user} />
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar / Profile Picture Editor */}
        <div className="md:col-span-1 space-y-6 animate-fade-in-up">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
            <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wide mb-4">
              Profile Photo
            </h3>

            {/* Circular Preview Container */}
            <div className="relative inline-block mb-6 group">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-lg relative bg-slate-100 mx-auto">
                <img
                  src={avatarPreview}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              </div>

              {/* Upload Overlay */}
              <label className="absolute bottom-0 right-1/2 translate-x-14 translate-y-2 bg-slate-900 text-white p-3 rounded-full cursor-pointer hover:bg-primary transition shadow-md group-hover:scale-110">
                <Camera size={18} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {/* Zoom Controls */}
            <div className="mb-6 px-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-bold uppercase">
                <span>Zoom</span>
                <span>{(zoomLevel * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <ZoomOut size={14} className="text-slate-400" />
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.1"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <ZoomIn size={14} className="text-slate-400" />
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between">
              <button
                className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition"
                title="Reset to default"
              >
                <Trash2 size={14} /> Remove
              </button>
              <label className="text-xs font-bold text-primary hover:text-indigo-700 flex items-center gap-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition cursor-pointer">
                <UploadCloud size={14} /> Upload New
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Role</span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full uppercase tracking-wider">
                {user.role}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Member since {new Date().getFullYear()}
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="md:col-span-2 animate-fade-in-up animation-delay-100">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                General Information
              </h3>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {successMsg && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-xl flex items-center gap-2 text-sm font-medium animate-fade-in-up border border-green-100 dark:border-green-900/30">
                  <CheckCircle size={18} /> {successMsg}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Display Name
                </label>
                <div className="relative group">
                  <UserIcon
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Read Only Fields */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {user.email ? "Email Address" : "Login ID"}
                </label>
                <div className="relative">
                  {user.email ? (
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                  ) : (
                    <Shield
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                  )}
                  <input
                    type="text"
                    value={user.email || user.loginId}
                    disabled
                    className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Contact support to update your primary identifier.
                </p>
              </div>

              <div className="pt-4 flex justify-end border-t border-slate-50 dark:border-slate-800 mt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary dark:hover:bg-indigo-700 transition shadow-lg disabled:opacity-70 hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default ProfileSettings;
