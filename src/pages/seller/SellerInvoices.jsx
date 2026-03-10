import React, { useState, useMemo, useEffect } from 'react';
import { useProductStore } from '../../store/productStore';
import { formatCurrency, printInvoice } from '../../utils/helpers';
import { salesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const paymentLabels = {
  cash: 'Espèces',
  card: 'Carte bancaire',
  transfer: 'Virement',
  check: 'Chèque',
  paiement_marchand: 'Paiement marchand',
};

export default function SellerInvoices() {
  const { sales, fetchSales } = useProductStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSales().catch(() => {});
  }, [fetchSales]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sales.filter(
      (s) =>
        !search ||
        (s.invoice_number || '').toLowerCase().includes(q) ||
        (s.client_name || '').toLowerCase().includes(q)
    );
  }, [sales, search]);

  const totalAmount = useMemo(
    () => filtered.reduce((sum, s) => sum + parseFloat(s.total_amount ?? s.total ?? 0), 0),
    [filtered]
  );

  const handlePrint = async (saleId) => {
    try {
      const { data } = await salesAPI.getById(saleId);
      const payload = data.sale ? { ...data.sale, items: data.items || [] } : { ...data, items: data.items || [] };
      printInvoice(payload);
    } catch {
      toast.error('Impossible de charger les détails de la facture');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Mes Factures</h1>
        <p className="text-dark-600 mt-1">Toutes vos factures générées</p>
      </div>

      {/* Cartes de synthèse */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600 mb-1">Total factures</p>
              <p className="text-2xl font-bold text-primary-600">{sales.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🧾</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600 mb-1">Chiffre d&apos;affaires</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(sales.reduce((s, v) => s + parseFloat(v.total_amount ?? v.total ?? 0), 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600 mb-1">Résultats filtrés</p>
              <p className="text-2xl font-bold text-purple-600">{filtered.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🔍</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-dark-700 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="N° facture ou nom client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-dark-900"
            />
          </div>
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg px-5 py-3 whitespace-nowrap">
            <p className="text-xs text-dark-600">Total filtré</p>
            <p className="text-lg font-bold text-primary-600">{formatCurrency(totalAmount)}</p>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <span className="text-4xl">🧾</span>
              <p className="text-dark-500 mt-3">Aucune facture trouvée</p>
              <p className="text-dark-400 text-sm mt-1">
                Les factures sont créées automatiquement lors de chaque vente
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm">N° Facture</th>
                  <th className="text-left py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm hidden sm:table-cell">Date</th>
                  <th className="text-left py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm hidden md:table-cell">Client</th>
                  <th className="text-center py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm hidden md:table-cell">Articles</th>
                  <th className="text-right py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm hidden lg:table-cell">Remise</th>
                  <th className="text-right py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm">Total</th>
                  <th className="text-center py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm hidden sm:table-cell">Paiement</th>
                  <th className="text-center py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 md:px-6">
                      <span className="font-mono text-xs md:text-sm font-semibold text-primary-700">
                        {sale.invoice_number || <span className="text-dark-400 italic text-xs">N/A</span>}
                      </span>
                    </td>
                    <td className="py-3 px-3 md:px-6 text-dark-700 text-xs md:text-sm whitespace-nowrap hidden sm:table-cell">
                      {formatDate(sale.created_at)}
                    </td>
                    <td className="py-3 px-3 md:px-6 text-dark-600 text-sm hidden md:table-cell">
                      {sale.client_name || <span className="italic text-dark-400">Sans client</span>}
                    </td>
                    <td className="py-3 px-3 md:px-6 text-center hidden md:table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        {sale.items_count ?? 0}
                      </span>
                    </td>
                    <td className="py-3 px-3 md:px-6 text-right text-orange-600 font-medium text-sm hidden lg:table-cell">
                      {sale.discount_amount > 0 ? formatCurrency(sale.discount_amount) : '—'}
                    </td>
                    <td className="py-3 px-3 md:px-6 text-right font-semibold text-primary-600 text-sm">
                      {formatCurrency(sale.total_amount ?? sale.total ?? 0)}
                    </td>
                    <td className="py-3 px-3 md:px-6 text-center hidden sm:table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {paymentLabels[sale.payment_method] || sale.payment_method || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3 md:px-6 text-center">
                      <button
                        type="button"
                        onClick={() => handlePrint(sale.id)}
                        className="px-2 md:px-3 py-1.5 bg-[#0369a1] hover:bg-[#0284c7] text-white text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                      >
                        🖨️ <span className="hidden sm:inline">Imprimer</span>
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
