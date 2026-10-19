"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { QrCode, Copy, Check, Share2 } from "lucide-react";



export interface SummaryTabProps {
  onOpenQr: (amount: number, senderName: string) => void;
}



export const SummaryTab = ({ onOpenQr }: SummaryTabProps) => {
  const {
    settings,
    t,
    isDark,
    groupedTransfers,
    calculateTransfers,
    formatMoney,
    formatNumberOnly,
    settleAllBills,
  } = useApp();

  const [copied, setCopied] = useState(false);

  const getSummaryText = (): string => {
    return groupedTransfers
      .map((group) => {
        let block = `${t.transferTo} ${group.receiverName}:\n`;
        block += group.senders
          .map((s) => `- ${s.name}: ${formatNumberOnly(s.amount)} đ`)
          .join("\n");
        return block;
      })
      .join("\n\n");
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(getSummaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: t.summaryTitle,
          text: getSummaryText(),
        });
      } catch {
        // User cancelled share dialog
      }
    } else {
      handleCopySummary();
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-4">
      <div
        className={`p-6 shadow-lg border rounded-none ${
          isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-[#6482AD]/10"
        }`}
      >
        <h2
          className={`text-xl font-bold mb-4 uppercase tracking-widest border-b pb-2 flex items-center justify-between ${
            isDark ? "text-white border-neutral-800" : "text-[#2C3E50] border-gray-100"
          }`}
        >
          <span>{t.summaryTitle}</span>
          <span className="text-xs font-normal text-gray-400 lowercase">
            ({calculateTransfers.length} giao dịch)
          </span>
        </h2>

        {calculateTransfers.length === 0 ? (
          <div className="text-center py-8 text-gray-400 italic">{t.emptySummary}</div>
        ) : (
          <div className="space-y-4">
            {groupedTransfers.map((group) => {
              const isMeReceiving = settings.myId === group.receiverId;

              return (
                <div
                  key={group.receiverId}
                  className={`p-4 border rounded-none transition-all ${
                    isDark
                      ? "bg-neutral-800/40 border-neutral-700"
                      : "bg-[#F5EDED]/40 border-[#6482AD]/10"
                  }`}
                >
                  <div className="font-bold text-[#6482AD] mb-3 text-base border-b border-[#6482AD]/10 pb-2 flex justify-between items-center">
                    <span>
                      {t.transferTo} {group.receiverName}:
                    </span>

                    {isMeReceiving && (
                      <button
                        type="button"
                        onClick={() => onOpenQr(0, "")}
                        className="text-[10px] flex items-center gap-1 bg-white border px-2 py-1 shadow-sm text-gray-500 hover:text-[#6482AD] cursor-pointer"
                      >
                        <QrCode size={12} /> {t.showQR}
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 pl-2">
                    {group.senders.map((sender, sIdx) => (
                      <div
                        key={sIdx}
                        className={`flex justify-between items-center font-mono text-sm ${
                          isDark ? "text-neutral-300" : "text-[#2C3E50]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>- {sender.name}:</span>
                          <span className="font-bold">{formatMoney(sender.amount)}</span>
                        </div>

                        {isMeReceiving && (
                          <button
                            type="button"
                            onClick={() => onOpenQr(sender.amount, sender.name)}
                            className="p-1.5 bg-[#6482AD] text-white rounded-none hover:bg-[#506b8f] transition shadow-sm flex items-center gap-1 text-[10px] font-bold uppercase cursor-pointer"
                          >
                            <QrCode size={14} /> QR
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {groupedTransfers.length > 0 && (
          <div
            className={`space-y-3 pt-4 mt-6 border-t ${
              isDark ? "border-neutral-700" : "border-gray-100"
            }`}
          >
            <div className="flex gap-2">
              <Button
                variant={copied ? "success" : "primary"}
                className="flex-1 py-4 shadow-xl shadow-[#6482AD]/10 border-2 border-[#6482AD] transition-all"
                onClick={handleCopySummary}
                isDark={isDark}
              >
                {copied ? (
                  <>
                    <Check size={18} className="text-emerald-400" /> Đã sao chép!
                  </>
                ) : (
                  <>
                    <Copy size={18} /> {t.copy}
                  </>
                )}
              </Button>

              {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                <Button
                  variant="outline"
                  className="px-4 py-4 border-2 border-[#6482AD]"
                  onClick={handleNativeShare}
                  isDark={isDark}
                  title="Chia sẻ nhanh"
                >
                  <Share2 size={18} />
                </Button>
              )}
            </div>

            <Button
              variant="success"
              className="w-full py-4 border-2"
              onClick={settleAllBills}
              isDark={isDark}
            >
              <Check size={18} /> {t.settle}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
