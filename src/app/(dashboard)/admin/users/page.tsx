import { getUsers } from "@/app/actions/users";
import { UserManager } from "@/components/admin/user-manager";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  
  const viewMode = cookies().get('view-mode')?.value || 'admin';
  const isViewModeUser = currentUser?.role === 'ADMIN' && viewMode === 'user';
  if (isViewModeUser && currentUser) {
    currentUser.role = 'USER';
  }

  if (!currentUser || currentUser.role !== "ADMIN") redirect("/profile");

  const currentUserId = session.user.id;
  const users = await getUsers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-[#015249] dark:text-white tracking-tight flex items-center gap-3">
          <Users className="w-8 h-8 text-[#57BC90]" />
          Manajemen Akses User
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          Kelola data akses pengguna aplikasi. Anda dapat menambahkan pengguna baru, mengubah informasi profil, atau mencabut akses dengan menghapus pengguna.
        </p>
      </div>

      <UserManager initialUsers={users} currentUserId={currentUserId} />
    </div>
  );
}
