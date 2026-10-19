"use client";

import React, { ButtonHTMLAttributes, ReactNode } from "react";



export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "warning" | "success";
  className?: string;
  isDark?: boolean;
}



export const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  isDark = false,
  ...props
}: ButtonProps) => {
  const baseStyle =
    "px-4 py-2 rounded-none font-medium transition-all duration-200 active:translate-y-[1px] flex items-center justify-center gap-2 uppercase tracking-wide text-xs border font-sans cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#6482AD] text-white border-[#6482AD] hover:bg-[#506b8f] hover:border-[#506b8f]",
    secondary: isDark
      ? "bg-neutral-800 text-neutral-200 border-neutral-800 hover:bg-neutral-700"
      : "bg-[#E2DAD6] text-[#6482AD] border-[#E2DAD6] hover:bg-[#d4c3bd]",
    outline: isDark
      ? "bg-transparent border-[#6482AD] text-[#6482AD] hover:bg-[#6482AD]/20"
      : "bg-transparent border-[#6482AD] text-[#6482AD] hover:bg-[#6482AD]/5",
    ghost: isDark
      ? "bg-transparent border-transparent text-neutral-400 hover:bg-neutral-800 hover:text-white"
      : "bg-transparent border-transparent text-[#6482AD]/70 hover:bg-[#6482AD]/10 hover:text-[#6482AD]",
    danger: isDark
      ? "bg-red-900/20 text-red-400 border-red-900/30 hover:bg-red-900/40"
      : "bg-red-50 text-red-500 border-red-100 hover:bg-red-100",
    warning: "bg-amber-500 text-white border-amber-500 hover:bg-amber-600",
    success: isDark
      ? "bg-white text-black border-white hover:bg-neutral-200"
      : "bg-[#2C3E50] text-white border-[#2C3E50] hover:bg-[#1a252f]",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
