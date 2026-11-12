import React, { useState, useEffect, useCallback } from 'react';
import { Printer, Receipt, RotateCcw, SlidersHorizontal, Trash2, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProductStore } from '../../store/productStore';
import { formatCurrency, formatDateTime, PAYMENT_LABELS } from '../../utils/helpers';
import { printSaleInvoice } from '../../utils/printSaleInvoice';
import Pagination from './Pagination';
import {
  Badge, Button, Card, EmptyState, ListSkeleton, PageHeader, SearchInput, Select, StatCard, confirmDialog,
  inputClass, labelClass,
} from '../ui';

export default function InvoicesView({ title, isAdmin = false }) {
  const { sales, fetchSales, deleteSale, salesPagination, isLoading } = useProductStore();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(() => {
    const params = { page, pageSize };
    if (debouncedSearch) params.search = debouncedSearch;
    if (filterPayment !== 'all') params.payment_method = filterPayment;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    return fetchSales(params);
  }, [page, pageSize, debouncedSearch, filterPayment, dateFrom, dateTo, fetchSales]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const totalCount = salesPagination?.total ?? sales.length;
  const totalAmount = salesPagination?.totalAmount ?? 0;
  const totalPages = salesPagination?.totalPages ?? 1;
  const hasFilters = search || filterPayment !== 'all' || dateFrom || dateTo;

  const setFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setFilterPayment('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handleDelete = async (sale) => {
    const ok = await confirmDialog({
      title: 'Supprimer la facture',
      message: `La facture ${sale.invoice_number || ''} sera supprimée définitivement et le stock sera remis à jour.`,
    });
    if (!ok) return;
    try {
      setDeletingId(sale.id);
      await deleteSale(sale.id);
      await load().catch(() => {});
      toast.success('Facture supprimée');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Suppression impossible');
    } finally {
      setDeletingId(null);
    }
  };

  const actions = (sale) => (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" icon={Printer} onClick={() => printSaleInvoice(sale.id)}>
        <span className="hidden sm:inline">Imprimer</span>
      </Button>
      {isAdmin && (
        <Button
          variant="danger-ghost"
          size="icon"
          icon={Trash2}
          loading={deletingId === sale.id}
          onClick={() => handleDelete(sale)}
          title="Supprimer"
          aria-label="Supprimer"
        />
      )}
    </div>
  );

  return (
    <>
      <PageHeader title={title} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:max-w-xl">
        <StatCard label={hasFilters ? 'Factures (filtrées)' : 'Factures'} value={totalCount} icon={Receipt} />
        <StatCard label={hasFilters ? 'Montant (filtré)' : 'Montant total'} value={formatCurrency(totalAmount)} icon={Wallet} tone="success" />
      </div>

      <Card>
        <div className="flex gap-2 sm:hidden">
          <SearchInput
            className="flex-1"
            placeholder={isAdmin ? 'N° facture, vendeur, client' : 'N° facture ou client'}
            value={search}
            onChange={setFilter(setSearch)}
          />
          <Button
            variant={showFilters || filterPayment !== 'all' || dateFrom || dateTo ? 'primary' : 'secondary'}
            size="icon"
            icon={SlidersHorizontal}
            className="h-10 w-10"
            onClick={() => setShowFilters((v) => !v)}
            aria-label="Filtres"
          />
        </div>
        <div className={`${showFilters ? 'grid' : 'hidden'} sm:grid mt-3 sm:mt-0 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-end`}>
          <div className="hidden sm:block sm:col-span-2 lg:col-span-1">
            <label className={labelClass}>Rechercher</label>
            <SearchInput
              placeholder={isAdmin ? 'N° facture, vendeur ou client' : 'N° facture ou client'}
              value={search}
              onChange={setFilter(setSearch)}
            />
          </div>
          <div>
            <label className={labelClass}>Paiement</label>
            <Select value={filterPayment} onChange={setFilter(setFilterPayment)}>
              <option value="all">Tous</option>
              <option value="cash">Espèces</option>
              <option value="paiement_marchand">Paiement marchand</option>
            </Select>
          </div>
          <div>
            <label className={labelClass}>Du</label>
            <input type="date" value={dateFrom} onChange={setFilter(setDateFrom)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Au</label>
            <input type="date" value={dateTo} onChange={setFilter(setDateTo)} className={inputClass} />
          </div>
          <Button variant="secondary" icon={RotateCcw} onClick={resetFilters} disabled={!hasFilters}>
            Réinitialiser
          </Button>
        </div>
      </Card>

      <Card bodyClassName="" className="overflow-hidden">
        {isLoading && sales.length === 0 ? (
          <ListSkeleton />
        ) : totalCount === 0 ? (
          <EmptyState icon={Receipt} title="Aucune facture trouvée" />
        ) : (
          <>
            <ul className="md:hidden divide-y divide-dark-100">
              {sales.map((sale) => (
                <li key={sale.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-semibold text-primary-700">{sale.invoice_number || '—'}</p>
                      <p className="text-xs text-dark-500">{formatDateTime(sale.created_at)}</p>
                    </div>
                    <p className="font-bold text-dark-900 whitespace-nowrap">{formatCurrency(sale.total_amount)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-dark-600">
                    <span>{sale.client_name || 'Sans client'}</span>
                    {isAdmin && sale.seller_name && <span className="text-dark-400">· {sale.seller_name}</span>}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                      <Badge tone="primary">{PAYMENT_LABELS[sale.payment_method] || sale.payment_method}</Badge>
                      <Badge>{sale.items_count ?? 0} art.</Badge>
                    </div>
                    {actions(sale)}
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-200 bg-dark-50 text-left text-xs font-semibold uppercase tracking-wide text-dark-500">
                    <th className="py-3 px-4">N° facture</th>
                    <th className="py-3 px-4">Date</th>
                    {isAdmin && <th className="py-3 px-4 hidden lg:table-cell">Vendeur</th>}
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4 text-center hidden lg:table-cell">Articles</th>
                    <th className="py-3 px-4 text-right">Montant</th>
                    <th className="py-3 px-4">Paiement</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-dark-50">
                      <td className="py-3 px-4 font-mono font-semibold text-primary-700 whitespace-nowrap">{sale.invoice_number || '—'}</td>
                      <td className="py-3 px-4 text-dark-600 whitespace-nowrap">{formatDateTime(sale.created_at)}</td>
                      {isAdmin && <td className="py-3 px-4 text-dark-700 hidden lg:table-cell">{sale.seller_name || '—'}</td>}
                      <td className="py-3 px-4 text-dark-700">{sale.client_name || <span className="text-dark-400">Sans client</span>}</td>
                      <td className="py-3 px-4 text-center hidden lg:table-cell">{sale.items_count ?? 0}</td>
                      <td className="py-3 px-4 text-right font-semibold whitespace-nowrap">{formatCurrency(sale.total_amount)}</td>
                      <td className="py-3 px-4"><Badge tone="primary">{PAYMENT_LABELS[sale.payment_method] || sale.payment_method}</Badge></td>
                      <td className="py-2 px-4">{actions(sale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      <Pagination
        currentPage={Math.min(page, totalPages)}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={totalCount}
        itemsPerPage={pageSize}
        onItemsPerPageChange={(n) => {
          setPageSize(n);
          setPage(1);
        }}
      />
    </>
  );
}
