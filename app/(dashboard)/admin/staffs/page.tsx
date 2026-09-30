// app/(dashboard)/admin/staffs/page.tsx
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createStaffAction, deleteStaffAction } from '@/actions/staff-actions';
import { UserPlus, Users, Trash2, Mail, Lock, User, CheckCircle2 } from 'lucide-react';

export default async function AdminStaffsPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  // Fetch all staff members with task counts
  const staffs = await prisma.user.findMany({
    where: { role: 'STAFF' },
    select: {
      id: true,
      fullName: true,
      email: true,
      createdAt: true,
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl font-black text-[#1a2c5b] tracking-tight">Staff Management</h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
          Add new team members, issue system access credentials, and manage team roster.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Add New Staff Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs h-fit">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284c7] flex items-center justify-center font-bold">
              <UserPlus size={18} />
            </div>
            <h2 className="text-base font-bold text-[#1a2c5b]">Create Staff Account</h2>
          </div>

          <form action={createStaffAction} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0284c7] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="john@inspire.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0284c7] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Temporary Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0284c7] transition"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Share this password with the staff member to log in.
              </p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1a2c5b] hover:bg-[#121f42] text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              <UserPlus size={16} />
              Register Staff Member
            </button>
          </form>
        </div>

        {/* Right: Existing Staff List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1a2c5b] flex items-center gap-2">
              <Users size={18} className="text-[#0284c7]" />
              Team Members ({staffs.length})
            </h2>
          </div>

          {staffs.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <p className="text-slate-400 font-semibold text-sm">
                No staff members created yet. Use the form to add your first staff.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {staffs.map((staff) => (
                <div
                  key={staff.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center font-black text-sm">
                          {staff.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 leading-tight">
                            {staff.fullName}
                          </h3>
                          <span className="text-xs text-slate-500 font-medium">
                            {staff.email}
                          </span>
                        </div>
                      </div>

                      {/* Delete Staff Action */}
                      <form
                        action={async () => {
                          'use server';
                          await deleteStaffAction(staff.id);
                        }}
                      >
                        <button
                          type="submit"
                          title="Remove Staff"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 font-semibold text-slate-600">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        {staff._count.tasks} Total Tasks Logged
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Joined {new Date(staff.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}