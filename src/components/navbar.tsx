import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { auth, signOut } from '@/auth';
import { LogoutButton } from '@/components/logout-button';
import { cookies } from 'next/headers';
import { ViewModeToggle } from '@/components/admin/view-mode-toggle';
import { AsistenModeToggle } from '@/components/admin/asisten-mode-toggle';

import { prisma } from '@/lib/prisma';
import { Database } from 'lucide-react';
export default function Navbar() {
  return null;
}
