import React, { useState, useEffect, useCallback } from 'react';
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

export default function AdminInvoices() {
  const { sales, fetchSales, deleteSale, salesPagination, isLoading } = useProductStore();
  const [search, setSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCurrentSales = useCallback(() => {
    const params = {
      page,
      pageSize,
    };

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }

    if (filterPayment !== 'all') {
      params.payment_method = filterPayment;
    }

    if (dateFrom) {
      params.date_from = dateFrom;
    }

    if (dateTo) {
      params.date_to = dateTo;
    }

    return fetchSales(params);
  }, [page, pageSize, debouncedSearch, filterPayment, dateFrom, dateTo, fetchSales]);

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
  const totalAmount = salesPagination?.totalAmount ?? sales.reduce((sum, s) => sum + parseFloat(s.total_amount ?? s.total ?? 0), 0);
  const totalPages = salesPagination?.totalPages ?? 1;
  const showingFrom = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = totalCount === 0 ? 0 : Math.min((page - 1) * pageSize + sales.length, totalCount);

  const resetFilters = () => {
    setSearch('');
    setFilterPayment('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handlePrint = async (saleId) => {
    try {
      const { data } = await salesAPI.getById(saleId);
      const payload = data.sale ? { ...data.sale, items: data.items || [] } : { ...data, items: data.items || [] };
      printInvoice(payload);
    } catch {
      toast.error('Impossible de charger les détails de la facture');
    }
  };

  const handleDelete = async (saleId) => {
    const sale = sales.find((s) => s.id === saleId);
    const label = sale?.invoice_number || saleId;
    if (!window.confirm(`Supprimer définitivement la facture ${label} ?`)) return;

    try {
      setDeletingId(saleId);
      await deleteSale(saleId);
      await fetchCurrentSales().catch(() => {});
      toast.success('Facture supprimée');
    } catch (err) {
      const msg = err.response?.data?.error || 'Suppression impossible';
      toast.error(msg);
    } finally {
      setDeletingId(null);
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
        <h1 className="text-2xl font-bold text-dark-900">Factures</h1>
        <p className="text-dark-600 mt-1">Liste de toutes les factures générées</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="N° facture, vendeur ou client..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-dark-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">
              Mode de paiement
            </label>
            <select
              value={filterPayment}
              onChange={(e) => {
                setFilterPayment(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-dark-900"
            >
              <option value="all">Tous</option>
              <option value="cash">Espèces</option>
              <option value="paiement_marchand">Paiement marchand</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">Du</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-dark-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">Au</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-dark-900"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="w-full px-4 py-2 border border-primary-200 text-primary-700 rounded-lg font-medium hover:bg-primary-50 transition"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4">
            <p className="text-xs text-dark-600 mb-1">
              Total ({totalCount} facture{totalCount !== 1 ? 's' : ''})
            </p>
            <p className="text-lg font-bold text-primary-600">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="rounded-lg p-4 border border-gray-200 text-sm text-dark-700">
            <p>Filtre paiement : <span className="font-semibold">{filterPayment === 'all' ? 'Tous' : paymentLabels[filterPayment] || filterPayment}</span></p>
            <p>Période : <span className="font-semibold">{dateFrom ? `du ${dateFrom}` : '—'} {dateTo ? `au ${dateTo}` : ''}</span></p>
          </div>
          <div className="rounded-lg p-4 border border-gray-200 text-sm text-dark-700">
            <p>Résultats filtrés : <span className="font-semibold">{totalCount}</span></p>
            <p>Total filtré : <span className="font-semibold">{formatCurrency(totalAmount)}</span></p>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {totalCount === 0 ? (
            <div className="py-12 text-center">
              <span className="text-4xl">🧾</span>
              <p className="text-dark-500 mt-3">Aucune facture trouvée</p>
              <p className="text-dark-400 text-sm mt-1">Les factures sont générées automatiquement à chaque vente</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm">N° Facture</th>
                  <th className="text-left py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm hidden sm:table-cell">Date</th>
                  <th className="text-left py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm hidden lg:table-cell">Vendeur</th>
                  <th className="text-left py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm hidden md:table-cell">Client</th>
                  <th className="text-center py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm hidden md:table-cell">Articles</th>
                  <th className="text-right py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm">Montant</th>
                  <th className="text-center py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm hidden sm:table-cell">Paiement</th>
                  <th className="text-center py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 md:px-6">
                      <span className="font-mono text-xs md:text-sm font-semibold text-primary-700">
                        {sale.invoice_number || <span className="text-dark-400 italic">N/A</span>}
                      </span>
                    </td>
                    <td className="py-3 px-3 md:px-6 text-dark-700 text-xs md:text-sm whitespace-nowrap hidden sm:table-cell">
                      {formatDate(sale.created_at)}
                    </td>
                    <td className="py-3 px-3 md:px-6 text-dark-700 text-sm font-medium hidden lg:table-cell">
                      {sale.seller_name || '—'}
                    </td>
                    <td className="py-3 px-3 md:px-6 text-dark-600 text-sm hidden md:table-cell">
                      {sale.client_name || <span className="italic text-dark-400">Sans client</span>}
                    </td>
                    <td className="py-3 px-3 md:px-6 text-center hidden md:table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        {sale.items_count ?? 0}
                      </span>
                    </td>
                    <td className="py-3 px-3 md:px-6 text-right font-semibold text-primary-600 text-sm">
                      {formatCurrency(sale.total_amount ?? sale.total ?? 0)}
                    </td>
                    <td className="py-3 px-3 md:px-6 text-center hidden sm:table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {paymentLabels[sale.payment_method] || sale.payment_method || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3 md:px-6 text-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handlePrint(sale.id)}
                        className="px-2 md:px-3 py-1.5 bg-[#0369a1] hover:bg-[#0284c7] text-white text-xs md:text-sm font-medium rounded-lg whitespace-nowrap"
                      >
                        🖨️ <span className="hidden sm:inline">Imprimer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(sale.id)}
                        disabled={deletingId === sale.id}
                        className="px-2 md:px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-xs md:text-sm font-medium rounded-lg whitespace-nowrap disabled:opacity-60"
                      >
                        {deletingId === sale.id ? 'Suppression...' : 'Supprimer'}
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
              : `Affichage ${showingFrom}-${showingTo} sur ${totalCount} facture${totalCount > 1 ? 's' : ''}`}
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
                Page {totalPages === 0 ? 0 : page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || totalCount === 0 || isLoading}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
