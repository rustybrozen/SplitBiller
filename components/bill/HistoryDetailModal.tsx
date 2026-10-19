"use client";

import React from "react";
import { Bill } from "@/types";
import { Dialog } from "@/components/ui/Dialog";
import { useApp } from "@/context/AppContext";



export interface HistoryDetailModalProps {
  bill: Bill | null;
  onClose: () => void;
}



export const HistoryDetailModal = ({ bill, onClose }: HistoryDetailModalProps) => {
  const { members, t, isDark, formatMoney } = useApp();

  if (!bill) return null;

  const getMemberName = (id: number): string => {
    return bill.memberSnapshot?.[id] || members.find((m) => m.id === id)?.name || "Thành viên cũ";
  };

  return (
    <Dialog isOpen={Boolean(bill)} onClose={onClose} title={t.billDetail} isDark={isDark}>
      <div className="space-y-4">
        <div
          className={`p-4 border text-center ${
            isDark ? "bg-neutral-800 border-neutral-700" : "bg-gray-50 border-gray-200"
          }`}
        >
          <h4
            className={`text-2xl font-bold uppercase ${
              isDark ? "text-white" : "text-[#2C3E50]"
            }`}
          >
            {bill.description}
          </h4>
          <p className="text-gray-500 text-sm">{bill.date}</p>
          <div className="mt-2 text-3xl font-bold text-[#6482AD]">
            {formatMoney(bill.amount)}
          </div>
          <div className="text-xs mt-1 uppercase tracking-wider">
            {t.paidBy}: <b>{getMemberName(bill.payer)}</b>
          </div>
        </div>

        <div className="space-y-2">
          <h5 className="font-bold text-xs uppercase text-gray-400 border-b pb-1">
            {t.splitDetail}
          </h5>

          {bill.splitType === "equal" ? (
            <div
              className={`p-3 border text-sm ${
                isDark
                  ? "bg-neutral-800 border-neutral-700 text-neutral-300"
                  : "bg-white border-gray-100"
              }`}
            >
              <p className="mb-2">
                <span className="font-bold">{t.equalShare}</span> (
                {bill.selectedMembers.length} {t.people}):
              </p>
              <div className="flex flex-wrap gap-2">
                {bill.selectedMembers.map((mid) => {
                  const shareWeight = bill.shares?.[mid];
                  return (
                    <span
                      key={mid}
                      className={`px-2 py-1 text-xs border ${
                        isDark
                          ? "bg-neutral-700 border-neutral-600"
                          : "bg-gray-100 border-gray-200"
                      }`}
                    >
                      {getMemberName(mid)}
                      {shareWeight !== undefined && shareWeight !== 1 && (
                        <span className="ml-1 text-[10px] text-amber-500 font-bold">
                          ({shareWeight} {t.shareUnit || "phần"})
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>

              {bill.equalAdjustments && Object.keys(bill.equalAdjustments).length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200/50 space-y-1">
                  <p className="text-xs font-bold text-amber-500 uppercase tracking-wide">
                    Điều chỉnh phát sinh:
                  </p>
                  {Object.entries(bill.equalAdjustments).map(([midStr, adj]) => {
                    const mid = parseInt(midStr, 10);
                    return (
                      <div key={mid} className="text-xs flex justify-between">
                        <span>{getMemberName(mid)}:</span>
                        <span className={adj > 0 ? "text-amber-500 font-mono" : "text-emerald-500 font-mono"}>
                          {adj > 0 ? `+${formatMoney(adj)}` : formatMoney(adj)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {bill.extraSplits.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between items-center p-2 border text-sm ${
                    isDark
                      ? "bg-neutral-800 border-neutral-700 text-neutral-300"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-gray-400">
                      {item.members.map((mid) => getMemberName(mid)).join(", ")}
                    </div>
                  </div>
                  <div className="font-mono text-[#6482AD]">{formatMoney(item.amount)}</div>
                </div>
              ))}

              {(() => {
                const allocated = bill.extraSplits.reduce((acc, curr) => acc + curr.amount, 0);
                const remaining = bill.amount - allocated;
                if (remaining > 0) {
                  return (
                    <div
                      className={`flex justify-between items-center p-2 border text-sm ${
                        isDark ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-100"
                      }`}
                    >
                      <div className="text-blue-500 font-bold">{t.remainder}</div>
                      <div className="font-mono text-blue-500">{formatMoney(remaining)}</div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};
