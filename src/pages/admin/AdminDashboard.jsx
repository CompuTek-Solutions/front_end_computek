import React, { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet, PackageCheck, ShoppingBag, CreditCard, Package, AlertTriangle, CheckCircle2,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { formatCurrency } from '../../utils/helpers';
import { Badge, Button, Card, EmptyState, PageHeader, StatCard } from '../../components/ui';
import TopProductsList from '../../components/common/TopProductsList';

const LOW_STOCK_PER_PAGE = 5;

export default function AdminDashboard() {
  const { products, inventory, adminStats, fetchProducts, fetchInventory, fetchAdminStats } = useProductStore();
  const [lowStockPage, setLowStockPage] = useState(1);

  useEffect(() => {
    fetchProducts().catch(() => {});
    fetchInventory().catch(() => {});
    fetchAdminStats().catch(() => {});
  }, [fetchProducts, fetchInventory, fetchAdminStats]);

  const stats = adminStats?.summary ?? { totalRevenue: 0, totalQuantity: 0, totalOrders: 0, averageOrder: 0 };
  const topProducts = adminStats?.topProducts?.slice(0, 5) ?? [];

  const lowStockProducts = useMemo(
    () =>
      products
        .map((product) => ({
          ...product,
          qty: inventory.find((i) => i.product_id === product.id)?.quantity_on_hand ?? 0,
        }))
        .filter((p) => p.qty > 0 && p.qty < 10),
    [products, inventory]
  );

  const totalLowStockPages = Math.max(1, Math.ceil(lowStockProducts.length / LOW_STOCK_PER_PAGE));
  const currentLowStockPage = Math.min(lowStockPage, totalLowStockPages);
  const paginatedLowStock = lowStockProducts.slice(
    (currentLowStockPage - 1) * LOW_STOCK_PER_PAGE,
    currentLowStockPage * LOW_STOCK_PER_PAGE
  );

  return (
    <>
      <PageHeader title="Tableau de bord" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Chiffre d'affaires" value={formatCurrency(stats.totalRevenue)} icon={Wallet} tone="success" />
        <StatCard label="Articles vendus" value={stats.totalQuantity} icon={PackageCheck} />
        <StatCard label="Ventes" value={stats.totalOrders} icon={ShoppingBag} />
        <StatCard label="Panier moyen" value={formatCurrency(stats.averageOrder)} icon={CreditCard} />
        <StatCard label="Produits" value={products.length} icon={Package} tone="neutral" />
        <StatCard label="Stock faible" value={lowStockProducts.length} icon={AlertTriangle} tone="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Top 5 des produits vendus" bodyClassName="p-2 sm:p-4">
          <TopProductsList products={topProducts} emptyTitle="Aucune vente enregistrée" />
        </Card>

        <Card
          title="Stock faible"
          actions={
            lowStockProducts.length > 0 && (
              <Link to="/admin/inventory" className="text-sm font-medium text-primary-700 hover:underline">
                Gérer le stock
              </Link>
            )
          }
          bodyClassName="p-2 sm:p-4"
        >
          {lowStockProducts.length > 0 ? (
            <>
              <ul className="divide-y divide-dark-100">
                {paginatedLowStock.map((product) => (
                  <li key={product.id} className="flex items-center gap-3 px-2 py-3">
                    <span className="h-8 w-8 shrink-0 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                    <p className="min-w-0 flex-1 font-medium text-dark-900 truncate">{product.name}</p>
                    <Badge tone="warning">{product.qty} en stock</Badge>
                  </li>
                ))}
              </ul>
              {totalLowStockPages > 1 && (
                <div className="flex items-center justify-between px-2 pt-3 text-sm text-dark-600">
                  <Button
                    variant="secondary"
                    size="icon"
                    icon={ChevronLeft}
                    onClick={() => setLowStockPage(Math.max(1, currentLowStockPage - 1))}
                    disabled={currentLowStockPage === 1}
                    aria-label="Page précédente"
                  />
                  <span>Page {currentLowStockPage} / {totalLowStockPages}</span>
                  <Button
                    variant="secondary"
                    size="icon"
                    icon={ChevronRight}
                    onClick={() => setLowStockPage(Math.min(totalLowStockPages, currentLowStockPage + 1))}
                    disabled={currentLowStockPage === totalLowStockPages}
                    aria-label="Page suivante"
                  />
                </div>
              )}
            </>
          ) : (
            <EmptyState icon={CheckCircle2} title="Tous les stocks sont suffisants" />
          )}
        </Card>
      </div>
    </>
  );
}
