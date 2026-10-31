"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: "success" | "error" | "info") => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast],
  );

  const success = useCallback(
    (msg: string) => addToast(msg, "success"),
    [addToast],
  );
  const error = useCallback(
    (msg: string) => addToast(msg, "error"),
    [addToast],
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-lg border shadow-lg transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 text-sm",
              t.type === "success" &&
                "bg-white border-green-200 text-green-900 shadow-green-900/5",
              t.type === "error" &&
                "bg-white border-red-200 text-red-900 shadow-red-900/5",
              t.type === "info" &&
                "bg-white border-border text-charcoal-deep shadow-black/5",
            )}
          >
            <div className="flex items-center gap-2.5">
              {t.type === "success" && (
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              )}
              {t.type === "error" && (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              {t.type === "info" && (
                <Info className="w-4 h-4 text-accent shrink-0" />
              )}
              <span className="font-medium">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-muted hover:text-charcoal-deep p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
