import React from 'react';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { EmptyState } from '../ui';

export default function TopProductsList({ products, emptyTitle = 'Aucun produit vendu' }) {
  if (!products.length) return <EmptyState icon={BarChart3} title={emptyTitle} />;
  return (
    <ul className="divide-y divide-dark-100">
      {products.map((product, index) => (
        <li key={product.productId || index} className="flex items-center gap-3 px-2 py-3">
          <span className="h-8 w-8 shrink-0 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold flex items-center justify-center">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-dark-900 truncate">{product.name}</p>
            <p className="text-xs text-dark-500">{product.quantity} vendu(s)</p>
          </div>
          <span className="font-semibold text-primary-700 whitespace-nowrap">{formatCurrency(product.revenue)}</span>
        </li>
      ))}
    </ul>
  );
}
