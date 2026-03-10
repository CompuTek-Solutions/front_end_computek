export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
  }).format(amount);
};

export const calculateTotalSales = (sales) => {
  return sales.reduce((total, sale) => total + (sale.total_amount ?? sale.total ?? 0), 0);
};

export const calculateTotalQuantity = (sales) => {
  return sales.reduce((total, sale) => {
    const items = Array.isArray(sale.items) ? sale.items : [];
    return total + items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, 0);
};

export const getTopSellingProducts = (sales, limit = 5) => {
  const productMap = new Map();

  sales.forEach((sale) => {
    const items = Array.isArray(sale.items) ? sale.items : [];
    items.forEach((item) => {
      const key = item.productId ?? item.product_id;
      const name = item.name ?? item.product_name;
      const revenue = item.total ?? item.subtotal ?? 0;
      if (productMap.has(key)) {
        const existing = productMap.get(key);
        productMap.set(key, {
          ...existing,
          quantity: existing.quantity + (item.quantity || 0),
          revenue: existing.revenue + revenue,
        });
      } else {
        productMap.set(key, {
          productId: key,
          name,
          quantity: item.quantity || 0,
          revenue,
        });
      }
    });
  });

  return Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
};

export const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `INV-${year}${month}-${random}`;
};

/**
 * Ouvre une fenêtre d'impression pour la facture (vente).
 * @param {Object} sale - { id, total_amount|total, discount_amount|discount, payment_method, created_at|date, items: [{ name, product_name, quantity, unit_price, price, subtotal, total }] }
 */
export const printInvoice = (sale) => {
  const total = sale.total_amount ?? sale.total ?? 0;
  const discount = sale.discount_amount ?? sale.discount ?? 0;
  const subtotal = sale.subtotal ?? total + discount;
  const date = sale.created_at || sale.date;
  const dateStr = date
    ? new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const items = sale.items || [];
  const invoiceNumber = sale.invoice_number || generateInvoiceNumber();

  const paymentLabels = { cash: 'Espèces', card: 'Carte bancaire', transfer: 'Virement', check: 'Chèque', paiement_marchand: 'Paiement marchand' };
  const paymentLabel = paymentLabels[sale.payment_method] || sale.payment_method || '—';

  const rows = items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px;border:1px solid #e2e8f0">${item.name || item.product_name || 'Article'}</td>
      <td style="padding:8px;border:1px solid #e2e8f0;text-align:center">${item.quantity ?? 0}</td>
      <td style="padding:8px;border:1px solid #e2e8f0;text-align:right">${formatCurrency(item.unit_price ?? item.price ?? 0)}</td>
      <td style="padding:8px;border:1px solid #e2e8f0;text-align:right">${formatCurrency(item.subtotal ?? item.total ?? (item.quantity * (item.unit_price ?? item.price ?? 0)))}</td>
    </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Facture ${invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 14px; color: #000; padding: 24px; max-width: 600px; margin: 0 auto; }
    h1 { font-size: 22px; margin-bottom: 8px; }
    .meta { color: #475569; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #f1f5f9; padding: 10px; border: 1px solid #e2e8f0; text-align: left; }
    .total-row { font-weight: bold; font-size: 16px; }
    .text-right { text-align: right; }
  </style>
</head>
<body>
  <h1>CompuTek Solutions</h1>
  <p class="meta">Facture n° ${invoiceNumber} &nbsp;|&nbsp; Date: ${dateStr}</p>
  <table>
    <thead>
      <tr>
        <th>Désignation</th>
        <th style="text-align:center">Qté</th>
        <th class="text-right">P.U.</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="text-right">Sous-total: ${formatCurrency(subtotal)}</p>
  ${discount ? `<p class="text-right">Remise: -${formatCurrency(discount)}</p>` : ''}
  <p class="text-right total-row">Total TTC: ${formatCurrency(total)}</p>
  <p class="meta" style="margin-top:24px">Paiement: ${paymentLabel}</p>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=700,height=800');
  if (w) {
    w.document.write(html);
    w.document.close();
  }
};

export const calculateStats = (sales) => {
  const totalRevenue = calculateTotalSales(sales);
  const totalQuantity = calculateTotalQuantity(sales);
  const averageOrder = sales.length > 0 ? totalRevenue / sales.length : 0;

  return {
    totalRevenue,
    totalQuantity,
    averageOrder,
    totalOrders: sales.length,
  };
};
