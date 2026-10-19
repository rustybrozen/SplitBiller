"use client";

import React, { useState } from "react";
import { Bill, ExtraSplit } from "@/types";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { parseSmartMoney, parseAdjustmentString, formatNumberWithCommas } from "@/lib/money";
import { Plus, X, User } from "lucide-react";



export interface BillFormProps {
  editingBill: Bill | null;
  onFinishEdit: () => void;
}



export const BillForm = ({ editingBill, onFinishEdit }: BillFormProps) => {
  const { members, t, isDark, saveBill, formatMoney } = useApp();

  const [billDesc, setBillDesc] = useState(editingBill ? editingBill.description : "");
  const [billAmount, setBillAmount] = useState(editingBill ? editingBill.amount.toString() : "");
  const [billPayer, setBillPayer] = useState(editingBill ? editingBill.payer.toString() : "");
  const [billSplitType, setBillSplitType] = useState<"equal" | "advanced">(
    editingBill ? editingBill.splitType : "equal"
  );
  const [selectedMembers, setSelectedMembers] = useState<number[]>(() => {
    if (editingBill?.selectedMembers && editingBill.selectedMembers.length > 0) {
      return editingBill.selectedMembers;
    }
    return members.map((m) => m.id);
  });
  const [shares, setShares] = useState<Record<number, number>>(editingBill?.shares || {});
  const [equalAdjustments, setEqualAdjustments] = useState<Record<number, string>>(() => {
    const adjMap: Record<number, string> = {};
    if (editingBill?.equalAdjustments) {
      Object.entries(editingBill.equalAdjustments).forEach(([id, val]) => {
        adjMap[parseInt(id, 10)] = val.toString();
      });
    }
    return adjMap;
  });
  const [extraSplits, setExtraSplits] = useState<ExtraSplit[]>(editingBill?.extraSplits || []);

  const [isSplitDialogOpen, setIsSplitDialogOpen] = useState(false);
  const [currentSplitItem, setCurrentSplitItem] = useState<{
    name: string;
    amount: string;
    members: number[];
  }>({ name: "", amount: "", members: [] });

  const [errors, setErrors] = useState<{
    desc?: boolean;
    amount?: boolean;
    payer?: boolean;
    members?: boolean;
    general?: string;
  }>({});

  const parsedAmount = parseSmartMoney(billAmount);
  const totalShares = selectedMembers.reduce(
    (sum, id) => sum + (shares[id] !== undefined ? shares[id] : 1),
    0
  );

  const getRemainingAdvancedAmount = () => {
    const total = parsedAmount || 0;
    const allocated = extraSplits.reduce((acc, curr) => acc + curr.amount, 0);
    return total - allocated;
  };

  const handleShareChange = (memberId: number, delta: number) => {
    const current = shares[memberId] !== undefined ? shares[memberId] : 1;
    const nextVal = Math.max(0.5, Math.round((current + delta) * 10) / 10);
    setShares({ ...shares, [memberId]: nextVal });
  };

  const handleResetForm = () => {
    setBillDesc("");
    setBillAmount("");
    setBillPayer("");
    setBillSplitType("equal");
    setSelectedMembers(members.map((m) => m.id));
    setShares({});
    setEqualAdjustments({});
    setExtraSplits([]);
    setErrors({});
    onFinishEdit();
  };

  const handleSave = () => {
    const newErrors: typeof errors = {};

    if (!billDesc.trim()) newErrors.desc = true;
    if (!billAmount.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = true;
    }
    if (!billPayer) newErrors.payer = true;

    if (billSplitType === "equal" && selectedMembers.length === 0) {
      newErrors.members = true;
      newErrors.general = t.alertSelectMembers;
    }

    if (Object.keys(newErrors).length > 0) {
      if (!newErrors.general) newErrors.general = t.alertFillInfo;
      setErrors(newErrors);
      return;
    }

    if (billSplitType === "advanced") {
      const totalAllocated = extraSplits.reduce((sum, item) => sum + item.amount, 0);
      if (totalAllocated > parsedAmount) {
        setErrors({ general: "Tiền chia lẻ lớn hơn tổng bill. Vui lòng chia lại hợp lý!" });
        return;
      }
    }

    const finalAdjustments: Record<number, number> = {};
    if (billSplitType === "equal") {
      for (const id of selectedMembers) {
        if (equalAdjustments[id] !== undefined) {
          const strVal = equalAdjustments[id] || "";
          const parsed = parseAdjustmentString(strVal);
          if (parsed === null) {
            setErrors({ general: t.alertAdjustmentFormat || "Lỗi! Nhập thêm/bớt tiền bị sai định dạng." });
            return;
          }
          if (parsed !== 0) {
            finalAdjustments[id] = parsed;
          }
        }
      }
    }

    setErrors({});

    const action = editingBill ? t.update : t.create;
    if (!confirm(`${t.alertConfirmAction} ${action} ${t.alertConfirmBill}`)) return;

    saveBill({
      id: editingBill?.id || null,
      amount: parsedAmount,
      description: billDesc.trim(),
      payer: parseInt(billPayer, 10),
      splitType: billSplitType,
      selectedMembers: billSplitType === "equal" ? selectedMembers : members.map((m) => m.id),
      extraSplits,
      equalAdjustments: finalAdjustments,
      shares,
    });

    handleResetForm();
  };

  const openAddSplitItem = () => {
    setCurrentSplitItem({ name: "", amount: "", members: [] });
    setIsSplitDialogOpen(true);
  };

  const saveSplitItem = () => {
    const amt = parseSmartMoney(currentSplitItem.amount);
    if (!currentSplitItem.name.trim() || isNaN(amt) || amt <= 0 || currentSplitItem.members.length === 0) {
      alert(t.alertItemInfo);
      return;
    }

    const currentRemaining = getRemainingAdvancedAmount();
    if (currentRemaining - amt < 0) {
      alert(`${t.alertOverAmount} ${formatMoney(currentRemaining)}.`);
      return;
    }

    const newItem: ExtraSplit = {
      id: Date.now(),
      name: currentSplitItem.name.trim(),
      amount: amt,
      members: currentSplitItem.members,
    };

    setExtraSplits([...extraSplits, newItem]);
    setIsSplitDialogOpen(false);
  };

  const removeSplitItem = (id: number) => {
    setExtraSplits(extraSplits.filter((i) => i.id !== id));
  };

  return (
    <div
      className={`p-6 shadow-lg border rounded-none relative overflow-hidden transition-all duration-300 ${
        editingBill
          ? "border-amber-500 ring-1 ring-amber-500"
          : isDark
          ? "border-neutral-800"
          : "border-[#6482AD]/10"
      } ${isDark ? "bg-neutral-900" : "bg-white"}`}
    >
      <div className="flex justify-between items-center mb-6 border-b border-[#6482AD]/10 pb-2">
        <h2
          className={`text-xl font-bold flex items-center gap-2 uppercase tracking-widest ${
            editingBill ? "text-amber-500" : isDark ? "text-white" : "text-[#2C3E50]"
          }`}
        >
          {editingBill ? t.editBillTitle : t.addBillTitle}
        </h2>
        {editingBill && (
          <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-none font-bold uppercase tracking-wider">
            {t.editingBill}
          </span>
        )}
      </div>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-500/10 border-l-4 border-red-500 text-red-500 text-xs font-medium">
          {errors.general}
        </div>
      )}

      <div className="space-y-4">
        <Input
          label={t.descLabel}
          placeholder={t.descPlaceholder}
          value={billDesc}
          hasError={errors.desc}
          onChange={(e) => {
            setBillDesc(e.target.value);
            if (errors.desc) setErrors({ ...errors, desc: false, general: "" });
          }}
          isDark={isDark}
        />

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              label={t.amountLabel}
              type="text"
              placeholder="VD: 150k, 1.5tr, 200,000"
              value={billAmount}
              hasError={errors.amount}
              hint={
                !isNaN(parsedAmount) && parsedAmount > 0
                  ? `= ${formatNumberWithCommas(parsedAmount)} đ`
                  : undefined
              }
              onChange={(e) => {
                setBillAmount(e.target.value);
                if (errors.amount) setErrors({ ...errors, amount: false, general: "" });
              }}
              isDark={isDark}
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {["50k", "100k", "200k", "500k", "1tr"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setBillAmount(preset);
                    if (errors.amount) setErrors({ ...errors, amount: false, general: "" });
                  }}
                  className={`px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                    isDark
                      ? "border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-[#6482AD]"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#6482AD]"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full flex-1 flex flex-col gap-1">
            <label
              className={`text-xs font-bold uppercase tracking-wider ml-1 ${
                errors.payer ? "text-red-500" : isDark ? "text-neutral-400" : "text-[#6482AD]"
              }`}
            >
              {t.payerLabel}
            </label>
            <select
              className={`w-full rounded-none px-4 py-3 outline-none appearance-none cursor-pointer border-b-2 transition-all font-sans ${
                errors.payer ? "border-red-500" : "border-transparent focus:border-[#6482AD]"
              } ${
                isDark
                  ? errors.payer
                    ? "bg-red-900/20 text-white"
                    : "bg-neutral-800 text-white"
                  : errors.payer
                  ? "bg-red-50 text-red-900"
                  : "bg-[#F5EDED] text-[#2C3E50]"
              }`}
              value={billPayer}
              onChange={(e) => {
                setBillPayer(e.target.value);
                if (errors.payer) setErrors({ ...errors, payer: false, general: "" });
              }}
            >
              <option value="">{t.selectPayer}</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex border border-[#6482AD]/20 p-1 bg-gray-50/50 dark:bg-neutral-800/30">
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-none cursor-pointer ${
              billSplitType === "equal"
                ? isDark
                  ? "bg-neutral-700 text-white shadow"
                  : "bg-white shadow text-[#6482AD] border border-gray-200"
                : "text-gray-400"
            }`}
            onClick={() => setBillSplitType("equal")}
          >
            {t.splitEqual} & {t.sharesSplit || "Theo phần"}
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-none cursor-pointer ${
              billSplitType === "advanced"
                ? isDark
                  ? "bg-neutral-700 text-white shadow"
                  : "bg-white shadow text-[#6482AD] border border-gray-200"
                : "text-gray-400"
            }`}
            onClick={() => setBillSplitType("advanced")}
          >
            {t.splitAdvanced}
          </button>
        </div>

        {billSplitType === "equal" ? (
          <div
            className={`p-4 border rounded-none ${
              errors.members ? "border-red-500" : isDark ? "bg-neutral-800/50 border-neutral-700" : "bg-[#F5EDED]/30 border-[#6482AD]/10"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-[#6482AD] uppercase">{t.whoJoins}</p>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedMembers.length === members.length) {
                      setSelectedMembers([]);
                    } else {
                      setSelectedMembers(members.map((m) => m.id));
                    }
                  }}
                  className="text-[10px] font-bold text-[#6482AD] hover:underline uppercase cursor-pointer"
                >
                  {selectedMembers.length === members.length ? "Bỏ chọn hết" : "Chọn tất cả"}
                </button>
              </div>
              <span className="text-[10px] text-gray-400 italic">Bấm [-] [+] chỉnh phần</span>
            </div>

            <div className="flex flex-col gap-2">
              {members.map((m) => {
                const isSelected = selectedMembers.includes(m.id);
                const currentShare = shares[m.id] !== undefined ? shares[m.id] : 1;

                return (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between p-2 border transition-all ${
                      isSelected
                        ? isDark
                          ? "bg-neutral-800 border-[#6482AD]"
                          : "bg-white border-[#6482AD]"
                        : isDark
                        ? "bg-neutral-900 border-neutral-800 opacity-60"
                        : "bg-gray-50 border-gray-200 opacity-60"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedMembers(selectedMembers.filter((id) => id !== m.id));
                        } else {
                          setSelectedMembers([...selectedMembers, m.id]);
                        }
                        if (errors.members) setErrors({ ...errors, members: false, general: "" });
                      }}
                      className="flex items-center gap-2 flex-1 text-left cursor-pointer"
                    >
                      <span
                        className={`w-4 h-4 rounded-none border flex items-center justify-center text-[10px] font-bold ${
                          isSelected ? "bg-[#6482AD] text-white border-[#6482AD]" : "border-gray-300"
                        }`}
                      >
                        {isSelected ? "v" : ""}
                      </span>
                      <span
                        className={`text-xs font-bold uppercase tracking-wide ${
                          isSelected ? (isDark ? "text-white" : "text-[#2C3E50]") : "text-gray-400"
                        }`}
                      >
                        {m.name}
                      </span>
                    </button>

                    {isSelected && (
                      <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-neutral-700 px-2 py-1">
                        <button
                          type="button"
                          onClick={() => handleShareChange(m.id, -0.5)}
                          className="w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-gray-200 dark:hover:bg-neutral-600 rounded cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold font-mono px-1 min-w-[32px] text-center">
                          {currentShare} {t.shareUnit || "phần"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleShareChange(m.id, 0.5)}
                          className="w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-gray-200 dark:hover:bg-neutral-600 rounded cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedMembers.length > 0 && parsedAmount > 0 && (
              <div
                className={`mt-2.5 p-2.5 border text-xs flex justify-between items-center ${
                  isDark
                    ? "bg-neutral-900 border-neutral-700 text-neutral-300"
                    : "bg-white border-[#6482AD]/20 text-[#2C3E50]"
                }`}
              >
                <span>
                  Tổng: <b>{totalShares} {t.shareUnit || "phần"}</b>
                </span>
                <span>
                  Ước tính:{" "}
                  <b className="text-[#6482AD] font-mono">
                    {formatMoney(Math.round(parsedAmount / (totalShares || 1)))}
                  </b>{" "}
                  / phần
                </span>
              </div>
            )}

            {selectedMembers.length > 0 && (
              <div
                className={`mt-4 space-y-3 border-t pt-4 ${
                  isDark ? "border-neutral-700" : "border-[#6482AD]/10"
                }`}
              >
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                  Thêm/Bớt tiền riêng (Tùy chọn)
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((mid) => {
                    const m = members.find((x) => x.id === mid);
                    if (!m) return null;
                    const isAdjusting = equalAdjustments[mid] !== undefined;

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          const newAdj = { ...equalAdjustments };
                          if (isAdjusting) {
                            delete newAdj[mid];
                          } else {
                            newAdj[mid] = "";
                          }
                          setEqualAdjustments(newAdj);
                        }}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide border transition-all cursor-pointer ${
                          isAdjusting
                            ? "bg-amber-500 text-white border-amber-500 shadow-md"
                            : isDark
                            ? "bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700"
                            : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {m.name}
                      </button>
                    );
                  })}
                </div>

                {Object.keys(equalAdjustments).length > 0 && (
                  <div
                    className={`space-y-3 mt-4 p-3 border-l-4 border-amber-500 w-full overflow-hidden ${
                      isDark ? "bg-amber-500/5" : "bg-amber-50"
                    }`}
                  >
                    <p className="text-[10px] text-gray-500 italic mb-2 break-words">
                      *Nhập số tiền phát sinh (Hỗ trợ 20k, 20.000, -15k). VD: 20k -15k
                    </p>

                    {selectedMembers.map((mid) => {
                      if (equalAdjustments[mid] === undefined) return null;
                      const m = members.find((x) => x.id === mid);

                      return (
                        <div
                          key={m?.id}
                          className={`flex w-full items-stretch border transition-all shadow-sm rounded-none overflow-hidden ${
                            isDark
                              ? "border-neutral-700 bg-neutral-900 focus-within:border-amber-500"
                              : "border-gray-200 bg-white focus-within:border-amber-500"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center px-2 py-2.5 w-[75px] shrink-0 border-r ${
                              isDark
                                ? "bg-neutral-800 border-neutral-700 text-neutral-300"
                                : "bg-gray-100 border-gray-200 text-[#2C3E50]"
                            }`}
                          >
                            <span className="text-xs font-bold truncate w-full text-center">
                              {m?.name}
                            </span>
                          </div>

                          <input
                            type="text"
                            placeholder="VD: 20k -15k"
                            className={`flex-1 w-full min-w-0 px-3 py-2.5 text-sm outline-none bg-transparent ${
                              isDark
                                ? "text-white placeholder:text-neutral-600"
                                : "text-[#2C3E50] placeholder:text-gray-400"
                            }`}
                            value={equalAdjustments[mid] || ""}
                            onChange={(e) =>
                              setEqualAdjustments({ ...equalAdjustments, [mid]: e.target.value })
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className={`flex justify-between items-center p-3 border rounded-none ${
                getRemainingAdvancedAmount() < 0
                  ? "bg-red-900/20 border-red-800 text-red-400"
                  : "bg-blue-900/20 border-blue-800 text-blue-400"
              }`}
            >
              <span className="text-sm font-medium">{t.remaining}</span>
              <span className="font-bold font-mono">
                {formatMoney(getRemainingAdvancedAmount())}
              </span>
            </div>

            <div className="space-y-2">
              {extraSplits.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 border shadow-sm rounded-none ${
                    isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-gray-100"
                  }`}
                >
                  <div>
                    <div className={`font-bold ${isDark ? "text-white" : "text-[#2C3E50]"}`}>
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <User size={10} />{" "}
                      {item.members.map((mid) => members.find((m) => m.id === mid)?.name).join(", ")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-[#6482AD]">
                      {formatMoney(item.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSplitItem(item.id)}
                      className="text-red-300 hover:text-red-500 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={openAddSplitItem}
              isDark={isDark}
            >
              <Plus size={18} /> {t.addExtra}
            </Button>
          </div>
        )}

        <div className="pt-2 flex gap-3">
          {editingBill && (
            <Button
              variant="ghost"
              className="flex-1"
              onClick={handleResetForm}
              isDark={isDark}
            >
              {t.cancel}
            </Button>
          )}
          <Button
            variant={editingBill ? "warning" : "primary"}
            className="flex-1 py-3 text-sm shadow-lg shadow-[#6482AD]/10"
            onClick={handleSave}
            isDark={isDark}
          >
            {editingBill ? t.updateBill : t.saveBill}
          </Button>
        </div>
      </div>

      <Dialog
        isOpen={isSplitDialogOpen}
        onClose={() => setIsSplitDialogOpen(false)}
        title={t.dialogSplitTitle}
        isDark={isDark}
        footer={
          <div className="flex gap-2 w-full">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setIsSplitDialogOpen(false)}
              isDark={isDark}
            >
              {t.cancel}
            </Button>
            <Button variant="primary" className="flex-1" onClick={saveSplitItem} isDark={isDark}>
              {t.saveBill}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label={t.itemName}
            placeholder="VD: Cua rang me, Bia"
            value={currentSplitItem.name}
            onChange={(e) => setCurrentSplitItem({ ...currentSplitItem, name: e.target.value })}
            isDark={isDark}
          />

          <Input
            label={t.itemPrice}
            type="text"
            placeholder="VD: 50k, 150000"
            value={currentSplitItem.amount}
            hint={
              !isNaN(parseSmartMoney(currentSplitItem.amount)) &&
              parseSmartMoney(currentSplitItem.amount) > 0
                ? `= ${formatNumberWithCommas(parseSmartMoney(currentSplitItem.amount))} đ`
                : undefined
            }
            onChange={(e) => setCurrentSplitItem({ ...currentSplitItem, amount: e.target.value })}
            isDark={isDark}
          />

          <div>
            <label className="text-xs font-bold text-[#6482AD] uppercase tracking-wider block mb-2">
              {t.whoEats}
            </label>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => {
                const isSelected = currentSplitItem.members.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setCurrentSplitItem({
                          ...currentSplitItem,
                          members: currentSplitItem.members.filter((id) => id !== m.id),
                        });
                      } else {
                        setCurrentSplitItem({
                          ...currentSplitItem,
                          members: [...currentSplitItem.members, m.id],
                        });
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#6482AD] text-white border-[#6482AD]"
                        : isDark
                        ? "bg-neutral-800 text-neutral-400 border-neutral-700"
                        : "bg-white text-gray-400 border-gray-200"
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
