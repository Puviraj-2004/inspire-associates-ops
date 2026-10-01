// app/(dashboard)/admin/dashboard/page.tsx
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { adminDeleteTaskAction, addCommentAction } from '@/actions/admin-actions';
import InstantFilter from '@/components/InstantFilter';
import AdminAssignTaskModal from '@/components/AdminAssignTaskModal';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRightLeft, 
  ExternalLink, 
  Trash2, 
  MessageSquare, 
  User, 
  Tag 
} from 'lucide-react';
import AdminEditTaskModal from '@/components/AdminEditTaskModal';

interface AdminDashboardProps {
  searchParams: Promise<{
    staffId?: string;
  }>;
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardProps) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const { staffId } = await searchParams;

  // 1. Fetch Staffs for filter & task assignment
  const staffs = await prisma.user.findMany({
    where: { role: 'STAFF' },
    select: { id: true, fullName: true, email: true },
    orderBy: { fullName: 'asc' },
  });

  // 2. Fetch Categories for task assignment
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  // 3. Fetch Tasks
  const tasks = await prisma.task.findMany({
    where: staffId ? { staffId } : undefined,
    include: {
      staff: { select: { fullName: true, email: true } },
      category: { select: { name: true } },
      comments: {
        include: { author: { select: { fullName: true, role: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate Metrics
  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const carriedOverCount = tasks.filter((t) => t.status === 'CARRIED_OVER').length;
  const plannedCount = tasks.filter((t) => t.status === 'PLANNED' || t.status === 'IN_PROGRESS').length;

  return (
    <div className="space-y-6">
      {/* Top Header with "Assign Job" Action & Instant Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-[#1a2c5b] tracking-tight">Work Overview</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Real-time daily task monitoring, carry-overs, and staff submissions.
          </p>
        </div>

        {/* Actions & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 1. Prominent "Assign Job" Button */}
          <AdminAssignTaskModal staffs={staffs} categories={categories} />

          {/* 2. Instant Staff Filter (No Apply Button) */}
          <InstantFilter
            paramName="staffId"
            label="Staff"
            allOptionLabel="All Staff Members"
            options={staffs.map((s) => ({ value: s.id, label: s.fullName }))}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tasks</p>
          <p className="text-2xl font-black text-[#1a2c5b] mt-1">{totalTasks}</p>
        </div>
        <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Completed</p>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-800 mt-1">{completedCount}</p>
        </div>
        <div className="bg-sky-50/50 p-5 rounded-2xl border border-sky-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-sky-700 uppercase tracking-wider">Ongoing / Planned</p>
            <Clock size={16} className="text-sky-600" />
          </div>
          <p className="text-2xl font-black text-sky-800 mt-1">{plannedCount}</p>
        </div>
        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Carried Over</p>
            <ArrowRightLeft size={16} className="text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-800 mt-1">{carriedOverCount}</p>
        </div>
      </div>

      {/* Task List Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#1a2c5b]">Logged Tasks ({tasks.length})</h2>

        {tasks.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <p className="text-slate-400 font-semibold text-sm">No tasks found for the selected criteria.</p>
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            const isCarriedOver = task.status === 'CARRIED_OVER';

            return (
              <div
                key={task.id}
                className={`rounded-2xl p-5 sm:p-6 border transition-all ${
                  isCompleted
                    ? 'bg-white border-emerald-200'
                    : isCarriedOver
                    ? 'bg-amber-50/30 border-amber-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Header & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCarriedOver
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Tag size={13} />
                      {task.category.name}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Clock size={13} />
                      Est: {task.estimatedTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 1. Admin Edit Modal (No 5-min limit) */}
                    <AdminEditTaskModal task={task} categories={categories} />

                    {/* 2. Admin Delete Action */}
                    <form
                      action={async () => {
                        'use server';
                        await adminDeleteTaskAction(task.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </form>
                  </div>
                </div>

                {/* Body Content */}
                <div className="py-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                      <User size={13} />
                    </div>
                    <span className="text-xs font-bold text-[#1a2c5b]">{task.staff.fullName}</span>
                    <span className="text-[11px] text-slate-400">({task.staff.email})</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900">{task.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-wrap">{task.description}</p>

                  {/* Carried Over Details */}
                  {isCarriedOver && task.carryOverNotes && (
                    <div className="mt-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-xs font-extrabold text-amber-800 uppercase tracking-wider mb-1">
                        Carried Over Note (Reason & Progress)
                      </p>
                      <p className="text-xs text-amber-900">{task.carryOverNotes}</p>
                    </div>
                  )}

                  {/* Completion Details & Links */}
                  {isCompleted && (
                    <div className="mt-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                      {task.completionNotes && (
                        <div>
                          <p className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider mb-1">
                            Completion Notes
                          </p>
                          <p className="text-xs text-emerald-900">{task.completionNotes}</p>
                        </div>
                      )}

                      {task.completionLinks.length > 0 && (
                        <div>
                          <p className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider mb-1.5">
                            Attached Work Links ({task.completionLinks.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {task.completionLinks.map((link, idx) => (
                              <a
                                key={idx}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284c7] bg-white border border-sky-200 px-3 py-1.5 rounded-lg hover:bg-sky-50 transition"
                              >
                                <ExternalLink size={13} />
                                {link.replace(/^https?:\/\//, '').slice(0, 30)}...
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Admin Reactions & Comments Section */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  {task.comments.length > 0 && (
                    <div className="space-y-2">
                      {task.comments.map((c) => (
                        <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[#1a2c5b]">
                              {c.author.fullName} ({c.author.role})
                            </span>
                            {c.reaction && (
                              <span className="bg-white border px-2 py-0.5 rounded-md font-bold text-slate-700">
                                {c.reaction}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Admin Feedback Form */}
                  <form action={addCommentAction} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input type="hidden" name="taskId" value={task.id} />
                    <input
                      type="text"
                      name="text"
                      placeholder="Add reply or instructions..."
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                    />
                    <select
                      name="reaction"
                      defaultValue=""
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                    >
                      <option value="">No Badge</option>
                      <option value="👍 Approved">👍 Approved</option>
                      <option value="🔥 Great Job">🔥 Great Job</option>
                      <option value="⚠️ Needs Changes">⚠️ Needs Changes</option>
                    </select>
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#1a2c5b] hover:bg-[#121f42] text-white text-xs font-bold rounded-xl transition"
                    >
                      <MessageSquare size={14} />
                      Comment
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}