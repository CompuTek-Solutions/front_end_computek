import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ role, isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const adminMenus = [
    { name: 'Tableau de bord', path: '/admin', icon: '📊' },
    { name: 'Produits', path: '/admin/products', icon: '📦' },
    { name: 'Inventaire', path: '/admin/inventory', icon: '📋' },
    { name: 'Ventes', path: '/admin/sales', icon: '🛒' },
    { name: 'Factures', path: '/admin/invoices', icon: '🧾' },
    { name: 'Clients', path: '/admin/clients', icon: '👤' },
    { name: 'Statistiques', path: '/admin/statistics', icon: '📈' },
    { name: 'Utilisateurs', path: '/admin/users', icon: '👥' },
    { name: 'Paramètres', path: '/admin/settings', icon: '⚙️' },
  ];

  const sellerMenus = [
    { name: 'Tableau de bord', path: '/seller', icon: '📊' },
    { name: 'Nouvelle vente', path: '/seller/new-sale', icon: '💳' },
    { name: 'Historique', path: '/seller/sales-history', icon: '📜' },
    { name: 'Mes factures', path: '/seller/invoices', icon: '🧾' },
    // { name: 'Mes performances', path: '/seller/performance', icon: '📊' },
  ];

  const menus = role === 'admin' ? adminMenus : sellerMenus;

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <aside
      className={`
        flex-shrink-0 flex flex-col h-screen bg-white shadow-sm border-r border-gray-200
        fixed top-0 left-0 z-30 transition-transform duration-300
        md:relative md:translate-x-0 md:w-64 md:z-auto
        w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Logo + Close button on mobile */}
      <div className="flex-shrink-0 p-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <span className="text-lg font-semibold text-dark-900">Navigation</span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden ml-2 p-1.5 rounded-lg text-dark-500 hover:bg-gray-100 flex-shrink-0"
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Navigation - scrollable */}
      <nav className="flex-1 min-h-0 overflow-y-auto py-3 px-2 space-y-1">
        {menus.map((menu) => {
          const isActive = location.pathname === menu.path;
          return (
            <button
              key={menu.path}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                isActive
                  ? 'bg-primary-100 text-primary-800 border-l-2 border-primary-600'
                  : 'text-dark-700 hover:bg-gray-100 hover:text-dark-900'
              }`}
              onClick={() => handleNavigate(menu.path)}
            >
              <span className="text-lg flex-shrink-0">{menu.icon}</span>
              <span className="font-medium truncate">{menu.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer - fixe en bas, ne déborde pas */}
      <div className="flex-shrink-0 p-3 border-t border-gray-200">
        <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-lg flex-shrink-0">💡</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-dark-900">Besoin d&apos;aide ?</p>
              <p className="text-xs text-dark-600">Contactez le support</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
