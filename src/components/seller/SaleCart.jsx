import React from 'react';
import './SaleCart.css';

export default function SaleCart({ items, onUpdateQuantity, getMaxQuantity }) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="sale-cart">
      <h3>📦 Panier</h3>

      <div className="cart-items">
        {items.length === 0 ? (
          <p className="empty-cart">Le panier est vide</p>
        ) : (
          items.map((item) => {
            const maxQty = typeof getMaxQuantity === 'function' ? getMaxQuantity(item.productId) : 9999;
            return (
            <div key={item.productId} className="cart-item">
              <div className="cart-item-info">
                <p className="item-name">{item.name}</p>
                <p className="item-price">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'XAF',
                  }).format(item.price)}
                </p>
              </div>

              <div className="item-controls">
                <input
                  type="number"
                  min="1"
                  max={maxQty}
                  value={item.quantity}
                  onChange={(e) =>
                    onUpdateQuantity(item.productId, parseInt(e.target.value, 10))
                  }
                  className="qty-input"
                />

                <button
                  className="btn-remove"
                  onClick={() => onUpdateQuantity(item.productId, 0)}
                  title="Supprimer"
                >
                  🗑️
                </button>
              </div>

              <div className="item-total">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XAF',
                }).format(item.total)}
              </div>
            </div>
          );
          })
        )}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Sous-total</span>
          <span>
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XAF',
            }).format(subtotal)}
          </span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XAF',
            }).format(subtotal)}
          </span>
        </div>
        <p className="item-count">
          {items.length} article{items.length > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
