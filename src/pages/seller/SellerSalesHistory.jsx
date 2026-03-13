import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { useProductStore } from '../../store/productStore';
import { formatCurrency, printInvoice } from '../../utils/helpers';
import { dateTimeToString } from '../../utils/dateUtils';
import { salesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const paymentLabels = {
  cash: 'Espèces',
  card: 'Carte bancaire',
  transfer: 'Virement',
  check: 'Chèque',
  paiement_marchand: 'Paiement marchand',
};

export default function SellerSalesHistory() {
  const { sales, fetchSales, salesPagination, isLoading } = useProductStore();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchCurrentSales = useCallback(() => {
    return fetchSales({ page, pageSize });
  }, [fetchSales, page, pageSize]);

  useEffect(() => {
    fetchCurrentSales().catch(() => {});
  }, [fetchCurrentSales]);

  useEffect(() => {
    if (!salesPagination?.totalPages) return;
    setPage((current) => {
      const maxPage = Math.max(1, salesPagination.totalPages);
      return current > maxPage ? maxPage : current;
    });
  }, [salesPagination?.totalPages]);

  const totalCount = salesPagination?.total ?? sales.length;
  const totalRevenue = useMemo(() => {
    if (salesPagination?.totalAmount !== undefined) {
      return salesPagination.totalAmount;
    }
    return sales.reduce((sum, sale) => sum + (sale.total_amount ?? sale.total ?? 0), 0);
  }, [sales, salesPagination?.totalAmount]);

  const averageOrder = useMemo(() => {
    if (totalCount === 0) return 0;
    return totalRevenue / totalCount;
  }, [totalRevenue, totalCount]);

  const handlePrintInvoice = async (saleId) => {
    try {
      const { data } = await salesAPI.getById(saleId);
      const payload = data.sale ? { ...data.sale, items: data.items || [] } : { ...data, items: data.items || [] };
      printInvoice(payload);
    } catch (err) {
      toast.error('Impossible de charger les détails de la vente');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Historique de Mes Ventes</h1>
        <p className="text-dark-600 mt-1">Suivi détaillé de vos performances commerciales</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600 mb-1">Total ventes</p>
              <p className="text-2xl font-bold text-primary-600">{sales.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-700 text-xl">🛒</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600 mb-1">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-700 text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600 mb-1">Panier moyen</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(averageOrder)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-700 text-xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading && sales.length === 0 ? (
            <div className="py-12 text-center">Chargement des ventes...</div>
          ) : totalCount === 0 ? (
            <div className="py-12 text-center">
              <span className="text-4xl">📝</span>
              <p className="text-dark-500 mt-2">Aucune vente enregistrée</p>
              <p className="text-dark-400 text-sm mt-1">Vos ventes apparaîtront ici</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm">Date</th>
                  <th className="text-center py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm hidden md:table-cell">Articles</th>
                  <th className="text-right py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm hidden lg:table-cell">Montant HT</th>
                  <th className="text-right py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm hidden lg:table-cell">Remise</th>
                  <th className="text-right py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm">Total</th>
                  <th className="text-center py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm hidden sm:table-cell">Paiement</th>
                  <th className="text-center py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm">Facture</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 md:px-6 text-dark-700 text-xs md:text-sm font-medium whitespace-nowrap">
                      {dateTimeToString(sale.created_at || sale.date)}
                    </td>
                    <td className="py-3 px-3 md:px-6 text-center hidden md:table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        {sale.items_count ?? (sale.items ? sale.items.length : 0)}
                      </span>
                    </td>
                    <td className="py-3 px-3 md:px-6 text-right font-medium text-dark-900 text-sm hidden lg:table-cell">
                      {formatCurrency(sale.subtotal ?? sale.total_amount ?? sale.total)}
                    </td>
                    <td className="py-3 px-3 md:px-6 text-right text-orange-600 font-medium text-sm hidden lg:table-cell">
                      {(sale.discount_amount ?? sale.discount) ? formatCurrency(sale.discount_amount ?? sale.discount) : '—'}
                    </td>
                    <td className="py-3 px-3 md:px-6 text-right font-semibold text-primary-600 text-sm">
                      {formatCurrency(sale.total_amount ?? sale.total)}
                    </td>
                    <td className="py-3 px-3 md:px-6 text-center hidden sm:table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {paymentLabels[sale.payment_method ?? sale.paymentMethod] || sale.payment_method || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-3 md:px-6 text-center">
                      <button
                        type="button"
                        onClick={() => handlePrintInvoice(sale.id)}
                        className="px-2 md:px-3 py-1.5 bg-[#0369a1] hover:bg-[#0284c7] text-white text-xs md:text-sm font-medium rounded-lg whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">Générer </span>facture
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-dark-600">
            {totalCount === 0
              ? 'Aucun résultat'
              : `Affichage ${(page - 1) * pageSize + 1}-${Math.min((page - 1) * pageSize + sales.length, totalCount)} sur ${totalCount} vente${totalCount > 1 ? 's' : ''}`}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span>Par page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white"
              >
                {[10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || totalCount === 0 || isLoading}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="text-sm text-dark-600">
                Page {salesPagination?.totalPages ? page : sales.length === 0 ? 0 : 1} / {salesPagination?.totalPages ?? 1}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(salesPagination?.totalPages ?? 1, p + 1))}
                disabled={
                  page >= (salesPagination?.totalPages ?? 1) || totalCount === 0 || isLoading
                }
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {totalCount > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-200 p-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Résumé de performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-dark-600 mb-1">Nombre total de transactions</p>
              <p className="text-2xl font-bold text-primary-600">{totalCount}</p>
            </div>
            <div>
              <p className="text-dark-600 mb-1">Chiffre d'affaires total</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <div>
              <p className="text-dark-600 mb-1">Valeur moyenne par vente</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(averageOrder)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
