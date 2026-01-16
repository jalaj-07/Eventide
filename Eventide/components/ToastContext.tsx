import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-xl animate-fade-in-up transition-all transform hover:scale-105 ${
              toast.type === "success"
                ? "bg-white/95 border-green-100 text-green-800 shadow-green-900/5"
                : toast.type === "error"
                ? "bg-white/95 border-red-100 text-red-800 shadow-red-900/5"
                : "bg-slate-900/95 border-slate-700 text-white shadow-slate-900/20"
            }`}
            style={{ minWidth: "320px", maxWidth: "400px" }}
          >
            <div
              className={`flex-shrink-0 p-1 rounded-full ${
                toast.type === "success"
                  ? "bg-green-100"
                  : toast.type === "error"
                  ? "bg-red-100"
                  : "bg-slate-700"
              }`}
            >
              {toast.type === "success" && (
                <CheckCircle size={16} className="text-green-600" />
              )}
              {toast.type === "error" && (
                <AlertCircle size={16} className="text-red-600" />
              )}
              {toast.type === "info" && (
                <Info size={16} className="text-blue-400" />
              )}
            </div>
            <p className="text-sm font-semibold flex-grow leading-tight">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-40 hover:opacity-100 transition-opacity p-1"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};
