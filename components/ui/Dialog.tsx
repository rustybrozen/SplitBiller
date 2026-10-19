"use client";

import React, { ReactNode } from "react";
import { X } from "lucide-react";



export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  isDark: boolean;
}



export const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  isDark,
}: DialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={`rounded-none shadow-2xl w-full max-w-md z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 border-2 border-[#6482AD]/20 ${
          isDark ? "bg-neutral-900 border-neutral-800" : "bg-white"
        }`}
      >
        <div
          className={`p-4 px-6 flex justify-between items-center border-b border-[#6482AD]/10 ${
            isDark ? "bg-neutral-900" : "bg-white"
          }`}
        >
          <h3
            className={`text-xl font-bold uppercase tracking-widest ${
              isDark ? "text-white" : "text-[#6482AD]"
            }`}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#6482AD]/10 text-[#6482AD] transition rounded-none cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>

        {footer && (
          <div
            className={`p-4 border-t border-[#6482AD]/10 flex justify-end gap-2 ${
              isDark ? "bg-black/40" : "bg-[#F5EDED]/30"
            }`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
