"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function setAsistenMode(mode: 'coach' | 'coachee') {
  cookies().set('asisten-mode', mode, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true
  });
  
  redirect('/profile');
}
