"use client";

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToast, type ToastType } from "@/context/ToastContext";

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />,
  error:   <AlertCircle size={16} className="text-red-500 flex-shrink-0" />,
  warning: <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />,
  info:    <Info size={16} className="text-indigo-500 flex-shrink-0" />,
};

const BORDER: Record<ToastType, string> = {
  success: "border-emerald-200",
  error:   "border-red-200",
  warning: "border-amber-200",
  info:    "border-indigo-200",
};

export default function Toaster() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 bg-white border ${BORDER[t.type]} rounded-xl shadow-lg px-4 py-3 pointer-events-auto
                      animate-in slide-in-from-right-4 fade-in duration-200`}
        >
          {ICONS[t.type]}
          <p className="text-sm text-slate-700 flex-1 leading-snug">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
