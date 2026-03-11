import React, { useMemo, useEffect, useState } from 'react';
import { useProductStore } from '../../store/productStore';
import { formatCurrency } from '../../utils/helpers';
import BarcodeLabelsGenerator from '../../components/admin/BarcodeLabelsGenerator';
import toast from 'react-hot-toast';

export default function AdminInventory() {
  const { products, inventory, fetchProducts, fetchInventory, updateInventoryQuantity } = useProductStore();
  const [sortBy, setSortBy] = React.useState('name');
  const [sortOrder, setSortOrder] = React.useState('asc');
  const [filterStock, setFilterStock] = React.useState('all');
  const [draftQty, setDraftQty] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [showBarcodeGenerator, setShowBarcodeGenerator] = useState(false);

  useEffect(() => {
    fetchProducts().catch(() => {});
    fetchInventory().catch(() => {});
  }, [fetchProducts, fetchInventory]);

  const inventoryList = useMemo(() => {
    let list = products.map((product) => ({
      id: product.id,
      name: product.name,
      barcode: product.barcode,
      price: product.price_selling ?? product.price,
      quantity: inventory.find((i) => i.product_id === product.id)?.quantity_on_hand ?? 0,
    }));

    if (filterStock === 'low') {
      list = list.filter((item) => item.quantity > 0 && item.quantity < 10);
    } else if (filterStock === 'out') {
      list = list.filter((item) => item.quantity === 0);
    }

    // Tri des produits
    return list.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'quantity':
          aValue = a.quantity || 0;
          bValue = b.quantity || 0;
          break;
        case 'value':
          aValue = (a.price || 0) * (a.quantity || 0);
          bValue = (b.price || 0) * (b.quantity || 0);
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
  }, [products, inventory, sortBy, sortOrder, filterStock]);

  const totalValue = useMemo(() => {
    return inventoryList.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [inventoryList]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => {
      const qty = inventory.find((i) => i.product_id === p.id)?.quantity_on_hand ?? 0;
      return qty > 0 && qty < 10;
    }).length;
  }, [products, inventory]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => {
      const qty = inventory.find((i) => i.product_id === p.id)?.quantity_on_hand ?? 0;
      return qty === 0;
    }).length;
  }, [products, inventory]);

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
          <h1 className="text-xl md:text-2xl font-bold text-dark-900">Gestion de l'Inventaire</h1>
          <p className="text-dark-600 mt-1 text-sm md:text-base">Suivi et analyse du stock en temps réel</p>
        </div>
        <button
          onClick={() => setShowBarcodeGenerator(true)}
          className="px-4 md:px-6 py-2 md:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center space-x-2 font-medium shadow-sm text-sm md:text-base"
        >
          <span>🏷️</span>
          <span>Imprimer étiquettes</span>
        </button>
      </div>

      {/* Barcode Generator Modal */}
      {showBarcodeGenerator && (
        <BarcodeLabelsGenerator
          products={products.filter(p => p.barcode) || []}
          onClose={() => setShowBarcodeGenerator(false)}
        />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600 mb-1">Valeur totale</p>
              <p className="text-2xl font-bold text-primary-600">{formatCurrency(totalValue)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-700 text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600 mb-1">Stock faible</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-800 text-xl">⚠️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600 mb-1">Rupture de stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-700 text-xl">🚫</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600 mb-1">Total articles</p>
              <p className="text-2xl font-bold text-green-600">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-700 text-xl">📦</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Stock Filter */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-dark-500">Stock:</span>
            <button
              onClick={() => setFilterStock('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStock === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterStock('low')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStock === 'low' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Stock faible
            </button>
            <button
              onClick={() => setFilterStock('out')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStock === 'out' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rupture
            </button>
          </div>
          
          {/* Sort Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-dark-500">Trier par:</span>
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
              onClick={() => handleSortChange('quantity')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'quantity' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={`Trier par quantité ${sortBy === 'quantity' && sortOrder === 'asc' ? '(élevée-basse)' : '(basse-élevée)'}`}
            >
              Quantité {sortBy === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('value')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'value' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={`Trier par valeur ${sortBy === 'value' && sortOrder === 'asc' ? '(élevée-basse)' : '(basse-élevée)'}`}
            >
              Valeur {sortBy === 'value' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
          
          {/* Results Count */}
          <div className="flex items-center space-x-2 text-dark-500 flex-shrink-0 lg:ml-auto">
            <span>📊</span>
            <span className="text-sm">{inventoryList.length} résultat(s)</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm">Produit</th>
                <th className="text-left py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm hidden lg:table-cell">Code-barres</th>
                <th className="text-right py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm hidden sm:table-cell">Prix unitaire</th>
                <th className="text-center py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm">Qté</th>
                <th className="text-right py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm hidden md:table-cell">Valeur stock</th>
                <th className="text-center py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm">Modifier</th>
              </tr>
            </thead>
            <tbody>
              {inventoryList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="text-dark-500">
                      <span className="text-3xl">📦</span>
                      <p className="mt-2">Aucun produit trouvé</p>
                    </div>
                  </td>
                </tr>
              ) : (
                inventoryList.map((item) => {
                  const currentDraft = draftQty[item.id];
                  const inputValue = currentDraft === undefined ? String(item.quantity) : String(currentDraft);
                  const isSaving = savingId === item.id;
                  return (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 md:px-6">
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-700 font-semibold text-sm">{item.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-dark-900 text-sm truncate">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 md:px-6 text-dark-700 hidden lg:table-cell">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">{item.barcode || 'Sans code-barres'}</code>
                    </td>
                    <td className="py-3 px-3 md:px-6 text-right font-medium text-dark-900 text-sm hidden sm:table-cell">{formatCurrency(item.price)}</td>
                    <td className="py-3 px-3 md:px-6 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        item.quantity === 0
                          ? 'bg-red-100 text-red-800'
                          : item.quantity < 10
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-3 md:px-6 text-right font-semibold text-primary-600 text-sm hidden md:table-cell">{formatCurrency(item.price * item.quantity)}</td>
                    <td className="py-3 px-3 md:px-6">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={inputValue}
                          onChange={(e) => {
                            const n = parseInt(e.target.value, 10);
                            setDraftQty((prev) => ({ ...prev, [item.id]: Number.isFinite(n) ? Math.max(0, n) : 0 }));
                          }}
                          className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg bg-white text-dark-900 text-center font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={async () => {
                            const nextQty = draftQty[item.id];
                            const quantity_on_hand = nextQty === undefined ? item.quantity : nextQty;
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
                          }}
                          className="px-3 py-1.5 bg-[#0369a1] hover:bg-[#0284c7] disabled:bg-gray-400 text-white text-sm font-medium rounded-lg"
                        >
                          {isSaving ? '...' : 'Enregistrer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
