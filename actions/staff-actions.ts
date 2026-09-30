// actions/staff-actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';

// 1. Create New Staff Account (Admin Only)
export async function createStaffAction(formData: FormData): Promise<void> {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized: Only Admin can create staff accounts.');
  }

  const fullName = (formData.get('fullName') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!fullName || !email || !password) {
    throw new Error('All fields are mandatory.');
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('A user with this email already exists.');
  }

  // Hash Password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create Staff in Database
  const newStaff = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role: Role.STAFF,
    },
  });

  // Record Audit Log
  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      userName: session.fullName,
      action: 'STAFF_CREATED',
      details: `Admin created staff profile: ${newStaff.fullName} (${newStaff.email})`,
    },
  });

  revalidatePath('/admin/staffs');
  revalidatePath('/admin/dashboard');
}

// 2. Delete Staff Member (Admin Only)
export async function deleteStaffAction(staffId: string): Promise<void> {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized: Only Admin can delete staff accounts.');
  }

  const staff = await prisma.user.findUnique({
    where: { id: staffId },
    select: { fullName: true, email: true, role: true },
  });

  if (!staff || staff.role !== 'STAFF') {
    throw new Error('Staff not found or cannot delete this user.');
  }

  await prisma.user.delete({
    where: { id: staffId },
  });

  // Record Audit Log
  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      userName: session.fullName,
      action: 'STAFF_DELETED',
      details: `Admin deleted staff member: ${staff.fullName} (${staff.email})`,
    },
  });

  revalidatePath('/admin/staffs');
  revalidatePath('/admin/dashboard');
}