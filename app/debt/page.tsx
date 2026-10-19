"use client";

import React, { useState, ChangeEvent } from "react";
import { HeaderSwitch } from "@/components/HeaderSwitch";
import { Plus, HandCoins, PiggyBank, AlertTriangle, Trash2, Settings, History } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { SettingsTab } from "@/components/bill/SettingsTab";
import { parseSmartMoney, formatNumberWithCommas } from "@/lib/money";



type DebtTab = "input" | "pay" | "receive" | "history" | "settings";



export default function DebtPage() {
  const {
    members,
    debts,
    t,
    isDark,
    formatMoney,
    addDebtRecord,
    settleDebt,
    deleteDebt,
  } = useApp();

  const [activeTab, setActiveTab] = useState<DebtTab>("input");
  const [debtAmount, setDebtAmount] = useState("");
  const [debtMemberName, setDebtMemberName] = useState("");
  const [debtType, setDebtType] = useState<"borrow" | "lend">("lend");
  const [debtNote, setDebtNote] = useState("");
  const [debtDate, setDebtDate] = useState(() => new Date().toISOString().split("T")[0]);

  const activeBorrowDebts = debts.filter((d) => d.type === "borrow" && d.status === "active");
  const activeLendDebts = debts.filter((d) => d.type === "lend" && d.status === "active");
  const settledDebts = debts.filter((d) => d.status === "settled");

  const totalBorrow = activeBorrowDebts.reduce((sum, d) => sum + d.amount, 0);
  const totalLend = activeLendDebts.reduce((sum, d) => sum + d.amount, 0);

  const parsedAmount = parseSmartMoney(debtAmount);

  const handleSaveDebt = () => {
    if (!debtAmount.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !debtMemberName.trim()) {
      alert(t.alertFillInfo);
      return;
    }

    const success = addDebtRecord({
      amount: parsedAmount,
      memberName: debtMemberName.trim(),
      type: debtType,
      note: debtNote.trim(),
      date: debtDate,
    });

    if (success) {
      setDebtAmount("");
      setDebtNote("");
      setDebtMemberName("");
      setActiveTab(debtType === "borrow" ? "pay" : "receive");
    }
  };

  const tabs: { id: DebtTab; icon: typeof Plus; label: string; badge: number | null }[] = [
    { id: "input", icon: Plus, label: t.tabDebtInput, badge: null },
    { id: "pay", icon: HandCoins, label: t.tabDebtPay, badge: activeBorrowDebts.length || null },
    { id: "receive", icon: PiggyBank, label: t.tabDebtReceive, badge: activeLendDebts.length || null },
    { id: "history", icon: History, label: t.history || "Lịch sử", badge: null },
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
        <div className="flex gap-3">
          <div
            className={`flex-1 p-3 border-l-4 border-red-500 shadow-sm rounded-none ${
              isDark
                ? "bg-neutral-900 border-y border-r border-neutral-800"
                : "bg-white border-y border-r border-gray-100"
            }`}
          >
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t.totalOwe}
            </div>
            <div className="text-base font-bold text-red-500 truncate">
              {formatMoney(totalBorrow)}
            </div>
          </div>
          <div
            className={`flex-1 p-3 border-l-4 border-[#6482AD] shadow-sm rounded-none ${
              isDark
                ? "bg-neutral-900 border-y border-r border-neutral-800"
                : "bg-white border-y border-r border-gray-100"
            }`}
          >
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t.totalReceivable}
            </div>
            <div className="text-base font-bold text-[#6482AD] truncate">
              {formatMoney(totalLend)}
            </div>
          </div>
        </div>

        <div
          className={`p-1 flex shadow-sm border rounded-none overflow-x-auto ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-[#6482AD]/20"
          }`}
        >
          {tabs.map((tab) => {
            const isPayTab = tab.id === "pay";

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[60px] py-3 flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-all rounded-none relative cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#6482AD] text-white shadow-md"
                    : isDark
                    ? "text-neutral-500 hover:text-white hover:bg-neutral-800"
                    : "text-[#6482AD]/60 hover:text-[#6482AD] hover:bg-[#6482AD]/5"
                }`}
              >
                <div className="relative">
                  <tab.icon size={16} />
                  {tab.badge ? (
                    <span
                      className={`absolute -top-2 -right-2 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-white ${
                        isPayTab ? "bg-red-500" : "bg-[#6482AD]"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  ) : null}
                </div>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === "input" && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div
              className={`p-6 shadow-lg border rounded-none ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-[#6482AD]/10"
              }`}
            >
              <h2
                className={`text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-widest ${
                  isDark ? "text-white" : "text-[#2C3E50]"
                }`}
              >
                {t.tabDebtInput}
              </h2>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDebtType("borrow")}
                    className={`flex-1 py-3 text-xs font-bold uppercase border rounded-none transition-all cursor-pointer ${
                      debtType === "borrow"
                        ? "bg-red-500 text-white border-red-500"
                        : isDark
                        ? "bg-neutral-800 text-neutral-500 border-neutral-700"
                        : "bg-white text-gray-400 border-gray-200"
                    }`}
                  >
                    {t.typeBorrow}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDebtType("lend")}
                    className={`flex-1 py-3 text-xs font-bold uppercase border rounded-none transition-all cursor-pointer ${
                      debtType === "lend"
                        ? "bg-[#6482AD] text-white border-[#6482AD]"
                        : isDark
                        ? "bg-neutral-800 text-neutral-500 border-neutral-700"
                        : "bg-white text-gray-400 border-gray-200"
                    }`}
                  >
                    {t.typeLend}
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Số tiền (VD: 50k, 1.5tr, 500000)"
                    value={debtAmount}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setDebtAmount(e.target.value)}
                    className={`w-full border-b-2 p-3 outline-none rounded-none transition-colors ${
                      isDark
                        ? "bg-neutral-900 text-white border-neutral-800 focus:border-white placeholder:text-neutral-600"
                        : "bg-gray-50 text-black border-gray-200 focus:border-[#6482AD] placeholder:text-gray-400"
                    }`}
                  />
                  {!isNaN(parsedAmount) && parsedAmount > 0 && (
                    <span className="text-[10px] text-gray-400 ml-1 italic">
                      = {formatNumberWithCommas(parsedAmount)} đ
                    </span>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {["50k", "100k", "200k", "500k", "1tr"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDebtAmount(preset)}
                        className={`px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                          isDark
                            ? "border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-[#6482AD]"
                            : "border-gray-200 bg-white text-gray-600 hover:border-[#6482AD]"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider ml-1">
                    {t.members || "Người dính nợ"}
                  </label>
                  <input
                    list="history-members"
                    placeholder="Nhập tên mới hoặc chọn từ danh sách..."
                    value={debtMemberName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setDebtMemberName(e.target.value)
                    }
                    className={`w-full border-b-2 p-3 outline-none rounded-none transition-colors ${
                      isDark
                        ? "bg-neutral-900 text-white border-neutral-800 focus:border-white placeholder:text-neutral-600"
                        : "bg-gray-50 text-black border-gray-200 focus:border-[#6482AD] placeholder:text-gray-400"
                    }`}
                  />
                  <datalist id="history-members">
                    {members.map((m) => (
                      <option key={m.id} value={m.name} />
                    ))}
                  </datalist>
                </div>

                <input
                  type="date"
                  value={debtDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setDebtDate(e.target.value)}
                  className={`w-full border-b-2 p-3 outline-none rounded-none transition-colors ${
                    isDark
                      ? "bg-neutral-900 text-white border-neutral-800 focus:border-white"
                      : "bg-gray-50 text-black border-gray-200 focus:border-[#6482AD]"
                  }`}
                />

                <input
                  placeholder={t.debtNote}
                  value={debtNote}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setDebtNote(e.target.value)}
                  className={`w-full border-b-2 p-3 outline-none rounded-none transition-colors ${
                    isDark
                      ? "bg-neutral-900 text-white border-neutral-800 focus:border-white placeholder:text-neutral-600"
                      : "bg-gray-50 text-black border-gray-200 focus:border-[#6482AD] placeholder:text-gray-400"
                  }`}
                />

                <Button className="w-full py-4 mt-2" onClick={handleSaveDebt} isDark={isDark}>
                  {t.debtSave}
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "pay" && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div
              className={`p-6 shadow-lg border rounded-none ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-[#6482AD]/10"
              }`}
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-red-500/20">
                <h2 className="text-xl font-bold uppercase tracking-widest text-red-500 flex items-center gap-2">
                  {t.totalOwe}
                </h2>
              </div>
              <div className="space-y-3">
                {activeBorrowDebts.length === 0 && (
                  <p className="text-center text-gray-400 italic">{t.emptyDebt}</p>
                )}

                {activeBorrowDebts.slice().reverse().map((debt) => {
                  const isGhost = !members.some((m) => m.id === debt.memberId);
                  const displayName = isGhost
                    ? debt.memberNameSnapshot
                    : members.find((m) => m.id === debt.memberId)?.name || "Thành viên cũ";

                  return (
                    <div
                      key={debt.id}
                      className={`p-4 border-l-4 border-l-red-500 flex justify-between items-center ${
                        isDark
                          ? "bg-neutral-800 border border-neutral-700"
                          : "bg-white border shadow-sm"
                      }`}
                    >
                      <div>
                        <div
                          className={`font-bold text-lg ${
                            isDark ? "text-white" : "text-[#2C3E50]"
                          }`}
                        >
                          {formatMoney(debt.amount)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide flex items-center gap-1">
                          To:{" "}
                          <b className={isDark ? "text-neutral-300" : "text-black"}>
                            {displayName}
                          </b>
                          {isGhost && <AlertTriangle size={12} className="text-amber-500" />}
                        </div>
                        {debt.note && (
                          <div className="text-[10px] text-gray-500 italic mt-1">{debt.note}</div>
                        )}
                        <div className="text-[10px] text-gray-400 mt-1">{debt.date}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => settleDebt(debt.id)}
                        className="text-xs text-red-400 hover:text-red-600 font-bold uppercase border border-red-400/30 px-2 py-1 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        {t.markSettled}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "receive" && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div
              className={`p-6 shadow-lg border rounded-none ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-[#6482AD]/10"
              }`}
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#6482AD]/20">
                <h2
                  className={`text-xl font-bold uppercase tracking-widest flex items-center gap-2 ${
                    isDark ? "text-white" : "text-[#2C3E50]"
                  }`}
                >
                  {t.totalReceivable}
                </h2>
              </div>
              <div className="space-y-3">
                {activeLendDebts.length === 0 && (
                  <p className="text-center text-gray-400 italic">{t.emptyDebt}</p>
                )}

                {activeLendDebts.slice().reverse().map((debt) => {
                  const isGhost = !members.some((m) => m.id === debt.memberId);
                  const displayName = isGhost
                    ? debt.memberNameSnapshot
                    : members.find((m) => m.id === debt.memberId)?.name || "Thành viên cũ";

                  return (
                    <div
                      key={debt.id}
                      className={`p-4 border-l-4 border-l-[#6482AD] flex justify-between items-center ${
                        isDark
                          ? "bg-neutral-800 border border-neutral-700"
                          : "bg-white border shadow-sm"
                      }`}
                    >
                      <div>
                        <div
                          className={`font-bold text-lg ${
                            isDark ? "text-white" : "text-[#2C3E50]"
                          }`}
                        >
                          {formatMoney(debt.amount)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide flex items-center gap-1">
                          From:{" "}
                          <b className={isDark ? "text-neutral-300" : "text-black"}>
                            {displayName}
                          </b>
                          {isGhost && <AlertTriangle size={12} className="text-amber-500" />}
                        </div>
                        {debt.note && (
                          <div className="text-[10px] text-gray-500 italic mt-1">{debt.note}</div>
                        )}
                        <div className="text-[10px] text-gray-400 mt-1">{debt.date}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => settleDebt(debt.id)}
                        className="text-xs text-[#6482AD] hover:text-[#506b8f] font-bold uppercase border border-[#6482AD]/30 px-2 py-1 hover:bg-[#6482AD]/10 transition-colors cursor-pointer"
                      >
                        {t.markSettled}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div
              className={`p-6 shadow-lg border rounded-none ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-[#6482AD]/10"
              }`}
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-neutral-700">
                <h2
                  className={`text-xl font-bold uppercase tracking-widest flex items-center gap-2 ${
                    isDark ? "text-white" : "text-[#2C3E50]"
                  }`}
                >
                  <History size={20} /> {t.history || "Lịch sử"}
                </h2>
              </div>
              <div className="space-y-3">
                {settledDebts.length === 0 && (
                  <p className="text-center text-gray-400 italic">Trống trơn</p>
                )}

                {settledDebts.slice().reverse().map((debt) => {
                  const isGhost = !members.some((m) => m.id === debt.memberId);
                  const displayName = isGhost
                    ? debt.memberNameSnapshot
                    : members.find((m) => m.id === debt.memberId)?.name || "Thành viên cũ";
                  const isBorrow = debt.type === "borrow";

                  return (
                    <div
                      key={debt.id}
                      className={`p-4 border-l-4 flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity ${
                        isBorrow ? "border-l-red-500" : "border-l-[#6482AD]"
                      } ${
                        isDark
                          ? "bg-neutral-800 border border-neutral-700"
                          : "bg-gray-50 border shadow-sm"
                      }`}
                    >
                      <div>
                        <div
                          className={`font-bold text-lg line-through ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {formatMoney(debt.amount)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide flex items-center gap-1">
                          {isBorrow ? "To:" : "From:"}{" "}
                          <b className={isDark ? "text-neutral-400" : "text-gray-600"}>
                            {displayName}
                          </b>
                          {isGhost && <AlertTriangle size={12} className="text-amber-500" />}
                        </div>
                        {debt.note && (
                          <div className="text-[10px] text-gray-500 italic mt-1">{debt.note}</div>
                        )}
                        <div className="text-[10px] text-gray-400 mt-1">{debt.date}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteDebt(debt.id)}
                        className="text-red-300 hover:text-red-500 p-2 transition-colors cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}