"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeftRight } from 'lucide-react';

export const HeaderSwitch = ({ isDark }: { isDark: boolean }) => {
  const pathname = usePathname();
  const isDebtMode = pathname === '/debt';

  return (
    <header className={`pt-10 pb-6 px-6 border-b mb-6 sticky top-0 z-20 backdrop-blur-md transition-all duration-300
      ${isDark ? 'bg-black/90 border-neutral-800' : 'bg-white/90 border-[#6482AD]/20'}`}>
      <div className="max-w-md mx-auto flex justify-between items-end relative">
        
        {/* LOGIC HIỂN THỊ TIÊU ĐỀ */}
        {!isDebtMode ? (
           // TRANG CHỦ (SPLIT BILL)
           <>
             <div>
               <p className="text-[#6482AD] text-[10px] font-bold tracking-[0.3em] uppercase mb-1">My Finance</p>
               <h1 className={`text-3xl font-bold tracking-tight uppercase ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>SplitBiller</h1>
             </div>
             
             {/* Nút nhảy sang /debt */}
             <Link href="/debt" className="text-right group cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95">
                <div className="flex items-center justify-end gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider group-hover:text-[#6482AD]">
                   Sổ Nợ <ArrowLeftRight size={12} />
                </div>
                <div className={`text-sm font-bold opacity-60 group-hover:opacity-100 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>
                   Debt Book
                </div>
             </Link>
           </>
        ) : (
           // TRANG NỢ (DEBT)
           <>
              <div>
                 <p className="text-[#6482AD] text-[10px] font-bold tracking-[0.3em] uppercase mb-1">My Finance</p>
                 <h1 className={`text-3xl font-bold tracking-tight uppercase ${isDark ? 'text-white' : 'text-[#2C3E50]'}`}>Debt Book</h1>
              </div>

              {/* Nút nhảy về trang chủ / */}
              <Link href="/" className="text-right group cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95">
                 <div className="flex items-center justify-end gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider group-hover:text-[#6482AD]">
                    SplitBiller <ArrowLeftRight size={12} />
                 </div>
                 <div className={`text-sm font-bold opacity-60 group-hover:opacity-100 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>
                    Chia Bill
                 </div>
              </Link>
           </>
        )}
      </div>
    </header>
  );
};