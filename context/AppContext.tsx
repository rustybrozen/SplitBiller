"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { Member, Bill, AppSettings, DebtRecord, Transfer, ExtraSplit } from "@/types";
import { TRANSLATIONS } from "@/constants/translations";



interface AppContextType {
  members: Member[];
  bills: Bill[];
  debts: DebtRecord[];
  settings: AppSettings;
  isLoaded: boolean;
  t: Record<keyof typeof TRANSLATIONS.vi, string>;
  isDark: boolean;
  openBillsCount: number;
  calculateTransfers: Transfer[];
  groupedTransfers: {
    receiverId: number;
    receiverName: string;
    totalReceive: number;
    senders: { name: string; amount: number }[];
  }[];
  formatMoney: (amount: number) => string;
  formatNumberOnly: (amount: number) => string;
  addMember: (name: string) => boolean;
  removeMember: (id: number) => boolean;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  saveBill: (billData: {
    id?: number | null;
    amount: number;
    description: string;
    payer: number;
    splitType: 'equal' | 'advanced';
    selectedMembers: number[];
    extraSplits: ExtraSplit[];
    equalAdjustments: Record<number, number>;
    shares: Record<number, number>;
  }) => boolean;
  deleteBill: (id: number) => void;
  settleAllBills: () => void;
  addDebtRecord: (record: {
    amount: number;
    memberName: string;
    type: 'borrow' | 'lend';
    note: string;
    date: string;
  }) => boolean;
  settleDebt: (id: number) => void;
  deleteDebt: (id: number) => void;
}



const AppContext = createContext<AppContextType | null>(null);



const DEFAULT_SETTINGS: AppSettings = {
  roundingMode: "none",
  language: "vi",
  theme: "light",
  simplifyDebts: true,
  myId: undefined,
  bankBin: "",
  bankAccountNo: "",
  bankAccountName: "",
  defaultApp: "split",
};



const smartRound = (amount: number, mode: "none" | "smart"): number => {
  if (mode === "none") return amount;
  const remainder = amount % 1000;
  if (remainder === 500) return amount;
  if (remainder < 500) return Math.floor(amount / 1000) * 1000;
  return Math.ceil(amount / 1000) * 1000;
};



export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [debts, setDebts] = useState<DebtRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedMembers = localStorage.getItem("aesthetic_members");
      const savedBills = localStorage.getItem("aesthetic_bills");
      const savedDebts = localStorage.getItem("aesthetic_debts");
      const savedSettings = localStorage.getItem("aesthetic_settings");

      if (savedMembers) setMembers(JSON.parse(savedMembers));
      if (savedBills) setBills(JSON.parse(savedBills));
      if (savedDebts) setDebts(JSON.parse(savedDebts));
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      }
    } catch (e) {
      console.error("Storage load error", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("aesthetic_members", JSON.stringify(members));
    localStorage.setItem("aesthetic_bills", JSON.stringify(bills));
    localStorage.setItem("aesthetic_debts", JSON.stringify(debts));
    localStorage.setItem("aesthetic_settings", JSON.stringify(settings));
  }, [members, bills, debts, settings, isLoaded]);

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.vi;
  const isDark = settings.theme === "dark";

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(settings.language === "vi" ? "vi-VN" : "en-US", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const formatNumberOnly = (amount: number) =>
    new Intl.NumberFormat(settings.language === "vi" ? "vi-VN" : "en-US").format(amount);



  const addMember = (name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())) {
      alert(t.conflictName);
      return false;
    }
    const newMember: Member = { id: Date.now(), name: trimmed };
    setMembers((prev) => [...prev, newMember]);
    return true;
  };



  const removeMember = (id: number): boolean => {
    const isInvolvedInOpenBill = bills.some(
      (b) =>
        b.status === "open" &&
        (b.payer === id ||
          (b.splitType === "equal" && b.selectedMembers.includes(id)) ||
          (b.splitType === "advanced" && b.extraSplits.some((ex) => ex.members.includes(id))))
    );

    const isInvolvedInActiveDebt = debts.some(
      (d) => d.status === "active" && d.memberId === id
    );

    if (isInvolvedInOpenBill || isInvolvedInActiveDebt) {
      alert(t.hasUnpaidBill);
      return false;
    }

    if (confirm(t.confirmDeleteMember)) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      return true;
    }
    return false;
  };



  const saveBill = (billData: {
    id?: number | null;
    amount: number;
    description: string;
    payer: number;
    splitType: 'equal' | 'advanced';
    selectedMembers: number[];
    extraSplits: ExtraSplit[];
    equalAdjustments: Record<number, number>;
    shares: Record<number, number>;
  }): boolean => {
    const isEdit = Boolean(billData.id);
    const existingStatus = isEdit ? bills.find((b) => b.id === billData.id)?.status || "open" : "open";

    const newBill: Bill = {
      id: billData.id || Date.now(),
      amount: billData.amount,
      description: billData.description,
      payer: billData.payer,
      date: new Date().toLocaleDateString(settings.language === "vi" ? "vi-VN" : "en-US"),
      splitType: billData.splitType,
      selectedMembers: billData.selectedMembers,
      extraSplits: billData.extraSplits,
      equalAdjustments: billData.equalAdjustments,
      shares: billData.shares,
      status: existingStatus,
    };

    if (isEdit) {
      setBills((prev) => prev.map((b) => (b.id === newBill.id ? newBill : b)));
    } else {
      setBills((prev) => [...prev, newBill]);
    }
    return true;
  };



  const deleteBill = (id: number) => {
    if (confirm(t.alertDeleteBill)) {
      setBills((prev) => prev.filter((b) => b.id !== id));
    }
  };



  const settleAllBills = () => {
    if (confirm(t.settleConfirm)) {
      const batchId = Date.now();
      const currentNames: Record<number, string> = {};
      members.forEach((m) => {
        currentNames[m.id] = m.name;
      });

      setBills((prev) =>
        prev.map((b) =>
          b.status === "open" ? { ...b, status: "closed", batchId, memberSnapshot: currentNames } : b
        )
      );
    }
  };



  const addDebtRecord = (record: {
    amount: number;
    memberName: string;
    type: 'borrow' | 'lend';
    note: string;
    date: string;
  }): boolean => {
    const inputNameRaw = record.memberName.trim();
    if (!inputNameRaw || record.amount <= 0) return false;

    let targetMember = members.find((m) => m.name.toLowerCase() === inputNameRaw.toLowerCase());
    if (!targetMember) {
      targetMember = { id: Date.now(), name: inputNameRaw };
      setMembers((prev) => [...prev, targetMember!]);
    }

    const newDebt: DebtRecord = {
      id: Date.now(),
      memberId: targetMember.id,
      amount: record.amount,
      type: record.type,
      note: record.note,
      date: record.date
        ? new Date(record.date).toLocaleDateString(settings.language === "vi" ? "vi-VN" : "en-US")
        : new Date().toLocaleDateString(settings.language === "vi" ? "vi-VN" : "en-US"),
      status: "active",
      memberNameSnapshot: targetMember.name,
    };

    setDebts((prev) => [newDebt, ...prev]);
    return true;
  };



  const settleDebt = (id: number) => {
    if (confirm(t.confirmSettle)) {
      setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, status: "settled" } : d)));
    }
  };



  const deleteDebt = (id: number) => {
    if (confirm(settings.language === "vi" ? "Xoá vĩnh viễn giao dịch này?" : "Permanently delete this entry?")) {
      setDebts((prev) => prev.filter((d) => d.id !== id));
    }
  };



  const calculateTransfers = useMemo(() => {
    const openBills = bills.filter((b) => b.status === "open");
    if (openBills.length === 0) return [];

    if (settings.simplifyDebts) {
      const balances: Record<number, number> = {};
      members.forEach((m) => {
        balances[m.id] = 0;
      });

      openBills.forEach((bill) => {
        const payer = bill.payer;
        const totalAmount = bill.amount;
        const shares: Record<number, number> = {};

        if (bill.splitType === "equal") {
          const selected = bill.selectedMembers.length > 0 ? bill.selectedMembers : members.map((m) => m.id);
          const sharesMap = bill.shares || {};

          let totalShares = 0;
          selected.forEach((id) => {
            const weight = sharesMap[id] !== undefined ? sharesMap[id] : 1;
            totalShares += weight;
          });
          if (totalShares <= 0) totalShares = selected.length || 1;

          const baseShares: Record<number, number> = {};
          selected.forEach((id) => {
            const weight = sharesMap[id] !== undefined ? sharesMap[id] : 1;
            baseShares[id] = (totalAmount * weight) / totalShares;
          });

          const parsedAdjustments = bill.equalAdjustments || {};
          let totalAdjustments = 0;
          const unadjustedMembers: number[] = [];

          selected.forEach((id) => {
            const adj = parsedAdjustments[id] || 0;
            if (adj === 0) {
              unadjustedMembers.push(id);
            } else {
              totalAdjustments += adj;
            }
          });

          const spreadCount = unadjustedMembers.length > 0 ? unadjustedMembers.length : selected.length;
          const spreadAmount = spreadCount > 0 ? -totalAdjustments / spreadCount : 0;

          selected.forEach((id) => {
            const adj = parsedAdjustments[id] || 0;
            if (adj !== 0) {
              shares[id] = baseShares[id] + adj + (unadjustedMembers.length === 0 ? spreadAmount : 0);
            } else {
              shares[id] = baseShares[id] + spreadAmount;
            }
          });
        } else {
          let allocatedAmount = 0;
          bill.extraSplits.forEach((split) => {
            const splitMemberCount = split.members.length || 1;
            const splitShare = split.amount / splitMemberCount;
            split.members.forEach((id) => {
              shares[id] = (shares[id] || 0) + splitShare;
            });
            allocatedAmount += split.amount;
          });

          const remaining = totalAmount - allocatedAmount;
          if (remaining > 0) {
            const poolToSplit = bill.selectedMembers && bill.selectedMembers.length > 0
              ? bill.selectedMembers
              : members.map((m) => m.id);
            const poolCount = poolToSplit.length || 1;
            const share = remaining / poolCount;
            poolToSplit.forEach((id) => {
              shares[id] = (shares[id] || 0) + share;
            });
          }
        }

        balances[payer] = (balances[payer] || 0) + totalAmount;
        Object.entries(shares).forEach(([memberIdStr, amount]) => {
          const mId = parseInt(memberIdStr, 10);
          balances[mId] = (balances[mId] || 0) - amount;
        });
      });

      const debtors: { id: number; amount: number }[] = [];
      const creditors: { id: number; amount: number }[] = [];

      for (const [id, amount] of Object.entries(balances)) {
        if (amount < -1) debtors.push({ id: parseInt(id, 10), amount });
        if (amount > 1) creditors.push({ id: parseInt(id, 10), amount });
      }

      debtors.sort((a, b) => a.amount - b.amount);
      creditors.sort((a, b) => b.amount - a.amount);

      const transfers: Transfer[] = [];
      let i = 0;
      let j = 0;

      while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const matchAmount = Math.min(Math.abs(debtor.amount), creditor.amount);

        if (matchAmount > 0) {
          const finalAmount = smartRound(matchAmount, settings.roundingMode);
          if (finalAmount > 0) {
            transfers.push({
              from: debtor.id,
              to: creditor.id,
              amount: finalAmount,
            });
          }
        }

        debtor.amount += matchAmount;
        creditor.amount -= matchAmount;
        if (Math.abs(debtor.amount) < 1) i++;
        if (creditor.amount < 1) j++;
      }

      return transfers;
    } else {
      const debtsMap: Record<number, Record<number, number>> = {};

      const addDebt = (from: number, to: number, amount: number) => {
        if (from === to || isNaN(amount) || amount <= 0) return;
        if (!debtsMap[from]) debtsMap[from] = {};
        debtsMap[from][to] = (debtsMap[from][to] || 0) + amount;
      };

      openBills.forEach((bill) => {
        const payer = bill.payer;

        if (bill.splitType === "equal") {
          const selected = bill.selectedMembers.length > 0 ? bill.selectedMembers : members.map((m) => m.id);
          const sharesMap = bill.shares || {};

          let totalShares = 0;
          selected.forEach((id) => {
            const weight = sharesMap[id] !== undefined ? sharesMap[id] : 1;
            totalShares += weight;
          });
          if (totalShares <= 0) totalShares = selected.length || 1;

          const baseShares: Record<number, number> = {};
          selected.forEach((id) => {
            const weight = sharesMap[id] !== undefined ? sharesMap[id] : 1;
            baseShares[id] = (bill.amount * weight) / totalShares;
          });

          const parsedAdjustments = bill.equalAdjustments || {};
          let totalAdjustments = 0;
          const unadjustedMembers: number[] = [];

          selected.forEach((id) => {
            const adj = parsedAdjustments[id] || 0;
            if (adj === 0) unadjustedMembers.push(id);
            else totalAdjustments += adj;
          });

          const spreadCount = unadjustedMembers.length > 0 ? unadjustedMembers.length : selected.length;
          const spreadAmount = spreadCount > 0 ? -totalAdjustments / spreadCount : 0;

          selected.forEach((memberId) => {
            const adj = parsedAdjustments[memberId] || 0;
            let share = baseShares[memberId];
            if (adj !== 0) {
              share = share + adj + (unadjustedMembers.length === 0 ? spreadAmount : 0);
            } else {
              share = share + spreadAmount;
            }
            addDebt(memberId, payer, share);
          });
        } else {
          let allocated = 0;
          bill.extraSplits.forEach((split) => {
            const share = split.amount / (split.members.length || 1);
            split.members.forEach((mId) => {
              addDebt(mId, payer, share);
            });
            allocated += split.amount;
          });

          const remaining = bill.amount - allocated;
          if (remaining > 0) {
            const poolToSplit = bill.selectedMembers && bill.selectedMembers.length > 0
              ? bill.selectedMembers
              : members.map((m) => m.id);
            const share = remaining / (poolToSplit.length || 1);
            poolToSplit.forEach((memberId) => {
              addDebt(memberId, payer, share);
            });
          }
        }
      });

      const transfers: Transfer[] = [];
      Object.keys(debtsMap).forEach((fromIdStr) => {
        const fromId = parseInt(fromIdStr, 10);
        Object.keys(debtsMap[fromId]).forEach((toIdStr) => {
          const toId = parseInt(toIdStr, 10);
          const amount = debtsMap[fromId][toId];
          const reverseDebt = debtsMap[toId]?.[fromId] || 0;

          if (amount > reverseDebt) {
            const finalAmt = smartRound(amount - reverseDebt, settings.roundingMode);
            if (finalAmt > 0) {
              transfers.push({
                from: fromId,
                to: toId,
                amount: finalAmt,
              });
            }
          }
        });
      });

      return transfers;
    }
  }, [bills, members, settings.roundingMode, settings.simplifyDebts]);



  const groupedTransfers = useMemo(() => {
    const groups: Record<
      number,
      {
        receiverName: string;
        totalReceive: number;
        senders: { name: string; amount: number }[];
        receiverId: number;
      }
    > = {};

    calculateTransfers.forEach((t) => {
      if (!groups[t.to]) {
        groups[t.to] = {
          receiverId: t.to,
          receiverName: members.find((m) => m.id === t.to)?.name || "Unknown",
          totalReceive: 0,
          senders: [],
        };
      }
      const senderName = members.find((m) => m.id === t.from)?.name || "Unknown";
      groups[t.to].senders.push({ name: senderName, amount: t.amount });
      groups[t.to].totalReceive += t.amount;
    });

    return Object.values(groups);
  }, [calculateTransfers, members]);



  const openBillsCount = bills.filter((b) => b.status === "open").length;

  return (
    <AppContext.Provider
      value={{
        members,
        bills,
        debts,
        settings,
        isLoaded,
        t,
        isDark,
        openBillsCount,
        calculateTransfers,
        groupedTransfers,
        formatMoney,
        formatNumberOnly,
        addMember,
        removeMember,
        setSettings,
        saveBill,
        deleteBill,
        settleAllBills,
        addDebtRecord,
        settleDebt,
        deleteDebt,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};



export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
