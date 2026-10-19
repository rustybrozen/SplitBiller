"use client";

import React from "react";
import { Copy } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { VIET_QR_BANKS } from "@/constants/banks";



export interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  senderName: string;
}



export const QrModal = ({ isOpen, onClose, amount, senderName }: QrModalProps) => {
  const { settings, t, isDark, formatMoney } = useApp();

  if (!isOpen) return null;

  const baseUrl = `https://img.vietqr.io/image/${settings.bankBin}-${settings.bankAccountNo}-compact.jpg`;
  const params = new URLSearchParams();

  if (amount > 0) {
    params.append("amount", amount.toString());
  }

  if (senderName) {
    const cleanName = senderName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");
    params.append("addInfo", `${cleanName} tra tien`);
  }

  params.append("accountName", settings.bankAccountName || "");
  const qrUrl = `${baseUrl}?${params.toString()}`;

  const handleCopy = () => {
    const bankInfo = VIET_QR_BANKS.find((b) => b.bin === settings.bankBin);
    const bankName = bankInfo ? `${bankInfo.shortName} - ${bankInfo.name}` : settings.bankBin;

    let textToCopy = `Ten ngan hang: ${bankName}\nSo tai khoan: ${settings.bankAccountNo}\nTen: ${settings.bankAccountName}`;

    if (senderName) {
      const cleanContent = `${senderName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")} tra tien`;
      textToCopy += `\nNoi dung: ${cleanContent}`;
    }

    if (amount > 0) {
      textToCopy += `\nSo tien: ${formatMoney(amount)}`;
    }

    navigator.clipboard.writeText(textToCopy);
    alert(t.alertCopy);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={t.qrTitle} isDark={isDark}>
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="bg-white p-2 border border-gray-200 shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt="VietQR Payment Code"
            className="w-64 h-auto object-contain mx-auto"
          />
        </div>

        <div className="text-center w-full">
          {amount > 0 ? (
            <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-[#2C3E50]"}`}>
              {formatMoney(amount)}
            </div>
          ) : (
            <div
              className={`text-sm font-bold uppercase tracking-widest ${
                isDark ? "text-neutral-300" : "text-gray-500"
              }`}
            >
              Quet ma de chuyen khoan
            </div>
          )}

          <div className="text-sm text-gray-500 mt-1">
            {settings.bankAccountName} • {settings.bankAccountNo}
          </div>

          {senderName && (
            <p className="text-xs text-gray-400 mt-2 italic">
              Noi dung:{" "}
              <span className="bg-yellow-100 text-gray-700 px-1">
                {senderName
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/\s+/g, " ")}{" "}
                tra tien
              </span>
            </p>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full mt-2 border-dashed"
          isDark={isDark}
          onClick={handleCopy}
        >
          <Copy size={14} /> {t.copyBankInfo || "Copy thong tin"}
        </Button>
      </div>
    </Dialog>
  );
};
