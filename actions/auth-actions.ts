// actions/auth-actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { setSessionCookie, clearSessionCookie, getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export interface AuthActionState {
  error?: string;
}

export async function loginAction(
  _prevState: AuthActionState | null,
  formData: FormData
): Promise<AuthActionState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: 'Invalid credentials. User not found.' };
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return { error: 'Invalid credentials. Incorrect password.' };
  }

  // Set Session Cookie (Staff: 12h, Admin: 30d)
  await setSessionCookie({
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  });

  // Record Audit Log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      userName: user.fullName,
      action: 'LOGIN',
      details: `${user.role} logged in (${user.email})`,
    },
  });

  // Redirect based on Role
  if (user.role === 'ADMIN') {
    redirect('/admin/dashboard');
  } else {
    redirect('/staff/dashboard');
  }
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();

  if (session) {
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.fullName,
        action: 'LOGOUT',
        details: `${session.role} logged out (${session.email})`,
      },
    });
  }

  await clearSessionCookie();
  redirect('/login');
}

// actions/auth-actions.ts kulla add pannunga:
export async function changePasswordAction(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!currentPassword || !newPassword) {
    return { error: 'Please provide both passwords.' };
  }

  if (newPassword.length < 6) {
    return { error: 'New password must be at least 6 characters long.' };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) return { error: 'User not found.' };

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    return { error: 'Incorrect current password.' };
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      userName: user.fullName,
      action: 'PASSWORD_CHANGED',
      details: `${user.role} updated their account password.`,
    },
  });

  return { success: true };
}