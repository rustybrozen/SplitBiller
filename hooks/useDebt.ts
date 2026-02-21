"use client";
import { useState, useEffect } from 'react';
import { Member, AppSettings, DebtRecord } from '@/types';
import { TRANSLATIONS, Language } from '@/constants/translations';

interface NewDebtState {
  amount: string;
  memberId: string;
  type: 'borrow' | 'lend';
  note: string;
  date: string;
}

export type DebtTab = 'members' | 'input' | 'pay' | 'receive' | 'history' | 'settings';

export const useDebt = () => {
  const [activeTab, setActiveTab] = useState<DebtTab>('input');
  const [isLoaded, setIsLoaded] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
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
  
  const [newMemberName, setNewMemberName] = useState('');

  const [debts, setDebts] = useState<DebtRecord[]>([]);
  const [newDebt, setNewDebt] = useState<NewDebtState>({
    amount: '', memberId: '', type: 'lend', note: '', date: new Date().toISOString().split('T')[0]
  });

  const currentLang = (settings.language as Language) || 'vi';
  const t = TRANSLATIONS[currentLang];
  const isDark = settings.theme === 'dark';

  useEffect(() => {
    try {
        const savedMembers = localStorage.getItem("aesthetic_members");
        // const savedSettings = localStorage.getItem("aesthetic_settings");
        const savedDebts = localStorage.getItem("aesthetic_debts");

        if (savedMembers) setMembers(JSON.parse(savedMembers));
        // if (savedSettings) setSettings(JSON.parse(savedSettings));
        if (savedDebts) setDebts(JSON.parse(savedDebts));
    } catch (e) {
        console.error("Load error:", e);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('aesthetic_members', JSON.stringify(members));
  }, [members, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('aesthetic_debts', JSON.stringify(debts));
  }, [debts, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('aesthetic_settings', JSON.stringify(settings));
  }, [settings, isLoaded]);

  const addMember = () => {
    if (!newMemberName.trim()) return;
    const newMember: Member = { id: Date.now(), name: newMemberName.trim() };
    setMembers([...members, newMember]);
    setNewMemberName('');
  };

  const removeMember = (id: number) => {
    if (confirm(t.confirmDeleteMember || "Bạn có chắc muốn xoá thành viên này?")) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const addDebtRecord = () => {
    if (!newDebt.amount || !newDebt.memberId) {
        alert(t.alertFillInfo); 
        return;
    }
    const member = members.find(m => m.id === parseInt(newDebt.memberId));
    const record: DebtRecord = {
      id: Date.now(),
      memberId: parseInt(newDebt.memberId),
      amount: parseFloat(newDebt.amount),
      type: newDebt.type,
      note: newDebt.note,
      date: newDebt.date ? new Date(newDebt.date).toLocaleDateString(currentLang === 'vi' ? 'vi-VN' : 'en-US') : new Date().toLocaleDateString(currentLang === 'vi' ? 'vi-VN' : 'en-US'),
      status: 'active',
      memberNameSnapshot: member?.name || 'Unknown'
    };
    setDebts([record, ...debts]);
    setNewDebt({ ...newDebt, amount: '', note: '' });
    
    setActiveTab(newDebt.type === 'borrow' ? 'pay' : 'receive');
  };

  const settleDebt = (id: number) => {
    if(confirm(t.confirmSettle || "Xác nhận đã thanh toán xong khoản này?")) {
      setDebts(debts.map(d => d.id === id ? { ...d, status: 'settled' } : d));
    }
  };

  const deleteDebt = (id: number) => {
    if(confirm("Xoá vĩnh viễn khoản nợ này khỏi lịch sử nha bro?")) {
      setDebts(debts.filter(d => d.id !== id));
    }
  };

  const formatMoney = (amount: number) => 
    new Intl.NumberFormat(currentLang === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(amount);

  return {
    state: { activeTab, members, debts, settings, newDebt, newMemberName },
    computed: {
      countMyDebt: debts.filter(d => d.type === 'borrow' && d.status === 'active').length,
      countTheyOwe: debts.filter(d => d.type === 'lend' && d.status === 'active').length,
      totalBorrow: debts.filter(d => d.type === 'borrow' && d.status === 'active').reduce((sum, d) => sum + d.amount, 0),
      totalLend: debts.filter(d => d.type === 'lend' && d.status === 'active').reduce((sum, d) => sum + d.amount, 0),
      isDark,
      t
    },
    actions: {
      setActiveTab, setDebts, setNewDebt, addDebtRecord, settleDebt, deleteDebt, formatMoney,
      addMember, removeMember, setNewMemberName, setSettings
    }
  };
};