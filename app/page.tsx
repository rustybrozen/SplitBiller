"use client";

import React, { useState, ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import {
  Trash2, Edit2, Plus, Copy, Check,
  Receipt, User, X, Calculator, Info,
  Settings, History, ArchiveRestore,
  Eye, AlertTriangle, Moon, Sun,
  QrCode,
  CreditCard
} from 'lucide-react';
import { useBillApp } from '@/hooks/useBillApp';
import { VIET_QR_BANKS } from '@/constants/banks';
import { HeaderSwitch } from '@/components/HeaderSwitch';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "warning" | "success";
  className?: string;
  isDark?: boolean;
}

const Button = ({ children, onClick, variant = 'primary', className = '', isDark = false, ...props }: ButtonProps) => {
  const baseStyle = "px-4 py-2 rounded-none font-medium transition-all duration-200 active:translate-y-[1px] flex items-center justify-center gap-2 uppercase tracking-wide text-xs border font-sans";

  const variants = {
    primary: "bg-[#6482AD] text-white border-[#6482AD] hover:bg-[#506b8f] hover:border-[#506b8f]",
    // Dark mode: Neutral 800 (Dark Gray) instead of Slate
    secondary: isDark
      ? "bg-neutral-800 text-neutral-200 border-neutral-800 hover:bg-neutral-700"
      : "bg-[#E2DAD6] text-[#6482AD] border-[#E2DAD6] hover:bg-[#d4c3bd]",
    outline: isDark
      ? "bg-transparent border-[#6482AD] text-[#6482AD] hover:bg-[#6482AD]/20"
      : "bg-transparent border-[#6482AD] text-[#6482AD] hover:bg-[#6482AD]/5",
    ghost: isDark
      ? "bg-transparent border-transparent text-neutral-400 hover:bg-neutral-800 hover:text-white"
      : "bg-transparent border-transparent text-[#6482AD]/70 hover:bg-[#6482AD]/10 hover:text-[#6482AD]",
    danger: isDark
      ? "bg-red-900/20 text-red-400 border-red-900/30 hover:bg-red-900/40"
      : "bg-red-50 text-red-500 border-red-100 hover:bg-red-100",
    warning: "bg-amber-500 text-white border-amber-500 hover:bg-amber-600",
    success: isDark
      ? "bg-white text-black border-white hover:bg-neutral-200" // Dark mode: Nút trắng sáng
      : "bg-[#2C3E50] text-white border-[#2C3E50] hover:bg-[#1a252f]",
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  isDark?: boolean;
}

const Input = ({ label, isDark, ...props }: InputProps) => (
  <div className="flex flex-col gap-1 w-full font-sans">
    {label && <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider ml-1">{label}</label>}
    <input
      className={`w-full border-b-2 border-transparent focus:border-[#6482AD] rounded-none px-4 py-3 transition-all outline-none placeholder:text-[#6482AD]/30 
      ${isDark ? 'bg-neutral-900 text-white border-neutral-800 focus:bg-black' : 'bg-[#F5EDED] text-[#2C3E50]'}`}
      {...props}
    />
  </div>
);

const Dialog = ({ isOpen, onClose, title, children, footer, isDark }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; isDark: boolean }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      {/* Backdrop đen hơn */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className={`rounded-none shadow-2xl w-full max-w-md z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 border-2 border-[#6482AD]/20 
        ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white'}`}>
        <div className={`p-4 px-6 flex justify-between items-center border-b border-[#6482AD]/10 ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
          <h3 className={`text-xl font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-[#6482AD]'}`}>{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#6482AD]/10 text-[#6482AD] transition rounded-none">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className={`p-4 border-t border-[#6482AD]/10 flex justify-end gap-2 ${isDark ? 'bg-black/40' : 'bg-[#F5EDED]/30'}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const BillSplitter = () => {
  const { state, computed, actions } = useBillApp();
  const { t, isDark } = computed;
  const [qrData, setQrData] = useState<{ url: string; amount: number; senderName: string } | null>(null);

  const openQrModal = (amount: number = 0, senderName: string = '') => {
    if (!state.settings.bankBin || !state.settings.bankAccountNo) {
      alert(t.missingBankInfo);
      actions.setActiveTab('settings');
      return;
    }

    const baseUrl = `https://img.vietqr.io/image/${state.settings.bankBin}-${state.settings.bankAccountNo}-compact.jpg`;
    const params = new URLSearchParams();

    if (amount > 0) {
      params.append('amount', amount.toString());
    }

    if (senderName) {
      const cleanName = senderName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
      params.append('addInfo', `${cleanName} tra tien`);
    }

    params.append('accountName', state.settings.bankAccountName || '');

    setQrData({
      url: `${baseUrl}?${params.toString()}`,
      amount,
      senderName
    });
  };

  return (
    // MAIN BACKGROUND: Chuyển sang bg-black
    <div className={`min-h-screen font-sans selection:bg-[#6482AD] selection:text-white pb-24 transition-colors duration-300
      ${isDark ? 'bg-black text-neutral-200' : 'bg-[#F5EDED] text-[#2C3E50]'}`}>

      <HeaderSwitch isDark={isDark} />

      <main className="max-w-md mx-auto px-4 space-y-6">

        {/* TABS CONTAINER */}
        <div className={`p-1 flex shadow-sm border rounded-none overflow-x-auto
           ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#6482AD]/20'}`}>
          {[
            { id: 'members', icon: User, label: t.members },
            { id: 'bills', icon: Receipt, label: t.bills, badge: computed.openBillsCount > 0 ? computed.openBillsCount : null },
            { id: 'summary', icon: Check, label: t.summary },
            { id: 'history', icon: History, label: t.history },
            { id: 'settings', icon: Settings, label: t.settings }
          ].map((tab) => {
            const isSummary = tab.id === 'summary';
            const isSummaryDisabled = isSummary && computed.openBillsCount === 0;
            const badge = isSummary ? (computed.openBillsCount > 0 ? true : null) : tab.badge;

            return (
              <button
                key={tab.id}
                disabled={isSummaryDisabled}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={() => !isSummaryDisabled && actions.setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[60px] py-3 flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-all rounded-none relative 
                ${isSummaryDisabled ? 'opacity-20 cursor-not-allowed' : state.activeTab === tab.id
                    ? 'bg-[#6482AD] text-white shadow-md'
                    : isDark ? 'text-neutral-500 hover:text-white hover:bg-neutral-800' : 'text-[#6482AD]/60 hover:text-[#6482AD] hover:bg-[#6482AD]/5'
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

        {state.activeTab === 'members' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-4">
            <div className={`p-6 shadow-lg border rounded-none ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#6482AD]/10'}`}>
              <h2 className={`text-xl font-bold mb-4 uppercase tracking-widest border-b pb-2 ${isDark ? 'text-white border-neutral-800' : 'text-[#2C3E50] border-gray-100'}`}>Team</h2>
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder={t.addMemberPlaceholder}
                  value={state.newMemberName}
                  onChange={(e) => actions.setNewMemberName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && actions.addMember()}
                  isDark={isDark}
                />
                <Button onClick={actions.addMember} className="w-12 h-12 p-0! shrink-0">
                  <Plus size={24} />
                </Button>
              </div>

              <div className="space-y-3">
                {state.members.length === 0 && <p className="text-center text-gray-400 italic py-4">{t.emptyMember}</p>}
                {state.members.map(m => (
                  <div key={m.id} className={`group flex items-center justify-between p-3 transition-colors border border-transparent rounded-none
                   ${isDark ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700' : 'bg-[#F5EDED] hover:bg-[#E2DAD6] hover:border-[#6482AD]/20'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center text-[#6482AD] ${isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white border border-[#6482AD]/30'}`}>
                        <User size={16} />
                      </div>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>{m.name}</span>
                    </div>
                    <button onClick={() => actions.removeMember(m.id)}
                      className={`text-red-300 hover:text-red-500 p-2 transition-opacity rounded-none
                        opacity-100 sm:opacity-0 sm:group-hover:opacity-100`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {state.activeTab === 'bills' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-6">
            <div className={`p-6 shadow-lg shadow-[#6482AD]/10 border-t-4 relative overflow-hidden rounded-none transition-colors duration-300 
             ${isDark ? 'bg-neutral-900' : 'bg-white'}
             ${state.isEditingBill ? 'border-amber-500' : 'border-[#6482AD]'}`}>

              {state.isEditingBill && (
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg">
                  {t.editingBill}
                </div>
              )}

              <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-widest ${state.isEditingBill ? 'text-amber-600' : isDark ? 'text-white' : 'text-[#2C3E50]'}`}>
                {state.isEditingBill ? <Edit2 size={20} /> : <Plus size={24} />}
                {state.isEditingBill ? t.editBillTitle : t.addBillTitle}
              </h2>

              <div className="space-y-4">
                <Input label={t.descLabel} placeholder={t.descPlaceholder} value={state.billDesc} onChange={(e) => actions.setBillDesc(e.target.value)} isDark={isDark} />
                <div className="flex gap-4">
                  <Input label={t.amountLabel} type="number" placeholder="0" value={state.billAmount} onChange={(e) => actions.setBillAmount(e.target.value)} isDark={isDark} />
                  <div className="w-full flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider ml-1">{t.payerLabel}</label>
                    <select
                      className={`w-full rounded-none px-4 py-3 outline-none appearance-none cursor-pointer border-b-2 border-transparent focus:border-[#6482AD] font-sans
                       ${isDark ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-[#F5EDED] text-[#2C3E50]'}`}
                      value={state.billPayer}
                      onChange={(e) => actions.setBillPayer(e.target.value)}
                    >
                      <option value="">{t.selectPayer}</option>
                      {state.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className={`flex p-1 rounded-none border ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-[#F5EDED] border-gray-100'}`}>
                  <button
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-none 
                     ${state.billSplitType === 'equal'
                        ? (isDark ? 'bg-neutral-700 text-white shadow' : 'bg-white shadow text-[#6482AD] border border-gray-200')
                        : 'text-gray-400'}`}
                    onClick={() => actions.setBillSplitType('equal')}
                  >
                    {t.splitEqual}
                  </button>
                  <button
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-none
                     ${state.billSplitType === 'advanced'
                        ? (isDark ? 'bg-neutral-700 text-white shadow' : 'bg-white shadow text-[#6482AD] border border-gray-200')
                        : 'text-gray-400'}`}
                    onClick={() => actions.setBillSplitType('advanced')}
                  >
                    {t.splitAdvanced}
                  </button>
                </div>

                {state.billSplitType === 'equal' ? (
                  <div className={`p-4 border rounded-none ${isDark ? 'bg-neutral-800/50 border-neutral-700' : 'bg-[#F5EDED]/30 border-[#6482AD]/10'}`}>
                    <p className="text-xs font-bold text-[#6482AD] uppercase mb-2">{t.whoJoins}</p>
                    <div className="flex flex-wrap gap-2">
                      {state.members.map(m => {
                        const isSelected = state.billSelectedMembers.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            onClick={() => {
                              if (isSelected) actions.setBillSelectedMembers(prev => prev.filter(id => id !== m.id));
                              else actions.setBillSelectedMembers(prev => [...prev, m.id]);
                            }}
                            className={`px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wide border transition-all ${isSelected
                              ? 'bg-[#6482AD] text-white border-[#6482AD]'
                              : (isDark ? 'bg-neutral-800 text-neutral-400 border-neutral-700' : 'bg-white text-gray-400 border-gray-200')
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
                    <div className={`flex justify-between items-center p-3 border rounded-none ${computed.remainingAmount < 0 ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-blue-900/20 border-blue-800 text-blue-400'}`}>
                      <span className="text-sm font-medium">{t.remaining}</span>
                      <span className="font-bold font-mono">
                        {actions.formatMoney(computed.remainingAmount)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {state.billExtraSplits.map((item) => (
                        <div key={item.id} className={`flex items-center justify-between p-3 border shadow-sm rounded-none 
                         ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-100'}`}>
                          <div>
                            <div className={`font-bold ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>{item.name}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <User size={10} /> {item.members.map(mid => state.members.find(m => m.id === mid)?.name).join(', ')}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-medium text-[#6482AD]">{actions.formatMoney(item.amount)}</span>
                            <button onClick={() => actions.removeSplitItem(item.id)} className="text-red-300 hover:text-red-500">
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" className="w-full border-dashed" onClick={actions.openAddSplitItem} isDark={isDark}>
                      <Plus size={18} /> {t.addExtra}
                    </Button>
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  {state.isEditingBill && (
                    <Button variant="ghost" className="flex-1" onClick={actions.cancelEdit} isDark={isDark}>{t.cancel}</Button>
                  )}
                  <Button variant={state.isEditingBill ? 'warning' : 'primary'} className="flex-1 py-3 text-sm shadow-lg shadow-[#6482AD]/10" onClick={actions.handleSaveBill} isDark={isDark}>
                    {state.isEditingBill ? t.updateBill : t.saveBill}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#6482AD] pl-2 uppercase tracking-widest border-l-4 border-[#6482AD] ml-1 flex items-center gap-2">
                {t.waiting} <span className="text-[10px] bg-[#6482AD] text-white px-2 rounded-full">{computed.openBillsCount}</span>
              </h3>
              {state.bills.filter(b => b.status === 'open').slice().reverse().map(bill => (
                <div key={bill.id} className={`p-4 shadow-sm border hover:border-[#6482AD]/30 transition cursor-pointer flex justify-between items-center group rounded-none
                 ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#F5EDED]'}`}>
                  <div onClick={() => actions.editBill(bill)} className="flex-1">
                    <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>{bill.description}</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      <span className={`px-2 py-0.5 mr-2 uppercase tracking-wider text-[10px] font-bold ${isDark ? 'bg-neutral-800 text-[#6482AD]' : 'bg-[#F5EDED] text-[#6482AD]'}`}>{state.members.find(m => m.id === bill.payer)?.name}</span>
                      {bill.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>{actions.formatMoney(bill.amount)}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); actions.deleteBill(bill.id); }}
                      className={`w-8 h-8 flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition rounded-none opacity-100 sm:opacity-0 sm:group-hover:opacity-100`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {computed.openBillsCount === 0 && <div className="text-center text-gray-400 text-sm italic py-4">{t.cleanBills}</div>}
            </div>
          </div>
        )}

        {state.activeTab === 'summary' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div className={`p-6 shadow-lg border rounded-none text-center space-y-6 ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#6482AD]/10'}`}>
              <div className={`w-16 h-16 flex items-center justify-center mx-auto text-[#6482AD] rounded-none border 
               ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-[#F5EDED] border-[#6482AD]/20'}`}>
                <Calculator size={32} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>
                  {computed.groupedTransfers.length === 0 ? t.emptySummary : t.summaryTitle}
                </h2>
              </div>
              {state.settings.simplifyDebts && computed.groupedTransfers.length > 0 && (
                <div className={`mx-auto max-w-sm mb-4 p-3 rounded-none border-l-4 text-left text-xs flex gap-2
                    ${isDark ? 'bg-blue-900/20 border-blue-500 text-blue-300' : 'bg-blue-50 border-blue-400 text-blue-600'}
                  `}>

                  <span>{t.simplifyNote}</span>
                </div>
              )}

              {state.settings.roundingMode !== 'none' && (
                <div className="text-xs text-[#6482AD] bg-blue-50/10 p-2 border border-blue-500/20 uppercase tracking-wide flex items-center justify-center gap-2">
                  <Settings size={12} />
                  {t.roundingMode}: {state.settings.roundingMode === 'smart' ? t.smart : t.even}
                </div>
              )}


              <div className="space-y-4 text-left">
                {computed.groupedTransfers.map((group, idx) => {

                  const isMeReceiving = state.settings.myId === group.receiverId;

                  return (
                    <div key={idx} className={`border p-4 rounded-none relative overflow-hidden 
  ${isMeReceiving
                        ? (isDark
                          ? 'border-[#6482AD] bg-[#6482AD]/10' // Viền xanh Brand, nền trong suốt
                          : 'border-[#6482AD] bg-[#6482AD]/5')
                        : (isDark ? 'border-neutral-700 bg-neutral-800/50' : 'border-[#6482AD]/20 bg-[#F5EDED]/20')}`
                    }>


                      {isMeReceiving && (

                        <div className="absolute top-0 right-0 bg-[#6482AD] text-white text-[10px] px-2 py-0.5 font-bold uppercase rounded-bl-md">
                          Me
                        </div>
                      )}

                      <div className="font-bold text-[#6482AD] mb-3 text-lg border-b border-[#6482AD]/10 pb-2 flex justify-between items-center">
                        <span>{t.transferTo} {group.receiverName}:</span>

                        {/* Nếu là Tôi nhận tiền -> Hiện nút Copy STK tổng */}
                        {isMeReceiving && (
                          <button

                            onClick={() => openQrModal(0, '')}
                            className="text-[10px] flex items-center gap-1 bg-white border px-2 py-1 rounded shadow-sm text-gray-500 hover:text-[#6482AD]"
                          >

                            <QrCode size={12} /> QR Code
                          </button>
                        )}
                      </div>

                      <div className="space-y-3 pl-2">
                        {group.senders.map((sender, sIdx) => (
                          <div key={sIdx} className={`flex justify-between items-center font-mono text-sm ${isDark ? 'text-neutral-300' : 'text-[#2C3E50]'}`}>
                            <div className="flex items-center gap-2">
                              <span>- {sender.name}:</span>
                              <span className="font-bold">{actions.formatMoney(sender.amount)}</span>
                            </div>

                            {/* NÚT HIỆN QR: Chỉ hiện khi TÔI là người nhận */}
                            {isMeReceiving && (
                              <button
                                onClick={() => openQrModal(sender.amount, sender.name)}
                                className="p-1.5 bg-[#6482AD] text-white rounded hover:bg-[#506b8f] transition shadow-sm flex items-center gap-1 text-[10px] font-bold uppercase"
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

              {computed.groupedTransfers.length > 0 && (
                <div className={`space-y-3 pt-4 border-t ${isDark ? 'border-neutral-700' : 'border-gray-100'}`}>
                  <Button
                    variant="primary"
                    className="w-full py-4 shadow-xl shadow-[#6482AD]/10 border-2 border-[#6482AD]"
                    onClick={() => {
                      const text = computed.groupedTransfers.map(group => {
                        let block = `${t.transferTo} ${group.receiverName}:\n`;
                        block += group.senders.map(s => `- ${s.name}: ${actions.formatNumberOnly(s.amount)}`).join('\n');
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
                    onClick={actions.settleAllBills}
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

        {state.activeTab === 'history' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-4">
            <div className={`p-6 shadow-lg border rounded-none ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#6482AD]/10'}`}>
              <h2 className={`text-xl font-bold mb-4 uppercase tracking-widest border-b pb-2 flex items-center gap-2 ${isDark ? 'text-white border-neutral-800' : 'text-[#2C3E50] border-gray-100'}`}>
                <ArchiveRestore size={20} /> {t.archive}
              </h2>
              <p className="text-xs text-gray-400 mb-4">{t.archiveDesc}</p>

              <div className="space-y-3">
                {state.bills.filter(b => b.status === 'closed').slice().reverse().map(bill => (
                  <div key={bill.id} className={`p-3 border rounded-none flex justify-between items-center group ${isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                    <div>
                      <div className={`font-bold ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>{bill.description}</div>
                      <div className="text-[10px] uppercase">
                        {t.paidBy} {state.members.find(m => m.id === bill.payer)?.name} • {actions.formatMoney(bill.amount)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" className="h-8 px-2" onClick={() => actions.setHistoryDetailBill(bill)} isDark={isDark}>
                        <Eye size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
                {state.bills.filter(b => b.status === 'closed').length === 0 && (
                  <div className="text-center py-8 text-gray-300 italic">{t.emptyHistory}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {state.activeTab === 'settings' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-4">
            <div className={`p-6 shadow-lg border rounded-none space-y-6 ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#6482AD]/10'}`}>
              <h2 className={`text-xl font-bold uppercase tracking-widest border-b pb-2 flex items-center gap-2 ${isDark ? 'text-white border-neutral-800' : 'text-[#2C3E50] border-gray-100'}`}>
                <Settings size={20} /> {t.settingTitle}
              </h2>

              <div className="space-y-4">
                <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider block">{t.roundingSetting}</label>
                <div className="space-y-2">
                  <div
                    onClick={() => actions.setSettings({ ...state.settings, roundingMode: 'none' })}
                    className={`p-3 border cursor-pointer transition-all flex justify-between items-center 
                      ${state.settings.roundingMode === 'none'
                        ? (isDark ? 'border-[#6482AD] bg-neutral-800' : 'border-[#6482AD] bg-blue-50')
                        : (isDark ? 'border-neutral-700' : 'border-gray-200')}`}
                  >
                    <div>
                      <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>{t.roundingNone}</div>
                      <div className="text-[10px] text-gray-400">{t.roundingNoneDesc}</div>
                    </div>
                    {state.settings.roundingMode === 'none' && <Check size={16} className="text-[#6482AD]" />}
                  </div>

                  <div
                    onClick={() => actions.setSettings({ ...state.settings, roundingMode: 'smart' })}
                    className={`p-3 border cursor-pointer transition-all flex justify-between items-center 
                      ${state.settings.roundingMode === 'smart'
                        ? (isDark ? 'border-[#6482AD] bg-neutral-800' : 'border-[#6482AD] bg-blue-50')
                        : (isDark ? 'border-neutral-700' : 'border-gray-200')}`}
                  >
                    <div>
                      <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>{t.smart}</div>
                      <div className="text-[10px] text-gray-400">{t.roundingSmartDesc}</div>
                    </div>
                    {state.settings.roundingMode === 'smart' && <Check size={16} className="text-[#6482AD]" />}
                  </div>
                </div>
              </div>
              {/* SETTING: NGÂN HÀNG & ĐỊNH DANH */}
              <div className="space-y-4 border-t border-[#6482AD]/10 pt-4">
                <h3 className="text-sm font-bold text-[#6482AD] uppercase tracking-wider flex items-center gap-2">
                  <CreditCard size={16} /> {t.bankSettings}
                </h3>

                {/* Chọn: Tôi là ai */}
                <div className="bg-yellow-50 p-3 border border-yellow-200 rounded-none mb-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">{t.whoAmI}</label>
                  <select
                    className="w-full bg-transparent font-bold text-[#2C3E50] outline-none"
                    value={state.settings.myId || ''}
                    onChange={(e) => actions.setSettings({ ...state.settings, myId: parseInt(e.target.value) })}
                  >
                    <option value="">-- Chọn tên của bạn --</option>
                    {state.members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* Dropdown Ngân hàng */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">{t.bankName}</label>
                  <select
                    className={`w-full p-2 border text-sm outline-none ${isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-200'}`}
                    value={state.settings.bankBin}
                    onChange={(e) => actions.setSettings({ ...state.settings, bankBin: e.target.value })}
                  >
                    <option value="">Chọn ngân hàng</option>
                    {VIET_QR_BANKS.map(b => (
                      <option key={b.bin} value={b.bin}>({b.shortName}) {b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Input STK */}
                <Input
                  label={t.bankAccount}
                  value={state.settings.bankAccountNo}
                  onChange={(e) => actions.setSettings({ ...state.settings, bankAccountNo: e.target.value })}
                  placeholder="0123456789"
                  isDark={isDark}
                />

                {/* Input Tên chủ thẻ */}
                <Input
                  label={t.bankOwner}
                  value={state.settings.bankAccountName}
                  onChange={(e) => actions.setSettings({ ...state.settings, bankAccountName: e.target.value.toUpperCase() })}
                  placeholder="NGUYEN VAN A"
                  isDark={isDark}
                />
              </div>

              <div className="space-y-4 border-t border-[#6482AD]/10 pt-4">
                <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider block">{t.language}</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => actions.setSettings({ ...state.settings, language: 'vi' })}
                    className={`flex-1 p-3 border text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all
                            ${state.settings.language === 'vi'
                        ? 'bg-[#6482AD] text-white border-[#6482AD]'
                        : isDark ? 'bg-transparent border-neutral-700 text-neutral-400' : 'bg-transparent border-gray-200 text-gray-400'}`}
                  >
                    Tiếng Việt
                  </button>
                  <button
                    onClick={() => actions.setSettings({ ...state.settings, language: 'en' })}
                    className={`flex-1 p-3 border text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all
                            ${state.settings.language === 'en'
                        ? 'bg-[#6482AD] text-white border-[#6482AD]'
                        : isDark ? 'bg-transparent border-neutral-700 text-neutral-400' : 'bg-transparent border-gray-200 text-gray-400'}`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="space-y-4 border-t border-[#6482AD]/10 pt-4">
                <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider block">{t.theme}</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => actions.setSettings({ ...state.settings, theme: 'light' })}
                    className={`flex-1 p-3 border text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all
                            ${state.settings.theme === 'light'
                        ? 'bg-[#E2DAD6] text-[#6482AD] border-[#E2DAD6]'
                        : isDark ? 'bg-transparent border-neutral-700 text-neutral-400' : 'bg-transparent border-gray-200 text-gray-400'}`}
                  >
                    <Sun size={16} /> {t.light}
                  </button>
                  <button
                    onClick={() => actions.setSettings({ ...state.settings, theme: 'dark' })}
                    className={`flex-1 p-3 border text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all
                            ${state.settings.theme === 'dark'
                        ? 'bg-neutral-800 text-white border-neutral-700'
                        : 'bg-transparent border-gray-200 text-gray-400'}`}
                  >
                    <Moon size={16} /> {t.dark}
                  </button>
                </div>
              </div>

              <div className="space-y-4 border-t border-[#6482AD]/10 pt-4">
                <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider block">{t.simplifyDebts}</label>
                <div
                  onClick={() => actions.setSettings({ ...state.settings, simplifyDebts: !state.settings.simplifyDebts })}
                  className={`p-3 border cursor-pointer transition-all flex justify-between items-center 
            ${isDark ? 'border-neutral-700' : 'border-gray-200'}
            ${state.settings.simplifyDebts ? (isDark ? 'bg-neutral-800' : 'bg-blue-50') : ''}
        `}
                >
                  <div className="flex-1 pr-4">
                    <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>
                      {t.simplifyDebts}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {t.simplifyDebtsDesc}
                    </div>
                  </div>

                  {/* Toggle Switch UI */}
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${state.settings.simplifyDebts ? 'bg-[#6482AD]' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${state.settings.simplifyDebts ? 'left-6' : 'left-1'}`} />
                  </div>
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
        isOpen={state.isSplitDialogOpen}
        onClose={() => actions.setIsSplitDialogOpen(false)}
        title={t.dialogSplitTitle}
        isDark={isDark}
        footer={
          <>
            <Button variant="ghost" onClick={() => actions.setIsSplitDialogOpen(false)} isDark={isDark}>{t.cancel}</Button>
            <Button onClick={actions.saveSplitItem} isDark={isDark}>{t.addExtra}</Button>
          </>
        }
      >
        <div className="space-y-4 font-sans">
          <div className={`flex items-center gap-2 text-sm p-3 border rounded-none ${computed.remainingAmount < 0 ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-blue-900/20 border-blue-800 text-blue-400'}`}>
            {computed.remainingAmount < 0 ? <AlertTriangle size={16} /> : <Info size={16} />}
            <span>
              {t.remainingSpace} <b>{actions.formatMoney(computed.remainingAmount - (parseFloat(state.currentSplitItem.amount) || 0))}</b>
            </span>
          </div>

          <Input
            label={t.itemName}
            placeholder="E.g. Bia, Nước ngọt..."
            autoFocus
            value={state.currentSplitItem.name}
            onChange={(e) => actions.setCurrentSplitItem({ ...state.currentSplitItem, name: e.target.value })}
            isDark={isDark}
          />
          <Input
            label={t.itemPrice}
            type="number"
            placeholder="0"
            value={state.currentSplitItem.amount}
            onChange={(e) => actions.setCurrentSplitItem({ ...state.currentSplitItem, amount: e.target.value })}
            isDark={isDark}
          />

          <div>
            <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider ml-1 mb-2 block">{t.whoEats}</label>
            <div className="grid grid-cols-2 gap-2">
              {state.members.map(m => {
                const isSelected = state.currentSplitItem.members.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      const newMems = isSelected
                        ? state.currentSplitItem.members.filter(id => id !== m.id)
                        : [...state.currentSplitItem.members, m.id];
                      actions.setCurrentSplitItem({ ...state.currentSplitItem, members: newMems });
                    }}
                    className={`p-2 border cursor-pointer transition-all flex items-center gap-2 rounded-none 
                        ${isSelected
                        ? 'bg-[#6482AD] border-[#6482AD] text-white shadow-md'
                        : isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
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
        isOpen={!!state.historyDetailBill}
        onClose={() => actions.setHistoryDetailBill(null)}
        title={t.billDetail}
        isDark={isDark}
      >
        {state.historyDetailBill && (
          <div className="space-y-4">
            <div className={`p-4 border text-center ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`text-2xl font-bold uppercase ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>{state.historyDetailBill.description}</h4>
              <p className="text-gray-500 text-sm">{state.historyDetailBill.date}</p>
              <div className="mt-2 text-3xl font-bold text-[#6482AD]">{actions.formatMoney(state.historyDetailBill.amount)}</div>
              <div className="text-xs mt-1 uppercase tracking-wider">{t.paidBy}: <b>{state.members.find(m => m.id === state.historyDetailBill!.payer)?.name}</b></div>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-xs uppercase text-gray-400 border-b pb-1">{t.splitDetail}</h5>
              {state.historyDetailBill.splitType === 'equal' ? (
                <div className={`p-3 border text-sm ${isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-white border-gray-100'}`}>
                  <p className="mb-2"><span className="font-bold">{t.equalShare}</span> ({state.historyDetailBill.selectedMembers.length} {t.people}):</p>
                  <div className="flex flex-wrap gap-2">
                    {state.historyDetailBill.selectedMembers.map(mid => (
                      <span key={mid} className={`px-2 py-1 text-xs border ${isDark ? 'bg-neutral-700 border-neutral-600' : 'bg-gray-100 border-gray-200'}`}>
                        {state.members.find(m => m.id === mid)?.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {state.historyDetailBill.extraSplits.map((item, idx) => (
                    <div key={idx} className={`flex justify-between items-center p-2 border text-sm ${isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-white border-gray-100'}`}>
                      <div>
                        <div className="font-bold">{item.name}</div>
                        <div className="text-xs text-gray-400">
                          {item.members.map(mid => state.members.find(m => m.id === mid)?.name).join(', ')}
                        </div>
                      </div>
                      <div className="font-mono">{actions.formatMoney(item.amount)}</div>
                    </div>
                  ))}
                  {(() => {
                    const allocated = state.historyDetailBill!.extraSplits.reduce((acc, curr) => acc + curr.amount, 0);
                    const remaining = state.historyDetailBill!.amount - allocated;
                    if (remaining > 0) return (
                      <div className={`flex justify-between items-center p-2 border text-sm ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'}`}>
                        <div className="text-blue-500 font-bold">{t.remainder}</div>
                        <div className="font-mono text-blue-500">{actions.formatMoney(remaining)}</div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        isOpen={!!qrData}
        onClose={() => setQrData(null)}
        title={qrData?.amount ? t.qrTitle : 'My Bank QR'} // Đổi title
        isDark={isDark}
      >
        {qrData && (
          <div className="text-center space-y-4">
            <div className="bg-white p-2 inline-block shadow-md border">
              <img src={qrData.url} alt="VietQR" className="w-64 h-64 object-contain" />
            </div>
            <div>

              {qrData.amount > 0 ? (

                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>
                  {actions.formatMoney(qrData.amount)}
                </div>
              ) : (
                // Trường hợp QR chung: Ẩn số tiền, hiện text hướng dẫn
                <div className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-neutral-300' : 'text-gray-500'}`}>
                  Quét mã để chuyển khoản
                </div>
              )}


              <div className="text-sm text-gray-500 mt-1">
                {state.settings.bankAccountName} • {state.settings.bankAccountNo}
              </div>


              {qrData.senderName && (
                <p className="text-xs text-gray-400 mt-2 italic">
                  Nội dung: <span className="bg-yellow-100 text-gray-700 px-1">{qrData.senderName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ")} tra tien</span>
                </p>
              )}
            </div>

            {/* Nút Copy */}
            <Button
              variant="outline"
              className="w-full mt-2 border-dashed"
              isDark={isDark}
              onClick={() => {
                const bankInfo = VIET_QR_BANKS.find(b => b.bin === state.settings.bankBin);
                const bankName = bankInfo ? `${bankInfo.shortName} - ${bankInfo.name}` : state.settings.bankBin;

                let textToCopy = `Tên ngân hàng: ${bankName}\nSố tài khoản: ${state.settings.bankAccountNo}\nTên: ${state.settings.bankAccountName}`;

                if (qrData.senderName) {
                  const cleanContent = `${qrData.senderName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ")} tra tien`;
                  textToCopy += `\nNội dung: ${cleanContent}`;
                }

                navigator.clipboard.writeText(textToCopy);
                alert(t.alertCopy);
              }}
            >
              <Copy size={14} /> Copy thông tin
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default BillSplitter;