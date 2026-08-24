"use client";

import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

import { useState } from "react";

export type NotificationType = {
  id: string;
  title: string;
  message: string;
  logId: string;
  type: 'response' | 'action_item';
  date: Date;
};

export function NotificationMenu({ notifications }: { notifications: NotificationType[] }) {
  const router = useRouter();
  const [readIds, setReadIds] = useState<string[]>([]);
  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const handleNotificationClick = (notif: NotificationType) => {
    if (!readIds.includes(notif.id)) {
      setReadIds((prev) => [...prev, notif.id]);
    }
    router.push(`/coaching/${notif.logId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          unreadCount > 0 
            ? "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 focus:ring-red-300 shadow-sm shadow-red-100" 
            : "bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 focus:ring-slate-300"
        }`}
      >
        <Bell className={`h-5 w-5 ${unreadCount > 0 ? "fill-red-100" : ""}`} />
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md z-10 border border-white">
              {unreadCount}
            </span>
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-400 animate-ping opacity-75"></span>
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 rounded-xl overflow-hidden shadow-xl border-slate-200">
        <div className="p-4 bg-slate-50 border-b border-slate-100 text-slate-800 font-bold text-sm">
          Notifikasi
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Belum ada notifikasi baru
            </div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem 
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`flex flex-col items-start gap-1 p-4 cursor-pointer border-b border-slate-100 last:border-0 ${
                  readIds.includes(notif.id) 
                    ? 'bg-slate-50/50 opacity-60' 
                    : 'bg-white hover:bg-slate-50 focus:bg-slate-50'
                }`}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-slate-800">
                    {notif.title}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                    {formatDistanceToNow(new Date(notif.date), { addSuffix: true, locale: id })}
                  </span>
                </div>
                <span className="text-xs text-slate-600 line-clamp-2 leading-relaxed mt-1">
                  {notif.message}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
