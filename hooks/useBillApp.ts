"use client";

import { useState, useEffect, useMemo } from "react";
import { Member, Bill, AppSettings, ExtraSplit, Transfer } from "@/types";
import { TRANSLATIONS } from "@/constants/translations";

export const useBillApp = () => {
  const [activeTab, setActiveTab] = useState<
    "members" | "bills" | "summary" | "history" | "settings"
  >("members");
  const [members, setMembers] = useState<Member[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem("aesthetic_settings");
        if (saved) {
          return {
            roundingMode: "none",
            language: "vi",
            theme: "light",
            simplifyDebts: true,
            myId: undefined,
            bankBin: "",
            bankAccountNo: "",
            bankAccountName: "",
            ...JSON.parse(saved)
          };
        }
      } catch (e) {
        console.error("Load settings error", e);
      }
    }

    return {
      roundingMode: "none",
      language: "vi",
      theme: "light",
      simplifyDebts: true,
      myId: undefined,
      bankBin: "",
      bankAccountNo: "",
      bankAccountName: "",
    };
  });

  const [newMemberName, setNewMemberName] = useState("");
  const [isEditingBill, setIsEditingBill] = useState<boolean>(false);
  const [editingBillId, setEditingBillId] = useState<number | null>(null);
  const [billAmount, setBillAmount] = useState("");
  const [billDesc, setBillDesc] = useState("");
  const [billPayer, setBillPayer] = useState<string>("");
  const [billSplitType, setBillSplitType] = useState<"equal" | "advanced">(
    "equal",
  );
  const [billSelectedMembers, setBillSelectedMembers] = useState<number[]>([]);
  const [billExtraSplits, setBillExtraSplits] = useState<ExtraSplit[]>([]);
  const [isSplitDialogOpen, setIsSplitDialogOpen] = useState(false);
  const [currentSplitItem, setCurrentSplitItem] = useState<{
    name: string;
    amount: string;
    members: number[];
  }>({
    name: "",
    amount: "",
    members: [],
  });
  const [historyDetailBill, setHistoryDetailBill] = useState<Bill | null>(null);
  const [billEqualAdjustments, setBillEqualAdjustments] = useState<
    Record<number, string>
  >({});
  const [billErrors, setBillErrors] = useState<{
    desc?: boolean;
    amount?: boolean;
    payer?: boolean;
    general?: string;
  }>({});

  const t = TRANSLATIONS[settings.language];
  const isDark = settings.theme === "dark";
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedMembers = localStorage.getItem("aesthetic_members");
        const savedBills = localStorage.getItem("aesthetic_bills");
        // const savedSettings = localStorage.getItem("aesthetic_settings");

        if (savedMembers) setMembers(JSON.parse(savedMembers));
        if (savedBills) setBills(JSON.parse(savedBills));
        // if (savedSettings) {
        //   const parsed = JSON.parse(savedSettings);
        //   setSettings((prev) => ({ ...prev, ...parsed }));
        // }
      } catch (e) {
        console.error("Load error", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("aesthetic_members", JSON.stringify(members));
    localStorage.setItem("aesthetic_bills", JSON.stringify(bills));
    localStorage.setItem("aesthetic_settings", JSON.stringify(settings));
  }, [members, bills, settings, isLoaded]);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(settings.language === "vi" ? "vi-VN" : "en-US", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  const formatNumberOnly = (amount: number) =>
    new Intl.NumberFormat(
      settings.language === "vi" ? "vi-VN" : "en-US",
    ).format(amount);

  const getRemainingAmount = () => {
    const total = parseFloat(billAmount) || 0;
    const allocated = billExtraSplits.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );
    return total - allocated;
  };

  const smartRound = (amount: number, mode: "none" | "smart") => {
    if (mode === "none") return amount;
    const remainder = amount % 1000;
    if (remainder === 500) return amount;
    if (remainder < 500) return Math.floor(amount / 1000) * 1000;
    return Math.ceil(amount / 1000) * 1000;
  };
  const parseAdjustment = (val: string): number | null => {
    if (!val || !val.trim()) return 0;
    const parts = val.trim().split(/\s+/);
    let sum = 0;
    for (const p of parts) {
      const num = Number(p);
      if (isNaN(num)) return null; 
      sum += num;
    }
    return sum;
  };

  const addMember = () => {
    if (members.some(m => m.name === newMemberName.trim())) { alert(t.conflictName); return; }
    if (!newMemberName.trim()) return;
    const newMember = { id: Date.now(), name: newMemberName.trim() };
    setMembers([...members, newMember]);
    setNewMemberName("");
    setBillSelectedMembers((prev) => [...prev, newMember.id]);
  };

const removeMember = (id: number) => {
    const isInvolvedInOpenBill = bills.some(b => 
      b.status === 'open' && (
        b.payer === id || 
        (b.splitType === 'equal' && b.selectedMembers.includes(id)) ||
        (b.splitType === 'advanced' && b.extraSplits.some(ex => ex.members.includes(id)))
      )
    );

    if (isInvolvedInOpenBill) {
      alert(t.hasUnpaidBill);
      return;
    }

    if (confirm(t.confirmDeleteMember)) {
      setMembers(members.filter((m) => m.id !== id));
    }
  };

  const resetBillForm = () => {
    setBillAmount("");
    setBillDesc("");
    setBillPayer("");
    setBillSplitType("equal");
    setBillSelectedMembers(members.map((m) => m.id));
    setBillExtraSplits([]);
    setBillEqualAdjustments({});
    setBillErrors({});
    setIsEditingBill(false);
    setEditingBillId(null);
  };

  const handleSaveBill = () => {
const errors: { desc?: boolean; amount?: boolean; payer?: boolean; general?: string } = {};
    if (!billDesc) errors.desc = true;
    if (!billAmount) errors.amount = true;
    if (!billPayer) errors.payer = true;

    if (Object.keys(errors).length > 0) {
      errors.general = t.alertFillInfo;
      setBillErrors(errors);
      return;
    }
    if (billSplitType === "advanced") {
      const totalAllocated = billExtraSplits.reduce((sum, item) => sum + item.amount, 0);
      if (totalAllocated > parseFloat(billAmount)) {
        setBillErrors({ general: "Tiền chia lẻ lớn tổng bill. Vui lòng chia lại hợp lý!" });
        return;
      }
    }

    const finalAdjustments: Record<number, number> = {};
    if (billSplitType === "equal") {
      for (const id of billSelectedMembers) {
        if (billEqualAdjustments[id] !== undefined) {
          const strVal = billEqualAdjustments[id] || "";
          const parsed = parseAdjustment(strVal);
          if (parsed === null) {
            setBillErrors({ general: "Lỗ! Nhập thêm/bớt tiền bị sai format." });
            return;
          }
          if (parsed !== 0) {
            finalAdjustments[id] = parsed;
          }
        }
      }
    }

    setBillErrors({});

    const action = isEditingBill ? t.update : t.create;
    if (!confirm(`${t.alertConfirmAction} ${action} ${t.alertConfirmBill}`))
      return;

    const newBill: Bill = {
      id: editingBillId || Date.now(),
      amount: parseFloat(billAmount),
      description: billDesc,
      payer: parseInt(billPayer),
      date: new Date().toLocaleDateString(
        settings.language === "vi" ? "vi-VN" : "en-US",
      ),
      splitType: billSplitType,
      selectedMembers: billSelectedMembers,
      extraSplits: billExtraSplits,
      equalAdjustments: finalAdjustments,
      status: "open",
    };

    if (isEditingBill) {
      const existingStatus =
        bills.find((b) => b.id === newBill.id)?.status || "open";
      setBills(
        bills.map((b) =>
          b.id === newBill.id ? { ...newBill, status: existingStatus } : b,
        ),
      );
    } else {
      setBills([...bills, newBill]);
    }
    resetBillForm();
    setActiveTab("bills");
  };

  const editBill = (bill: Bill) => {
    if (!confirm(`${t.alertConfirmAction} ${t.update} ${t.alertConfirmBill}`))
      return;
    setBillAmount(bill.amount.toString());
    setBillDesc(bill.description);
    setBillPayer(bill.payer.toString());
    setBillSplitType(bill.splitType);
    setBillSelectedMembers(bill.selectedMembers);
    setBillExtraSplits(bill.extraSplits);
    const editAdj: Record<number, string> = {};
    if (bill.equalAdjustments) {
      Object.entries(bill.equalAdjustments).forEach(([id, val]) => {
        editAdj[parseInt(id)] = val.toString();
      });
    }
    setBillEqualAdjustments(editAdj);

    setIsEditingBill(true);
    setEditingBillId(bill.id);
    setActiveTab("bills");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    if (confirm(t.alertEditCancel)) {
      resetBillForm();
    }
  };

  const deleteBill = (id: number) => {
    if (confirm(t.alertDeleteBill)) {
      setBills(bills.filter((b) => b.id !== id));
    }
  };

  const openAddSplitItem = () => {
    setCurrentSplitItem({ name: "", amount: "", members: [] });
    setIsSplitDialogOpen(true);
  };

  const saveSplitItem = () => {
    const amt = parseFloat(currentSplitItem.amount);
    if (
      !currentSplitItem.name ||
      isNaN(amt) ||
      currentSplitItem.members.length === 0
    ) {
      alert(t.alertItemInfo);
      return;
    }

    const currentRemaining = getRemainingAmount();
    if (currentRemaining - amt < 0) {
      alert(`${t.alertOverAmount} ${formatMoney(currentRemaining)}.`);
      return;
    }

    const newItem: ExtraSplit = {
      id: Date.now(),
      name: currentSplitItem.name,
      amount: amt,
      members: currentSplitItem.members,
    };
    setBillExtraSplits([...billExtraSplits, newItem]);
    setIsSplitDialogOpen(false);
  };

  const removeSplitItem = (id: number) => {
    setBillExtraSplits(billExtraSplits.filter((i) => i.id !== id));
  };

const settleAllBills = () => {
    if (confirm(t.settleConfirm)) {
      const batchId = Date.now(); 
      
      const currentNames: Record<number, string> = {};
      members.forEach(m => currentNames[m.id] = m.name);

      setBills(
        bills.map((b) =>
          b.status === "open" ? { ...b, status: "closed", batchId, memberSnapshot: currentNames } : b
        )
      );
      setActiveTab("history");
    }
  };
  const calculateTransfers = useMemo(() => {
    if (settings.simplifyDebts) {
      const balances: Record<number, number> = {};
      members.forEach((m) => (balances[m.id] = 0));
      const openBills = bills.filter((b) => b.status === "open");

      openBills.forEach((bill) => {
        const payer = bill.payer;
        const totalAmount = bill.amount;
        const shares: Record<number, number> = {};

        if (bill.splitType === "equal") {
          const involvedCount = bill.selectedMembers.length || 1;
          const baseShare = totalAmount / involvedCount; // Chia đều ban đầu (VD: 10k)
          const parsedAdjustments = bill.equalAdjustments || {};

          let totalAdjustments = 0;
          const unadjustedMembers: number[] = [];

          // Xem thằng nào có thêm/bớt, thằng nào ăn bình thường
          bill.selectedMembers.forEach((id) => {
            const adj = parsedAdjustments[id] || 0;
            if (adj === 0) {
              unadjustedMembers.push(id);
            } else {
              totalAdjustments += adj;
            }
          });

          const spreadCount =
            unadjustedMembers.length > 0
              ? unadjustedMembers.length
              : involvedCount;
          const spreadAmount = -totalAdjustments / spreadCount;

          bill.selectedMembers.forEach((id) => {
            const adj = parsedAdjustments[id] || 0;
            if (adj !== 0) {
              shares[id] =
                baseShare +
                adj +
                (unadjustedMembers.length === 0 ? spreadAmount : 0);
            } else {
              shares[id] = baseShare + spreadAmount;
            }
          });
        } else {
          let allocatedAmount = 0;
          const extraSplitMemberIds = new Set<number>();

          bill.extraSplits.forEach((split) => {
            const splitShare = split.amount / split.members.length;
            split.members.forEach((id) => {
              shares[id] = (shares[id] || 0) + splitShare;
              extraSplitMemberIds.add(id);
            });
            allocatedAmount += split.amount;
          });

          const remaining = totalAmount - allocatedAmount;
          if (remaining > 0) {
            const remainingMembers = members.filter(
              (m) => !extraSplitMemberIds.has(m.id),
            );

            const poolToSplit =
              remainingMembers.length > 0 ? remainingMembers : members;
            const share = remaining / poolToSplit.length;

            poolToSplit.forEach(
              (m) => (shares[m.id] = (shares[m.id] || 0) + share),
            );
          }
        }

        balances[payer] += totalAmount;
        Object.entries(shares).forEach(([memberId, amount]) => {
          balances[parseInt(memberId)] -= amount;
        });
      });

      const debtors = [];
      const creditors = [];
      for (const [id, amount] of Object.entries(balances)) {
        if (amount < -1) debtors.push({ id: parseInt(id), amount: amount });
        if (amount > 1) creditors.push({ id: parseInt(id), amount: amount });
      }
      debtors.sort((a, b) => a.amount - b.amount);
      creditors.sort((a, b) => b.amount - a.amount);

      const transfers: Transfer[] = [];
      let i = 0;
      let j = 0;
      while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const amount = Math.min(Math.abs(debtor.amount), creditor.amount);
        if (amount > 0) {
          const finalAmount = smartRound(amount, settings.roundingMode);
          transfers.push({
            from: debtor.id,
            to: creditor.id,
            amount: finalAmount,
          });
        }
        debtor.amount += amount;
        creditor.amount -= amount;
        if (Math.abs(debtor.amount) < 1) i++;
        if (creditor.amount < 1) j++;
      }
      return transfers;
    } else {
      const debts: Record<number, Record<number, number>> = {};

      bills
        .filter((b) => b.status === "open")
        .forEach((bill) => {
          const payer = bill.payer;

          const addDebt = (from: number, to: number, amount: number) => {
            if (from === to) return;
            if (!debts[from]) debts[from] = {};
            debts[from][to] = (debts[from][to] || 0) + amount;
          };

          if (bill.splitType === "equal") {
            const involvedCount = bill.selectedMembers.length || 1;
            const baseShare = bill.amount / involvedCount;
            const parsedAdjustments = bill.equalAdjustments || {};

            let totalAdjustments = 0;
            const unadjustedMembers: number[] = [];

            bill.selectedMembers.forEach((id) => {
              const adj = parsedAdjustments[id] || 0;
              if (adj === 0) {
                unadjustedMembers.push(id);
              } else {
                totalAdjustments += adj;
              }
            });

            const spreadCount =
              unadjustedMembers.length > 0
                ? unadjustedMembers.length
                : involvedCount;
            const spreadAmount = -totalAdjustments / spreadCount;

            bill.selectedMembers.forEach((memberId) => {
              const adj = parsedAdjustments[memberId] || 0;
              let share = 0;
              if (adj !== 0) {
                share =
                  baseShare +
                  adj +
                  (unadjustedMembers.length === 0 ? spreadAmount : 0);
              } else {
                share = baseShare + spreadAmount;
              }

              addDebt(memberId, payer, share);
            });
          } else {
            let allocated = 0;
            const extraSplitMemberIds = new Set<number>();

            bill.extraSplits.forEach((split) => {
              const share = split.amount / split.members.length;
              split.members.forEach((mId) => {
                addDebt(mId, payer, share);
                extraSplitMemberIds.add(mId);
              });
              allocated += split.amount;
            });

            const remaining = bill.amount - allocated;
            if (remaining > 0) {
              const remainingMembers = members.filter(
                (m) => !extraSplitMemberIds.has(m.id),
              );
              const poolToSplit =
                remainingMembers.length > 0 ? remainingMembers : members;
              const share = remaining / poolToSplit.length;

              poolToSplit.forEach((member) => addDebt(member.id, payer, share));
            }
          }
        });

      const transfers: Transfer[] = [];
      Object.keys(debts).forEach((fromId) => {
        Object.keys(debts[parseInt(fromId)]).forEach((toId) => {
          const amount = debts[parseInt(fromId)][parseInt(toId)];

          const reverseDebt = debts[parseInt(toId)]?.[parseInt(fromId)] || 0;

          if (amount > reverseDebt) {
            const finalAmt = smartRound(
              amount - reverseDebt,
              settings.roundingMode,
            );
            if (finalAmt > 0) {
              transfers.push({
                from: parseInt(fromId),
                to: parseInt(toId),
                amount: finalAmt,
              });
            }
          }
        });
      });

      return transfers;
    }
  }, [bills, members, settings.roundingMode, settings.simplifyDebts]); // <--- Nhớ thêm simplifyDebts vào dependency

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
      const senderName =
        members.find((m) => m.id === t.from)?.name || "Unknown";
      groups[t.to].senders.push({ name: senderName, amount: t.amount });
      groups[t.to].totalReceive += t.amount;
    });
    return Object.values(groups);
  }, [calculateTransfers, members]);

  const openBillsCount = bills.filter((b) => b.status === "open").length;

  return {
    state: {
      activeTab,
      members,
      bills,
      settings,
      newMemberName,
      isEditingBill,
      editingBillId,
      billAmount,
      billDesc,
      billPayer,
      billSplitType,
      billSelectedMembers,
      billExtraSplits,
      isSplitDialogOpen,
      currentSplitItem,
      historyDetailBill,
      billEqualAdjustments,
      billErrors
    },
    computed: {
      t,
      isDark,
      openBillsCount,
      groupedTransfers,
      remainingAmount: getRemainingAmount(),
    },
    actions: {
      setActiveTab,
      setMembers,
      setBills,
      setSettings,
      setNewMemberName,
      setIsEditingBill,
      setEditingBillId,
      setBillAmount,
      setBillDesc,
      setBillPayer,
      setBillSplitType,
      setBillSelectedMembers,
      setBillExtraSplits,
      setIsSplitDialogOpen,
      setCurrentSplitItem,
      setHistoryDetailBill,
      addMember,
      removeMember,
      handleSaveBill,
      editBill,
      cancelEdit,
      deleteBill,
      openAddSplitItem,
      saveSplitItem,
      removeSplitItem,
      settleAllBills,
      formatMoney,
      formatNumberOnly,
      setBillEqualAdjustments,
      setBillErrors
    },
  };
};
