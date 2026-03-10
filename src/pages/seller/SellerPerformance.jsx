import React, { useMemo } from 'react';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { calculateStats, getTopSellingProducts } from '../../utils/helpers';
import { formatCurrency } from '../../utils/helpers';

export default function SellerPerformance() {
  const { sales, products } = useProductStore();
  const { user } = useAuthStore();

  const stats = useMemo(() => calculateStats(sales), [sales]);
  const topProducts = useMemo(() => getTopSellingProducts(sales, 5), [sales]);

  const commissionRate = 0; // Commission removed
  const totalCommissions = 0;

  const monthlyTarget = 500000;
  const progressPercent = Math.min(100, Math.round((stats.totalRevenue / monthlyTarget) * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Mes Performances</h1>
        <p className="text-dark-600 mt-1">Suivi de votre progression et statistiques détaillées</p>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Performance Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-dark-900 mb-4">Taux de Performance</h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="8"
                  strokeDasharray={`${(performanceRate / 100) * 339.3} 339.3`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-600">{performanceRate}%</span>
              </div>
            </div>
            <p className="text-sm text-dark-600">Basé sur votre activité commerciale</p>
          </div>
        </div>

        {/* Commission */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Mes Commissions</h3>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-3">
              <span className="text-2xl font-bold text-white">💰</span>
            </div>
            <p className="text-2xl font-bold text-dark-900">{formatCurrency(totalCommissions)}</p>
            <p className="text-sm text-dark-600 mt-2">Commission désactivée</p>
          </div>
        </div>

        {/* Monthly Target */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Objectif Mensuel</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-dark-600">Progression</span>
                <span className="text-sm font-bold text-primary-600">{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-600">{formatCurrency(stats.totalRevenue)}</span>
              <span className="font-semibold text-dark-700">{formatCurrency(monthlyTarget)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Produits les Plus Vendus</h3>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-dark-900">{product.name}</p>
                      <p className="text-xs text-dark-500">{product.quantity} unités vendues</p>
                    </div>
                  </div>
                  <p className="font-semibold text-primary-600">{formatCurrency(product.revenue)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-3xl">📦</span>
              <p className="text-dark-500 mt-2">Aucun produit vendu</p>
            </div>
          )}
        </div>

        {/* Monthly Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Statistiques Mensuelles</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-dark-600">Total ventes</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
              </div>
              <span className="text-3xl">🛒</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-dark-600">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <span className="text-3xl">💰</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-dark-600">Panier moyen</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.averageOrder)}</p>
              </div>
              <span className="text-3xl">📊</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="text-sm text-dark-600">Articles vendus</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalQuantity}</p>
              </div>
              <span className="text-3xl">📦</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-dark-900 mb-4">💡 Conseils pour Améliorer votre Performance</h3>
        <ul className="space-y-2 text-dark-700">
          <li className="flex items-start space-x-3">
            <span className="text-primary-600 mt-1">✓</span>
            <span>Augmentez votre base clients en proposant des promotions attractives</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-primary-600 mt-1">✓</span>
            <span>Diversifiez vos ventes en recommandant des produits complémentaires</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-primary-600 mt-1">✓</span>
            <span>Analysez les tendances de vente pour adapter votre stratégie</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-primary-600 mt-1">✓</span>
            <span>Optimisez votre temps en mettant l'accent sur les produits populaires</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
