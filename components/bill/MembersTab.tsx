"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2 } from "lucide-react";



export const MembersTab = () => {
  const { members, t, isDark, addMember, removeMember } = useApp();
  const [newMemberName, setNewMemberName] = useState("");

  const handleAdd = () => {
    if (addMember(newMemberName)) {
      setNewMemberName("");
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-4">
      <div
        className={`p-6 shadow-lg border rounded-none ${
          isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-[#6482AD]/10"
        }`}
      >
        <h2
          className={`text-xl font-bold mb-4 uppercase tracking-widest border-b pb-2 ${
            isDark ? "text-white border-neutral-800" : "text-[#2C3E50] border-gray-100"
          }`}
        >
          {t.members} ({members.length})
        </h2>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder={t.addMemberPlaceholder}
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            isDark={isDark}
          />
          <Button onClick={handleAdd} className="w-12 h-12 p-0 shrink-0">
            <Plus size={24} />
          </Button>
        </div>

        <div className="space-y-3">
          {members.length === 0 && (
            <p className="text-center text-gray-400 italic py-4">{t.emptyMember}</p>
          )}

          {members.map((m) => (
            <div
              key={m.id}
              className={`group flex items-center justify-between p-3 transition-colors border border-transparent rounded-none ${
                isDark
                  ? "bg-neutral-800 hover:bg-neutral-700 border-neutral-700"
                  : "bg-[#F5EDED] hover:bg-[#E2DAD6] hover:border-[#6482AD]/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 flex items-center justify-center text-[#6482AD] ${
                    isDark
                      ? "bg-neutral-900 border-neutral-700"
                      : "bg-white border border-[#6482AD]/30"
                  }`}
                >
                  <span className="text-sm font-bold uppercase">{m.name.charAt(0)}</span>
                </div>
                <span className={`font-bold ${isDark ? "text-white" : "text-[#2C3E50]"}`}>
                  {m.name}
                </span>
              </div>

              <button
                type="button"
                onClick={() => removeMember(m.id)}
                className="text-red-300 hover:text-red-500 p-2 transition-opacity rounded-none cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
