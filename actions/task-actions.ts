// actions/task-actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { TaskStatus } from '@prisma/client';

// 1. Create Morning Task
export async function createTaskAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== 'STAFF') {
    throw new Error('Unauthorized: Only staff members can log daily tasks.');
  }

  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const categoryId = formData.get('categoryId') as string;
  const estimatedTime = (formData.get('estimatedTime') as string)?.trim();

  if (!title || !description || !categoryId || !estimatedTime) {
    throw new Error('All morning task fields are required.');
  }

  const task = await prisma.task.create({
    data: {
      staffId: session.userId,
      categoryId,
      title,
      description,
      estimatedTime,
      status: TaskStatus.PLANNED,
    },
  });

  // Log in Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      userName: session.fullName,
      action: 'TASK_CREATED',
      details: `Staff logged morning task: "${task.title}" (Est: ${task.estimatedTime})`,
    },
  });

  revalidatePath('/staff/dashboard');
  revalidatePath('/admin/dashboard');
}

// 2. Edit Task (Strict 5-Minute Restriction for Staff)
export async function updateTaskAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const taskId = formData.get('taskId') as string;
  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const estimatedTime = (formData.get('estimatedTime') as string)?.trim();

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) throw new Error('Task not found.');

  // 5-Minute Edit Enforcement for Staff
  if (session.role === 'STAFF') {
    if (task.staffId !== session.userId) {
      throw new Error('Unauthorized to edit this task.');
    }

    const createdAtTime = new Date(task.createdAt).getTime();
    const currentTime = new Date().getTime();
    const diffMinutes = (currentTime - createdAtTime) / (1000 * 60);

    if (diffMinutes > 5) {
      throw new Error('Edit time expired: Tasks can only be edited within 5 minutes of creation.');
    }
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      title,
      description,
      estimatedTime,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      userName: session.fullName,
      action: 'TASK_UPDATED',
      details: `${session.role} updated task: "${title}"`,
    },
  });

  revalidatePath('/staff/dashboard');
  revalidatePath('/admin/dashboard');
}

// 3. Mark Task as Completed (With Links and Notes)
export async function completeTaskAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const taskId = formData.get('taskId') as string;
  const completionNotes = (formData.get('completionNotes') as string)?.trim();
  const rawLinks = (formData.get('completionLinks') as string)?.trim() || '';

  // Parse links (comma-separated or newline-separated)
  const completionLinks = rawLinks
    ? rawLinks
        .split(/[\n,]+/)
        .map((link) => link.trim())
        .filter((link) => link.length > 0)
    : [];

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task || task.staffId !== session.userId) {
    throw new Error('Task not found or unauthorized.');
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: TaskStatus.COMPLETED,
      completionNotes: completionNotes || 'Work completed successfully.',
      completionLinks,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      userName: session.fullName,
      action: 'TASK_COMPLETED',
      details: `Completed task: "${task.title}" with ${completionLinks.length} link(s)`,
    },
  });

  revalidatePath('/staff/dashboard');
  revalidatePath('/admin/dashboard');
}

// 4. Carry Over Task (Progress / Continue Next Day)
export async function carryOverTaskAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const taskId = formData.get('taskId') as string;
  const carryOverNotes = (formData.get('carryOverNotes') as string)?.trim();

  if (!carryOverNotes) {
    throw new Error('Please describe the progress or reason for continuing next day.');
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task || task.staffId !== session.userId) {
    throw new Error('Task not found or unauthorized.');
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: TaskStatus.CARRIED_OVER,
      carryOverNotes,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      userName: session.fullName,
      action: 'TASK_CARRIED_OVER',
      details: `Carried over task: "${task.title}" to next day. Reason: "${carryOverNotes}"`,
    },
  });

  revalidatePath('/staff/dashboard');
  revalidatePath('/admin/dashboard');
}

// actions/task-actions.ts kulla add pannunga:
export async function adminAssignTaskAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized: Only Admin can assign tasks.');
  }

  const staffId = formData.get('staffId') as string;
  const categoryId = formData.get('categoryId') as string;
  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const estimatedTime = (formData.get('estimatedTime') as string)?.trim();

  if (!staffId || !categoryId || !title || !description || !estimatedTime) {
    throw new Error('All fields are mandatory.');
  }

  const task = await prisma.task.create({
    data: {
      staffId,
      categoryId,
      title,
      description,
      estimatedTime,
      status: TaskStatus.PLANNED,
    },
    include: { staff: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      userName: session.fullName,
      action: 'TASK_ALLOCATED',
      details: `Admin assigned task "${task.title}" to ${task.staff.fullName}`,
    },
  });

  revalidatePath('/admin/dashboard');
  revalidatePath('/staff/dashboard');
}