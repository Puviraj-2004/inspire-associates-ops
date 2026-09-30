// actions/category-actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// 1. Create New Work Category (Admin Only)
export async function createCategoryAction(formData: FormData): Promise<void> {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized: Only Admin can add work categories.');
  }

  const name = (formData.get('name') as string)?.trim();

  if (!name) {
    throw new Error('Category name cannot be empty.');
  }

  // Check duplicate
  const existing = await prisma.category.findUnique({
    where: { name },
  });

  if (existing) {
    throw new Error('A category with this name already exists.');
  }

  const category = await prisma.category.create({
    data: { name },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      userName: session.fullName,
      action: 'CATEGORY_CREATED',
      details: `Admin added new work category: "${category.name}"`,
    },
  });

  revalidatePath('/admin/categories');
  revalidatePath('/staff/dashboard');
}

// 2. Delete Category (Admin Only)
export async function deleteCategoryAction(categoryId: string): Promise<void> {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized: Only Admin can delete categories.');
  }

  // Check if any tasks are assigned to this category
  const taskCount = await prisma.task.count({
    where: { categoryId },
  });

  if (taskCount > 0) {
    throw new Error('Cannot delete category: Tasks are already associated with it.');
  }

  const category = await prisma.category.delete({
    where: { id: categoryId },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      userName: session.fullName,
      action: 'CATEGORY_DELETED',
      details: `Admin removed category: "${category.name}"`,
    },
  });

  revalidatePath('/admin/categories');
  revalidatePath('/staff/dashboard');
}