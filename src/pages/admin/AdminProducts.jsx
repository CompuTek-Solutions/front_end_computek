import React, { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import ProductForm from '../../components/admin/ProductForm';
import ProductList from '../../components/admin/ProductList';
import Pagination from '../../components/common/Pagination';
import { normalizeForSearch, productMatchesSearch } from '../../utils/helpers';
import { Button, Card, PageHeader, SearchInput, SegmentedControl } from '../../components/ui';

const SORT_OPTIONS = [
  { value: 'name', label: 'Nom' },
  { value: 'price', label: 'Prix' },
  { value: 'category', label: 'Catégorie' },
];

export default function AdminProducts() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingProduct, setEditingProduct] = useState(null);
  const { products, fetchProducts, fetchInventory } = useProductStore();

  useEffect(() => {
    fetchProducts().catch(() => {});
    fetchInventory().catch(() => {});
  }, [fetchProducts, fetchInventory]);

  const filteredAndSortedProducts = useMemo(() => {
    const term = normalizeForSearch(searchTerm);
    const direction = sortOrder === 'asc' ? 1 : -1;
    return products
      .filter((product) => productMatchesSearch(product, term))
      .sort((a, b) => {
        if (sortBy === 'price') return direction * (Number(a.price_selling) - Number(b.price_selling));
        const key = sortBy === 'category' ? 'category' : 'name';
        return direction * (a[key] || '').toLowerCase().localeCompare((b[key] || '').toLowerCase());
      });
  }, [products, searchTerm, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedProducts.length / itemsPerPage));
  const page = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredAndSortedProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSortChange = (value) => {
    if (sortBy === value) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(value);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const sortOptions = SORT_OPTIONS.map((opt) => ({
    ...opt,
    label: sortBy === opt.value ? `${opt.label} ${sortOrder === 'asc' ? '↑' : '↓'}` : opt.label,
  }));

  return (
    <>
      <PageHeader title="Produits" subtitle={`${products.length} produit(s)`}>
        <Button
          icon={Plus}
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
        >
          Ajouter un produit
        </Button>
      </PageHeader>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      <div className="flex flex-col lg:flex-row lg:items-center gap-3" translate="no">
        <SearchInput
          className="flex-1"
          placeholder="Rechercher par nom ou code..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <SegmentedControl label="Trier :" options={sortOptions} value={sortBy} onChange={handleSortChange} />
      </div>

      <Card bodyClassName="">
        <ProductList
          products={paginatedProducts}
          onEdit={(product) => {
            setEditingProduct(product);
            setShowForm(true);
          }}
        />
      </Card>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredAndSortedProducts.length}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(n) => {
          setItemsPerPage(n);
          setCurrentPage(1);
        }}
      />
    </>
  );
}
