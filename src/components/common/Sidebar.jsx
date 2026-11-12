import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, ClipboardList, Receipt, Users, UserCog, BarChart3,
  Settings, ShoppingCart, History, TrendingUp, X,
} from 'lucide-react';

const ADMIN_MENU = [
  { name: 'Tableau de bord', path: '/admin', icon: LayoutDashboard, end: true },
  { name: 'Produits', path: '/admin/products', icon: Package },
  { name: 'Inventaire', path: '/admin/inventory', icon: ClipboardList },
  { name: 'Factures', path: '/admin/invoices', icon: Receipt },
  { name: 'Clients', path: '/admin/clients', icon: Users },
  { name: 'Statistiques', path: '/admin/statistics', icon: BarChart3 },
  { name: 'Utilisateurs', path: '/admin/users', icon: UserCog },
  { name: 'Mon compte', path: '/admin/settings', icon: Settings },
];

const SELLER_MENU = [
  { name: 'Tableau de bord', path: '/seller', icon: LayoutDashboard, end: true },
  { name: 'Nouvelle vente', path: '/seller/new-sale', icon: ShoppingCart },
  { name: 'Historique', path: '/seller/sales-history', icon: History },
  { name: 'Mes factures', path: '/seller/invoices', icon: Receipt },
  { name: 'Mes performances', path: '/seller/performance', icon: TrendingUp },
  { name: 'Mon compte', path: '/seller/settings', icon: Settings },
];

export default function Sidebar({ role, isOpen, onClose }) {
  const menus = role === 'admin' ? ADMIN_MENU : SELLER_MENU;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-white border-r border-dark-200 transition-transform duration-200
        md:static md:z-auto md:translate-x-0 ${isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-dark-200 md:hidden">
        <span className="font-semibold text-dark-900">Menu</span>
        <button
          onClick={onClose}
          className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-dark-500 hover:bg-dark-100"
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menus.map(({ name, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-dark-600 hover:bg-dark-100 hover:text-dark-900'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
