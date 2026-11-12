import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, History, PackageCheck, Receipt, ShoppingBag, ShoppingCart, TrendingUp, Wallet } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/helpers';
import TopProductsList from '../../components/common/TopProductsList';
import { Card, EmptyState, PageHeader, StatCard } from '../../components/ui';

const QUICK_ACTIONS = [
  { to: '/seller/new-sale', label: 'Nouvelle vente', icon: ShoppingCart, primary: true },
  { to: '/seller/invoices', label: 'Mes factures', icon: Receipt },
  { to: '/seller/sales-history', label: 'Historique', icon: History },
  { to: '/seller/performance', label: 'Performances', icon: TrendingUp },
];

export default function SellerDashboard() {
  const { sellerStats, fetchSellerStats } = useProductStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) fetchSellerStats(user.id).catch(() => {});
  }, [user?.id, fetchSellerStats]);

  const stats = sellerStats?.summary ?? { totalRevenue: 0, totalOrders: 0, totalQuantity: 0, averageOrder: 0 };
  const months = (sellerStats?.monthlySales ?? []).map((entry) => ({
    label: new Date(entry.month).toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
    revenue: Number(entry.total_revenue) || 0,
    count: Number(entry.sales_count) || 0,
  }));

  return (
    <>
      <PageHeader title={`Bonjour ${user?.name || ''}`.trim()} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map(({ to, label, icon: Icon, primary }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 rounded-xl p-4 text-sm font-medium shadow-sm transition-colors ${
              primary
                ? 'bg-primary-700 text-white hover:bg-primary-800'
                : 'bg-white border border-dark-200 text-dark-700 hover:bg-dark-50'
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Mes ventes" value={formatCurrency(stats.totalRevenue)} icon={Wallet} tone="success" />
        <StatCard label="Nombre de ventes" value={stats.totalOrders} icon={ShoppingBag} />
        <StatCard label="Articles vendus" value={stats.totalQuantity} icon={PackageCheck} />
        <StatCard label="Panier moyen" value={formatCurrency(stats.averageOrder)} icon={CreditCard} tone="neutral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Top produits" bodyClassName="p-2 sm:p-4">
          <TopProductsList products={(sellerStats?.topProducts ?? []).slice(0, 5)} />
        </Card>

        <Card title="Par mois" bodyClassName="p-2 sm:p-4">
          {months.length > 0 ? (
            <ul className="divide-y divide-dark-100">
              {months.map((m) => (
                <li key={m.label} className="flex items-center justify-between gap-3 px-2 py-3">
                  <div>
                    <p className="font-medium text-dark-900 capitalize">{m.label}</p>
                    <p className="text-xs text-dark-500">{m.count} vente(s)</p>
                  </div>
                  <span className="font-semibold text-dark-900 whitespace-nowrap">{formatCurrency(m.revenue)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={History} title="Pas encore de ventes" />
          )}
        </Card>
      </div>
    </>
  );
}
