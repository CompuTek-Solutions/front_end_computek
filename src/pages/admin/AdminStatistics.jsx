import React, { useMemo } from 'react';
import { useProductStore } from '../../store/productStore';
import { getTopSellingProducts, calculateStats } from '../../utils/helpers';
import { formatCurrency } from '../../utils/helpers';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function AdminStatistics() {
  const { products, sales, inventory } = useProductStore();

  const stats = useMemo(() => calculateStats(sales), [sales]);
  const topProducts = useMemo(() => getTopSellingProducts(sales, 10), [sales]);

  const monthlyData = useMemo(() => {
    const months = {};
    sales.forEach((sale) => {
      const date = new Date(sale.created_at || sale.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[monthKey] = (months[monthKey] || 0) + (sale.total_amount ?? sale.total ?? 0);
    });

    return Object.entries(months).sort().map(([month, total]) => ({
      month: new Date(`${month}-01`).toLocaleString('fr-FR', { month: 'short', year: 'numeric' }),
      ventes: total,
    }));
  }, [sales]);

  const categoryData = useMemo(() => {
    const categories = {};
    topProducts.forEach((product) => {
      const prod = products.find((p) => p.id === product.productId);
      const category = prod?.category || 'Autre';
      categories[category] = (categories[category] || 0) + product.quantity;
    });

    return Object.entries(categories).map(([category, quantity]) => ({
      name: category,
      value: quantity,
    }));
  }, [topProducts, products]);

  const colors = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Statistiques et Rapports</h1>
        <p className="text-dark-600 mt-1">Vue d'ensemble de vos performances commerciales</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-dark-600">Chiffre d'affaires</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-xs text-blue-600 mt-2">Total de tous les temps</p>
        </div>

        {/* Orders Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-dark-600">Nombre de ventes</h3>
            <span className="text-2xl">🛒</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.totalOrders}</p>
          <p className="text-xs text-green-600 mt-2">Transactions complétées</p>
        </div>

        {/* Items Sold Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-dark-600">Articles vendus</h3>
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-3xl font-bold text-purple-600">{stats.totalQuantity}</p>
          <p className="text-xs text-purple-600 mt-2">Total d'unités</p>
        </div>

        {/* Average Order Card */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-dark-600">Panier moyen</h3>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-3xl font-bold text-orange-600">{formatCurrency(stats.averageOrder)}</p>
          <p className="text-xs text-orange-600 mt-2">Par transaction</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Ventes Mensuelles</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ventes"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={{ fill: '#0284c7', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Chiffre d'affaires"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center">
              <div className="text-center">
                <span className="text-3xl">📊</span>
                <p className="text-dark-500 mt-2">Pas de données disponibles</p>
              </div>
            </div>
          )}
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Répartition par Catégorie</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center">
              <div className="text-center">
                <span className="text-3xl">📈</span>
                <p className="text-dark-500 mt-2">Pas de données disponibles</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Products Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-dark-900 mb-4">Top 10 Produits les Plus Vendus</h3>
        {topProducts.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db' }} />
              <Bar dataKey="quantity" fill="#0284c7" name="Quantité" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-72 flex items-center justify-center">
            <div className="text-center">
              <span className="text-3xl">📦</span>
              <p className="text-dark-500 mt-2">Pas de données disponibles</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-dark-900">Résumé des Ventes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark-900">Période</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-dark-900">Nombre de ventes</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-dark-900">Chiffre d'affaires</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-dark-900">Panier moyen</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 text-dark-900 font-medium">Tous les temps</td>
                <td className="px-6 py-4 text-right text-dark-900 font-semibold">{stats.totalOrders}</td>
                <td className="px-6 py-4 text-right text-dark-900 font-semibold text-primary-600">{formatCurrency(stats.totalRevenue)}</td>
                <td className="px-6 py-4 text-right text-dark-900">{formatCurrency(stats.averageOrder)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
