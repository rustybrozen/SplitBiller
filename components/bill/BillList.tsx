"use client";

import React from "react";
import { Bill } from "@/types";
import { useApp } from "@/context/AppContext";
import { Trash2 } from "lucide-react";



export interface BillListProps {
  onEditBill: (bill: Bill) => void;
}



export const BillList = ({ onEditBill }: BillListProps) => {
  const { bills, members, t, isDark, openBillsCount, formatMoney, deleteBill } = useApp();

  const openBills = bills.filter((b) => b.status === "open").slice().reverse();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-[#6482AD] pl-2 uppercase tracking-widest border-l-4 border-[#6482AD] ml-1 flex items-center gap-2">
        {t.waiting}{" "}
        <span className="text-[10px] bg-[#6482AD] text-white px-2 py-0.5 rounded-full">
          {openBillsCount}
        </span>
      </h3>

      {openBills.map((bill) => {
        const payerName =
          bill.memberSnapshot?.[bill.payer] ||
          members.find((m) => m.id === bill.payer)?.name ||
          "User đã xóa";

        return (
          <div
            key={bill.id}
            className={`p-4 shadow-sm border hover:border-[#6482AD]/30 transition cursor-pointer flex justify-between items-center group rounded-none ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-[#F5EDED]"
            }`}
          >
            <div onClick={() => onEditBill(bill)} className="flex-1">
              <h4 className={`font-bold text-lg ${isDark ? "text-white" : "text-[#2C3E50]"}`}>
                {bill.description}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                <span
                  className={`px-2 py-0.5 mr-2 uppercase tracking-wider text-[10px] font-bold ${
                    isDark ? "bg-neutral-800 text-[#6482AD]" : "bg-[#F5EDED] text-[#6482AD]"
                  }`}
                >
                  {payerName}
                </span>
                {bill.date}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className={`font-bold text-xl ${isDark ? "text-white" : "text-[#2C3E50]"}`}>
                {formatMoney(bill.amount)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteBill(bill.id);
                }}
                className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition rounded-none cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}

      {openBillsCount === 0 && (
        <div className="text-center text-gray-400 text-sm italic py-4">{t.cleanBills}</div>
      )}
    </div>
  );
};
