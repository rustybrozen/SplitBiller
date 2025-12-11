"use client";
import { useState, useEffect } from 'react';
import { Member, AppSettings, DebtRecord } from '@/types';
import { TRANSLATIONS, Language } from '@/constants/translations';

// Định nghĩa Type cho State nội bộ để không dùng any
interface NewDebtState {
  amount: string;
  memberId: string;
  type: 'borrow' | 'lend';
  note: string;
}

// Định nghĩa Tab khả dụng (đã bỏ settings)
export type DebtTab = 'members' | 'input' | 'pay' | 'receive';

export const useDebt = () => {
  const [activeTab, setActiveTab] = useState<DebtTab>('input');
  const [isLoaded, setIsLoaded] = useState(false); // Cờ hiệu chống mất data

  // --- STATE DÙNG CHUNG ---
  const [members, setMembers] = useState<Member[]>([]);
  // Vẫn cần state settings để biết đang dùng tiếng Anh hay Việt, Sáng hay Tối
  const [settings, setSettings] = useState<AppSettings>({ 
    roundingMode: 'none', language: 'vi', theme: 'light', simplifyDebts: true 
  });
  
  const [newMemberName, setNewMemberName] = useState('');

  // --- STATE RIÊNG ---
  const [debts, setDebts] = useState<DebtRecord[]>([]);
  const [newDebt, setNewDebt] = useState<NewDebtState>({
    amount: '', memberId: '', type: 'lend', note: ''
  });

  // Ép kiểu Language để TypeScript không la ó
  const currentLang = (settings.language as Language) || 'vi';
  const t = TRANSLATIONS[currentLang];
  const isDark = settings.theme === 'dark';

  // --- LOAD DATA ---
  useEffect(() => {
    try {
        const savedMembers = localStorage.getItem("aesthetic_members");
        const savedSettings = localStorage.getItem("aesthetic_settings");
        const savedDebts = localStorage.getItem("aesthetic_debts");

        if (savedMembers) setMembers(JSON.parse(savedMembers));
        if (savedSettings) setSettings(JSON.parse(savedSettings));
        if (savedDebts) setDebts(JSON.parse(savedDebts));
    } catch (e) {
        console.error("Load error:", e);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  // --- SAVE DATA (Chỉ chạy khi đã Load xong) ---
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('aesthetic_members', JSON.stringify(members));
  }, [members, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('aesthetic_debts', JSON.stringify(debts));
  }, [debts, isLoaded]);


  // --- ACTIONS ---
  const addMember = () => {
    if (!newMemberName.trim()) return;
    const newMember: Member = { id: Date.now(), name: newMemberName.trim() };
    setMembers([...members, newMember]);
    setNewMemberName('');
  };

  const removeMember = (id: number) => {
    if (confirm(t.confirmDeleteMember)) {
      setMembers(members.filter(m => m.id !== id));
      setDebts(debts.filter(d => d.memberId !== id));
    }
  };

  const addDebtRecord = () => {
    if (!newDebt.amount || !newDebt.memberId) {
        alert(t.alertFillInfo); 
        return;
    }
    const record: DebtRecord = {
      id: Date.now(),
      memberId: parseInt(newDebt.memberId),
      amount: parseFloat(newDebt.amount),
      type: newDebt.type,
      note: newDebt.note,
      date: new Date().toLocaleDateString(currentLang === 'vi' ? 'vi-VN' : 'en-US'),
      status: 'active'
    };
    setDebts([record, ...debts]);
    setNewDebt({ ...newDebt, amount: '', note: '' });
    
    // Auto switch tab
    setActiveTab(newDebt.type === 'borrow' ? 'pay' : 'receive');
  };

  const settleDebt = (id: number) => {
    if(confirm(t.confirmSettle)) {
      setDebts(debts.filter(d => d.id !== id));
    }
  };

  const formatMoney = (amount: number) => 
    new Intl.NumberFormat(currentLang === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(amount);

  return {
    state: { activeTab, members, debts, settings, newDebt, newMemberName },
    computed: {
      countMyDebt: debts.filter(d => d.type === 'borrow').length,
      countTheyOwe: debts.filter(d => d.type === 'lend').length,
      isDark,
      t
    },
    actions: {
      setActiveTab, setDebts, setNewDebt, addDebtRecord, settleDebt, formatMoney,
      addMember, removeMember, setNewMemberName
    }
  };
};