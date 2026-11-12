import React, { useMemo, useEffect, useState } from 'react';
import { BarChart3, CreditCard, PackageCheck, PieChart as PieIcon, ShoppingBag, Wallet } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useProductStore } from '../../store/productStore';
import { formatCurrency } from '../../utils/helpers';
import { Card, EmptyState, PageHeader, StatCard } from '../../components/ui';
import PeriodFilter from '../../components/common/PeriodFilter';
import { periodParams } from '../../utils/periods';

const CHART_COLORS = ['#0369a1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#64748b', '#7dd3fc', '#075985'];
const AXIS = { stroke: '#94a3b8', fontSize: 12 };
const compact = (v) => new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(v);

export default function AdminStatistics() {
  const { adminStats, statsLoading, fetchAdminStats } = useProductStore();
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    fetchAdminStats(periodParams(period)).catch(() => {});
  }, [fetchAdminStats, period]);

  const loading = statsLoading && !adminStats;
  const prev = adminStats?.previousSummary;

  const stats = adminStats?.summary ?? { totalRevenue: 0, totalQuantity: 0, totalOrders: 0, averageOrder: 0 };
  const topProducts = useMemo(
    () => (adminStats?.topProducts ?? []).slice(0, 10).map((p) => ({ ...p, quantity: Number(p.quantity) })),
    [adminStats]
  );

  const monthlyData = useMemo(
    () =>
      (adminStats?.monthlySales ?? [])
        .map((entry) => ({
          month: new Date(entry.month).toLocaleString('fr-FR', { month: 'short', year: '2-digit' }),
          ventes: Number(entry.total_revenue) || 0,
        }))
        .reverse(),
    [adminStats]
  );

  const categoryData = useMemo(
    () =>
      (adminStats?.categories ?? []).map((c) => ({
        name: c.category || 'Autre',
        value: Number(c.total_revenue) || 0,
      })),
    [adminStats]
  );

  return (
    <>
      <PageHeader title="Statistiques">
        <PeriodFilter value={period} onChange={setPeriod} />
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Chiffre d'affaires" value={formatCurrency(stats.totalRevenue)} icon={Wallet} tone="success" loading={loading} current={stats.totalRevenue} previous={prev?.totalRevenue} />
        <StatCard label="Ventes" value={stats.totalOrders} icon={ShoppingBag} loading={loading} current={stats.totalOrders} previous={prev?.totalOrders} />
        <StatCard label="Articles vendus" value={stats.totalQuantity} icon={PackageCheck} loading={loading} current={stats.totalQuantity} previous={prev?.totalQuantity} />
        <StatCard label="Panier moyen" value={formatCurrency(stats.averageOrder)} icon={CreditCard} tone="neutral" loading={loading} current={stats.averageOrder} previous={prev?.averageOrder} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Chiffre d'affaires mensuel (12 derniers mois)">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} margin={{ left: -10, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" {...AXIS} />
                <YAxis {...AXIS} tickFormatter={compact} width={50} />
                <Tooltip formatter={(v) => formatCurrency(v)} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="ventes" name="Chiffre d'affaires" fill="#0369a1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={BarChart3} title="Pas encore de données" />
          )}
        </Card>

        <Card title="Chiffre d'affaires par catégorie">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius="45%" outerRadius="75%" paddingAngle={2}>
                  {categoryData.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={PieIcon} title="Pas encore de données" />
          )}
        </Card>
      </div>

      <Card title="Top 10 des produits (quantités vendues)">
        {topProducts.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(200, topProducts.length * 40)}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" {...AXIS} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                {...AXIS}
                width={110}
                tickFormatter={(name) => (name.length > 16 ? `${name.slice(0, 15)}…` : name)}
              />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="quantity" name="Quantité" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={BarChart3} title="Pas encore de données" />
        )}
      </Card>
    </>
  );
}
