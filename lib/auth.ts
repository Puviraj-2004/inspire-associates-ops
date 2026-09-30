// lib/auth.ts
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { Role } from '@prisma/client';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'Test@JWT#2026_MangoMoon_7xQ9!'
);

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
}

// 1. Create JWT Token (Admin: 30 Days | Staff: 12 Hours)
export async function createSessionToken(payload: TokenPayload): Promise<string> {
  const expiresIn = payload.role === 'ADMIN' ? '30d' : '12h';

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET_KEY);
}

// 2. Set Cookie to Browser
export async function setSessionCookie(payload: TokenPayload): Promise<void> {
  const token = await createSessionToken(payload);
  const maxAge = payload.role === 'ADMIN' ? 30 * 24 * 60 * 60 : 12 * 60 * 60; // in seconds

  const cookieStore = await cookies();
  cookieStore.set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAge,
  });
}

// 3. Get and Verify Session
export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token) return null;

  try {
    // Note: token comes FIRST, SECRET_KEY comes SECOND
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

// 4. Logout (Clear Session)
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session_token');
}