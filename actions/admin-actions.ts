// actions/admin-actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { TaskStatus } from '@prisma/client';

// 1. Delete Task (ADMIN ONLY)
export async function adminDeleteTaskAction(taskId: string): Promise<void> {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized: Only Admin can delete tasks.');
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { staff: true },
  });

  if (!task) return;

  await prisma.task.delete({
    where: { id: taskId },
  });

  // Log in Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      userName: session.fullName,
      action: 'TASK_DELETED',
      details: `Admin deleted task: "${task.title}" belonging to ${task.staff.fullName}`,
    },
  });

  revalidatePath('/admin/dashboard');
}

// 2. Add Comment / Reaction (ADMIN or STAFF) - Strict React 19 void return
export async function addCommentAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) return;

  const taskId = formData.get('taskId') as string;
  const text = (formData.get('text') as string)?.trim();
  const reaction = (formData.get('reaction') as string) || null;

  if (!taskId || (!text && !reaction)) return;

  await prisma.comment.create({
    data: {
      taskId,
      authorId: session.userId,
      text: text || 'Reacted to task',
      reaction,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      userName: session.fullName,
      action: 'TASK_COMMENT',
      details: `${session.role} commented on task ID: ${taskId}`,
    },
  });

  revalidatePath('/admin/dashboard');
  revalidatePath('/staff/dashboard');
}

export async function adminUpdateTaskAction(formData: FormData): Promise<void> {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized: Only Admin can edit tasks without restrictions.');
  }

  const taskId = formData.get('taskId') as string;
  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const categoryId = formData.get('categoryId') as string;
  const estimatedTime = (formData.get('estimatedTime') as string)?.trim();
  const status = formData.get('status') as TaskStatus;

  if (!taskId || !title || !description || !categoryId || !estimatedTime || !status) {
    throw new Error('All fields are required.');
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      title,
      description,
      categoryId,
      estimatedTime,
      status,
    },
    include: { staff: true },
  });

  // Log edit in audit logs
  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      userName: session.fullName,
      action: 'TASK_EDITED_BY_ADMIN',
      details: `Admin edited task "${updatedTask.title}" of staff ${updatedTask.staff.fullName} (Status: ${status})`,
    },
  });

  revalidatePath('/admin/dashboard');
  revalidatePath('/staff/dashboard');
}