// components/StaffTaskCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  ArrowRightLeft, 
  Edit3, 
  Tag, 
  ExternalLink, 
  Lock, 
  X 
} from 'lucide-react';
import { 
  updateTaskAction, 
  completeTaskAction, 
  carryOverTaskAction 
} from '@/actions/task-actions';

interface StaffTaskCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    estimatedTime: string;
    status: string;
    completionNotes: string | null;
    completionLinks: string[];
    carryOverNotes: string | null;
    createdAt: Date;
    category: { name: string };
    comments: {
      id: string;
      text: string;
      reaction: string | null;
      author: { fullName: string; role: string };
    }[];
  };
}

export default function StaffTaskCard({ task }: StaffTaskCardProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCarryModal, setShowCarryModal] = useState(false);

  // 5-Minute Timer Calculation
  useEffect(() => {
    const calculateTimeLeft = () => {
      const createdTime = new Date(task.createdAt).getTime();
      const now = new Date().getTime();
      const elapsedSeconds = Math.floor((now - createdTime) / 1000);
      const remaining = 300 - elapsedSeconds; // 5 minutes = 300 seconds
      setSecondsRemaining(remaining > 0 ? remaining : 0);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [task.createdAt]);

  const canEdit = secondsRemaining > 0;
  const isCompleted = task.status === 'COMPLETED';
  const isCarriedOver = task.status === 'CARRIED_OVER';

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 border transition-all ${
        isCompleted
          ? 'bg-white border-emerald-200'
          : isCarriedOver
          ? 'bg-amber-50/20 border-amber-300'
          : 'bg-white border-slate-200 shadow-xs'
      }`}
    >
      {/* Top Meta & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
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
            <Tag size={12} />
            {task.category.name}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <Clock size={12} />
            Est: {task.estimatedTime}
          </span>
        </div>

        {/* 5-Minute Edit Status */}
        {!isCompleted && !isCarriedOver && (
          <div className="flex items-center gap-2">
            {canEdit ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-[#0284c7] hover:bg-sky-100 border border-sky-200 rounded-lg text-xs font-bold transition"
              >
                <Edit3 size={13} />
                Edit ({formatTimer(secondsRemaining)})
              </button>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                <Lock size={12} />
                Edit Locked
              </span>
            )}
          </div>
        )}
      </div>

      {/* Task Content */}
      <div className="py-3.5 space-y-2">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">{task.title}</h3>
        <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-wrap">{task.description}</p>

        {/* Completion Info */}
        {isCompleted && (
          <div className="mt-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <p className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
              Completion Notes:
            </p>
            <p className="text-xs text-emerald-900">{task.completionNotes}</p>

            {task.completionLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {task.completionLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0284c7] bg-white px-2.5 py-1 rounded-md border border-sky-200 hover:underline"
                  >
                    <ExternalLink size={12} />
                    Link #{idx + 1}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Carry Over Info */}
        {isCarriedOver && (
          <div className="mt-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs font-extrabold text-amber-800 uppercase tracking-wider mb-1">
              Carry Over Progress Note:
            </p>
            <p className="text-xs text-amber-900">{task.carryOverNotes}</p>
          </div>
        )}

        {/* Admin Feedback */}
        {task.comments.length > 0 && (
          <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Admin Feedback:</p>
            {task.comments.map((c) => (
              <div key={c.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-[#1a2c5b]">{c.author.fullName}</span>
                  {c.reaction && (
                    <span className="bg-white border px-1.5 py-0.5 rounded text-[11px] font-bold text-slate-700">
                      {c.reaction}
                    </span>
                  )}
                </div>
                <p className="text-slate-600">{c.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons for Pending/Planned Tasks */}
      {!isCompleted && !isCarriedOver && (
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCompleteModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <CheckCircle size={14} />
            Complete Task
          </button>
          <button
            onClick={() => setShowCarryModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <ArrowRightLeft size={14} />
            Continue Next Day
          </button>
        </div>
      )}

      {/* 1. EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h4 className="text-base font-bold text-[#1a2c5b]">
                Edit Task (Lock in {formatTimer(secondsRemaining)})
              </h4>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form
              action={async (formData) => {
                await updateTaskAction(formData);
                setShowEditModal(false);
              }}
              className="space-y-3"
            >
              <input type="hidden" name="taskId" value={task.id} />
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={task.title}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={task.description}
                  required
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Est. Time</label>
                <input
                  type="text"
                  name="estimatedTime"
                  defaultValue={task.estimatedTime}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1a2c5b] text-white rounded-xl text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. COMPLETE MODAL (Links & Notes) */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h4 className="text-base font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle size={18} />
                Mark Work as Completed
              </h4>
              <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form
              action={async (formData) => {
                await completeTaskAction(formData);
                setShowCompleteModal(false);
              }}
              className="space-y-4"
            >
              <input type="hidden" name="taskId" value={task.id} />
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Completion Notes (What was done?)
                </label>
                <textarea
                  name="completionNotes"
                  placeholder="Summarize the completed results..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Upload Links (GitHub, Google Drive, Figma, Docs)
                </label>
                <textarea
                  name="completionLinks"
                  placeholder="Add links separated by a comma or new line...&#10;https://drive.google.com/...&#10;https://github.com/..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400">Multiple links allowed.</span>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition"
                >
                  Submit & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. CARRY OVER MODAL */}
      {showCarryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h4 className="text-base font-bold text-amber-800 flex items-center gap-2">
                <ArrowRightLeft size={18} />
                Continue Task Next Day
              </h4>
              <button onClick={() => setShowCarryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form
              action={async (formData) => {
                await carryOverTaskAction(formData);
                setShowCarryModal(false);
              }}
              className="space-y-4"
            >
              <input type="hidden" name="taskId" value={task.id} />
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Progress Note & Reason
                </label>
                <textarea
                  name="carryOverNotes"
                  required
                  placeholder="Explain today's progress and why this task will continue tomorrow..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCarryModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-amber-600 transition"
                >
                  Carry Over Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}