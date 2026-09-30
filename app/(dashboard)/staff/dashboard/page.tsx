// app/(dashboard)/staff/dashboard/page.tsx
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createTaskAction } from '@/actions/task-actions';
import StaffTaskCard from '@/components/StaffTaskCard';
import { PlusCircle, Clock, CheckCircle2, ArrowRightLeft, Calendar } from 'lucide-react';

export default async function StaffDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== 'STAFF') redirect('/login');

  // Fetch Categories for morning task creation
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  // Fetch Staff Tasks
  const tasks = await prisma.task.findMany({
    where: { staffId: session.userId },
    include: {
      category: { select: { name: true } },
      comments: {
        include: { author: { select: { fullName: true, role: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const carriedOverTasks = tasks.filter((t) => t.status === 'CARRIED_OVER');
  const activeTasks = tasks.filter((t) => t.status !== 'CARRIED_OVER');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#1a2c5b] tracking-tight">Daily Work Hub</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Welcome, <span className="font-bold text-slate-800">{session.fullName}</span>. Plan morning tasks & submit completion links.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3.5 py-2 rounded-xl w-fit">
          <Calendar size={14} className="text-[#0284c7]" />
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Morning Task Logging Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs h-fit">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284c7] flex items-center justify-center font-bold">
              <PlusCircle size={18} />
            </div>
            <h2 className="text-base font-bold text-[#1a2c5b]">Log Morning Work</h2>
          </div>

          <form action={createTaskAction} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                name="categoryId"
                required
                defaultValue=""
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              >
                <option value="" disabled>Select Work Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Task Title
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Annotation of 50 front-view cars"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description / Objective
              </label>
              <textarea
                name="description"
                required
                rows={3}
                placeholder="Describe key milestones or details for today..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Estimated Time
              </label>
              <input
                type="text"
                name="estimatedTime"
                required
                placeholder="e.g. 3 hours / Full Day"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1a2c5b] hover:bg-[#121f42] text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              <PlusCircle size={15} />
              Submit Task (5-min edit window)
            </button>
          </form>
        </div>

        {/* Right Column: Tasks View */}
        <div className="lg:col-span-2 space-y-6">
          {/* Carried Over (Pending from previous day) section */}
          {carriedOverTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft size={16} className="text-amber-600" />
                <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wider">
                  Carried Over Work ({carriedOverTasks.length})
                </h2>
              </div>
              <div className="space-y-3">
                {carriedOverTasks.map((task) => (
                  <StaffTaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Active Tasks Section */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#1a2c5b] flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#0284c7]" />
              My Logged Tasks ({activeTasks.length})
            </h2>

            {activeTasks.length === 0 ? (
              <div className="bg-white p-10 text-center rounded-2xl border border-slate-200">
                <Clock size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-400 font-semibold text-sm">
                  No active tasks logged yet today. Use the left form to add your work.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTasks.map((task) => (
                  <StaffTaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}