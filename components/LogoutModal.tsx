// components/LogoutModal.tsx
'use client';

import { LogOut, X, AlertTriangle } from 'lucide-react';
import { logoutAction } from '@/actions/auth-actions';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
        {/* Top Warning Icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
            <AlertTriangle size={22} />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Text */}
        <div className="space-y-1 mb-6">
          <h3 className="text-base font-bold text-[#1a2c5b]">Confirm Logout</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Are you sure you want to end your current session? You will need to sign in again to access your dashboard.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            Stay Signed In
          </button>

          <form action={logoutAction} className="flex-1">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <LogOut size={14} />
              Yes, Log Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}