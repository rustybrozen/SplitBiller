"use client";

import React, { InputHTMLAttributes } from "react";



export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hasError?: boolean;
  isDark?: boolean;
  hint?: string;
}



export const Input = ({
  label,
  hasError = false,
  isDark = false,
  hint,
  className = "",
  ...props
}: InputProps) => {
  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label
          className={`text-xs font-bold uppercase tracking-wider ml-1 transition-colors ${
            hasError ? "text-red-500" : isDark ? "text-neutral-400" : "text-[#6482AD]"
          }`}
        >
          {label}
        </label>
      )}

      <input
        className={`w-full rounded-none px-4 py-3 outline-none border-b-2 transition-all font-sans ${
          hasError
            ? "border-red-500 bg-red-50/10 placeholder:text-red-300"
            : isDark
            ? "bg-neutral-800 text-white border-transparent focus:border-[#6482AD] placeholder:text-neutral-600"
            : "bg-[#F5EDED] text-[#2C3E50] border-transparent focus:border-[#6482AD] placeholder:text-gray-400"
        } ${className}`}
        {...props}
      />

      {hint && <span className="text-[10px] text-gray-400 ml-1 italic">{hint}</span>}
    </div>
  );
};
