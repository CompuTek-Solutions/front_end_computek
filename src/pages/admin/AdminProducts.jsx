import React, { useState, useMemo, useEffect } from 'react';
import { useProductStore } from '../../store/productStore';
import ProductForm from '../../components/admin/ProductForm';
import ProductList from '../../components/admin/ProductList';

export default function AdminProducts() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price', 'category'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [editingProduct, setEditingProduct] = useState(null);
  const { products, fetchProducts, fetchInventory } = useProductStore();

  useEffect(() => {
    fetchProducts().catch(() => {});
    fetchInventory().catch(() => {});
  }, [fetchProducts, fetchInventory]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Tri des produits
    return filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'price':
          aValue = a.price_selling || a.price || 0;
          bValue = b.price_selling || b.price || 0;
          break;
        case 'category':
          aValue = (a.category || '').toLowerCase();
          bValue = (b.category || '').toLowerCase();
          break;
        case 'name':
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
    });
  }, [products, searchTerm, sortBy, sortOrder]);

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      // Inverser l'ordre si on clique sur le même critère
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouveau critère, ordre ascendant par défaut
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
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

      {/* Search and Sort Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par nom ou code-barres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-dark-900 placeholder-gray-500 text-sm md:text-base"
            />
          </div>
          
          {/* Sort Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-dark-500 hidden md:block">Trier par:</span>
            <button
              onClick={() => handleSortChange('name')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'name' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={`Trier par nom ${sortBy === 'name' && sortOrder === 'asc' ? '(Z-A)' : '(A-Z)'}`}
            >
              Nom {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('price')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'price' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={`Trier par prix ${sortBy === 'price' && sortOrder === 'asc' ? '(élevé-bas)' : '(bas-élevé)'}`}
            >
              Prix {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('category')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'category' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={`Trier par catégorie ${sortBy === 'category' && sortOrder === 'asc' ? '(Z-A)' : '(A-Z)'}`}
            >
              Catégorie {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
          
          {/* Results Count */}
          <div className="flex items-center space-x-2 text-dark-500 flex-shrink-0">
            <span>🔍</span>
            <span className="text-sm">{filteredAndSortedProducts.length} résultat(s)</span>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <ProductList
          products={filteredAndSortedProducts}
          onEdit={handleEditProduct}
        />
      </div>
    </div>
  );
}
