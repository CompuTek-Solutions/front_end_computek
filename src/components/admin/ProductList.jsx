import React from 'react';
import { useProductStore } from '../../store/productStore';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductList({ products, onEdit }) {
  const { deleteProduct, inventory } = useProductStore();

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      deleteProduct(id);
      toast.success('Produit supprimé');
    }
  };

  const getInventoryQuantity = (productId) => {
    const item = inventory.find((i) => i.product_id === productId);
    return item?.quantity_on_hand ?? 0;
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📦</span>
        </div>
        <h3 className="text-lg font-medium text-dark-900 mb-2">Aucun produit trouvé</h3>
        <p className="text-dark-500">Commencez par ajouter votre premier produit</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm">Nom</th>
            <th className="text-left py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm hidden md:table-cell">Catégorie</th>
            <th className="text-left py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm hidden lg:table-cell">Code-barres</th>
            <th className="text-left py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm">Prix</th>
            <th className="text-center py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm">Stock</th>
            <th className="text-center py-3 px-3 md:px-6 font-semibold text-dark-700 text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => {
            const stockQuantity = getInventoryQuantity(product.id);
            const isLowStock = stockQuantity < 10;

            return (
              <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-3 md:px-6">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 font-semibold text-sm">
                        {product.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-dark-900 text-sm truncate">{product.name}</p>
                      <p className="text-xs text-dark-500 hidden sm:block">ID: {String(product.id).slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 md:px-6 hidden md:table-cell">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {product.category || 'Non catégorisé'}
                  </span>
                </td>
                <td className="py-3 px-3 md:px-6 hidden lg:table-cell">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                    {product.barcode || 'Sans code-barres'}
                  </code>
                </td>
                <td className="py-3 px-3 md:px-6">
                  <span className="font-semibold text-primary-600 text-sm">
                    {formatCurrency(product.price_selling ?? product.price)}
                  </span>
                </td>
                <td className="py-3 px-3 md:px-6 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isLowStock
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {stockQuantity}
                  </span>
                </td>
                <td className="py-3 px-3 md:px-6 text-center">
                  <div className="flex items-center justify-center gap-1 md:gap-3">
                    <button
                      onClick={() => onEdit(product)}
                      className="px-2 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm text-xs md:text-sm"
                      title="Modifier"
                    >
                      ✏️ <span className="hidden sm:inline">Éditer</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-2 md:px-4 py-1.5 md:py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-sm text-xs md:text-sm"
                      title="Supprimer"
                    >
                      🗑️ <span className="hidden sm:inline">Supprimer</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
