import React from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuthStore();
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Utilisateur';

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 bg-white border-b border-dark-200">
      <div className="h-full flex items-center justify-between gap-3 px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-lg text-dark-600 hover:bg-dark-100"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <img src="/logo.jpg" alt="" className="h-9 w-9 sm:h-10 sm:w-10 object-contain shrink-0" />
          <div className="min-w-0 leading-tight">
            <p className="font-bold text-dark-900 truncate">CompuTek Solutions</p>
            <p className="hidden sm:block text-xs text-dark-500">Gestion commerciale</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:block text-right leading-tight">
            <p className="text-sm font-semibold text-dark-900">{displayName}</p>
            <p className="text-xs text-dark-500">{user?.role === 'admin' ? 'Administrateur' : 'Vendeur'}</p>
          </div>
          <div className="hidden sm:flex h-9 w-9 rounded-full bg-primary-100 text-primary-700 items-center justify-center text-sm font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className="h-10 inline-flex items-center gap-2 rounded-lg px-2 sm:px-3 text-sm font-medium text-dark-600 hover:bg-red-50 hover:text-red-700"
            title="Déconnexion"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden lg:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
}
