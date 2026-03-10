import React, { useRef } from 'react';
import { toast } from 'react-hot-toast';
import JsBarcode from 'jsbarcode';

export default function BarcodeLabelsGenerator({ products, onClose }) {
  const contentRef = useRef();

  // Configuration du papier A4
  const PAGE_CONFIG = {
    width: 210, // mm
    height: 297, // mm
    columns: 3,
    rows: 10,
    marginLeft: 5,
    marginTop: 5,
    labelWidth: 60, // mm
    labelHeight: 25, // mm
  };

  // Fonction pour générer un vrai code-barres SVG
  const generateBarcodeSVG = (barcodeText) => {
    try {
      // Créer un élément SVG temporaire
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      JsBarcode(svg, barcodeText, {
        format: 'CODE128',     // Format Code 128 (universel)
        width: 2,              // Largeur des barres
        height: 40,            // Hauteur du code-barres
        displayValue: false,   // Ne pas afficher le texte sous le code
        margin: 0,             // Pas de marge
        background: '#ffffff', // Fond blanc
        lineColor: '#000000',  // Barres noires
      });

      // Convertir le SVG en string
      const svgString = new XMLSerializer().serializeToString(svg);
      const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;

      return `<img src="${svgDataUrl}" style="width: 35mm; height: 6mm; display: block; margin: 0 auto;" alt="Code-barres ${barcodeText}" />`;
    } catch (error) {
      console.warn('Erreur génération code-barres:', error);
      // Fallback vers la méthode simple si JsBarcode échoue
      const barcodeVisual = barcodeText.split('').map(c => {
        const code = parseInt(c) || 5;
        return code % 2 === 0 ? '█' : '▁';
      }).join('');
      return `<div style="font-family: 'Courier New', monospace; font-size: 11pt; font-weight: bold; text-align: center;">║${barcodeVisual.substring(0, 8)}║</div>`;
    }
  };

  // Calculer le nombre de pages nécessaires
  const labelsPerPage = PAGE_CONFIG.columns * PAGE_CONFIG.rows;
  const totalPages = Math.ceil((products?.length || 0) / labelsPerPage);

  const generatePDF = () => {
    try {
      // Créer un HTML imprimable
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Étiquettes Codes-Barres - Impression</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { width: 100%; height: 100%; }
            body { font-family: Arial, sans-serif; background: white; padding: 0; margin: 0; }
            .page { width: 210mm; height: 297mm; display: grid; grid-template-columns: repeat(3, 60mm); grid-auto-rows: 25mm; gap: 0; page-break-after: always; break-after: always; }
            .label { width: 60mm; height: 25mm; border: 1px solid #999; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5mm; font-size: 9pt; text-align: center; page-break-inside: avoid; break-inside: avoid; }
            .label-name { font-weight: bold; font-size: 8pt; width: 100%; max-height: 4mm; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
            .label-barcode-visual { margin: 0.5mm 0; text-align: center; }
            .label-barcode-visual img { max-width: 100%; height: auto; }
            .label-barcode-text { font-size: 6.5pt; font-family: 'Courier New', monospace; margin: 0.2mm 0; letter-spacing: 0.5px; }
            .label-price { font-size: 7pt; color: #000; font-weight: bold; margin-top: 0.2mm; }
            @media print {
              html, body { width: 210mm; height: 297mm; }
              body { padding: 0; margin: 0; }
              .page { margin: 0; padding: 5mm; }
            }
          </style>
        </head>
        <body>
      `;

      let labelIndex = 0;
      for (let page = 0; page < totalPages; page++) {
        htmlContent += '<div class="page">';

        for (let i = 0; i < labelsPerPage && labelIndex < products.length; i++) {
          const product = products[labelIndex];
          const barcode = product.barcode || 'N/A';
          const name = product.name.substring(0, 22);
          const price = product.price_selling ? product.price_selling.toFixed(0) : '0';

          // Générer le vrai code-barres SVG
          const barcodeSVG = generateBarcodeSVG(barcode);

          htmlContent += `<div class="label"><div class="label-name">${name}</div><div class="label-barcode-visual">${barcodeSVG}</div><div class="label-barcode-text">${barcode}</div><div class="label-price">${price} DH</div></div>`;
          labelIndex++;
        }

        htmlContent += '</div>';
      }

      htmlContent += `</body></html>`;

      // Créer un blob et le télécharger comme fichier
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `etiquettes-codes-barres-${new Date().toISOString().split('T')[0]}.html`;
      link.click();

      // Ouvrir dans une fenêtre pour impression
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 250);
      }

      toast.success(`✅ ${products.length} étiquette(s) prête(s) à imprimer !`);
      onClose();
    } catch (error) {
      console.error('Erreur génération impression:', error);
      toast.error('❌ Erreur lors de la génération');
    }
  };

  // Pas de produits
  if (!products || products.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-dark-900">🏷️ Imprimer les codes-barres</h3>
            <button onClick={onClose} className="text-dark-700 hover:text-dark-900 font-bold text-lg">✕</button>
          </div>
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-dark-900 mb-2">Aucun produit avec code-barres</h3>
            <p className="text-dark-600 mb-4">Veuillez d'abord ajouter des codes-barres à vos produits.</p>
            <p className="text-sm text-dark-500 mb-6">Pour ajouter un code-barres:</p>
            <ol className="text-sm text-dark-700 space-y-1 mb-6">
              <li>1. Allez dans <strong>Gestion des Produits</strong></li>
              <li>2. Cliquez sur <strong>Modifier</strong> pour un produit</li>
              <li>3. Entrez ou générez un code-barres</li>
              <li>4. Enregistrez les modifications</li>
            </ol>
            <button onClick={onClose} className="px-6 py-2 bg-[#0369a1] hover:bg-[#0284c7] text-white font-medium rounded-lg">Fermer</button>
          </div>
        </div>
      </div>
    );
  }

  // Avec produits - interface principale
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-dark-900">🏷️ Imprimer les codes-barres</h3>
          <button onClick={onClose} className="text-dark-700 hover:text-dark-900 font-bold text-lg">✕</button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900"><strong>📄 Format:</strong> Papier A4 autocollant (3 colonnes × 10 lignes)</p>
            <p className="text-sm text-blue-900 mt-2"><strong>🏷️ Total:</strong> {products.length} étiquette(s) sur {totalPages} page(s)</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-900 mb-2">✅ Étapes d'impression:</p>
            <ol className="text-sm text-green-800 space-y-1">
              <li>1️⃣ Cliquez sur "Ouvrir l'impression"</li>
              <li>2️⃣ Une fenêtre d'impression s'ouvrira automatiquement</li>
              <li>3️⃣ Insérez du papier autocollant A4 dans votre imprimante</li>
              <li>4️⃣ Cliquez sur "Imprimer" dans la fenêtre</li>
              <li>5️⃣ Découpez et collez les étiquettes sur vos produits</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900"><strong>💡 Conseil:</strong> Ajustez la taille de la page à "Adapter à la page" lors de l'impression pour éviter les décalages.</p>
          </div>

          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <p className="text-sm font-semibold text-dark-900 mb-3">Aperçu (premières étiquettes):</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {products.slice(0, 6).map((product, idx) => (
                <div key={idx} className="border border-gray-300 rounded p-2 text-center text-xs bg-white">
                  <p className="font-semibold truncate text-gray-800">{product.name.substring(0, 15)}</p>
                  <p className="text-gray-600 text-6px">[{product.barcode}]</p>
                  {product.price_selling && <p className="font-bold text-red-600">{product.price_selling.toFixed(0)} DH</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 text-dark-900 font-medium rounded-lg hover:bg-gray-50">Annuler</button>
          <button onClick={generatePDF} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center gap-2">
            <span>🖨️</span>
            <span>Ouvrir l'impression</span>
          </button>
        </div>
      </div>
    </div>
  );
}