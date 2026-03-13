import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import './BarcodeScanner.css';

export default function BarcodeScanner({ onDetected, onClose }) {
  const scannerRef = useRef(null);
  const html5QrcodeScanner = useRef(null);
  const [lastDetectedCode, setLastDetectedCode] = useState('');
  const [lastDetectionTime, setLastDetectionTime] = useState(0);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        rememberLastUsedCamera: true,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.ITF,
        ],
      },
      false
    );

    html5QrcodeScanner.current = scanner;

    scanner.render(
      (decodedText) => {
        // Éviter les détections en double rapides (moins de 300ms)
        const now = Date.now();
        if (decodedText === lastDetectedCode && now - lastDetectionTime < 300) {
          console.log('Détection en double ignorée');
          return;
        }

        setLastDetectedCode(decodedText);
        setLastDetectionTime(now);
        
        console.log('Code-barres détecté:', decodedText);
        onDetected(decodedText);
      },
      (errorMessage) => {
        console.debug('Scanner error:', errorMessage);
      }
    );

    return () => {
      if (html5QrcodeScanner.current) {
        try {
          html5QrcodeScanner.current.clear();
        } catch (err) {
          console.error('Scanner cleanup error:', err);
        }
      }
    };
  }, [onDetected]);

  return (
    <div className="barcode-scanner-overlay">
      <div className="barcode-scanner-container">
        <div className="scanner-header">
          <h3>Scanner Code-barres</h3>
          <button type="button" className="close-btn" onClick={onClose} title="Fermer">
            <span className="close-btn-icon">✕</span>
            <span className="close-btn-text">Fermer</span>
          </button>
        </div>

        <div id="qr-reader" ref={scannerRef} className="scanner-video"></div>

        <div className="scanner-info">
          <p>📱 Pointez la caméra sur le code-barres</p>
          <p>L'article sera automatiquement ajouté au panier</p>
        </div>
      </div>
    </div>
  );
}
