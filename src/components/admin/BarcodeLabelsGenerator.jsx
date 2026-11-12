import React, { useMemo } from 'react';
import { toast } from 'react-hot-toast';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-dark-900">Imprimer les étiquettes</h3>
          <button onClick={onClose} className="text-dark-700 hover:text-dark-900 font-bold text-lg" aria-label="Fermer">✕</button>
        </div>

        {labels.length === 0 ? (
          <p className="py-8 text-center text-dark-600">Aucun produit n'a de code-barres.</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-dark-700">
              {labels.length} étiquette(s) sur {totalPages} page(s) A4 (3 × 10). Une étiquette par code.
            </p>
            <div className="grid grid-cols-3 gap-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
              {labels.slice(0, 6).map((l) => (
                <div key={l.code} className="border border-gray-300 rounded p-2 text-center text-xs bg-white">
                  <p className="font-semibold truncate text-gray-800">{l.name}</p>
                  <p className="font-mono text-gray-600 truncate">{l.code}</p>
                  <p className="font-bold">{formatCurrency(l.price)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 text-dark-900 font-medium rounded-lg hover:bg-gray-50">Annuler</button>
          {labels.length > 0 && (
            <button onClick={print} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg">
              🖨️ Imprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
