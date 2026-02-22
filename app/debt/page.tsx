"use client";

import React, { ChangeEvent, InputHTMLAttributes, KeyboardEvent } from 'react';
import { useDebt } from '@/hooks/useDebt';
import { HeaderSwitch } from '@/components/HeaderSwitch';
import {
   Plus, HandCoins, PiggyBank, AlertTriangle,
   User, Trash2, Settings, Moon, Sun, History
} from 'lucide-react';
import { DebtTab } from '@/hooks/useDebt';

type Props = InputHTMLAttributes<HTMLInputElement> & {
   isDark?: boolean;
};

const Button = ({ children, onClick, className = '', isDark = false, variant = 'primary' }: { children: React.ReactNode, onClick?: () => void, className?: string, isDark?: boolean, variant?: 'primary' | 'danger' | 'borrow' | 'lend' }) => {
   let bgStyle = "";
   if (variant === 'danger') {
      bgStyle = "bg-red-500 text-white border-red-500 hover:bg-red-600";
   } else if (variant === 'borrow') {
      bgStyle = isDark ? "bg-red-900/50 text-red-200 border-red-900" : "bg-red-50 text-red-600 border-red-200";
   } else if (variant === 'lend') {
      bgStyle = "bg-[#6482AD] text-white border-[#6482AD]";
   } else {
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
      <div
         suppressHydrationWarning
         className={`min-h-screen font-sans selection:bg-[#6482AD] selection:text-white pb-24 transition-colors duration-300
      ${isDark ? 'bg-black text-neutral-200' : 'bg-[#F5EDED] text-[#2C3E50]'}`}>

         <HeaderSwitch isDark={isDark} splitText={t.splitText} debtText={t.debtText} />

         <main className="max-w-md mx-auto px-4 space-y-6">

            <div className="flex gap-3">
               <div className={`flex-1 p-3 border-l-4 border-red-500 shadow-sm rounded-none ${isDark ? 'bg-neutral-900 border-y border-r border-neutral-800' : 'bg-white border-y border-r border-gray-100'}`}>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t.totalOwe}</div>
                  <div className="text-base font-bold text-red-500 truncate">{actions.formatMoney(computed.totalBorrow)}</div>
               </div>
               <div className={`flex-1 p-3 border-l-4 border-[#6482AD] shadow-sm rounded-none ${isDark ? 'bg-neutral-900 border-y border-r border-neutral-800' : 'bg-white border-y border-r border-gray-100'}`}>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t.totalReceivable}</div>
                  <div className="text-base font-bold text-[#6482AD] truncate">{actions.formatMoney(computed.totalLend)}</div>
               </div>
            </div>

            <div className={`p-1 flex shadow-sm border rounded-none overflow-x-auto
           ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#6482AD]/20'}`}>
               {[
                  { id: 'input', icon: Plus, label: t.tabDebtInput },
                  { id: 'pay', icon: HandCoins, label: t.tabDebtPay, badge: computed.countMyDebt },
                  { id: 'receive', icon: PiggyBank, label: t.tabDebtReceive, badge: computed.countTheyOwe },
                  { id: 'history', icon: History, label: t.history || 'Lịch sử' },
                  { id: 'settings', icon: Settings, label: t.settings }
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



            {state.activeTab === 'input' && (
               <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <div className={`p-6 shadow-lg border rounded-none ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#6482AD]/10'}`}>
                     <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-widest ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>
                        {t.tabDebtInput}
                     </h2>

                     <div className="space-y-4">
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
                           <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider ml-1">
                              {t.members || 'Người dính nợ'}
                           </label>
                           <Input
                              list="history-members"
                              placeholder="Nhập tên mới hoặc chọn từ lịch sử..."
                              value={state.newDebt.memberName}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => actions.setNewDebt({ ...state.newDebt, memberName: e.target.value })}
                              isDark={isDark}
                           />
                           <datalist id="history-members">
                              {state.members.map(m => (
                                 <option key={m.id} value={m.name} />
                              ))}
                           </datalist>
                        </div>

                        <Input
                           type="date"
                           value={state.newDebt.date}
                           onChange={(e: ChangeEvent<HTMLInputElement>) => actions.setNewDebt({ ...state.newDebt, date: e.target.value })}
                           isDark={isDark}
                        />

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

            {state.activeTab === 'pay' && (
               <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <div className={`p-6 shadow-lg border rounded-none ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#6482AD]/10'}`}>
                     <div className="flex justify-between items-center mb-4 pb-2 border-b border-red-500/20">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-red-500 flex items-center gap-2">
                           {t.totalOwe}
                        </h2>
                     </div>
                     <div className="space-y-3">
                        {state.debts.filter(d => d.type === 'borrow' && d.status === 'active').length === 0 && <p className="text-center text-gray-400 italic">{t.emptyDebt}</p>}

                        {state.debts.filter(d => d.type === 'borrow' && d.status === 'active').slice().reverse().map(debt => {
                           const isGhost = !state.members.some(m => m.id === debt.memberId);
                           const displayName = isGhost ? debt.memberNameSnapshot : state.members.find(m => m.id === debt.memberId)?.name;

                           return (
                              <div key={debt.id} className={`p-4 border-l-4 border-l-red-500 flex justify-between items-center
                           ${isDark ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border shadow-sm'}`}>
                                 <div>
                                    <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>
                                       {actions.formatMoney(debt.amount)}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide flex items-center gap-1">
                                       To: <b className={`${isDark ? 'text-neutral-300' : 'text-black'}`}>{displayName}</b>
                                       {isGhost && <AlertTriangle size={12} className="text-amber-500" />}
                                    </div>
                                    {debt.note && <div className="text-[10px] text-gray-500 italic mt-1">{debt.note}</div>}
                                    <div className="text-[10px] text-gray-400 mt-1">{debt.date}</div>
                                 </div>
                                 <button onClick={() => actions.settleDebt(debt.id)} className="text-xs text-red-400 hover:text-red-600 font-bold uppercase border border-red-400/30 px-2 py-1 hover:bg-red-50 transition-colors">
                                    {t.markSettled}
                                 </button>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </div>
            )}

            {state.activeTab === 'receive' && (
               <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <div className={`p-6 shadow-lg border rounded-none ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#6482AD]/10'}`}>
                     <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#6482AD]/20">
                        <h2 className={`text-xl font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>
                           {t.totalReceivable}
                        </h2>
                     </div>
                     <div className="space-y-3">
                        {state.debts.filter(d => d.type === 'lend' && d.status === 'active').length === 0 && <p className="text-center text-gray-400 italic">{t.emptyDebt}</p>}

                        {state.debts.filter(d => d.type === 'lend' && d.status === 'active').slice().reverse().map(debt => {
                           const isGhost = !state.members.some(m => m.id === debt.memberId);
                           const displayName = isGhost ? debt.memberNameSnapshot : state.members.find(m => m.id === debt.memberId)?.name;

                           return (
                              <div key={debt.id} className={`p-4 border-l-4 border-l-[#6482AD] flex justify-between items-center
                           ${isDark ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border shadow-sm'}`}>
                                 <div>
                                    <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>
                                       {actions.formatMoney(debt.amount)}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide flex items-center gap-1">
                                       From: <b className={`${isDark ? 'text-neutral-300' : 'text-black'}`}>{displayName}</b>
                                       {isGhost && <AlertTriangle size={12} className="text-amber-500" />}
                                    </div>
                                    {debt.note && <div className="text-[10px] text-gray-500 italic mt-1">{debt.note}</div>}
                                    <div className="text-[10px] text-gray-400 mt-1">{debt.date}</div>
                                 </div>
                                 <button onClick={() => actions.settleDebt(debt.id)} className="text-xs text-[#6482AD] hover:text-[#506b8f] font-bold uppercase border border-[#6482AD]/30 px-2 py-1 hover:bg-[#6482AD]/10 transition-colors">
                                    {t.markSettled}
                                 </button>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </div>
            )}

            {state.activeTab === 'history' && (
               <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <div className={`p-6 shadow-lg border rounded-none ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#6482AD]/10'}`}>
                     <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-neutral-700">
                        <h2 className={`text-xl font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>
                           <History size={20} /> {t.history || 'Lịch sử'}
                        </h2>
                     </div>
                     <div className="space-y-3">
                        {state.debts.filter(d => d.status === 'settled').length === 0 && <p className="text-center text-gray-400 italic">Trống trơn</p>}

                        {state.debts.filter(d => d.status === 'settled').slice().reverse().map(debt => {
                           const isGhost = !state.members.some(m => m.id === debt.memberId);
                           const displayName = isGhost ? debt.memberNameSnapshot : state.members.find(m => m.id === debt.memberId)?.name;
                           const isBorrow = debt.type === 'borrow';

                           return (
                              <div key={debt.id} className={`p-4 border-l-4 flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity
                           ${isBorrow ? 'border-l-red-500' : 'border-l-[#6482AD]'}
                           ${isDark ? 'bg-neutral-800 border border-neutral-700' : 'bg-gray-50 border shadow-sm'}`}>
                                 <div>
                                    <div className={`font-bold text-lg line-through ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                       {actions.formatMoney(debt.amount)}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide flex items-center gap-1">
                                       {isBorrow ? 'To:' : 'From:'} <b className={`${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>{displayName}</b>
                                       {isGhost && <AlertTriangle size={12} className="text-amber-500" />}
                                    </div>
                                    {debt.note && <div className="text-[10px] text-gray-500 italic mt-1">{debt.note}</div>}
                                    <div className="text-[10px] text-gray-400 mt-1">{debt.date}</div>
                                 </div>
                                 <button onClick={() => actions.deleteDebt(debt.id)} className="text-red-300 hover:text-red-500 p-2 transition-colors">
                                    <Trash2 size={18} />
                                 </button>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </div>
            )}

            {state.activeTab === 'settings' && (
               <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-4">
                  <div className={`p-6 shadow-lg border rounded-none space-y-6 ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#6482AD]/10'}`}>
                     <h2 className={`text-xl font-bold uppercase tracking-widest pb-2 flex items-center gap-2 ${isDark ? 'text-white border-neutral-800' : 'text-[#2C3E50] border-gray-100'}`}>
                        <Settings size={20} /> {t.settingTitle || 'Settings'}
                     </h2>

                     <div className="space-y-4 border-t border-[#6482AD]/10 pt-4">
                        <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider block">{t.language || 'Language'}</label>
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
                        <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider block">{t.theme || 'Theme'}</label>
                        <div className="flex gap-2">
                           <button
                              onClick={() => actions.setSettings({ ...state.settings, theme: 'light' })}
                              className={`flex-1 p-3 border text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all
                                      ${state.settings.theme === 'light'
                                    ? 'bg-[#E2DAD6] text-[#6482AD] border-[#E2DAD6]'
                                    : isDark ? 'bg-transparent border-neutral-700 text-neutral-400' : 'bg-transparent border-gray-200 text-gray-400'}`}
                           >
                              <Sun size={16} /> Light
                           </button>
                           <button
                              onClick={() => actions.setSettings({ ...state.settings, theme: 'dark' })}
                              className={`flex-1 p-3 border text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all
                                      ${state.settings.theme === 'dark'
                                    ? 'bg-neutral-800 text-white border-neutral-700'
                                    : 'bg-transparent border-gray-200 text-gray-400'}`}
                           >
                              <Moon size={16} /> Dark
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            )}

         </main>
      </div>
   );
}