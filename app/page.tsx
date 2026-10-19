"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Receipt, Check, History, Settings } from "lucide-react";
import { Bill } from "@/types";
import { useApp } from "@/context/AppContext";
import { HeaderSwitch } from "@/components/HeaderSwitch";
import { MembersTab } from "@/components/bill/MembersTab";
import { BillForm } from "@/components/bill/BillForm";
import { BillList } from "@/components/bill/BillList";
import { SummaryTab } from "@/components/bill/SummaryTab";
import { HistoryTab } from "@/components/bill/HistoryTab";
import { SettingsTab } from "@/components/bill/SettingsTab";
import { QrModal } from "@/components/bill/QrModal";
import { HistoryDetailModal } from "@/components/bill/HistoryDetailModal";



type TabKey = "members" | "bills" | "summary" | "history" | "settings";



export default function SplitBillerPage() {
  const router = useRouter();
  const { members, settings, isLoaded, t, isDark, openBillsCount } = useApp();

  const [activeTab, setActiveTab] = useState<TabKey>("members");
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [selectedHistoryBill, setSelectedHistoryBill] = useState<Bill | null>(null);
  const [qrModalData, setQrModalData] = useState<{ amount: number; senderName: string } | null>(null);

  useEffect(() => {
    if (
      isLoaded &&
      settings.defaultApp === "debt" &&
      typeof window !== "undefined" &&
      !sessionStorage.getItem("visited_split")
    ) {
      sessionStorage.setItem("visited_split", "true");
      router.replace("/debt");
    }
  }, [isLoaded, settings.defaultApp, router]);

  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill);
    setActiveTab("bills");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenQr = (amount: number, senderName: string) => {
    if (!settings.bankBin || !settings.bankAccountNo) {
      alert(t.missingBankInfo);
      setActiveTab("settings");
      return;
    }
    setQrModalData({ amount, senderName });
  };

  const tabs: { id: TabKey; icon: typeof User; label: string; badge: number | boolean | null }[] = [
    { id: "members", icon: User, label: t.members, badge: members.length > 0 ? members.length : null },
    { id: "bills", icon: Receipt, label: t.bills, badge: openBillsCount > 0 ? openBillsCount : null },
    { id: "summary", icon: Check, label: t.summary, badge: openBillsCount > 0 },
    { id: "history", icon: History, label: t.history, badge: null },
    { id: "settings", icon: Settings, label: t.settings, badge: null },
  ];

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen font-sans selection:bg-[#6482AD] selection:text-white pb-24 transition-colors duration-300 ${
        isDark ? "bg-black text-neutral-200" : "bg-[#F5EDED] text-[#2C3E50]"
      }`}
    >
      <HeaderSwitch isDark={isDark} splitText={t.splitText} debtText={t.debtText} />

      <main className="max-w-md mx-auto px-4 space-y-6">
        <div
          className={`p-1 flex shadow-sm border rounded-none overflow-x-auto ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-[#6482AD]/20"
          }`}
        >
          {tabs.map((tab) => {
            const isSummary = tab.id === "summary";
            const isSummaryDisabled = isSummary && openBillsCount === 0;

            return (
              <button
                key={tab.id}
                disabled={isSummaryDisabled}
                onClick={() => !isSummaryDisabled && setActiveTab(tab.id)}
                className={`flex-1 min-w-[60px] py-3 flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-all rounded-none relative cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                  activeTab === tab.id
                    ? "bg-[#6482AD] text-white shadow-md"
                    : isDark
                    ? "text-neutral-500 hover:text-white hover:bg-neutral-800"
                    : "text-[#6482AD]/60 hover:text-[#6482AD] hover:bg-[#6482AD]/5"
                }`}
              >
                <div className="relative">
                  <tab.icon size={16} />
                  {tab.badge &&
                    (isSummary ? (
                      <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
                    ) : (
                      <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-white">
                        {tab.badge}
                      </span>
                    ))}
                </div>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === "members" && <MembersTab />}

        {activeTab === "bills" && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <BillForm
              key={editingBill?.id ?? "new"}
              editingBill={editingBill}
              onFinishEdit={() => setEditingBill(null)}
            />
            <BillList onEditBill={handleEditBill} />
          </div>
        )}

        {activeTab === "summary" && <SummaryTab onOpenQr={handleOpenQr} />}

        {activeTab === "history" && (
          <HistoryTab onSelectBill={(bill) => setSelectedHistoryBill(bill)} />
        )}

        {activeTab === "settings" && <SettingsTab />}
      </main>

      <QrModal
        isOpen={Boolean(qrModalData)}
        onClose={() => setQrModalData(null)}
        amount={qrModalData?.amount || 0}
        senderName={qrModalData?.senderName || ""}
      />

      <HistoryDetailModal
        bill={selectedHistoryBill}
        onClose={() => setSelectedHistoryBill(null)}
      />
    </div>
  );
}