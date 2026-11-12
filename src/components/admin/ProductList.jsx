import React from 'react';
import { Package, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProductStore } from '../../store/productStore';
import { formatCurrency, getProductCodes, stockTone } from '../../utils/helpers';
import CodeList from './CodeList';
import { Badge, Button, EmptyState, ListSkeleton, confirmDialog } from '../ui';

export default function ProductList({ products, onEdit }) {
  const { deleteProduct, inventory, isLoading } = useProductStore();

  const handleDelete = async (product) => {
    const ok = await confirmDialog({
      title: 'Supprimer le produit',
      message: `« ${product.name} » sera supprimé définitivement.`,
    });
    if (!ok) return;
    try {
      await deleteProduct(product.id);
      toast.success('Produit supprimé');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const stockOf = (productId) => inventory.find((i) => i.product_id === productId)?.quantity_on_hand ?? 0;

  if (products.length === 0) {
    if (isLoading) return <ListSkeleton />;
    return <EmptyState icon={Package} title="Aucun produit trouvé" />;
  }

  const actions = (product) => (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" icon={Pencil} onClick={() => onEdit(product)} title="Modifier" aria-label="Modifier" />
      <Button variant="danger-ghost" size="icon" icon={Trash2} onClick={() => handleDelete(product)} title="Supprimer" aria-label="Supprimer" />
    </div>
  );

  return (
    <>
      <ul className="md:hidden divide-y divide-dark-100">
        {products.map((product) => {
          const qty = stockOf(product.id);
          return (
            <li key={product.id} className="p-4 flex gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-medium text-dark-900">{product.name}</p>
                <p className="text-sm font-semibold text-primary-700">{formatCurrency(product.price_selling)}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={stockTone(qty)}>Stock : {qty}</Badge>
                  {product.category && <Badge>{product.category}</Badge>}
                </div>
                <CodeList codes={getProductCodes(product)} />
              </div>
              {actions(product)}
            </li>
          );
        })}
      </ul>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-200 bg-dark-50 text-left text-xs font-semibold uppercase tracking-wide text-dark-500">
              <th className="py-3 px-4">Nom</th>
              <th className="py-3 px-4">Catégorie</th>
              <th className="py-3 px-4 hidden lg:table-cell">Codes</th>
              <th className="py-3 px-4 text-right">Prix</th>
              <th className="py-3 px-4 text-center">Stock</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100">
            {products.map((product) => {
              const qty = stockOf(product.id);
              return (
                <tr key={product.id} className="hover:bg-dark-50">
                  <td className="py-3 px-4 font-medium text-dark-900">{product.name}</td>
                  <td className="py-3 px-4 text-dark-600">{product.category || '—'}</td>
                  <td className="py-3 px-4 hidden lg:table-cell"><CodeList codes={getProductCodes(product)} /></td>
                  <td className="py-3 px-4 text-right font-semibold text-dark-900 whitespace-nowrap">{formatCurrency(product.price_selling)}</td>
                  <td className="py-3 px-4 text-center"><Badge tone={stockTone(qty)}>{qty}</Badge></td>
                  <td className="py-2 px-4">{actions(product)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
