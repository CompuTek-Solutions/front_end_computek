import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import './BarcodeScanner.css';

export default function BarcodeScanner({ onDetected, onClose }) {
  const html5QrcodeRef = useRef(null);
  const lastDetectedCodeRef = useRef('');
  const lastDetectionTimeRef = useRef(0);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [isInitialising, setIsInitialising] = useState(true);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [isSecureOrigin, setIsSecureOrigin] = useState(true);
  const [supportsLinearCodes, setSupportsLinearCodes] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsSecureOrigin(window.isSecureContext);
    setSupportsLinearCodes('BarcodeDetector' in window);
  }, []);

  const pickDefaultCamera = (devices) => {
    const findByKeywords = (keywords) =>
      devices.find((device) =>
        keywords.some((keyword) => device.label?.toLowerCase().includes(keyword))
      );

    return (
      findByKeywords(['back', 'rear', 'arrière', 'environment']) ||
      findByKeywords(['front', 'avant', 'user', 'selfie']) ||
      findByKeywords(['webcam', 'integrated', 'ordinateur', 'facetime']) ||
      devices[0]
    );
  };

  const quickAccessCameras = useMemo(() => {
    const findByKeywords = (keywords) =>
      cameras.find((device) =>
        keywords.some((keyword) => device.label?.toLowerCase().includes(keyword))
      );

    return {
      back: findByKeywords(['back', 'rear', 'arrière', 'environment']),
      front: findByKeywords(['front', 'avant', 'user', 'selfie']),
      desktop: findByKeywords(['webcam', 'integrated', 'ordinateur', 'facetime', 'caméra']),
    };
  }, [cameras]);

  const handleDecodedText = useCallback(
    (decodedText) => {
      const now = Date.now();
      if (decodedText === lastDetectedCodeRef.current && now - lastDetectionTimeRef.current < 300) {
        console.log('Détection en double ignorée');
        return;
      }

      lastDetectedCodeRef.current = decodedText;
      lastDetectionTimeRef.current = now;

      console.log('Code-barres détecté:', decodedText);
      onDetected(decodedText);
    },
    [onDetected]
  );

  const handleScannerError = useCallback((errorMessage) => {
    console.debug('Scanner error:', errorMessage);
  }, []);

  const shutdownScanner = useCallback(async () => {
    const instance = html5QrcodeRef.current;
    if (!instance) return;

    try {
      if (instance.isScanning) {
        await instance.stop();
      }
    } catch (err) {
      console.error('Scanner stop error:', err);
    }

    try {
      instance.clear();
    } catch (err) {
      console.error('Scanner clear error:', err);
    }
  }, []);

  useEffect(() => {
    const qrInstance = new Html5Qrcode('qr-reader');
    html5QrcodeRef.current = qrInstance;

    Html5Qrcode.getCameras()
      .then((devices) => {
        setCameras(devices);
        if (devices.length === 0) {
          setCameraError('Aucune caméra détectée sur cet appareil.');
          return;
        }

        const preferred = pickDefaultCamera(devices);
        setSelectedCameraId(preferred?.id ?? devices[0].id);
      })
      .catch((err) => {
        console.error('Erreur lors de la récupération des caméras', err);
        setCameraError("Impossible d'accéder aux caméras. Vérifiez les permissions.");
      })
      .finally(() => {
        setIsInitialising(false);
      });

    return () => {
      shutdownScanner();
    };
  }, [shutdownScanner]);

  useEffect(() => {
    const instance = html5QrcodeRef.current;
    if (!instance || !selectedCameraId) return;

    let isSubscribed = true;

    const startCamera = async () => {
      setIsSwitchingCamera(true);
      setCameraError('');

      try {
        if (instance.isScanning) {
          await instance.stop();
        }

        await instance.start(
          selectedCameraId,
          {
            fps: 12,
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
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true,
            },
          },
          handleDecodedText,
          handleScannerError
        );
      } catch (err) {
        console.error('Erreur démarrage caméra', err);
        if (isSubscribed) {
          setCameraError('Impossible de démarrer la caméra sélectionnée.');
        }
      } finally {
        if (isSubscribed) {
          setIsSwitchingCamera(false);
        }
      }
    };

    startCamera();

    return () => {
      isSubscribed = false;
    };
  }, [selectedCameraId, handleDecodedText, handleScannerError]);

  const isCameraOptionActive = (device) => device && device.id === selectedCameraId;

  const renderCameraPill = (device, label, icon) => (
    <button
      type="button"
      key={label}
      disabled={!device}
      onClick={() => device && setSelectedCameraId(device.id)}
      className={`camera-pill ${isCameraOptionActive(device) ? 'is-active' : ''}`}
      title={device ? device.label : 'Caméra non disponible'}
    >
      <span className="camera-pill-icon">{icon}</span>
      <span>{label}</span>
    </button>
  );

  const renderCameraOptions = () => {
    if (cameras.length === 0) {
      return null;
    }

    return (
      <>
        <div className="camera-pill-group">
          {renderCameraPill(quickAccessCameras.back, 'Caméra arrière', '📹')}
          {renderCameraPill(quickAccessCameras.front, 'Caméra avant', '🤳')}
          {renderCameraPill(quickAccessCameras.desktop, 'Webcam', '💻')}
        </div>

        {cameras.length > 1 && (
          <select
            className="camera-select"
            aria-label="Choisir une caméra"
            value={selectedCameraId ?? ''}
            onChange={(event) => setSelectedCameraId(event.target.value)}
          >
            {cameras.map((device, index) => (
              <option key={device.id} value={device.id}>
                {device.label || `Caméra ${index + 1}`}
              </option>
            ))}
          </select>
        )}
      </>
    );
  };

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

        <div id="qr-reader" className="scanner-video"></div>

        <div className="scanner-info">
          <div className="camera-switcher">
            <p className="camera-switcher-title">Choisissez la caméra à utiliser</p>
            {renderCameraOptions()}

            {isInitialising && <p className="camera-meta">Initialisation des caméras…</p>}
            {!isInitialising && isSwitchingCamera && <p className="camera-meta">Changement de caméra…</p>}
            {cameraError && <p className="camera-error">{cameraError}</p>}
            {!isSecureOrigin && (
              <p className="camera-warning">
                ⚠️ Le décodage des codes-barres 1D nécessite un contexte sécurisé (HTTPS ou localhost).
                Ouvrez cette page via https:// ou utilisez l'application déployée pour activer la lecture.
              </p>
            )}
            {isSecureOrigin && !supportsLinearCodes && (
              <p className="camera-warning">
                ⚠️ Votre navigateur ne supporte pas encore BarcodeDetector. Essayez avec Chrome/Edge/Opera
                version récente ou activez les flags expérimentaux.
              </p>
            )}
          </div>

          <p>📱 Pointez la caméra sélectionnée sur le code-barres</p>
          <p>L'article sera automatiquement ajouté au panier</p>
        </div>
      </div>
    </div>
  );
}
