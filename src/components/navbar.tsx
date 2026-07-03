import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { auth, signOut } from '@/auth';

import { prisma } from '@/lib/prisma';
import { Database } from 'lucide-react';

export default async function Navbar() {
  const session = await auth();
  
  let isAdmin = false;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true }});
    isAdmin = user?.role === 'ADMIN';
  }

  return (
    <nav className="border-b bg-white text-slate-800 sticky top-0 z-50 shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6 mx-auto">
        <Link href="/profile" className="font-bold text-lg tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity text-[#0a3161]">
          <img src="/cognit-icon.png" alt="Logo" className="w-9 h-9 object-contain" />
          KEDEPUTIAN WILAYAH VIII
        </Link>
        {session?.user && (
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link href="/admin/questions" className="text-sm font-semibold flex items-center gap-1.5 text-[#1eb88a] bg-[#1eb88a]/10 px-3 py-1.5 rounded-full hover:bg-[#1eb88a]/20 transition-colors">
                <Database className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}
            <Link href="/guide" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Panduan
            </Link>
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
              {session.user.name}
            </span>
            <form action={async () => {
              "use server";
              await signOut();
            }}>
              <Button variant="outline" size="sm">Keluar</Button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}
