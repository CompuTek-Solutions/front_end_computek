import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/helpers';

export default function SellerDashboard() {
  const { sellerStats, fetchSellerStats } = useProductStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchSellerStats(user.id).catch(() => {});
    }
  }, [user?.id, fetchSellerStats]);

  const stats = useMemo(() => {
    return (
      sellerStats?.summary ?? {
        totalRevenue: 0,
        totalOrders: 0,
        totalQuantity: 0,
        averageOrder: 0,
      }
    );
  }, [sellerStats]);

  const topProducts = sellerStats?.topProducts ?? [];
  const monthlySales = sellerStats?.monthlySales ?? [];

  const topProductsDisplay = useMemo(() => topProducts.slice(0, 5), [topProducts]);
  const monthlyOverview = useMemo(() => {
    return monthlySales.map((entry) => {
      const label = entry.month
        ? new Date(entry.month).toLocaleString('fr-FR', { month: 'short', year: 'numeric' })
        : '—';
      return {
        label,
        revenue: entry.total_revenue ?? entry.totalRevenue ?? 0,
        salesCount: entry.sales_count ?? entry.salesCount ?? 0,
      };
    });
  }, [monthlySales]);

  const commissionRate = 0; // Commission removed
  const totalCommissions = 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-dark-900 mb-2">Mon Tableau de Bord</h1>
          <p className="text-dark-600">Suivez vos performances et commissions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 mr-2">
                <p className="text-xs font-medium text-dark-600 mb-1">Mes ventes</p>
                <p className="text-lg font-bold text-dark-900 truncate">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-700 text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 mr-2">
                <p className="text-xs font-medium text-dark-600 mb-1">Nombre de ventes</p>
                <p className="text-lg font-bold text-dark-900">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-700 text-xl">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 mr-2">
                <p className="text-xs font-medium text-dark-600 mb-1">Articles vendus</p>
                <p className="text-lg font-bold text-dark-900">{stats.totalQuantity}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-700 text-xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 mr-2">
                <p className="text-xs font-medium text-dark-600 mb-1">Panier moyen</p>
                <p className="text-lg font-bold text-dark-900 truncate">{formatCurrency(stats.averageOrder)}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-700 text-xl">💳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 mr-2">
                <p className="text-xs font-medium text-dark-600 mb-1">Commission</p>
                <p className="text-lg font-bold text-green-600 truncate">{formatCurrency(totalCommissions)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-emerald-700 text-xl">🏆</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 text-xl">💡</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-dark-900 mb-2">Conseil du jour</h3>
                <p className="text-dark-600 leading-relaxed">
                  Augmentez vos ventes en mettant à jour vos fichiers clients et en proposant des produits adaptés aux besoins de chacun.
                  Utilisez le scanner de code-barres pour accélérer vos transactions.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-700 text-xl">📊</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-dark-900 mb-2">Analyse de performance</h3>
                <p className="text-dark-600 leading-relaxed">
                  Consultez la section "Historique des ventes" pour voir vos produits les plus vendus et optimiser votre approche commerciale.
                  Identifiez les tendances pour maximiser vos commissions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button onClick={() => navigate('/seller/new-sale')} className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg transition-all transform hover:scale-105">
              <span>🛒</span>
              <span className="font-medium">Nouvelle vente</span>
            </button>
            <button onClick={() => navigate('/seller/new-sale')} className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all transform hover:scale-105">
              <span>📱</span>
              <span className="font-medium">Scanner code</span>
            </button>
            <button onClick={() => navigate('/seller/performance')} className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all transform hover:scale-105">
              <span>📈</span>
              <span className="font-medium">Voir statistiques</span>
            </button>
            <button onClick={() => navigate('/seller/sales-history')} className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all transform hover:scale-105">
              <span>📜</span>
              <span className="font-medium">Historique</span>
            </button>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-900">Top produits</h3>
              <span className="text-2xl">🏅</span>
            </div>
            {topProductsDisplay.length > 0 ? (
              <div className="space-y-3">
                {topProductsDisplay.map((product, index) => (
                  <div key={product.productId || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-semibold text-sm">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-dark-900">{product.name}</p>
                        <p className="text-xs text-dark-500">{product.quantity} unités vendues</p>
                      </div>
                    </div>
                    <span className="font-semibold text-primary-600">{formatCurrency(product.revenue)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-dark-500">Aucune donnée disponible</div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-900">Historique mensuel</h3>
              <span className="text-2xl">📅</span>
            </div>
            {monthlyOverview.length > 0 ? (
              <div className="space-y-3">
                {monthlyOverview.map((month) => (
                  <div key={month.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-dark-900">{month.label}</p>
                      <p className="text-xs text-dark-500">{month.salesCount} ventes</p>
                    </div>
                    <span className="font-semibold text-dark-900">{formatCurrency(month.revenue)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-dark-500">Pas encore de ventes enregistrées</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
