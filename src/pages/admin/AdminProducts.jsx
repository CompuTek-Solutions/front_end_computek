import React, { useState, useMemo, useEffect } from 'react';
import { useProductStore } from '../../store/productStore';
import ProductForm from '../../components/admin/ProductForm';
import ProductList from '../../components/admin/ProductList';

export default function AdminProducts() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const { products, fetchProducts, fetchInventory } = useProductStore();

  useEffect(() => {
    fetchProducts().catch(() => {});
    fetchInventory().catch(() => {});
  }, [fetchProducts, fetchInventory]);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-dark-900">Gestion des Produits</h1>
          <p className="text-dark-600 mt-1 text-sm md:text-base">{products.length} produit(s) en stock</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(!showForm);
          }}
          className="px-4 md:px-6 py-2 md:py-3 bg-[#0369a1] hover:bg-[#0284c7] text-white rounded-lg transition-all flex items-center space-x-2 font-medium shadow-sm text-sm md:text-base"
        >
          <span>➕</span>
          <span>Ajouter un produit</span>
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <ProductForm
            product={editingProduct}
            onClose={handleCloseForm}
          />
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par nom ou code-barres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-dark-900 placeholder-gray-500 text-sm md:text-base"
            />
          </div>
          <div className="flex items-center space-x-2 text-dark-500 flex-shrink-0">
            <span>🔍</span>
            <span className="text-sm">{filteredProducts.length} résultat(s)</span>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <ProductList
          products={filteredProducts}
          onEdit={handleEditProduct}
        />
      </div>
    </div>
  );
}
