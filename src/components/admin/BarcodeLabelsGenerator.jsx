import React, { useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Printer, Tags } from 'lucide-react';
import { Button, EmptyState, Modal } from '../ui';
import JsBarcode from 'jsbarcode';
import { formatCurrency, getProductCodes } from '../../utils/helpers';

const LABELS_PER_PAGE = 30;

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const barcodeImage = (code) => {
  try {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    JsBarcode(svg, code, { format: 'CODE128', width: 2, height: 40, displayValue: false, margin: 0 });
    const data = btoa(unescape(encodeURIComponent(new XMLSerializer().serializeToString(svg))));
    return `<img src="data:image/svg+xml;base64,${data}" alt="" />`;
  } catch {
    return '';
  }
};

export default function BarcodeLabelsGenerator({ products, onClose }) {
  const labels = useMemo(
    () =>
      (products || []).flatMap((product) =>
        getProductCodes(product).map((code) => ({ code, name: product.name, price: product.price_selling }))
      ),
    [products]
  );
  const totalPages = Math.ceil(labels.length / LABELS_PER_PAGE);

  const print = () => {
    const pages = [];
    for (let i = 0; i < labels.length; i += LABELS_PER_PAGE) {
      const content = labels
        .slice(i, i + LABELS_PER_PAGE)
        .map(
          (l) => `<div class="label">
            <div class="name">${escapeHtml(l.name.substring(0, 28))}</div>
            <div class="bars">${barcodeImage(l.code)}</div>
            <div class="code">${escapeHtml(l.code)}</div>
            <div class="price">${escapeHtml(formatCurrency(l.price))}</div>
          </div>`
        )
        .join('');
      pages.push(`<div class="page">${content}</div>`);
    }

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Étiquettes</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; }
        .page { width: 210mm; display: grid; grid-template-columns: repeat(3, 60mm); grid-auto-rows: 25mm; padding: 5mm; break-after: page; }
        .label { border: 1px solid #999; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5mm; text-align: center; break-inside: avoid; }
        .name { font-weight: bold; font-size: 8pt; width: 100%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .bars img { width: 40mm; height: 8mm; display: block; margin: 0.5mm auto; }
        .code { font-size: 6.5pt; font-family: 'Courier New', monospace; }
        .price { font-size: 7pt; font-weight: bold; }
      </style></head><body>${pages.join('')}
      <script>window.onload = function () { window.print(); };</script></body></html>`;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast.error("Autorisez les fenêtres pop-up pour imprimer");
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    onClose();
  };

  return (
    <Modal
      title="Imprimer les étiquettes"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          {labels.length > 0 && <Button icon={Printer} onClick={print}>Imprimer</Button>}
        </>
      }
    >
      {labels.length === 0 ? (
        <EmptyState icon={Tags} title="Aucun produit n'a de code-barres" />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-dark-600">
            {labels.length} étiquette(s) sur {totalPages} page(s) A4 (3 × 10), une par code.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-lg border border-dark-200 bg-dark-50 p-3">
            {labels.slice(0, 6).map((l) => (
              <div key={l.code} className="rounded border border-dark-200 bg-white p-2 text-center text-xs">
                <p className="font-semibold truncate text-dark-800">{l.name}</p>
                <p className="font-mono text-dark-500 truncate">{l.code}</p>
                <p className="font-bold">{formatCurrency(l.price)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
