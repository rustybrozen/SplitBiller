"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Trash2, Edit2, Plus, Copy, Check,
  Receipt, User, X, Calculator, Info,
  Settings, History, ArchiveRestore,
  Eye, AlertTriangle, Moon, Sun
} from 'lucide-react';
import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from "react";
import { TRANSLATIONS } from '@/constants/translations';

interface Member {
  id: number;
  name: string;
}

interface ExtraSplit {
  id: number;
  name: string;
  amount: number;
  members: number[];
}

interface Bill {
  id: number;
  amount: number;
  description: string;
  payer: number;
  date: string;
  splitType: 'equal' | 'advanced';
  selectedMembers: number[];
  extraSplits: ExtraSplit[];
  status: 'open' | 'closed';
}

interface Transfer {
  from: number;
  to: number;
  amount: number;
}

interface AppSettings {
  roundingMode: 'none' | 'smart';
  language: 'vi' | 'en';
  theme: 'light' | 'dark';
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  isDark?: boolean;
}

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline" | "warning" | "success";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  className?: string;
  isDark?: boolean;
}

const Button = ({ children, onClick, variant = 'primary', className = '', isDark = false, ...props }: ButtonProps) => {
  const baseStyle = "px-4 py-2 rounded-none font-medium transition-all duration-200 active:translate-y-[1px] flex items-center justify-center gap-2 uppercase tracking-wide text-xs border font-sans";
  
  const variants = {
    primary: "bg-[#6482AD] text-white border-[#6482AD] hover:bg-[#506b8f] hover:border-[#506b8f]",
    secondary: isDark 
      ? "bg-slate-700 text-slate-200 border-slate-700 hover:bg-slate-600" 
      : "bg-[#E2DAD6] text-[#6482AD] border-[#E2DAD6] hover:bg-[#d4c3bd]",
    outline: isDark
      ? "bg-transparent border-[#6482AD] text-[#6482AD] hover:bg-[#6482AD]/20"
      : "bg-transparent border-[#6482AD] text-[#6482AD] hover:bg-[#6482AD]/5",
    ghost: isDark
      ? "bg-transparent border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      : "bg-transparent border-transparent text-[#6482AD]/70 hover:bg-[#6482AD]/10 hover:text-[#6482AD]",
    danger: isDark
      ? "bg-red-900/20 text-red-400 border-red-900/30 hover:bg-red-900/40"
      : "bg-red-50 text-red-500 border-red-100 hover:bg-red-100",
    warning: "bg-amber-500 text-white border-amber-500 hover:bg-amber-600",
    success: "bg-green-600 text-white border-green-600 hover:bg-green-700",
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ label, isDark, ...props }: InputProps) => (
  <div className="flex flex-col gap-1 w-full font-sans">
    {label && <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider ml-1">{label}</label>}
    <input
      className={`w-full border-b-2 border-transparent focus:border-[#6482AD] rounded-none px-4 py-3 transition-all outline-none placeholder:text-[#6482AD]/30 
        ${isDark ? 'bg-slate-800 text-slate-100' : 'bg-[#F5EDED] text-[#2C3E50]'}`}
      {...props}
    />
  </div>
);

const Dialog = ({ isOpen, onClose, title, children, footer, isDark }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; isDark: boolean }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-[#2C3E50]/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className={`rounded-none shadow-2xl w-full max-w-md z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 border-2 border-[#6482AD]/20 
        ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white'}`}>
        <div className={`p-4 px-6 flex justify-between items-center border-b border-[#6482AD]/10 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <h3 className={`text-xl font-bold uppercase tracking-widest ${isDark ? 'text-slate-100' : 'text-[#6482AD]'}`}>{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#6482AD]/10 text-[#6482AD] transition rounded-none">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className={`p-4 border-t border-[#6482AD]/10 flex justify-end gap-2 ${isDark ? 'bg-slate-800/50' : 'bg-[#F5EDED]/30'}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};


const BillSplitter = () => {
  const [activeTab, setActiveTab] = useState<'members' | 'bills' | 'summary' | 'history' | 'settings'>('members');
  const [members, setMembers] = useState<Member[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ roundingMode: 'none', language: 'vi', theme: 'light' });

  const [newMemberName, setNewMemberName] = useState('');
  const [isEditingBill, setIsEditingBill] = useState<boolean>(false);
  const [editingBillId, setEditingBillId] = useState<number | null>(null);
  const [billAmount, setBillAmount] = useState('');
  const [billDesc, setBillDesc] = useState('');
  const [billPayer, setBillPayer] = useState<string>('');
  const [billSplitType, setBillSplitType] = useState<'equal' | 'advanced'>('equal');
  const [billSelectedMembers, setBillSelectedMembers] = useState<number[]>([]);
  const [billExtraSplits, setBillExtraSplits] = useState<ExtraSplit[]>([]);
  const [isSplitDialogOpen, setIsSplitDialogOpen] = useState(false);
  const [currentSplitItem, setCurrentSplitItem] = useState<{ name: string, amount: string, members: number[] }>({
    name: '', amount: '', members: []
  });
  const [historyDetailBill, setHistoryDetailBill] = useState<Bill | null>(null);

  const t = TRANSLATIONS[settings.language];
  const isDark = settings.theme === 'dark';

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedMembers = localStorage.getItem("aesthetic_members");
        const savedBills = localStorage.getItem("aesthetic_bills");
        const savedSettings = localStorage.getItem("aesthetic_settings");

        if (savedMembers) setMembers(JSON.parse(savedMembers));
        if (savedBills) setBills(JSON.parse(savedBills));
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            setSettings(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error("Load error", e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('aesthetic_members', JSON.stringify(members));
    localStorage.setItem('aesthetic_bills', JSON.stringify(bills));
    localStorage.setItem('aesthetic_settings', JSON.stringify(settings));
  }, [members, bills, settings]);

  const formatMoney = (amount: number) => new Intl.NumberFormat(settings.language === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(amount);
  const formatNumberOnly = (amount: number) => new Intl.NumberFormat(settings.language === 'vi' ? 'vi-VN' : 'en-US').format(amount);

  const getRemainingAmount = () => {
    const total = parseFloat(billAmount) || 0;
    const allocated = billExtraSplits.reduce((acc, curr) => acc + curr.amount, 0);
    return total - allocated;
  };

  const smartRound = (amount: number, mode: 'none' | 'smart') => {
    if (mode === 'none') return amount;
    const remainder = amount % 1000;
    if (remainder === 500) return amount;
    if (remainder < 500) return Math.floor(amount / 1000) * 1000;
    return Math.ceil(amount / 1000) * 1000;
  };

  const addMember = () => {
    if (!newMemberName.trim()) return;
    const newMember = { id: Date.now(), name: newMemberName.trim() };
    setMembers([...members, newMember]);
    setNewMemberName('');
    setBillSelectedMembers(prev => [...prev, newMember.id]);
  };

  const removeMember = (id: number) => {
    if (confirm(t.confirmDeleteMember)) {
      setMembers(members.filter(m => m.id !== id));
      setBills(bills.filter(b => b.payer !== id));
    }
  };

  const resetBillForm = () => {
    setBillAmount('');
    setBillDesc('');
    setBillPayer('');
    setBillSplitType('equal');
    setBillSelectedMembers(members.map(m => m.id));
    setBillExtraSplits([]);
    setIsEditingBill(false);
    setEditingBillId(null);
  };

  const handleSaveBill = () => {
    if (!billAmount || !billDesc || !billPayer) {
      alert(t.alertFillInfo);
      return;
    }

    const action = isEditingBill ? t.update : t.create;
    if (!confirm(`${t.alertConfirmAction} ${action} ${t.alertConfirmBill}`)) return;

    const newBill: Bill = {
      id: editingBillId || Date.now(),
      amount: parseFloat(billAmount),
      description: billDesc,
      payer: parseInt(billPayer),
      date: new Date().toLocaleDateString(settings.language === 'vi' ? 'vi-VN' : 'en-US'),
      splitType: billSplitType,
      selectedMembers: billSelectedMembers,
      extraSplits: billExtraSplits,
      status: 'open'
    };

    if (isEditingBill) {
      const existingStatus = bills.find(b => b.id === newBill.id)?.status || 'open';
      setBills(bills.map(b => b.id === newBill.id ? { ...newBill, status: existingStatus } : b));
    } else {
      setBills([...bills, newBill]);
    }
    resetBillForm();
    setActiveTab('bills');
  };

  const editBill = (bill: Bill) => {
    if (!confirm(`${t.alertConfirmAction} ${t.update} ${t.alertConfirmBill}`)) return;
    setBillAmount(bill.amount.toString());
    setBillDesc(bill.description);
    setBillPayer(bill.payer.toString());
    setBillSplitType(bill.splitType);
    setBillSelectedMembers(bill.selectedMembers);
    setBillExtraSplits(bill.extraSplits);
    setIsEditingBill(true);
    setEditingBillId(bill.id);
    setActiveTab('bills');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    if (confirm(t.alertEditCancel)) {
      resetBillForm();
    }
  };

  const deleteBill = (id: number) => {
    if (confirm(t.alertDeleteBill)) {
      setBills(bills.filter(b => b.id !== id));
    }
  }

  const openAddSplitItem = () => {
    setCurrentSplitItem({ name: '', amount: '', members: [] });
    setIsSplitDialogOpen(true);
  };

  const saveSplitItem = () => {
    const amt = parseFloat(currentSplitItem.amount);
    if (!currentSplitItem.name || isNaN(amt) || currentSplitItem.members.length === 0) {
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
      members: currentSplitItem.members
    };
    setBillExtraSplits([...billExtraSplits, newItem]);
    setIsSplitDialogOpen(false);
  };

  const removeSplitItem = (id: number) => {
    setBillExtraSplits(billExtraSplits.filter(i => i.id !== id));
  };

  const settleAllBills = () => {
    if (confirm(t.settleConfirm)) {
      setBills(bills.map(b => b.status === 'open' ? { ...b, status: 'closed' } : b));
      setActiveTab('history');
    }
  };

  const calculateTransfers = useMemo(() => {
    const balances: Record<number, number> = {};
    members.forEach(m => balances[m.id] = 0);

    const openBills = bills.filter(b => b.status === 'open');

    openBills.forEach(bill => {
      const payer = bill.payer;
      const totalAmount = bill.amount;
      const shares: Record<number, number> = {};

      if (bill.splitType === 'equal') {
        const involvedCount = bill.selectedMembers.length || 1;
        const share = totalAmount / involvedCount;
        bill.selectedMembers.forEach(id => shares[id] = share);
      } else {
        let allocatedAmount = 0;
        bill.extraSplits.forEach(split => {
          const splitShare = split.amount / split.members.length;
          split.members.forEach(id => {
            shares[id] = (shares[id] || 0) + splitShare;
          });
          allocatedAmount += split.amount;
        });
        const remaining = totalAmount - allocatedAmount;
        if (remaining > 0) {
          const share = remaining / members.length;
          members.forEach(m => shares[m.id] = (shares[m.id] || 0) + share);
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
          amount: finalAmount
        });
      }

      debtor.amount += amount;
      creditor.amount -= amount;

      if (Math.abs(debtor.amount) < 1) i++;
      if (creditor.amount < 1) j++;
    }

    return transfers;
  }, [bills, members, settings.roundingMode]);

  const groupedTransfers = useMemo(() => {
    const groups: Record<number, { receiverName: string, totalReceive: number, senders: { name: string, amount: number }[] }> = {};

    calculateTransfers.forEach(t => {
      if (!groups[t.to]) {
        groups[t.to] = {
          receiverName: members.find(m => m.id === t.to)?.name || 'Unknown',
          totalReceive: 0,
          senders: []
        };
      }
      const senderName = members.find(m => m.id === t.from)?.name || 'Unknown';
      groups[t.to].senders.push({ name: senderName, amount: t.amount });
      groups[t.to].totalReceive += t.amount;
    });
    return Object.values(groups);
  }, [calculateTransfers, members]);

  const openBillsCount = bills.filter(b => b.status === 'open').length;

  return (
    <div className={`min-h-screen font-sans selection:bg-[#6482AD] selection:text-white pb-24 transition-colors duration-300
      ${isDark ? 'bg-slate-900 text-slate-200' : 'bg-[#F5EDED] text-[#2C3E50]'}`}>
      
      <header className={`pt-10 pb-6 px-6 border-b mb-6 sticky top-0 z-20 backdrop-blur-md
        ${isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-[#6482AD]/20'}`}>
        <div className="max-w-md mx-auto flex justify-between items-end">
          <div>
            <p className="text-[#6482AD] text-[10px] font-bold tracking-[0.3em] uppercase mb-1">My Finance</p>
            <h1 className={`text-3xl font-bold tracking-tight uppercase ${isDark ? 'text-slate-100' : 'text-[#2C3E50]'}`}>SplitBiller</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 space-y-6">

        <div className={`p-1 flex shadow-sm border rounded-none overflow-x-auto
           ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#6482AD]/20'}`}>
          {[
            { id: 'members', icon: User, label: t.members },
            { id: 'bills', icon: Receipt, label: t.bills, badge: openBillsCount > 0 ? openBillsCount : null },
            { id: 'summary', icon: Check, label: t.summary },
            { id: 'history', icon: History, label: t.history },
            { id: 'settings', icon: Settings, label: t.settings }
          ].map((tab) => {
            const isSummary = tab.id === 'summary';
            const isSummaryDisabled = isSummary && openBillsCount === 0;
            const badge = isSummary ? (openBillsCount > 0 ? true : null) : tab.badge;

            return (
              <button
                key={tab.id}
                disabled={isSummaryDisabled}
                onClick={() => !isSummaryDisabled && setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 min-w-[60px] py-3 flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-all rounded-none relative 
                ${isSummaryDisabled ? 'opacity-20 cursor-not-allowed' : activeTab === tab.id
                    ? 'bg-[#6482AD] text-white shadow-md'
                    : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-[#6482AD]/60 hover:text-[#6482AD] hover:bg-[#6482AD]/5'
                  }`}
              >
                <div className="relative">
                  <tab.icon size={16} />
                  {badge && (
                    isSummary ? (
                      <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
                    ) : (
                      <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-white">
                        {badge}
                      </span>
                    )
                  )}
                </div>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'members' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-4">
            <div className={`p-6 shadow-lg border rounded-none ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#6482AD]/10'}`}>
              <h2 className={`text-xl font-bold mb-4 uppercase tracking-widest border-b pb-2 ${isDark ? 'text-slate-100 border-slate-700' : 'text-[#2C3E50] border-gray-100'}`}>Team</h2>
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder={t.addMemberPlaceholder}
                  value={newMemberName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMemberName(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && addMember()}
                  isDark={isDark}
                />
                <Button onClick={addMember} className="w-12 h-12 p-0! shrink-0">
                  <Plus size={24} />
                </Button>
              </div>

              <div className="space-y-3">
                {members.length === 0 && <p className="text-center text-gray-400 italic py-4">{t.emptyMember}</p>}
                {members.map(m => (
                  <div key={m.id} className={`group flex items-center justify-between p-3 transition-colors border border-transparent rounded-none
                    ${isDark ? 'bg-slate-700 hover:bg-slate-600 hover:border-slate-500' : 'bg-[#F5EDED] hover:bg-[#E2DAD6] hover:border-[#6482AD]/20'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center text-[#6482AD] ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border border-[#6482AD]/30'}`}>
                        <User size={16} />
                      </div>
                      <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-[#2C3E50]'}`}>{m.name}</span>
                    </div>
                    <button onClick={() => removeMember(m.id)} className="text-red-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-none">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bills' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-6">
            <div className={`p-6 shadow-lg shadow-[#6482AD]/10 border-t-4 relative overflow-hidden rounded-none transition-colors duration-300 
              ${isDark ? 'bg-slate-800' : 'bg-white'}
              ${isEditingBill ? 'border-amber-500' : 'border-[#6482AD]'}`}>
              
              {isEditingBill && (
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg">
                  {t.editingBill}
                </div>
              )}

              <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-widest ${isEditingBill ? 'text-amber-600' : isDark ? 'text-slate-100' : 'text-[#2C3E50]'}`}>
                {isEditingBill ? <Edit2 size={20} /> : <Plus size={24} />}
                {isEditingBill ? t.editBillTitle : t.addBillTitle}
              </h2>

              <div className="space-y-4">
                <Input label={t.descLabel} placeholder={t.descPlaceholder} value={billDesc} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBillDesc(e.target.value)} isDark={isDark} />
                <div className="flex gap-4">
                  <Input label={t.amountLabel} type="number" placeholder="0" value={billAmount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBillAmount(e.target.value)} isDark={isDark} />
                  <div className="w-full flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider ml-1">{t.payerLabel}</label>
                    <select
                      className={`w-full rounded-none px-4 py-3 outline-none appearance-none cursor-pointer border-b-2 border-transparent focus:border-[#6482AD] font-sans
                        ${isDark ? 'bg-slate-700 text-slate-100' : 'bg-[#F5EDED] text-[#2C3E50]'}`}
                      value={billPayer}
                      onChange={(e) => setBillPayer(e.target.value)}
                    >
                      <option value="">{t.selectPayer}</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className={`flex p-1 rounded-none border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-[#F5EDED] border-gray-100'}`}>
                  <button
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-none 
                      ${billSplitType === 'equal' 
                        ? (isDark ? 'bg-slate-600 text-slate-100 shadow' : 'bg-white shadow text-[#6482AD] border border-gray-200')
                        : 'text-gray-400'}`}
                    onClick={() => setBillSplitType('equal')}
                  >
                    {t.splitEqual}
                  </button>
                  <button
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-none
                      ${billSplitType === 'advanced' 
                        ? (isDark ? 'bg-slate-600 text-slate-100 shadow' : 'bg-white shadow text-[#6482AD] border border-gray-200')
                        : 'text-gray-400'}`}
                    onClick={() => setBillSplitType('advanced')}
                  >
                    {t.splitAdvanced}
                  </button>
                </div>

                {billSplitType === 'equal' ? (
                  <div className={`p-4 border rounded-none ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-[#F5EDED]/30 border-[#6482AD]/10'}`}>
                    <p className="text-xs font-bold text-[#6482AD] uppercase mb-2">{t.whoJoins}</p>
                    <div className="flex flex-wrap gap-2">
                      {members.map(m => {
                        const isSelected = billSelectedMembers.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            onClick={() => {
                              if (isSelected) setBillSelectedMembers(prev => prev.filter(id => id !== m.id));
                              else setBillSelectedMembers(prev => [...prev, m.id]);
                            }}
                            className={`px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wide border transition-all ${isSelected 
                              ? 'bg-[#6482AD] text-white border-[#6482AD]' 
                              : (isDark ? 'bg-slate-800 text-slate-400 border-slate-600' : 'bg-white text-gray-400 border-gray-200')
                            }`}
                          >
                            {m.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className={`flex justify-between items-center p-3 border rounded-none ${getRemainingAmount() < 0 ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-blue-900/20 border-blue-800 text-blue-400'}`}>
                      <span className="text-sm font-medium">{t.remaining}</span>
                      <span className="font-bold font-mono">
                        {formatMoney(getRemainingAmount())}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {billExtraSplits.map((item,) => (
                        <div key={item.id} className={`flex items-center justify-between p-3 border shadow-sm rounded-none 
                          ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-100'}`}>
                          <div>
                            <div className={`font-bold ${isDark ? 'text-slate-200' : 'text-[#2C3E50]'}`}>{item.name}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <User size={10} /> {item.members.map(mid => members.find(m => m.id === mid)?.name).join(', ')}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-medium text-[#6482AD]">{formatMoney(item.amount)}</span>
                            <button onClick={() => removeSplitItem(item.id)} className="text-red-300 hover:text-red-500">
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" className="w-full border-dashed" onClick={openAddSplitItem} isDark={isDark}>
                      <Plus size={18} /> {t.addExtra}
                    </Button>
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  {isEditingBill && (
                    <Button variant="ghost" className="flex-1" onClick={cancelEdit} isDark={isDark}>{t.cancel}</Button>
                  )}
                  <Button variant={isEditingBill ? 'warning' : 'primary'} className="flex-1 py-3 text-sm shadow-lg shadow-[#6482AD]/10" onClick={handleSaveBill} isDark={isDark}>
                    {isEditingBill ? t.updateBill : t.saveBill}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#6482AD] pl-2 uppercase tracking-widest border-l-4 border-[#6482AD] ml-1 flex items-center gap-2">
                {t.waiting} <span className="text-[10px] bg-[#6482AD] text-white px-2 rounded-full">{openBillsCount}</span>
              </h3>
              {bills.filter(b => b.status === 'open').slice().reverse().map(bill => (
                <div key={bill.id} className={`p-4 shadow-sm border hover:border-[#6482AD]/30 transition cursor-pointer flex justify-between items-center group rounded-none
                  ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#F5EDED]'}`}>
                  <div onClick={() => editBill(bill)} className="flex-1">
                    <h4 className={`font-bold text-lg ${isDark ? 'text-slate-200' : 'text-[#2C3E50]'}`}>{bill.description}</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      <span className={`px-2 py-0.5 mr-2 uppercase tracking-wider text-[10px] font-bold ${isDark ? 'bg-slate-700 text-[#6482AD]' : 'bg-[#F5EDED] text-[#6482AD]'}`}>{members.find(m => m.id === bill.payer)?.name}</span>
                      {bill.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold text-xl ${isDark ? 'text-slate-100' : 'text-[#2C3E50]'}`}>{formatMoney(bill.amount)}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteBill(bill.id); }}
                      className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition opacity-0 group-hover:opacity-100 rounded-none"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {openBillsCount === 0 && <div className="text-center text-gray-400 text-sm italic py-4">{t.cleanBills}</div>}
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div className={`p-6 shadow-lg border rounded-none text-center space-y-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#6482AD]/10'}`}>
              <div className={`w-16 h-16 flex items-center justify-center mx-auto text-[#6482AD] rounded-none border 
                ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-[#F5EDED] border-[#6482AD]/20'}`}>
                <Calculator size={32} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold uppercase tracking-widest ${isDark ? 'text-slate-100' : 'text-[#2C3E50]'}`}>
                  {groupedTransfers.length === 0 ? t.emptySummary : t.summaryTitle}
                </h2>
              </div>

              {settings.roundingMode !== 'none' && (
                <div className="text-xs text-[#6482AD] bg-blue-50/10 p-2 border border-blue-500/20 uppercase tracking-wide flex items-center justify-center gap-2">
                  <Settings size={12} />
                  {t.roundingMode}: {settings.roundingMode === 'smart' ? t.smart : t.even}
                </div>
              )}

              <div className="space-y-4 text-left">
                {groupedTransfers.length !== 0 && (
                  groupedTransfers.map((group, idx) => (
                    <div key={idx} className={`border p-4 rounded-none ${isDark ? 'border-slate-600 bg-slate-700/30' : 'border-[#6482AD]/20 bg-[#F5EDED]/20'}`}>
                      <div className="font-bold text-[#6482AD] mb-3 text-lg border-b border-[#6482AD]/10 pb-2">
                        {t.transferTo} {group.receiverName}:
                      </div>
                      <div className="space-y-2 pl-2">
                        {group.senders.map((sender, sIdx) => (
                          <div key={sIdx} className={`flex justify-between items-center font-mono text-sm ${isDark ? 'text-slate-300' : 'text-[#2C3E50]'}`}>
                            <span>- {sender.name}:</span>
                            <span className="font-bold">{formatMoney(sender.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {groupedTransfers.length > 0 && (
                <div className={`space-y-3 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
                  <Button
                    variant="primary"
                    className="w-full py-4 shadow-xl shadow-[#6482AD]/10 border-2 border-[#6482AD]"
                    onClick={() => {
                      const text = groupedTransfers.map(group => {
                        let block = `${t.transferTo} ${group.receiverName}:\n`;
                        block += group.senders.map(s => `- ${s.name}: ${formatNumberOnly(s.amount)}`).join('\n');
                        return block;
                      }).join('\n\n');
                      navigator.clipboard.writeText(text);
                      alert(t.alertCopy);
                    }}
                    isDark={isDark}
                  >
                    <Copy size={18} /> {t.copy}
                  </Button>

                  <Button
                    variant="success"
                    className="w-full py-4 border-2"
                    onClick={settleAllBills}
                    isDark={isDark}
                  >
                    <Check size={18} /> {t.settle}
                  </Button>
                  <p className="text-[10px] text-gray-400 italic">
                    {t.settleHint}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-4">
            <div className={`p-6 shadow-lg border rounded-none ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#6482AD]/10'}`}>
              <h2 className={`text-xl font-bold mb-4 uppercase tracking-widest border-b pb-2 flex items-center gap-2 ${isDark ? 'text-slate-100 border-slate-700' : 'text-[#2C3E50] border-gray-100'}`}>
                <ArchiveRestore size={20} /> {t.archive}
              </h2>
              <p className="text-xs text-gray-400 mb-4">{t.archiveDesc}</p>

              <div className="space-y-3">
                {bills.filter(b => b.status === 'closed').slice().reverse().map(bill => (
                  <div key={bill.id} className={`p-3 border rounded-none flex justify-between items-center group ${isDark ? 'bg-slate-700 border-slate-600 text-slate-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                    <div>
                      <div className={`font-bold ${isDark ? 'text-slate-200' : 'text-[#2C3E50]'}`}>{bill.description}</div>
                      <div className="text-[10px] uppercase">
                        {t.paidBy} {members.find(m => m.id === bill.payer)?.name} • {formatMoney(bill.amount)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" className="h-8 px-2" onClick={() => setHistoryDetailBill(bill)} isDark={isDark}>
                        <Eye size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
                {bills.filter(b => b.status === 'closed').length === 0 && (
                  <div className="text-center py-8 text-gray-300 italic">{t.emptyHistory}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-4">
            <div className={`p-6 shadow-lg border rounded-none space-y-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#6482AD]/10'}`}>
              <h2 className={`text-xl font-bold uppercase tracking-widest border-b pb-2 flex items-center gap-2 ${isDark ? 'text-slate-100 border-slate-700' : 'text-[#2C3E50] border-gray-100'}`}>
                <Settings size={20} /> {t.settingTitle}
              </h2>

              <div className="space-y-4">
                <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider block">{t.roundingSetting}</label>
                <div className="space-y-2">
                  <div
                    onClick={() => setSettings({ ...settings, roundingMode: 'none' })}
                    className={`p-3 border cursor-pointer transition-all flex justify-between items-center 
                      ${settings.roundingMode === 'none' 
                        ? (isDark ? 'border-[#6482AD] bg-slate-700' : 'border-[#6482AD] bg-blue-50') 
                        : (isDark ? 'border-slate-600' : 'border-gray-200')}`}
                  >
                    <div>
                      <div className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-[#2C3E50]'}`}>{t.roundingNone}</div>
                      <div className="text-[10px] text-gray-400">{t.roundingNoneDesc}</div>
                    </div>
                    {settings.roundingMode === 'none' && <Check size={16} className="text-[#6482AD]" />}
                  </div>

                  <div
                    onClick={() => setSettings({ ...settings, roundingMode: 'smart' })}
                    className={`p-3 border cursor-pointer transition-all flex justify-between items-center 
                      ${settings.roundingMode === 'smart' 
                        ? (isDark ? 'border-[#6482AD] bg-slate-700' : 'border-[#6482AD] bg-blue-50') 
                        : (isDark ? 'border-slate-600' : 'border-gray-200')}`}
                  >
                    <div>
                      <div className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-[#2C3E50]'}`}>{t.smart}</div>
                      <div className="text-[10px] text-gray-400">{t.roundingSmartDesc}</div>
                    </div>
                    {settings.roundingMode === 'smart' && <Check size={16} className="text-[#6482AD]" />}
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-[#6482AD]/10 pt-4">
                <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider block">{t.language}</label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSettings({ ...settings, language: 'vi' })}
                        className={`flex-1 p-3 border text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all
                            ${settings.language === 'vi' 
                                ? 'bg-[#6482AD] text-white border-[#6482AD]' 
                                : isDark ? 'bg-transparent border-slate-600 text-slate-400' : 'bg-transparent border-gray-200 text-gray-400'}`}
                    >
                        Tiếng Việt
                    </button>
                    <button
                        onClick={() => setSettings({ ...settings, language: 'en' })}
                        className={`flex-1 p-3 border text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all
                            ${settings.language === 'en' 
                                ? 'bg-[#6482AD] text-white border-[#6482AD]' 
                                : isDark ? 'bg-transparent border-slate-600 text-slate-400' : 'bg-transparent border-gray-200 text-gray-400'}`}
                    >
                        English
                    </button>
                </div>
              </div>

              <div className="space-y-4 border-t border-[#6482AD]/10 pt-4">
                <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider block">{t.theme}</label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSettings({ ...settings, theme: 'light' })}
                        className={`flex-1 p-3 border text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all
                            ${settings.theme === 'light' 
                                ? 'bg-[#E2DAD6] text-[#6482AD] border-[#E2DAD6]' 
                                : isDark ? 'bg-transparent border-slate-600 text-slate-400' : 'bg-transparent border-gray-200 text-gray-400'}`}
                    >
                        <Sun size={16} /> {t.light}
                    </button>
                    <button
                        onClick={() => setSettings({ ...settings, theme: 'dark' })}
                        className={`flex-1 p-3 border text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all
                            ${settings.theme === 'dark' 
                                ? 'bg-slate-700 text-slate-100 border-slate-700' 
                                : 'bg-transparent border-gray-200 text-gray-400'}`}
                    >
                        <Moon size={16} /> {t.dark}
                    </button>
                </div>
              </div>

              <div className="pt-4 text-center">
                <p className="text-[10px] text-gray-300 uppercase tracking-widest">{t.version}</p>
              </div>
            </div>
          </div>
        )}

      </main>

      <Dialog
        isOpen={isSplitDialogOpen}
        onClose={() => setIsSplitDialogOpen(false)}
        title={t.dialogSplitTitle}
        isDark={isDark}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsSplitDialogOpen(false)} isDark={isDark}>{t.cancel}</Button>
            <Button onClick={saveSplitItem} isDark={isDark}>{t.addExtra}</Button>
          </>
        }
      >
        <div className="space-y-4 font-sans">
          <div className={`flex items-center gap-2 text-sm p-3 border rounded-none ${getRemainingAmount() < 0 ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-blue-900/20 border-blue-800 text-blue-400'}`}>
            {getRemainingAmount() < 0 ? <AlertTriangle size={16} /> : <Info size={16} />}
            <span>
              {t.remainingSpace} <b>{formatMoney(getRemainingAmount() - (parseFloat(currentSplitItem.amount) || 0))}</b>
            </span>
          </div>

          <Input
            label={t.itemName}
            placeholder="E.g. Bia, Nước ngọt..."
            autoFocus
            value={currentSplitItem.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentSplitItem({ ...currentSplitItem, name: e.target.value })}
            isDark={isDark}
          />
          <Input
            label={t.itemPrice}
            type="number"
            placeholder="0"
            value={currentSplitItem.amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentSplitItem({ ...currentSplitItem, amount: e.target.value })}
            isDark={isDark}
          />

          <div>
            <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider ml-1 mb-2 block">{t.whoEats}</label>
            <div className="grid grid-cols-2 gap-2">
              {members.map(m => {
                const isSelected = currentSplitItem.members.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      const newMems = isSelected
                        ? currentSplitItem.members.filter(id => id !== m.id)
                        : [...currentSplitItem.members, m.id];
                      setCurrentSplitItem({ ...currentSplitItem, members: newMems });
                    }}
                    className={`p-2 border cursor-pointer transition-all flex items-center gap-2 rounded-none 
                        ${isSelected
                            ? 'bg-[#6482AD] border-[#6482AD] text-white shadow-md'
                            : isDark ? 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                  >
                    <div className={`w-4 h-4 border flex items-center justify-center rounded-none ${isSelected ? 'border-white' : 'border-gray-300'}`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-none" />}
                    </div>
                    <span className="text-sm font-medium truncate">{m.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={!!historyDetailBill}
        onClose={() => setHistoryDetailBill(null)}
        title={t.billDetail}
        isDark={isDark}
      >
        {historyDetailBill && (
          <div className="space-y-4">
            <div className={`p-4 border text-center ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`text-2xl font-bold uppercase ${isDark ? 'text-slate-100' : 'text-[#2C3E50]'}`}>{historyDetailBill.description}</h4>
              <p className="text-gray-500 text-sm">{historyDetailBill.date}</p>
              <div className="mt-2 text-3xl font-bold text-[#6482AD]">{formatMoney(historyDetailBill.amount)}</div>
              <div className="text-xs mt-1 uppercase tracking-wider">{t.paidBy}: <b>{members.find(m => m.id === historyDetailBill.payer)?.name}</b></div>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-xs uppercase text-gray-400 border-b pb-1">{t.splitDetail}</h5>
              {historyDetailBill.splitType === 'equal' ? (
                <div className={`p-3 border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-white border-gray-100'}`}>
                  <p className="mb-2"><span className="font-bold">{t.equalShare}</span> ({historyDetailBill.selectedMembers.length} {t.people}):</p>
                  <div className="flex flex-wrap gap-2">
                    {historyDetailBill.selectedMembers.map(mid => (
                      <span key={mid} className={`px-2 py-1 text-xs border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-200'}`}>
                        {members.find(m => m.id === mid)?.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {historyDetailBill.extraSplits.map((item, idx) => (
                    <div key={idx} className={`flex justify-between items-center p-2 border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-white border-gray-100'}`}>
                      <div>
                        <div className="font-bold">{item.name}</div>
                        <div className="text-xs text-gray-400">
                          {item.members.map(mid => members.find(m => m.id === mid)?.name).join(', ')}
                        </div>
                      </div>
                      <div className="font-mono">{formatMoney(item.amount)}</div>
                    </div>
                  ))}
                  {(() => {
                    const allocated = historyDetailBill.extraSplits.reduce((acc, curr) => acc + curr.amount, 0);
                    const remaining = historyDetailBill.amount - allocated;
                    if (remaining > 0) return (
                      <div className={`flex justify-between items-center p-2 border text-sm ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'}`}>
                        <div className="text-blue-500 font-bold">{t.remainder}</div>
                        <div className="font-mono text-blue-500">{formatMoney(remaining)}</div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default BillSplitter;