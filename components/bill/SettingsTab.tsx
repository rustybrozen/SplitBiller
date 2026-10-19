"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Input } from "@/components/ui/Input";
import { VIET_QR_BANKS } from "@/constants/banks";
import { Settings, Check, CreditCard, Sun, Moon } from "lucide-react";



export const SettingsTab = () => {
  const { members, settings, setSettings, t, isDark } = useApp();

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-4">
      <div
        className={`p-6 shadow-lg border rounded-none space-y-6 ${
          isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-[#6482AD]/10"
        }`}
      >
        <h2
          className={`text-xl font-bold uppercase tracking-widest border-b pb-2 flex items-center gap-2 ${
            isDark ? "text-white border-neutral-800" : "text-[#2C3E50] border-gray-100"
          }`}
        >
          <Settings size={20} /> {t.settingTitle}
        </h2>

        <div className="space-y-4">
          <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider block">
            {t.roundingSetting}
          </label>
          <div className="space-y-2">
            <div
              onClick={() => setSettings((prev) => ({ ...prev, roundingMode: "none" }))}
              className={`p-3 border cursor-pointer transition-all flex justify-between items-center ${
                settings.roundingMode === "none"
                  ? isDark
                    ? "border-[#6482AD] bg-neutral-800"
                    : "border-[#6482AD] bg-blue-50"
                  : isDark
                  ? "border-neutral-700"
                  : "border-gray-200"
              }`}
            >
              <div>
                <div className={`font-bold text-sm ${isDark ? "text-white" : "text-[#2C3E50]"}`}>
                  {t.roundingNone}
                </div>
                <div className="text-[10px] text-gray-400">{t.roundingNoneDesc}</div>
              </div>
              {settings.roundingMode === "none" && <Check size={16} className="text-[#6482AD]" />}
            </div>

            <div
              onClick={() => setSettings((prev) => ({ ...prev, roundingMode: "smart" }))}
              className={`p-3 border cursor-pointer transition-all flex justify-between items-center ${
                settings.roundingMode === "smart"
                  ? isDark
                    ? "border-[#6482AD] bg-neutral-800"
                    : "border-[#6482AD] bg-blue-50"
                  : isDark
                  ? "border-neutral-700"
                  : "border-gray-200"
              }`}
            >
              <div>
                <div className={`font-bold text-sm ${isDark ? "text-white" : "text-[#2C3E50]"}`}>
                  {t.smart}
                </div>
                <div className="text-[10px] text-gray-400">{t.roundingSmartDesc}</div>
              </div>
              {settings.roundingMode === "smart" && <Check size={16} className="text-[#6482AD]" />}
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-[#6482AD]/10 pt-4">
          <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider block">
            {t.simplifyDebts}
          </label>
          <div
            onClick={() => setSettings((prev) => ({ ...prev, simplifyDebts: !prev.simplifyDebts }))}
            className={`p-3 border cursor-pointer transition-all flex justify-between items-center ${
              isDark ? "border-neutral-700" : "border-gray-200"
            } ${settings.simplifyDebts ? (isDark ? "bg-neutral-800" : "bg-blue-50") : ""}`}
          >
            <div className="flex-1 pr-4">
              <div className={`font-bold text-sm ${isDark ? "text-white" : "text-[#2C3E50]"}`}>
                {t.simplifyDebts}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">{t.simplifyDebtsDesc}</div>
            </div>

            <div
              className={`w-10 h-5 rounded-full relative transition-colors ${
                settings.simplifyDebts ? "bg-[#6482AD]" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${
                  settings.simplifyDebts ? "left-6" : "left-1"
                }`}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-[#6482AD]/10 pt-4">
          <h3 className="text-sm font-bold text-[#6482AD] uppercase tracking-wider flex items-center gap-2">
            <CreditCard size={16} /> {t.bankSettings}
          </h3>

          <div
            className={`p-3 border rounded-none mb-2 ${
              isDark ? "bg-amber-950/20 border-amber-800/40" : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              {t.whoAmI}
            </label>
            <select
              className={`w-full bg-transparent font-bold outline-none cursor-pointer ${
                isDark ? "text-white" : "text-[#2C3E50]"
              }`}
              value={settings.myId || ""}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  myId: e.target.value ? parseInt(e.target.value, 10) : undefined,
                }))
              }
            >
              <option value="">-- Chọn tên của bạn --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id} className={isDark ? "bg-neutral-900" : "bg-white"}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
              {t.bankName}
            </label>
            <select
              className={`w-full p-2 border text-sm outline-none cursor-pointer ${
                isDark
                  ? "bg-neutral-800 border-neutral-700 text-white"
                  : "bg-white border-gray-200 text-[#2C3E50]"
              }`}
              value={settings.bankBin}
              onChange={(e) => setSettings((prev) => ({ ...prev, bankBin: e.target.value }))}
            >
              <option value="">Chọn ngân hàng</option>
              {VIET_QR_BANKS.map((b) => (
                <option
                  key={b.bin}
                  value={b.bin}
                  className={isDark ? "bg-neutral-900" : "bg-white"}
                >
                  ({b.shortName}) {b.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label={t.bankAccount}
            value={settings.bankAccountNo}
            onChange={(e) => setSettings((prev) => ({ ...prev, bankAccountNo: e.target.value }))}
            placeholder="0123456789"
            isDark={isDark}
          />

          <Input
            label={t.bankOwner}
            value={settings.bankAccountName}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, bankAccountName: e.target.value.toUpperCase() }))
            }
            placeholder="NGUYEN VAN A"
            isDark={isDark}
          />
        </div>

        <div className="space-y-4 border-t border-[#6482AD]/10 pt-4">
          <div>
            <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider block">
              {t.defaultAppSetting}
            </label>
            <p className="text-[10px] text-gray-400 mt-0.5">{t.defaultAppDesc}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSettings((prev) => ({ ...prev, defaultApp: "split" }))}
              className={`flex-1 p-3 border text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
                settings.defaultApp !== "debt"
                  ? "bg-[#6482AD] text-white border-[#6482AD]"
                  : isDark
                  ? "bg-transparent border-neutral-700 text-neutral-400"
                  : "bg-transparent border-gray-200 text-gray-400"
              }`}
            >
              {t.defaultAppSplit}
            </button>
            <button
              type="button"
              onClick={() => setSettings((prev) => ({ ...prev, defaultApp: "debt" }))}
              className={`flex-1 p-3 border text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
                settings.defaultApp === "debt"
                  ? "bg-[#6482AD] text-white border-[#6482AD]"
                  : isDark
                  ? "bg-transparent border-neutral-700 text-neutral-400"
                  : "bg-transparent border-gray-200 text-gray-400"
              }`}
            >
              {t.defaultAppDebt}
            </button>
          </div>
        </div>

        <div className="space-y-4 border-t border-[#6482AD]/10 pt-4">
          <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider block">
            {t.language}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSettings((prev) => ({ ...prev, language: "vi" }))}
              className={`flex-1 p-3 border text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
                settings.language === "vi"
                  ? "bg-[#6482AD] text-white border-[#6482AD]"
                  : isDark
                  ? "bg-transparent border-neutral-700 text-neutral-400"
                  : "bg-transparent border-gray-200 text-gray-400"
              }`}
            >
              Tiếng Việt
            </button>
            <button
              type="button"
              onClick={() => setSettings((prev) => ({ ...prev, language: "en" }))}
              className={`flex-1 p-3 border text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
                settings.language === "en"
                  ? "bg-[#6482AD] text-white border-[#6482AD]"
                  : isDark
                  ? "bg-transparent border-neutral-700 text-neutral-400"
                  : "bg-transparent border-gray-200 text-gray-400"
              }`}
            >
              English
            </button>
          </div>
        </div>

        <div className="space-y-4 border-t border-[#6482AD]/10 pt-4">
          <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider block">
            {t.theme}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSettings((prev) => ({ ...prev, theme: "light" }))}
              className={`flex-1 p-3 border text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
                settings.theme === "light"
                  ? "bg-[#E2DAD6] text-[#6482AD] border-[#E2DAD6]"
                  : isDark
                  ? "bg-transparent border-neutral-700 text-neutral-400"
                  : "bg-transparent border-gray-200 text-gray-400"
              }`}
            >
              <Sun size={16} /> Light
            </button>
            <button
              type="button"
              onClick={() => setSettings((prev) => ({ ...prev, theme: "dark" }))}
              className={`flex-1 p-3 border text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
                settings.theme === "dark"
                  ? "bg-neutral-800 text-white border-neutral-700"
                  : "bg-transparent border-gray-200 text-gray-400"
              }`}
            >
              <Moon size={16} /> Dark
            </button>
          </div>
        </div>

        <div className="text-center pt-4 border-t border-[#6482AD]/10">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">{t.version}</p>
        </div>
      </div>
    </div>
  );
};
