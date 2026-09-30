// app/(dashboard)/admin/categories/page.tsx
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createCategoryAction, deleteCategoryAction } from '@/actions/category-actions';
import { FolderTree, Plus, Trash2, Tag, Layers } from 'lucide-react';

export default async function AdminCategoriesPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  // Fetch all categories with task counts
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl font-black text-[#1a2c5b] tracking-tight">Work Categories</h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
          Configure active project domains, departments, and task categories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Add New Category Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs h-fit">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284c7] flex items-center justify-center font-bold">
              <Plus size={18} />
            </div>
            <h2 className="text-base font-bold text-[#1a2c5b]">New Category</h2>
          </div>

          <form action={createCategoryAction} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Tag size={16} />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. AI Prompt Engineering"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1a2c5b] hover:bg-[#121f42] text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              <Plus size={16} />
              Add Category
            </button>
          </form>
        </div>

        {/* Right: Existing Categories List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1a2c5b] flex items-center gap-2">
              <FolderTree size={18} className="text-[#0284c7]" />
              Active Categories ({categories.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {categories.map((cat) => {
              const hasTasks = cat._count.tasks > 0;

              return (
                <div
                  key={cat.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-sm">{cat.name}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      <Layers size={11} />
                      {cat._count.tasks} task{cat._count.tasks === 1 ? '' : 's'} assigned
                    </span>
                  </div>

                  {!hasTasks ? (
                    <form
                      action={async () => {
                        'use server';
                        await deleteCategoryAction(cat.id);
                      }}
                    >
                      <button
                        type="submit"
                        title="Delete Category"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </form>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-300 px-2 py-1">In Use</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}