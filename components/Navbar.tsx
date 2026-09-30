// components/Navbar.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X, CheckSquare, Users, FolderTree, History, KeyRound } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import LogoutModal from './LogoutModal';

interface NavbarProps {
  user: {
    fullName: string;
    role: string;
  };
}

export default function Navbar({ user }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const pathname = usePathname();
  const isAdmin = user.role === 'ADMIN';

  const navLinks = isAdmin
    ? [
        { name: 'Work Overview', href: '/admin/dashboard', icon: CheckSquare },
        { name: 'Staffs', href: '/admin/staffs', icon: Users },
        { name: 'Categories', href: '/admin/categories', icon: FolderTree },
        { name: 'Activity Logs', href: '/admin/logs', icon: History },
      ]
    : [
        { name: 'My Daily Work', href: '/staff/dashboard', icon: CheckSquare },
      ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={isAdmin ? '/admin/dashboard' : '/staff/dashboard'} className="flex items-center gap-3">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10">
                <Image
                  src="/logo.png"
                  alt="Inspire Associates"
                  fill
                  sizes="40px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg text-[#1a2c5b] tracking-tight leading-tight">
                  Inspire Associates
                </span>
                <span className="text-[10px] text-[#64748b] tracking-wider font-semibold hidden sm:block">
                  Growth | Innovation | Trust
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-sky-50 text-[#0284c7] shadow-xs'
                        : 'text-slate-600 hover:text-[#1a2c5b] hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-[#0284c7]' : 'text-slate-400'} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Profile & Logout */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setShowPasswordModal(true)}
                title="Change Password"
                className="p-2 text-slate-500 hover:text-[#0284c7] hover:bg-slate-100 rounded-xl transition"
              >
                <KeyRound size={17} />
              </button>

              <div className="text-right">
                <p className="text-sm font-bold text-[#1a2c5b]">{user.fullName}</p>
                <span
                  className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {user.role}
                </span>
              </div>

              {/* Trigger Custom Logout Modal */}
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
            <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-[#1a2c5b] text-sm">{user.fullName}</p>
                <p className="text-xs text-slate-500 font-medium capitalize">{user.role.toLowerCase()}</p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowPasswordModal(true);
                }}
                className="flex items-center gap-1 text-xs font-bold text-[#0284c7] bg-sky-50 px-2.5 py-1 rounded-lg"
              >
                <KeyRound size={13} />
                Password
              </button>
            </div>

            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                      isActive ? 'bg-sky-50 text-[#0284c7]' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-[#0284c7]' : 'text-slate-400'} />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowLogoutModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Modals */}
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </>
  );
}