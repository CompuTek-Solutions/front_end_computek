import React, { useMemo, useEffect, useState } from 'react';
import { useProductStore } from '../../store/productStore';
import { formatCurrency } from '../../utils/helpers';

export default function AdminDashboard() {
  const { products, inventory, adminStats, fetchProducts, fetchInventory, fetchAdminStats } = useProductStore();
  const [lowStockPage, setLowStockPage] = useState(1);
  const LOW_STOCK_PER_PAGE = 5;

  useEffect(() => {
    fetchProducts().catch(() => {});
    fetchInventory().catch(() => {});
    fetchAdminStats().catch(() => {});
  }, [fetchProducts, fetchInventory, fetchAdminStats]);

  const stats = useMemo(() => {
    return (
      adminStats?.summary ?? {
        totalRevenue: 0,
        totalQuantity: 0,
        totalOrders: 0,
        averageOrder: 0,
      }
    );
  }, [adminStats]);

  const topProducts = useMemo(() => {
    return adminStats?.topProducts?.slice(0, 5) ?? [];
  }, [adminStats]);

  const lowStockProducts = useMemo(() => {
    return products.filter((product) => {
      const quantity = inventory.find((i) => i.product_id === product.id)?.quantity_on_hand ?? 0;
      return quantity < 10 && quantity > 0;
    });
  }, [products, inventory]);

  const totalLowStockPages = Math.max(1, Math.ceil(lowStockProducts.length / LOW_STOCK_PER_PAGE));

  useEffect(() => {
    setLowStockPage((current) => (current > totalLowStockPages ? totalLowStockPages : current));
  }, [totalLowStockPages]);

  const paginatedLowStockProducts = useMemo(() => {
    const start = (lowStockPage - 1) * LOW_STOCK_PER_PAGE;
    return lowStockProducts.slice(start, start + LOW_STOCK_PER_PAGE);
  }, [lowStockProducts, lowStockPage]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-dark-900 mb-2">Tableau de Bord Administrateur</h1>
          <p className="text-dark-600">Aperçu général de votre activité commerciale</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 mr-2">
                <p className="text-xs font-medium text-dark-600 mb-1">Chiffre d'affaires</p>
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
                <p className="text-xs font-medium text-dark-600 mb-1">Articles vendus</p>
                <p className="text-lg font-bold text-dark-900">{stats.totalQuantity}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-700 text-xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 mr-2">
                <p className="text-xs font-medium text-dark-600 mb-1">Commandes</p>
                <p className="text-lg font-bold text-dark-900">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-700 text-xl">🛒</span>
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
                <p className="text-xs font-medium text-dark-600 mb-1">Produits</p>
                <p className="text-lg font-bold text-dark-900">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-700 text-xl">🏭</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 mr-2">
                <p className="text-xs font-medium text-dark-600 mb-1">Stock faible</p>
                <p className="text-lg font-bold text-red-600">{lowStockProducts.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-700 text-xl">⚠️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Selling Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-dark-900">Top 5 Produits Vendus</h3>
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-primary-700 text-sm">📈</span>
              </div>
            </div>
            {topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">Produit</th>
                      <th className="text-center py-3 px-4 font-semibold text-dark-700">Quantité</th>
                      <th className="text-right py-3 px-4 font-semibold text-dark-700">Chiffre d'affaires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, index) => (
                      <tr key={product.productId || product.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 font-semibold text-sm">#{index + 1}</span>
                            </div>
                            <span className="font-medium text-dark-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {product.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-primary-600">
                          {formatCurrency(product.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-dark-500">Aucune vente enregistrée</p>
              </div>
            )}
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-dark-900">Produits en Stock Faible</h3>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-700 text-sm">⚠️</span>
              </div>
            </div>
            {lowStockProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">Produit</th>
                      <th className="text-center py-3 px-4 font-semibold text-dark-700">Quantité</th>
                      <th className="text-right py-3 px-4 font-semibold text-dark-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLowStockProducts.map((product) => {
                      const qty = inventory.find((i) => i.product_id === product.id)?.quantity_on_hand ?? 0;
                      return (
                        <tr key={product.id} className="border-b border-gray-100 hover:bg-red-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-red-600 font-semibold text-sm">!</span>
                              </div>
                              <span className="font-medium text-dark-900">{product.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {qty}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                              Réapprovisionner
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {totalLowStockPages > 1 && (
                  <div className="flex items-center justify-between mt-4 text-sm text-dark-600">
                    <button
                      className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setLowStockPage((page) => Math.max(1, page - 1))}
                      disabled={lowStockPage === 1}
                    >
                      Précédent
                    </button>
                    <span>
                      Page {lowStockPage} / {totalLowStockPages}
                    </span>
                    <button
                      className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setLowStockPage((page) => Math.min(totalLowStockPages, page + 1))}
                      disabled={lowStockPage === totalLowStockPages}
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <p className="text-dark-500">Tous les stocks sont suffisants</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
