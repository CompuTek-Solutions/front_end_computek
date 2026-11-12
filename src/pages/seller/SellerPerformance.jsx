import React, { useMemo, useEffect } from 'react';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/helpers';

const MONTHLY_TARGET = 500000;

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function SellerPerformance() {
  const { sellerStats, fetchSellerStats } = useProductStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) fetchSellerStats(user.id).catch(() => {});
  }, [fetchSellerStats, user?.id]);

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-900">Mes Performances</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-dark-900 mb-4">Objectif du mois</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-dark-600">{formatCurrency(currentMonthRevenue)} / {formatCurrency(MONTHLY_TARGET)}</span>
          <span className="text-sm font-bold text-primary-600">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Produits les plus vendus</h3>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-dark-900">{product.name}</p>
                      <p className="text-xs text-dark-500">{product.quantity} vendu(s)</p>
                    </div>
                  </div>
                  <p className="font-semibold text-primary-600">{formatCurrency(product.revenue)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-dark-500">Aucun produit vendu</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Totaux</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-dark-600">Nombre de ventes</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-dark-600">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-dark-600">Panier moyen</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.averageOrder)}</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-dark-600">Articles vendus</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalQuantity}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
