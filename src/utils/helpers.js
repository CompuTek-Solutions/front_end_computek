export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
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
  const toNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const total = toNumber(sale.total_amount ?? sale.total ?? 0);
  const discount = toNumber(sale.discount_amount ?? sale.discount ?? 0);
  const discountPercentProvided = toNumber(sale.discount_percent);
  const subtotal =
    sale.subtotal === null || sale.subtotal === undefined
      ? total + discount
      : toNumber(sale.subtotal);
  const date = sale.created_at || sale.date;
  const dateStr = date
    ? new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const items = sale.items || [];
  const invoiceNumber = sale.invoice_number || generateInvoiceNumber();

  const paymentLabels = { cash: 'Espèces', card: 'Carte bancaire', transfer: 'Virement', check: 'Chèque', paiement_marchand: 'Paiement marchand' };
  const paymentLabel = paymentLabels[sale.payment_method] || sale.payment_method || '—';

  const clientSource =
    sale.client || {
      name: sale.client_name,
      email: sale.client_email,
      phone: sale.client_phone,
      address: sale.client_address,
      rccm: sale.client_rccm,
      postal_box: sale.client_postal_box,
      nc: sale.client_nc,
    };

  const clientName = clientSource?.name;
  const clientLabels = {
    address: 'Adresse',
    email: 'Email',
    phone: 'Téléphone',
    rccm: 'RCCM',
    postal_box: 'Boîte postale',
    nc: 'NC',
  };

  const clientFields = Object.entries(clientLabels)
    .map(([key, label]) => {
      const value = clientSource?.[key];
      if (!value) return null;
      return `<div class="client-field"><span class="label">${label} :</span><span>${value}</span></div>`;
    })
    .filter(Boolean)
    .join('');

  const discountRate = discountPercentProvided || (subtotal ? (discount / subtotal) * 100 : 0);

  const rows = items
    .map(
      (item, index) => `
    <tr>
      <td style="padding:6px 8px;border:1px solid #222;">${index + 1}</td>
      <td style="padding:6px 8px;border:1px solid #222;">${item.name || item.product_name || 'Article'}</td>
      <td style="padding:6px 8px;border:1px solid #222;text-align:center;">${item.quantity ?? 0}</td>
      <td style="padding:6px 8px;border:1px solid #222;text-align:right;">${formatCurrency(item.unit_price ?? item.price ?? 0)}</td>
      <td style="padding:6px 8px;border:1px solid #222;text-align:right;">${formatCurrency(item.subtotal ?? item.total ?? (item.quantity * (item.unit_price ?? item.price ?? 0)))}</td>
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
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #111; margin: 0; background: #fff; }
    .invoice { max-width: 850px; margin: 0 auto; padding: 24px 36px; }
    .invoice-header { display: flex; gap: 12px; border-bottom: 2px solid #1d4ed8; padding-bottom: 12px; }
    .logo-column { min-width: 140px; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
    .logo-box img { height: 80px; width: auto; }
    .logo-label { font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin: 2px 0 0; text-align: left; }
    .services-column { flex: 1; background: #f8fafc; border: 1px solid #cbd5f5; padding: 8px 14px; }
    .service-list { margin: 0; padding: 0; list-style: none; }
    .service-list > li { font-size: 12px; display: flex; gap: 8px; line-height: 1.4; }
    .service-list > li::before { content: '▸'; font-size: 15px; color: #0f172a; line-height: 1.1; position: relative; top: -1px; }
    .service-list ul { margin: 2px 0 6px 18px; padding: 0; list-style: none; }
    .service-list ul li { font-size: 12px; display: flex; gap: 6px; line-height: 1.35; }
    .service-list ul li::before { content: '–'; font-size: 14px; color: #0f172a; position: relative; top: -1px; }
    .client-row { display: flex; justify-content: flex-end; }
    .client-box { width: 300px; border: 2px solid #1d4ed8; background: #f1f5f9; padding: 12px 16px; }
    .client-name { margin: 0 0 6px; font-size: 15px; font-weight: 700; text-transform: uppercase; }
    .client-field { display: flex; justify-content: space-between; border-bottom: 1px dotted #94a3b8; padding: 4px 0; font-size: 13px; }
    .client-field:last-child { border-bottom: none; }
    .client-field .label { font-weight: 600; margin-right: 12px; }
    .no-client { margin: 0; font-style: italic; color: #64748b; }
    .invoice-meta { display: grid; grid-template-columns: repeat(2, 1fr); margin: 16px 0; border: 1px solid #1d4ed8; }
    .invoice-meta div { padding: 10px 14px; border-right: 1px solid #1d4ed8; }
    .invoice-meta div:last-child { border-right: none; }
    .invoice-meta span { display: block; text-transform: uppercase; font-size: 11px; color: #475569; letter-spacing: 0.06em; }
    .invoice-meta strong { font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0 6px; }
    th { background: #dbeafe; padding: 8px 10px; border: 1px solid #222; text-transform: uppercase; font-size: 12px; }
    td { font-size: 13px; }
    .totals-table { width: 260px; margin-left: auto; border: 1px solid #222; }
    .totals-table td { border: 1px solid #222; padding: 6px 10px; font-weight: 600; }
    .totals-table .label { background: #f1f5f9; }
    .totals-table .grand-total { background: #1d4ed8; color: #fff; font-size: 15px; }
    .payment { margin: 14px 0; border-top: 1px dashed #475569; padding-top: 10px; }
    .signature { display: flex; justify-content: space-between; margin-top: 32px; font-weight: 600; }
    footer { margin-top: 36px; border: 1px solid #94a3b8; padding: 16px; font-size: 12px; line-height: 1.5; text-align: center; }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="invoice-header">
      <div class="logo-column">
        <div class="logo-box">
          <img src="/logo2.jpg" alt="CompuTek logo" />
        </div>
        <p class="logo-label">ETS COMPUTEK SOLUTIONS</p>
      </div>
      <div class="services-column">
        <ul class="service-list">
          <li>Matériels, accessoires et consommables informatiques et téléphoniques.</li>
          <li>Système de sécurité :
            <ul>
              <li>Des Caméras De Vidéo surveillance.</li>
              <li>Contrôle D'accès & Gestion de temps biométrie.</li>
              <li>Alarme Intrusion & Incendie.</li>
              <li>Interphone & Vidéophone.</li>
              <li>Tracking GPS.</li>
            </ul>
          </li>
          <li>Maintenance et sécurité des réseaux informatiques.</li>
          <li>Énergie Renouvelable solaire photovoltaïque.</li>
          <li>Audit IT Conseil.</li>
          <li>Prestation de service.</li>
        </ul>
      </div>
    </div>

    <div class="client-row">
      <div class="client-box">
        ${clientName ? `<p class="client-name">${clientName}</p>` : ''}
        ${clientFields || '<p class="no-client">Aucune information client fournie</p>'}
      </div>
    </div>

    <div class="invoice-meta">
      <div>
        <span>Facture N°</span>
        <strong>${invoiceNumber}</strong>
      </div>
      <div>
        <span>Date</span>
        <strong>${dateStr}</strong>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:5%">#</th>
          <th style="width:55%">Désignation</th>
          <th style="width:10%">Qté</th>
          <th style="width:15%">P.U.</th>
          <th style="width:15%">Montant</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin:6px 0 0;font-size:12px;font-weight:600;color:#0f172a;">Garantie 7jrs</p>

    <table class="totals-table">
      <tr>
        <td class="label">Sous-total</td>
        <td style="text-align:right;">${formatCurrency(subtotal)}</td>
      </tr>
      ${(discount > 0 || discountRate > 0) ? `<tr>
        <td class="label">Remise (${discountRate.toFixed(1)}%)</td>
        <td style="text-align:right;">−${formatCurrency(discount)}</td>
      </tr>` : ''}
      <tr>
        <td class="grand-total">TOTAL TTC</td>
        <td class="grand-total" style="text-align:right;">${formatCurrency(total)}</td>
      </tr>
    </table>

    <div class="payment">
      <p><strong>Modalité de paiement :</strong> ${paymentLabel}</p>
      ${sale.notes ? `<p><strong>Notes :</strong> ${sale.notes}</p>` : ''}
    </div>

    <div class="signature">
      <div>Le Client</div>
      <div>Le Service Commercial</div>
    </div>

    <footer>
      <div><strong>ETS COMPUTEK SOLUTIONS</strong></div>
      <div><strong>Siège social:</strong> Akwa-Douala Avenue KING AKWA à coté de l'immeuble DEKAGE.</div>
      <div><strong>N° RCCM:</strong> RC/DLA/2019/A/222 du 15/01/2019 &nbsp;&nbsp; <strong>NIU:</strong> P 019012736177 D</div>
      <div><strong>Email:</strong> infos@computeksolutions.cm / contact@computeksolutions.cm</div>
      <div><strong>Site web:</strong> www.computeksolutions.cm &nbsp;&nbsp; <strong>Tél:</strong> 657300520 / 653254806</div>
    </footer>
  </div>
  <script>window.onload = function() { window.print(); };</script>
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
