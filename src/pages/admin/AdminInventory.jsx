import React, { useMemo, useEffect, useState } from 'react';
import { Wallet, AlertTriangle, PackageX, Package, Tags, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProductStore } from '../../store/productStore';
import { formatCurrency, normalizeForSearch, getProductCodes, productMatchesSearch, stockTone } from '../../utils/helpers';
import CodeList from '../../components/admin/CodeList';
import BarcodeLabelsGenerator from '../../components/admin/BarcodeLabelsGenerator';
import Pagination from '../../components/common/Pagination';
import {
  Badge, Button, Card, EmptyState, PageHeader, SearchInput, SegmentedControl, StatCard,
} from '../../components/ui';

const STOCK_FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'low', label: 'Faible' },
  { value: 'out', label: 'Rupture' },
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Nom' },
  { value: 'quantity', label: 'Quantité' },
  { value: 'value', label: 'Valeur' },
];

export default function AdminInventory() {
  const { products, inventory, fetchProducts, fetchInventory, updateInventoryQuantity } = useProductStore();
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterStock, setFilterStock] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [draftQty, setDraftQty] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [showBarcodeGenerator, setShowBarcodeGenerator] = useState(false);

  useEffect(() => {
    fetchProducts().catch(() => {});
    fetchInventory().catch(() => {});
  }, [fetchProducts, fetchInventory]);

  const allItems = useMemo(
    () =>
      products.map((product) => ({
        id: product.id,
        name: product.name,
        codes: getProductCodes(product),
        price: Number(product.price_selling) || 0,
        quantity: inventory.find((i) => i.product_id === product.id)?.quantity_on_hand ?? 0,
      })),
    [products, inventory]
  );

  const inventoryList = useMemo(() => {
    const term = normalizeForSearch(searchTerm);
    const direction = sortOrder === 'asc' ? 1 : -1;
    return allItems
      .filter((item) => !term || productMatchesSearch({ name: item.name, barcodes: item.codes }, term))
      .filter((item) =>
        filterStock === 'low' ? item.quantity > 0 && item.quantity < 10 : filterStock === 'out' ? item.quantity === 0 : true
      )
      .sort((a, b) => {
        if (sortBy === 'quantity') return direction * (a.quantity - b.quantity);
        if (sortBy === 'value') return direction * (a.price * a.quantity - b.price * b.quantity);
        return direction * a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });
  }, [allItems, sortBy, sortOrder, filterStock, searchTerm]);

  const totalValue = allItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const lowStockCount = allItems.filter((i) => i.quantity > 0 && i.quantity < 10).length;
  const outOfStockCount = allItems.filter((i) => i.quantity === 0).length;

  const totalPages = Math.max(1, Math.ceil(inventoryList.length / itemsPerPage));
  const page = Math.min(currentPage, totalPages);
  const pageItems = inventoryList.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSortChange = (value) => {
    if (sortBy === value) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(value);
      setSortOrder('asc');
    }
  };

  const saveQuantity = async (item) => {
    const quantity_on_hand = draftQty[item.id] ?? item.quantity;
    setSavingId(item.id);
    try {
      await updateInventoryQuantity({ product_id: item.id, quantity_on_hand });
      toast.success('Stock mis à jour');
      setDraftQty((prev) => {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la mise à jour du stock');
    } finally {
      setSavingId(null);
    }
  };

  const quantityEditor = (item) => {
    const draft = draftQty[item.id];
    const dirty = draft !== undefined && draft !== item.quantity;
    return (
      <div className="flex items-center justify-end gap-2">
        <input
          type="number"
          inputMode="numeric"
          min="0"
          value={draft ?? item.quantity}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            setDraftQty((prev) => ({ ...prev, [item.id]: Number.isFinite(n) ? Math.max(0, n) : 0 }));
          }}
          className="h-9 w-20 rounded-lg border border-dark-200 bg-white text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label={`Quantité de ${item.name}`}
        />
        <Button
          size="sm"
          variant={dirty ? 'primary' : 'secondary'}
          icon={Save}
          loading={savingId === item.id}
          disabled={!dirty}
          onClick={() => saveQuantity(item)}
          aria-label="Enregistrer"
        >
          <span className="hidden lg:inline">Enregistrer</span>
        </Button>
      </div>
    );
  };

  const sortOptions = SORT_OPTIONS.map((opt) => ({
    ...opt,
    label: sortBy === opt.value ? `${opt.label} ${sortOrder === 'asc' ? '↑' : '↓'}` : opt.label,
  }));

  return (
    <>
      <PageHeader title="Inventaire">
        <Button variant="secondary" icon={Tags} onClick={() => setShowBarcodeGenerator(true)}>
          Imprimer étiquettes
        </Button>
      </PageHeader>

      {showBarcodeGenerator && (
        <BarcodeLabelsGenerator
          products={products.filter((p) => getProductCodes(p).length > 0)}
          onClose={() => setShowBarcodeGenerator(false)}
        />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Valeur du stock" value={formatCurrency(totalValue)} icon={Wallet} />
        <StatCard label="Stock faible" value={lowStockCount} icon={AlertTriangle} tone="warning" />
        <StatCard label="Rupture" value={outOfStockCount} icon={PackageX} tone="danger" />
        <StatCard label="Produits" value={products.length} icon={Package} tone="neutral" />
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center gap-3" translate="no">
        <SearchInput
          className="flex-1"
          placeholder="Rechercher par nom ou code..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <SegmentedControl
            label="Stock :"
            options={STOCK_FILTERS}
            value={filterStock}
            onChange={(v) => {
              setFilterStock(v);
              setCurrentPage(1);
            }}
          />
          <SegmentedControl label="Trier :" options={sortOptions} value={sortBy} onChange={handleSortChange} />
        </div>
      </div>

      <Card bodyClassName="">
        {inventoryList.length === 0 ? (
          <EmptyState icon={Package} title="Aucun produit trouvé" />
        ) : (
          <>
            <ul className="md:hidden divide-y divide-dark-100">
              {pageItems.map((item) => (
                <li key={item.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-dark-900">{item.name}</p>
                      <p className="text-sm text-dark-500">
                        {formatCurrency(item.price)} · valeur {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                    <Badge tone={stockTone(item.quantity)}>{item.quantity}</Badge>
                  </div>
                  {quantityEditor(item)}
                </li>
              ))}
            </ul>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-200 bg-dark-50 text-left text-xs font-semibold uppercase tracking-wide text-dark-500">
                    <th className="py-3 px-4">Produit</th>
                    <th className="py-3 px-4 hidden lg:table-cell">Codes</th>
                    <th className="py-3 px-4 text-right">Prix unitaire</th>
                    <th className="py-3 px-4 text-center">Qté</th>
                    <th className="py-3 px-4 text-right">Valeur</th>
                    <th className="py-3 px-4 text-right">Modifier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100">
                  {pageItems.map((item) => (
                    <tr key={item.id} className="hover:bg-dark-50">
                      <td className="py-3 px-4 font-medium text-dark-900">{item.name}</td>
                      <td className="py-3 px-4 hidden lg:table-cell"><CodeList codes={item.codes} /></td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">{formatCurrency(item.price)}</td>
                      <td className="py-3 px-4 text-center"><Badge tone={stockTone(item.quantity)}>{item.quantity}</Badge></td>
                      <td className="py-3 px-4 text-right font-semibold whitespace-nowrap">{formatCurrency(item.price * item.quantity)}</td>
                      <td className="py-2 px-4">{quantityEditor(item)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={inventoryList.length}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(n) => {
          setItemsPerPage(n);
          setCurrentPage(1);
        }}
      />
    </>
  );
}
