import JsBarcode from 'jsbarcode';

export const generateBarcode = (value, elementId) => {
  try {
    JsBarcode(`#${elementId}`, value, {
      format: 'CODE128',
      width: 2,
      height: 50,
      displayValue: true,
    });
  } catch (error) {
    console.error('Erreur lors de la génération du code-barres:', error);
  }
};

export const downloadBarcode = (value, filename) => {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, value, {
    format: 'CODE128',
    width: 2,
    height: 100,
    displayValue: true,
  });

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `${filename}-barcode.png`;
  link.click();
};

export const printBarcode = (value, label = '') => {
  const printWindow = window.open('', '', 'width=400,height=300');
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, value, {
    format: 'CODE128',
    width: 2,
    height: 100,
    displayValue: true,
  });

  printWindow.document.write(`
    <html>
      <head>
        <title>Imprimer Code-barres</title>
        <style>
          body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; }
          img { margin: 20px 0; }
          p { font-size: 14px; }
        </style>
      </head>
      <body>
        <p><strong>${label}</strong></p>
        <img src="${canvas.toDataURL('image/png')}" />
      </body>
    </html>
  `);
  printWindow.print();
};
