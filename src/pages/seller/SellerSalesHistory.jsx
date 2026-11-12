import React, { useEffect, useState } from 'react';
import { CreditCard, History, Printer, ShoppingBag, Wallet } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { formatCurrency, formatDateTime, PAYMENT_LABELS } from '../../utils/helpers';
import { printSaleInvoice } from '../../utils/printSaleInvoice';
import Pagination from '../../components/common/Pagination';
import { Badge, Button, Card, EmptyState, ListSkeleton, PageHeader, StatCard } from '../../components/ui';

export default function SellerSalesHistory() {
  const { sales, fetchSales, salesPagination, isLoading } = useProductStore();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchSales({ page, pageSize }).catch(() => {});
  }, [fetchSales, page, pageSize]);

  const totalCount = salesPagination?.total ?? sales.length;
  const totalRevenue = salesPagination?.totalAmount ?? 0;
  const totalPages = salesPagination?.totalPages ?? 1;
  const averageOrder = totalCount ? totalRevenue / totalCount : 0;

  const discountOf = (sale) => Number(sale.discount_amount) || 0;
  const grossOf = (sale) => (Number(sale.total_amount) || 0) + discountOf(sale);

  const printButton = (sale) => (
    <Button variant="ghost" size="sm" icon={Printer} onClick={() => printSaleInvoice(sale.id)}>
      <span className="hidden sm:inline">Facture</span>
    </Button>
  );

  return (
    <>
      <PageHeader title="Historique de mes ventes" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Ventes" value={totalCount} icon={ShoppingBag} />
        <StatCard label="Chiffre d'affaires" value={formatCurrency(totalRevenue)} icon={Wallet} tone="success" />
        <StatCard label="Panier moyen" value={formatCurrency(averageOrder)} icon={CreditCard} tone="neutral" />
      </div>

      <Card bodyClassName="" className="overflow-hidden">
        {isLoading && sales.length === 0 ? (
          <ListSkeleton />
        ) : totalCount === 0 ? (
          <EmptyState icon={History} title="Aucune vente enregistrée" />
        ) : (
          <>
            <ul className="md:hidden divide-y divide-dark-100">
              {sales.map((sale) => (
                <li key={sale.id} className="p-4 flex items-center gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm text-dark-500">{formatDateTime(sale.created_at)}</p>
                    <p className="font-bold text-dark-900">{formatCurrency(sale.total_amount)}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="primary">{PAYMENT_LABELS[sale.payment_method] || sale.payment_method}</Badge>
                      <Badge>{sale.items_count ?? 0} art.</Badge>
                      {discountOf(sale) > 0 && <Badge tone="warning">−{formatCurrency(discountOf(sale))}</Badge>}
                    </div>
                  </div>
                  {printButton(sale)}
                </li>
              ))}
            </ul>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-200 bg-dark-50 text-left text-xs font-semibold uppercase tracking-wide text-dark-500">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Articles</th>
                    <th className="py-3 px-4 text-right">Sous-total</th>
                    <th className="py-3 px-4 text-right">Remise</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4">Paiement</th>
                    <th className="py-3 px-4 text-right">Facture</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-dark-50">
                      <td className="py-3 px-4 text-dark-700 whitespace-nowrap">{formatDateTime(sale.created_at)}</td>
                      <td className="py-3 px-4 text-center">{sale.items_count ?? 0}</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">{formatCurrency(grossOf(sale))}</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap text-dark-500">
                        {discountOf(sale) > 0 ? `−${formatCurrency(discountOf(sale))}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold whitespace-nowrap">{formatCurrency(sale.total_amount)}</td>
                      <td className="py-3 px-4"><Badge tone="primary">{PAYMENT_LABELS[sale.payment_method] || sale.payment_method}</Badge></td>
                      <td className="py-2 px-4 text-right">{printButton(sale)}</td>
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
