"use client";

import React, { ChangeEvent, InputHTMLAttributes, KeyboardEvent } from 'react';
import { useDebt } from '@/hooks/useDebt';
import { HeaderSwitch } from '@/components/HeaderSwitch';
import {
   Plus, HandCoins, PiggyBank, Wallet, AlertTriangle,
   User, Trash2
} from 'lucide-react';
import { DebtTab } from '@/hooks/useDebt';

type Props = InputHTMLAttributes<HTMLInputElement> & {
   isDark?: boolean;
};
// Reusable Components (Nếu ông chưa tách file thì để đây)
const Button = ({ children, onClick, className = '', isDark = false, variant = 'primary' }: { children: React.ReactNode, onClick?: () => void, className?: string, isDark?: boolean, variant?: 'primary' | 'danger' | 'borrow' | 'lend' }) => {
   // Style Monochrome Strictly
   let bgStyle = "";
   if (variant === 'danger') {
      bgStyle = "bg-red-500 text-white border-red-500 hover:bg-red-600";
   } else if (variant === 'borrow') {
      bgStyle = isDark ? "bg-red-900/50 text-red-200 border-red-900" : "bg-red-50 text-red-600 border-red-200";
   } else if (variant === 'lend') {
      bgStyle = "bg-[#6482AD] text-white border-[#6482AD]";
   } else {
      // Default Primary
      bgStyle = isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-[#6482AD] text-white hover:bg-[#506b8f]";
   }

   return (
      <button
         onClick={onClick}
         className={`px-4 py-2 rounded-none font-medium flex items-center justify-center gap-2 uppercase text-xs border transition-all ${bgStyle} ${className}`}
      >
         {children}
      </button>
   );
}

const Input = ({ isDark, ...props }: Props) => (
   <input
      {...props}
      className={`w-full border-b-2 p-3 outline-none rounded-none transition-colors
        ${isDark
            ? 'bg-neutral-900 text-white border-neutral-800 focus:border-white placeholder:text-neutral-600'
            : 'bg-gray-50 text-black border-gray-200 focus:border-[#6482AD] placeholder:text-gray-400'}`}
   />
);

export default function DebtPage() {
   const { state, computed, actions } = useDebt();
   const { isDark, t } = computed;

   return (
      <div className={`min-h-screen font-sans selection:bg-[#6482AD] selection:text-white pb-24 transition-colors duration-300
      ${isDark ? 'bg-black text-neutral-200' : 'bg-[#F5EDED] text-[#2C3E50]'}`}>

         <HeaderSwitch isDark={isDark} />

         <main className="max-w-md mx-auto px-4 space-y-6">

            {/* NAVIGATION TABS (Đã bỏ Settings) */}
            <div className={`p-1 flex shadow-sm border rounded-none overflow-x-auto
           ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#6482AD]/20'}`}>
               {[
                  { id: 'members', icon: User, label: t.members },
                  { id: 'input', icon: Plus, label: t.tabDebtInput },
                  { id: 'pay', icon: HandCoins, label: t.tabDebtPay, badge: computed.countMyDebt },
                  { id: 'receive', icon: PiggyBank, label: t.tabDebtReceive, badge: computed.countTheyOwe },
               ].map((tab) => {
                  const isPayTab = tab.id === 'pay';
                  return (
                     <button
                        key={tab.id}
                        onClick={() => actions.setActiveTab(tab.id as DebtTab)}
                        className={`flex-1 min-w-[60px] py-3 flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-all rounded-none relative 
                   ${state.activeTab === tab.id
                              ? 'bg-[#6482AD] text-white shadow-md'
                              : isDark ? 'text-neutral-500 hover:text-white hover:bg-neutral-800' : 'text-[#6482AD]/60 hover:text-[#6482AD] hover:bg-[#6482AD]/5'
                           }`}
                     >
                        <div className="relative">
                           <tab.icon size={16} />
                           {tab.badge ? (
                              <span className={`absolute -top-2 -right-2 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-white
                         ${isPayTab ? 'bg-red-500' : 'bg-[#6482AD]'}`}>
                                 {tab.badge}
                              </span>
                           ) : null}
                        </div>
                        <span className="hidden sm:inline">{tab.label}</span>
                     </button>
                  );
               })}
            </div>

            {/* --- CONTENT --- */}

            {/* 1. TAB MEMBERS */}
            {state.activeTab === 'members' && (
               <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-4">
                  <div className={`p-6 shadow-lg border rounded-none ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#6482AD]/10'}`}>
                     <h2 className={`text-xl font-bold mb-4 uppercase tracking-widest border-b pb-2 ${isDark ? 'text-white border-neutral-800' : 'text-[#2C3E50] border-gray-100'}`}>Team</h2>
                     <div className="flex gap-2 mb-6">
                        <Input
                           placeholder={t.addMemberPlaceholder}
                           value={state.newMemberName}
                           onChange={(e: ChangeEvent<HTMLInputElement>) => actions.setNewMemberName(e.target.value)}
                           onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && actions.addMember()}
                           isDark={isDark}
                        />
                        <Button onClick={actions.addMember} isDark={isDark} className="w-12 px-0">
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
                                 className="text-red-300 hover:text-red-500 p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {/* 2. NHẬP NỢ */}
            {state.activeTab === 'input' && (
               <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <div className={`p-6 shadow-lg border rounded-none ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#6482AD]/10'}`}>
                     <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-widest ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>
                        <Wallet size={24} /> {t.tabDebtInput}
                     </h2>

                     <div className="space-y-4">
                        {/* Chọn loại giao dịch */}
                        <div className="flex gap-2">
                           <button
                              onClick={() => actions.setNewDebt({ ...state.newDebt, type: 'borrow' })}
                              className={`flex-1 py-3 text-xs font-bold uppercase border rounded-none transition-all
                             ${state.newDebt.type === 'borrow'
                                    ? 'bg-red-500 text-white border-red-500'
                                    : isDark ? 'bg-neutral-800 text-neutral-500 border-neutral-700' : 'bg-white text-gray-400 border-gray-200'}`}
                           >
                              {t.typeBorrow}
                           </button>
                           <button
                              onClick={() => actions.setNewDebt({ ...state.newDebt, type: 'lend' })}
                              className={`flex-1 py-3 text-xs font-bold uppercase border rounded-none transition-all
                             ${state.newDebt.type === 'lend'
                                    ? 'bg-[#6482AD] text-white border-[#6482AD]'
                                    : isDark ? 'bg-neutral-800 text-neutral-500 border-neutral-700' : 'bg-white text-gray-400 border-gray-200'}`}
                           >
                              {t.typeLend}
                           </button>
                        </div>

                        <Input
                           type="number"
                           placeholder="0"
                           value={state.newDebt.amount}
                           onChange={(e: ChangeEvent<HTMLInputElement>) => actions.setNewDebt({ ...state.newDebt, amount: e.target.value })}
                           isDark={isDark}
                        />

                        <div className="w-full flex flex-col gap-1">
                           <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider ml-1">{t.members}</label>
                           <select
                              className={`w-full rounded-none px-4 py-3 outline-none appearance-none cursor-pointer border-b-2 border-transparent focus:border-[#6482AD] font-sans
                           ${isDark ? 'bg-neutral-900 text-white border-neutral-800' : 'bg-[#F5EDED] text-[#2C3E50]'}`}
                              value={state.newDebt.memberId}
                              onChange={(e) => actions.setNewDebt({ ...state.newDebt, memberId: e.target.value })}
                           >
                              <option value="">-- Select Member --</option>
                              {state.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                           </select>
                        </div>

                        <Input
                           placeholder={t.debtNote}
                           value={state.newDebt.note}
                           onChange={(e: ChangeEvent<HTMLInputElement>) => actions.setNewDebt({ ...state.newDebt, note: e.target.value })}
                           isDark={isDark}
                        />

                        <Button className="w-full py-4 mt-2" onClick={actions.addDebtRecord} isDark={isDark}>
                           {t.debtSave}
                        </Button>
                     </div>
                  </div>
               </div>
            )}

            {/* 3. MÌNH NỢ (MÀU ĐỎ) */}
            {state.activeTab === 'pay' && (
               <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <div className={`p-6 shadow-lg border rounded-none ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#6482AD]/10'}`}>
                     <h2 className="text-xl font-bold mb-4 uppercase tracking-widest text-red-500 flex items-center gap-2">
                        <AlertTriangle size={24} /> {t.totalOwe}
                     </h2>
                     <div className="space-y-3">
                        {state.debts.filter(d => d.type === 'borrow').length === 0 && <p className="text-center text-gray-400 italic">{t.emptyDebt}</p>}

                        {state.debts.filter(d => d.type === 'borrow').slice().reverse().map(debt => (
                           <div key={debt.id} className={`p-4 border-l-4 border-l-red-500 flex justify-between items-center
                           ${isDark ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border shadow-sm'}`}>
                              <div>
                                 <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>
                                    {actions.formatMoney(debt.amount)}
                                 </div>
                                 <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
                                    To: <b className={`${isDark ? 'text-neutral-300' : 'text-black'}`}>{state.members.find(m => m.id === debt.memberId)?.name}</b>
                                 </div>
                                 {debt.note && <div className="text-[10px] text-gray-500 italic mt-1">{debt.note}</div>}
                              </div>
                              <button onClick={() => actions.settleDebt(debt.id)} className="text-xs text-red-400 hover:text-red-600 font-bold uppercase border border-red-400/30 px-2 py-1 hover:bg-red-50 transition-colors">
                                 {t.markSettled}
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {/* 4. THU NỢ (MÀU ACCENT) */}
            {state.activeTab === 'receive' && (
               <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <div className={`p-6 shadow-lg border rounded-none ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#6482AD]/10'}`}>
                     <h2 className={`text-xl font-bold mb-4 uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>
                        <PiggyBank size={24} /> {t.totalReceivable}
                     </h2>
                     <div className="space-y-3">
                        {state.debts.filter(d => d.type === 'lend').length === 0 && <p className="text-center text-gray-400 italic">{t.emptyDebt}</p>}

                        {state.debts.filter(d => d.type === 'lend').slice().reverse().map(debt => (
                           <div key={debt.id} className={`p-4 border-l-4 border-l-[#6482AD] flex justify-between items-center
                           ${isDark ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border shadow-sm'}`}>
                              <div>
                                 <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>
                                    {actions.formatMoney(debt.amount)}
                                 </div>
                                 <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
                                    From: <b className={`${isDark ? 'text-neutral-300' : 'text-black'}`}>{state.members.find(m => m.id === debt.memberId)?.name}</b>
                                 </div>
                                 {debt.note && <div className="text-[10px] text-gray-500 italic mt-1">{debt.note}</div>}
                              </div>
                              <button onClick={() => actions.settleDebt(debt.id)} className="text-xs text-[#6482AD] hover:text-[#506b8f] font-bold uppercase border border-[#6482AD]/30 px-2 py-1 hover:bg-[#6482AD]/10 transition-colors">
                                 {t.markSettled}
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}

         </main>
      </div>
   );
}