import React, { useState, useMemo, useEffect } from 'react';
import { useProductStore } from '../../store/productStore';
import { formatCurrency, printInvoice, normalizeForSearch } from '../../utils/helpers';
import { dateTimeToString } from '../../utils/dateUtils';
import { salesAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminSales() {
  const { sales, fetchSales } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchSales().catch(() => {});
  }, [fetchSales]);

  const filteredSales = useMemo(() => {
    const normalizedSearchTerm = normalizeForSearch(searchTerm);
    return sales.filter((sale) => {
      const matchesStatus = filterStatus === 'all' || sale.status === filterStatus;
      const matchesSearch =
        !searchTerm ||
        normalizeForSearch(sale.invoice_number || '').includes(normalizedSearchTerm) ||
        normalizeForSearch(sale.seller_name || '').includes(normalizedSearchTerm) ||
        normalizeForSearch(sale.client_name || '').includes(normalizedSearchTerm);
      return matchesStatus && matchesSearch;
    });
  }, [sales, searchTerm, filterStatus]);

  const totalSalesAmount = useMemo(() => {
    return filteredSales.reduce((sum, sale) => sum + (sale.total_amount ?? sale.total ?? 0), 0);
  }, [filteredSales]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">✓ Complétée</span>;
      case 'pending':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">⏳ En attente</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">✕ Annulée</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">N/A</span>;
    }
  };

  const paymentLabels = {
    cash: 'Espèces',
    card: 'Carte bancaire',
    transfer: 'Virement',
    check: 'Chèque',
    paiement_marchand: 'Paiement marchand',
  };

  const getPaymentBadge = (method) => {
    const colors = {
      cash: 'bg-blue-100 text-blue-800',
      card: 'bg-purple-100 text-purple-800',
      transfer: 'bg-green-100 text-green-800',
      check: 'bg-indigo-100 text-indigo-800',
      paiement_marchand: 'bg-teal-100 text-teal-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[method] || 'bg-gray-100 text-gray-800'}`}>
        {paymentLabels[method] || method || 'N/A'}
      </span>
    );
  };

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
        <h1 className="text-2xl font-bold text-dark-900">Historique des Ventes</h1>
        <p className="text-dark-600 mt-1">Suivi complet des transactions</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">Rechercher</label>
            <input
              type="text"
              placeholder="N° facture, vendeur, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">Filtrer par statut</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Complétée</option>
              <option value="pending">En attente</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 w-full">
              <p className="text-xs text-dark-600 mb-1">Résultats</p>
              <p className="text-lg font-bold text-primary-600">{filteredSales.length} vente(s)</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-dark-600">
            <span className="font-semibold text-dark-900">Total:</span> {formatCurrency(totalSalesAmount)}
          </p>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {filteredSales.length === 0 ? (
            <div className="py-12 text-center">
              <span className="text-4xl">🔍</span>
              <p className="text-dark-500 mt-2">Aucune vente trouvée</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-dark-700 text-xs md:text-sm">N° Facture</th>
                  <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-dark-700 text-xs md:text-sm hidden sm:table-cell">Date</th>
                  <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-dark-700 text-xs md:text-sm hidden md:table-cell">Vendeur</th>
                  <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-dark-700 text-xs md:text-sm hidden lg:table-cell">Client</th>
                  <th className="text-center py-3 md:py-4 px-3 md:px-6 font-semibold text-dark-700 text-xs md:text-sm hidden md:table-cell">Articles</th>
                  <th className="text-right py-3 md:py-4 px-3 md:px-6 font-semibold text-dark-700 text-xs md:text-sm">Total</th>
                  <th className="text-center py-3 md:py-4 px-3 md:px-6 font-semibold text-dark-700 text-xs md:text-sm hidden sm:table-cell">Paiement</th>
                  <th className="text-center py-3 md:py-4 px-3 md:px-6 font-semibold text-dark-700 text-xs md:text-sm">Statut</th>
                  <th className="text-center py-3 md:py-4 px-3 md:px-6 font-semibold text-dark-700 text-xs md:text-sm">Facture</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 md:py-4 px-3 md:px-6">
                      <span className="font-mono text-xs md:text-sm font-semibold text-primary-700">
                        {sale.invoice_number || <span className="text-dark-400 italic">N/A</span>}
                      </span>
                    </td>
                    <td className="py-3 md:py-4 px-3 md:px-6 text-dark-700 text-xs md:text-sm whitespace-nowrap hidden sm:table-cell">
                      {dateTimeToString(sale.created_at || sale.date)}
                    </td>
                    <td className="py-3 md:py-4 px-3 md:px-6 text-dark-700 text-sm font-medium hidden md:table-cell">
                      {sale.seller_name || '—'}
                    </td>
                    <td className="py-3 md:py-4 px-3 md:px-6 text-dark-600 text-sm hidden lg:table-cell">
                      {sale.client_name || <span className="italic text-dark-400">Sans client</span>}
                    </td>
                    <td className="py-3 md:py-4 px-3 md:px-6 text-center hidden md:table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        {sale.items_count ?? 0}
                      </span>
                    </td>
                    <td className="py-3 md:py-4 px-3 md:px-6 text-right font-semibold text-primary-600 text-sm md:text-base">
                      {formatCurrency(sale.total_amount ?? sale.total)}
                    </td>
                    <td className="py-3 md:py-4 px-3 md:px-6 text-center hidden sm:table-cell">
                      {getPaymentBadge(sale.payment_method ?? sale.paymentMethod)}
                    </td>
                    <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                      {getStatusBadge(sale.status)}
                    </td>
                    <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                      <button
                        type="button"
                        onClick={() => handlePrintInvoice(sale.id)}
                        className="px-2 md:px-3 py-1.5 bg-[#0369a1] hover:bg-[#0284c7] text-white text-xs md:text-sm font-medium rounded-lg whitespace-nowrap"
                      >
                        🖨️ <span className="hidden sm:inline">Facture</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
   
