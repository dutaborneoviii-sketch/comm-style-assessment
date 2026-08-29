"use client";

import { Search, Bell, DownloadCloud } from "lucide-react";
import { ViewModeToggle } from "./view-mode-toggle";
import { AsistenModeToggle } from "./asisten-mode-toggle";
import { NotificationMenu, NotificationType } from "../notification-menu";
import { ProfileDropdown } from "./profile-dropdown";

interface AdminHeaderProps {
  user: any;
  viewMode: 'admin' | 'user';
  asistenMode?: string;
  notifications: NotificationType[];
}

export default function AdminHeader({ user, viewMode, asistenMode, notifications }: AdminHeaderProps) {
  return (
    <div className="w-full bg-gradient-to-r from-[#015249] via-[#57BC90] to-[#77C9D4] shrink-0 px-8 pt-8 pb-24 flex flex-col relative overflow-hidden -mb-16 z-0">
      {/* Abstract Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="flex items-center justify-between z-10 w-full max-w-[1920px] mx-auto">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2 tracking-tight">
            Welcome to BELIAN
          </h1>
          <p className="text-white/80 mt-1 font-medium text-sm italic">"Membimbing Hari Ini, Meningkatkan Kinerja Esok Hari"</p>
        </div>

        <div className="flex items-center gap-4">
          <NotificationMenu notifications={notifications} />

          {user?.role === 'ADMIN' && (
            <div className="bg-white/10 p-1.5 rounded-full flex items-center gap-2 border border-white/20">
               <ViewModeToggle currentMode={viewMode} />
            </div>
          )}
          
          {(user?.position === 'Asisten Deputi' || user?.position === 'Kepala Kabupaten' || user?.position === 'Kepala Kantor Kabupaten' || user?.position === 'Asisten Manager') && (user?.role !== 'ADMIN' || viewMode !== 'user') && (
            <div className="bg-white/10 p-1.5 rounded-full flex items-center gap-2 border border-white/20">
               <AsistenModeToggle currentMode={(asistenMode === 'coachee' ? 'coachee' : 'coach')} />
            </div>
          )}

          <div className="ml-2 flex items-center">
            <ProfileDropdown user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
