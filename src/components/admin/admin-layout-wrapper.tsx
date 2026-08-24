"use client";

import { useState } from 'react';
import AdminSidebar from './admin-sidebar';
import AdminHeader from './admin-header';
import { usePathname } from 'next/navigation';

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
  user: any;
  viewMode: 'admin' | 'user';
  asistenMode?: string;
  notifications: any[];
  featuresMap?: Record<string, boolean>;
}

export default function AdminLayoutWrapper({ children, user, viewMode, asistenMode, notifications, featuresMap }: AdminLayoutWrapperProps) {
  const pathname = usePathname();
  const isDashboard = pathname === '/profile';
  const isQuestionnaire = pathname === '/questionnaire';
  const isTeamDetail = pathname.startsWith('/team/') && pathname !== '/team';
  const noCardWrapper = isDashboard || isQuestionnaire || isTeamDetail;
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fe] dark:bg-[#0b0f19] font-sans">
      <AdminSidebar 
        user={user} 
        viewMode={viewMode} 
        asistenMode={asistenMode} 
        featuresMap={featuresMap} 
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <AdminHeader user={user} viewMode={viewMode} asistenMode={asistenMode} notifications={notifications} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 z-10 relative flex flex-col">
          {noCardWrapper ? (
            children
          ) : (
            <div className="bg-white dark:bg-zinc-950 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 w-full max-w-[1920px] mx-auto min-h-[calc(100vh-16rem)] pt-2 -mt-10">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
