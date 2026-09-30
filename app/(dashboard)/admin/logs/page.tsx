// app/(dashboard)/admin/logs/page.tsx
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { 
  History, 
  LogIn, 
  LogOut, 
  PlusCircle, 
  CheckCircle2, 
  ArrowRightLeft, 
  Trash2, 
  MessageSquare, 
  UserCheck, 
  Clock 
} from 'lucide-react';
import InstantFilter from '@/components/InstantFilter';

interface LogsPageProps {
  searchParams: Promise<{
    action?: string;
  }>;
}

export default async function AdminLogsPage({ searchParams }: LogsPageProps) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const { action } = await searchParams;

  // Fetch Audit Logs (filtered by action if selected)
  const logs = await prisma.auditLog.findMany({
    where: action ? { action } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100, // Fetch recent 100 activities
  });

  const getActionBadge = (actionType: string) => {
    switch (actionType) {
      case 'LOGIN':
        return { icon: LogIn, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'LOGOUT':
        return { icon: LogOut, color: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'TASK_CREATED':
        return { icon: PlusCircle, color: 'bg-sky-100 text-sky-800 border-sky-200' };
      case 'TASK_COMPLETED':
        return { icon: CheckCircle2, color: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'TASK_CARRIED_OVER':
        return { icon: ArrowRightLeft, color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'TASK_DELETED':
      case 'STAFF_DELETED':
        return { icon: Trash2, color: 'bg-red-100 text-red-800 border-red-200' };
      case 'STAFF_CREATED':
        return { icon: UserCheck, color: 'bg-purple-100 text-purple-800 border-purple-200' };
      default:
        return { icon: MessageSquare, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-[#1a2c5b] tracking-tight">Audit & Activity Logs</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Tamper-proof chronological trail of logins, task modifications, and system events.
          </p>
        </div>

        {/* Filter by Action */}
        <InstantFilter
          paramName="action"
          label="Filter Activity"
          allOptionLabel="All Actions"
          options={[
            { value: 'LOGIN', label: 'Logins' },
            { value: 'LOGOUT', label: 'Logouts' },
            { value: 'TASK_CREATED', label: 'Task Created' },
            { value: 'TASK_COMPLETED', label: 'Task Completed' },
            { value: 'TASK_CARRIED_OVER', label: 'Carried Over' },
            { value: 'TASK_DELETED', label: 'Deletions' },
          ]}
        />
      </div>

      {/* Logs Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <History size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-400 font-semibold text-sm">No activity recorded for this criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => {
              const { icon: Icon, color } = getActionBadge(log.action);
              const logDate = new Date(log.createdAt);

              return (
                <div key={log.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition">
                  <div className="flex items-start gap-3.5">
                    {/* Action Icon Badge */}
                    <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${color}`}>
                      <Icon size={16} />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {log.userName}
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {log.action.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">
                        {log.details}
                      </p>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-right shrink-0">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                      <Clock size={12} />
                      {logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {logDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}