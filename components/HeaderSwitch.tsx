"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeftRight } from 'lucide-react';

export const HeaderSwitch = ({ isDark, splitText, debtText }: { isDark: boolean, splitText: string, debtText: string }) => {
  const pathname = usePathname();
  const isDebtMode = pathname?.startsWith('/debt');

  const currentApp = isDebtMode ? 'DebtBook' : 'SplitBiller';
  const targetApp = isDebtMode ? 'SplitBiller' : 'DebtBook';
  const targetLink = isDebtMode ? '/' : '/debt';
  const targetSubText = isDebtMode ? splitText : debtText;

  return (
    <header className={`pt-10 pb-6 px-6 border-b mb-6 sticky top-0 z-20 backdrop-blur-md transition-all duration-300
      ${isDark ? 'bg-black/90 border-neutral-800' : 'bg-white/90 border-[#6482AD]/20'}`}>
      <div className="max-w-md mx-auto flex justify-between items-end relative">
        
        <div>
          <p className="text-[#6482AD] text-[10px] font-bold tracking-[0.3em] uppercase mb-1">AnhPan</p>
          <h1 className={`text-3xl font-bold tracking-tight uppercase ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>
            {currentApp}
          </h1>
        </div>
        
        <Link href={targetLink} className="text-right group cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95">
          <div className="flex items-center justify-end gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider group-hover:text-[#6482AD]">
            {targetApp} <ArrowLeftRight size={12} />
          </div>
          <div className={`text-sm font-bold opacity-60 group-hover:opacity-100 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>
            {targetSubText}
          </div>
        </Link>

      </div>
    </header>
  );
};