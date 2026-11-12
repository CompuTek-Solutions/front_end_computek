import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import Header from './common/Header';
import Sidebar from './common/Sidebar';

export default function Layout({ children, pageTitle, fullBleed = false }) {
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} - CompuTek Solutions` : 'CompuTek Solutions';
  }, [pageTitle]);

  return (
    <div className="h-dvh flex flex-col bg-dark-50">
      <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="flex flex-1 min-h-0">
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-dark-900/40 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <Sidebar role={user?.role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`flex-1 min-w-0 overflow-y-auto ${fullBleed ? '' : 'p-4 sm:p-6'}`}>
          {fullBleed ? children : <div className="mx-auto max-w-7xl space-y-6">{children}</div>}
        </main>
      </div>
    </div>
  );
}
