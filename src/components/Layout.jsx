import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import Header from './common/Header';
import Sidebar from './common/Sidebar';

export default function Layout({ children, pageTitle }) {
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mettre à jour le titre de l'onglet du navigateur
  useEffect(() => {
    if (pageTitle) {
      // Nettoyer les emojis du titre pour l'onglet
      const cleanTitle = pageTitle.replace(/[^\w\s-]/g, '').trim();
      document.title = `${cleanTitle} - CompuTek Solutions`;
    } else {
      document.title = 'CompuTek Solutions';
    }
  }, [pageTitle]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Header title={pageTitle} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="flex flex-1 min-h-0 relative">
        {/* Overlay backdrop for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <Sidebar role={user?.role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
