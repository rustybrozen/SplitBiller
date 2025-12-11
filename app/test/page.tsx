"use client";

import React, { useState, useMemo } from 'react';
import { VIET_QR_BANKS } from '@/constants/banks'; // Nhớ import cái list ở trên, hoặc paste thẳng vào đây nếu lười
import { QrCode, User, CreditCard, ArrowRight, Wallet } from 'lucide-react';

// --- GIẢ LẬP DỮ LIỆU APP CỦA ÔNG ---
const MOCK_MEMBERS = [
  { id: 1, name: 'Trường (Tôi)' },
  { id: 2, name: 'Hiếu' },
  { id: 3, name: 'Nghĩa' },
  { id: 4, name: 'Hằng' },
];

const TestQrPage = () => {
  // --- STATE CẦN THÊM VÀO APP CHÍNH SAU NÀY ---
  const [myId, setMyId] = useState<number>(1); // ID của "Tôi"
  const [bankSettings, setBankSettings] = useState({
    bin: '970422', // Mặc định MB
    accountNo: '', // Số tài khoản
    accountName: '' // Tên chủ thẻ (Optional, VietQR tự tra cũng dc nhưng điền cho chắc)
  });

  // --- STATE ĐỂ TEST ---
  const [testAmount, setTestAmount] = useState('55000');
  const [debtorId, setDebtorId] = useState(2); // Thằng Hiếu đang nợ

  // --- HÀM TẠO LINK QR ---
  const qrUrl = useMemo(() => {
    if (!bankSettings.accountNo) return null;
    
    // Tìm tên người nợ để làm nội dung chuyển khoản
    const debtorName = MOCK_MEMBERS.find(m => m.id === debtorId)?.name || 'Someone';
    
    // Nội dung: "Hieu tra tien" (Bỏ dấu tiếng Việt đi cho an toàn)
    // Hàm bỏ dấu cơ bản
    const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
    const description = `${normalize(debtorName)} tra tien`;

    // API VietQR: https://img.vietqr.io/image/<BANK_BIN>-<ACC_NO>-<TEMPLATE>.png
    // Params: amount, addInfo (nội dung), accountName (tên chủ tk)
    const baseUrl = `https://img.vietqr.io/image/${bankSettings.bin}-${bankSettings.accountNo}-compact.jpg`;
    const params = new URLSearchParams({
      amount: testAmount,
      addInfo: description,
      accountName: bankSettings.accountName
    });

    return `${baseUrl}?${params.toString()}`;
  }, [bankSettings, testAmount, debtorId]);


  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-[#2C3E50]">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-bold uppercase tracking-widest text-[#6482AD] mb-2">Test VietQR Integration</h1>
          <p className="text-gray-500 italic">Thử nghiệm tính năng "Đòi nợ 4.0"</p>
        </div>

        {/* --- PHẦN 1: CẤU HÌNH (Sẽ nằm trong Tab Settings) --- */}
        <div className="bg-white p-6 shadow-lg border-t-4 border-[#6482AD]">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-wide">
            <User size={24} className="text-[#6482AD]" /> 1. Định danh & Ngân hàng
          </h2>
          
          <div className="space-y-4">
            {/* Chọn: TÔI LÀ AI? */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Tôi là ai trong nhóm?</label>
              <select 
                className="w-full p-3 border bg-gray-50 font-bold text-[#6482AD] outline-none focus:border-[#6482AD]"
                value={myId}
                onChange={(e) => setMyId(Number(e.target.value))}
              >
                {MOCK_MEMBERS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Chọn: NGÂN HÀNG */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Ngân hàng thụ hưởng</label>
                <select 
                  className="w-full p-3 border bg-gray-50 outline-none focus:border-[#6482AD]"
                  value={bankSettings.bin}
                  onChange={(e) => setBankSettings({...bankSettings, bin: e.target.value})}
                >
                  {VIET_QR_BANKS.map(b => (
                    <option key={b.bin} value={b.bin}>({b.shortName}) {b.name}</option>
                  ))}
                </select>
              </div>

              {/* Nhập: SỐ TÀI KHOẢN */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Số tài khoản</label>
                <input 
                  type="text" 
                  className="w-full p-3 border bg-gray-50 outline-none focus:border-[#6482AD] font-mono"
                  placeholder="Ví dụ: 0333..."
                  value={bankSettings.accountNo}
                  onChange={(e) => setBankSettings({...bankSettings, accountNo: e.target.value})}
                />
              </div>

               {/* Nhập: TÊN CHỦ TÀI KHOẢN */}
               <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Tên chủ thẻ (Không dấu - Tùy chọn)</label>
                <input 
                  type="text" 
                  className="w-full p-3 border bg-gray-50 outline-none focus:border-[#6482AD] uppercase"
                  placeholder="NGUYEN VAN A"
                  value={bankSettings.accountName}
                  onChange={(e) => setBankSettings({...bankSettings, accountName: e.target.value.toUpperCase()})}
                />
                 <p className="text-[10px] text-gray-400 mt-1">*Giúp người chuyển xác nhận đúng tên trước khi bắn tiền.</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- PHẦN 2: GIẢ LẬP TÌNH HUỐNG (Sẽ nằm trong Tab Summary) --- */}
        <div className="bg-white p-6 shadow-lg border-t-4 border-green-500">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-wide text-green-700">
            <Wallet size={24} /> 2. Giả lập "Đòi nợ"
          </h2>

          <div className="flex items-center justify-between bg-green-50 p-4 border border-green-200 mb-6">
            <div className="flex items-center gap-2">
               <span className="font-bold text-gray-700">
                 {MOCK_MEMBERS.find(m => m.id === debtorId)?.name}
               </span>
               <ArrowRight size={16} className="text-gray-400" />
               <span className="font-bold text-[#6482AD]">
                 {MOCK_MEMBERS.find(m => m.id === myId)?.name} (Tôi)
               </span>
            </div>
            <div className="text-xl font-bold font-mono text-green-600">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(testAmount))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
               <label className="text-xs uppercase font-bold text-gray-400">Chọn người nợ:</label>
               <select 
                  className="w-full p-2 border mt-1"
                  value={debtorId}
                  onChange={e => setDebtorId(Number(e.target.value))}
               >
                 {MOCK_MEMBERS.filter(m => m.id !== myId).map(m => (
                   <option key={m.id} value={m.id}>{m.name}</option>
                 ))}
               </select>
            </div>
            <div>
               <label className="text-xs uppercase font-bold text-gray-400">Số tiền nợ:</label>
               <input 
                 type="number" 
                 className="w-full p-2 border mt-1 font-mono"
                 value={testAmount}
                 onChange={e => setTestAmount(e.target.value)}
               />
            </div>
          </div>

          {/* KẾT QUẢ: MÃ QR */}
          <div className="flex flex-col items-center justify-center p-6 bg-gray-100 border border-dashed border-gray-300 rounded-lg">
             {!bankSettings.accountNo ? (
               <div className="text-center text-gray-400">
                 <CreditCard size={48} className="mx-auto mb-2 opacity-50" />
                 <p>Vui lòng nhập Số tài khoản ở trên để hiện QR</p>
               </div>
             ) : (
               <>
                 <div className="bg-white p-2 shadow-sm mb-4">
                    {/* HÌNH ẢNH QR TỪ API */}
                    <img 
                      src={qrUrl!} 
                      alt="VietQR" 
                      className="w-64 h-64 object-contain" 
                    />
                 </div>
                 <div className="text-center space-y-1">
                    <p className="font-bold text-[#2C3E50] uppercase">Quét mã để thanh toán</p>
                    <p className="text-sm text-gray-500">Nội dung: <span className="font-mono bg-yellow-100 px-1">{MOCK_MEMBERS.find(m => m.id === debtorId)?.name} tra tien</span></p>
                    <p className="text-[10px] text-gray-400">Powered by VietQR</p>
                 </div>
               </>
             )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default TestQrPage;