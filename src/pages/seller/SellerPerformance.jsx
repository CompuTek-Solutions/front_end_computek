import React, { useMemo, useEffect, useState } from 'react';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { CreditCard, PackageCheck, ShoppingBag, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import TopProductsList from '../../components/common/TopProductsList';
import { Card, PageHeader, StatCard } from '../../components/ui';
import PeriodFilter from '../../components/common/PeriodFilter';
import { periodParams } from '../../utils/periods';

const MONTHLY_TARGET = 500000;

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function SellerPerformance() {
  const { sellerStats, statsLoading, fetchSellerStats } = useProductStore();
  const { user } = useAuthStore();
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    if (user?.id) fetchSellerStats(user.id, periodParams(period)).catch(() => {});
  }, [fetchSellerStats, user?.id, period]);

  const loading = statsLoading && !sellerStats;
  const prev = sellerStats?.previousSummary;

  const summary = sellerStats?.summary;
  const stats = {
    totalRevenue: toNumber(summary?.totalRevenue),
    totalQuantity: toNumber(summary?.totalQuantity),
    averageOrder: toNumber(summary?.averageOrder),
    totalOrders: toNumber(summary?.totalOrders),
  };

  const topProducts = sellerStats?.topProducts ?? [];

  const currentMonthRevenue = useMemo(() => {
    const now = new Date();
    const entry = (sellerStats?.monthlySales ?? []).find((m) => {
      const d = new Date(m.month);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    return toNumber(entry?.total_revenue);
  }, [sellerStats?.monthlySales]);

  const progressPercent = Math.min(100, Math.round((currentMonthRevenue / MONTHLY_TARGET) * 100));

  return (
    <>
      <PageHeader title="Mes performances">
        <PeriodFilter value={period} onChange={setPeriod} />
      </PageHeader>

      <Card title="Objectif du mois">
        <div className="flex items-end justify-between gap-3 mb-3">
          <div>
            <p className="text-2xl font-bold text-dark-900">{formatCurrency(currentMonthRevenue)}</p>
            <p className="text-sm text-dark-500">sur {formatCurrency(MONTHLY_TARGET)}</p>
          </div>
          <span className="text-lg font-bold text-primary-700">{progressPercent}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-dark-100 overflow-hidden">
          <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Chiffre d'affaires" value={formatCurrency(stats.totalRevenue)} icon={Wallet} tone="success" loading={loading} current={stats.totalRevenue} previous={prev?.totalRevenue} />
        <StatCard label="Ventes" value={stats.totalOrders} icon={ShoppingBag} loading={loading} current={stats.totalOrders} previous={prev?.totalOrders} />
        <StatCard label="Articles vendus" value={stats.totalQuantity} icon={PackageCheck} loading={loading} current={stats.totalQuantity} previous={prev?.totalQuantity} />
        <StatCard label="Panier moyen" value={formatCurrency(stats.averageOrder)} icon={CreditCard} tone="neutral" loading={loading} current={stats.averageOrder} previous={prev?.averageOrder} />
      </div>

      <Card title="Produits les plus vendus" bodyClassName="p-2 sm:p-4">
        <TopProductsList products={topProducts.slice(0, 5)} />
      </Card>
    </>
  );
}
