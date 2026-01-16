import React, { useState } from "react";
import { X, Users, CheckCircle, Loader2 } from "lucide-react";
import { Backend } from "../services/backend";
import { useToast } from "./ToastContext";

interface CreatePlanModalProps {
  eventId: string;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: () => void;
}

const MOCK_FRIENDS = [
  { id: "f1", name: "Sarah", avatar: "https://ui-avatars.com/api/?name=Sarah" },
  { id: "f2", name: "Mike", avatar: "https://ui-avatars.com/api/?name=Mike" },
  { id: "f3", name: "Jessica", avatar: "https://ui-avatars.com/api/?name=Jessica" },
  { id: "f4", name: "David", avatar: "https://ui-avatars.com/api/?name=David" },
  { id: "f5", name: "Emily", avatar: "https://ui-avatars.com/api/?name=Emily" },
];

const CreatePlanModal: React.FC<CreatePlanModalProps> = ({
  eventId,
  eventName,
  isOpen,
  onClose,
  onPlanCreated,
}) => {
  const [planName, setPlanName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const toggleFriend = (id: string) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;

    setLoading(true);
    try {
      await Backend.API.createPlan({
        eventId,
        name: planName,
        friends: selectedFriends,
      });
      addToast("Plan created successfully!", "success");
      onPlanCreated();
      onClose();
    } catch (err) {
      addToast("Failed to create plan", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-3xl w-full max-w-md relative z-10 shadow-2xl animate-fade-in-up overflow-hidden">
        <div className="bg-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-xl">
              <Users size={24} />
            </div>
            <h2 className="text-xl font-bold">New Plan</h2>
          </div>
          <p className="text-white/70 text-sm">
            Coordinate with friends for <span className="text-white font-semibold">{eventName}</span>
          </p>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Plan Name
            </label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g. Birthday Bash, After Party..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Invite Friends
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
              {MOCK_FRIENDS.map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => toggleFriend(friend.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedFriends.includes(friend.id)
                      ? "border-primary bg-indigo-50"
                      : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium text-slate-900">
                      {friend.name}
                    </span>
                  </div>
                  {selectedFriends.includes(friend.id) && (
                    <CheckCircle size={18} className="text-primary fill-current" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !planName.trim()}
            className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Create Plan"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePlanModal;
