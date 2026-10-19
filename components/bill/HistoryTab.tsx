"use client";

import React from "react";
import { Bill } from "@/types";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Eye } from "lucide-react";



export interface HistoryTabProps {
  onSelectBill: (bill: Bill) => void;
}



export const HistoryTab = ({ onSelectBill }: HistoryTabProps) => {
  const { bills, members, t, isDark, formatMoney } = useApp();

  const closedBills = bills.filter((b) => b.status === "closed").slice().reverse();

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-4">
      <div
        className={`p-6 shadow-lg border rounded-none ${
          isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-[#6482AD]/10"
        }`}
      >
        <h2
          className={`text-xl font-bold mb-4 uppercase tracking-widest border-b pb-2 flex items-center gap-2 ${
            isDark ? "text-white border-neutral-800" : "text-[#2C3E50] border-gray-100"
          }`}
        >
          {t.archive}
        </h2>
        <p className="text-xs text-gray-400 mb-4">{t.archiveDesc}</p>

        <div className="space-y-3">
          {closedBills.map((bill) => {
            const payerName =
              bill.memberSnapshot?.[bill.payer] ||
              members.find((m) => m.id === bill.payer)?.name ||
              "User đã xóa";

            return (
              <div
                key={bill.id}
                className={`p-3 border rounded-none flex justify-between items-center group ${
                  isDark
                    ? "bg-neutral-800 border-neutral-700 text-neutral-400"
                    : "bg-gray-50 border-gray-200 text-gray-500"
                }`}
              >
                <div>
                  <div className={`font-bold ${isDark ? "text-white" : "text-[#2C3E50]"}`}>
                    {bill.description}
                  </div>
                  <div className="text-[10px] uppercase">
                    {t.paidBy} {payerName} • {formatMoney(bill.amount)}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => onSelectBill(bill)}
                    isDark={isDark}
                  >
                    <Eye size={16} />
                  </Button>
                </div>
              </div>
            );
          })}

          {closedBills.length === 0 && (
            <div className="text-center py-8 text-gray-400 italic">{t.emptyHistory}</div>
          )}
        </div>
      </div>
    </div>
  );
};
