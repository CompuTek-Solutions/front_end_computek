import React from 'react';
import { useAuthStore } from '../../store/authStore';

export default function Header({ title, onToggleSidebar }) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0">
      <div className="flex items-center justify-between gap-2">
        {/* Left: hamburger (mobile) + logo + title */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-dark-700 hover:bg-gray-100 flex-shrink-0"
            aria-label="Ouvrir le menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src="/logo.jpg" alt="CompuTek Solutions" className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg object-cover shadow-md flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl md:text-2xl font-bold text-dark-900 truncate">{title || 'CompuTek Solutions'}</h1>
            <p className="text-xs sm:text-sm text-dark-500 hidden sm:block">Gestion Commerciale</p>
          </div>
        </div>

        {/* Right: user info + logout */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-dark-900 text-sm sm:text-base">{user?.name || 'Utilisateur'}</p>
            <p className="text-xs sm:text-sm text-dark-500 capitalize">
              {user?.role === 'admin' ? 'Administrateur' : 'Vendeur'}
            </p>
          </div>

          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="px-2 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-1 sm:gap-2 shadow-md text-sm"
          >
            <span>🚪</span>
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
}
