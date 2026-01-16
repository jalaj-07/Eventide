import React, { useState, useEffect } from "react";
import { Event } from "../types";
import { X, Camera, Upload, Loader2, Save } from "lucide-react";

interface EditEventModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEvent: Partial<Event>) => Promise<void>;
}

const EditEventModal: React.FC<EditEventModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Event>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && event) {
      setFormData({ ...event });
    }
  }, [isOpen, event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save", error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-3xl w-full max-w-2xl relative z-10 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-20">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Edit Event
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload Field */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Event Cover Image
            </label>
            <div className="relative h-56 rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 group hover:border-primary transition-colors">
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <Camera size={32} />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <label className="cursor-pointer bg-white text-slate-900 px-5 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-slate-50 shadow-lg transform hover:scale-105 transition-all">
                  <Upload size={16} />{" "}
                  {formData.imageUrl ? "Replace Image" : "Upload Image"}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageFileChange}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                required
                placeholder="Event Title"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={
                  formData.date
                    ? new Date(formData.date).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location || ""}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              required
              placeholder="Venue Address"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium h-32"
              required
              placeholder="Describe your event..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Price
              </label>
              <input
                type="text"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                placeholder="e.g. ₹500 or Free"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium bg-white appearance-none cursor-pointer"
                >
                  <option value="Music">Music</option>
                  <option value="Tech">Tech</option>
                  <option value="Social">Social</option>
                  <option value="Wedding">Wedding</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-primary transition shadow-lg hover:shadow-primary/30 flex items-center gap-2 disabled:opacity-70"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}{" "}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventModal;
