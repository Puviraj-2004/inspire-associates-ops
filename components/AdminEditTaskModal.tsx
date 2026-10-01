// components/AdminEditTaskModal.tsx
'use client';

import { useState } from 'react';
import { adminUpdateTaskAction } from '@/actions/admin-actions';
import { Edit, X } from 'lucide-react';

interface TaskData {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  status: string;
  categoryId: string;
}

interface Props {
  task: TaskData;
  categories: { id: string; name: string }[];
}

export default function AdminEditTaskModal({ task, categories }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs font-bold text-[#0284c7] hover:text-[#0369a1] bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-lg transition"
      >
        <Edit size={13} />
        Edit Task
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h4 className="text-base font-bold text-[#1a2c5b] flex items-center gap-2">
                <Edit size={16} className="text-[#0284c7]" />
                Admin Edit Task
              </h4>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form
              action={async (formData) => {
                setLoading(true);
                await adminUpdateTaskAction(formData);
                setLoading(false);
                setOpen(false);
              }}
              className="space-y-3.5"
            >
              <input type="hidden" name="taskId" value={task.id} />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={task.title}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0284c7] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    name="categoryId"
                    defaultValue={task.categoryId}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#0284c7] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={task.status}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#0284c7] focus:outline-none"
                  >
                    <option value="PLANNED">PLANNED</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CARRIED_OVER">CARRIED OVER</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Estimated Time
                </label>
                <input
                  type="text"
                  name="estimatedTime"
                  defaultValue={task.estimatedTime}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0284c7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={task.description}
                  required
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0284c7] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#1a2c5b] hover:bg-[#121f42] text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}