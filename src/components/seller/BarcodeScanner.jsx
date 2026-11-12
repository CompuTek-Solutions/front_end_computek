import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { AlertTriangle, Camera, Monitor, ScanBarcode, SwitchCamera, X } from 'lucide-react';

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

  const renderCameraPill = (device, label, Icon) => (
    <button
      type="button"
      key={label}
      disabled={!device}
      onClick={() => device && setSelectedCameraId(device.id)}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${
        isCameraOptionActive(device) ? 'bg-white text-dark-900' : 'bg-white/10 text-white hover:bg-white/20'
      }`}
      title={device ? device.label : 'Caméra non disponible'}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[1002] flex items-center justify-center bg-dark-900/80 sm:p-4">
      <div className="flex h-full w-full flex-col overflow-hidden bg-dark-900 text-white sm:h-auto sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="flex items-center gap-2 font-semibold">
            <ScanBarcode className="h-5 w-5" /> Scanner un code
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 inline-flex items-center justify-center rounded-lg hover:bg-white/10"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div id="qr-reader" className="relative flex-1 min-h-[300px] bg-black sm:min-h-[360px] [&>div]:h-full [&>div]:w-full" />

        <div className="space-y-3 px-4 py-4 text-center text-sm">
          {cameras.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {renderCameraPill(quickAccessCameras.back, 'Arrière', Camera)}
              {renderCameraPill(quickAccessCameras.front, 'Avant', SwitchCamera)}
              {renderCameraPill(quickAccessCameras.desktop, 'Webcam', Monitor)}
            </div>
          )}
          {cameras.length > 1 && (
            <select
              className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white"
              aria-label="Choisir une caméra"
              value={selectedCameraId ?? ''}
              onChange={(event) => setSelectedCameraId(event.target.value)}
            >
              {cameras.map((device, index) => (
                <option key={device.id} value={device.id} className="text-dark-900">
                  {device.label || `Caméra ${index + 1}`}
                </option>
              ))}
            </select>
          )}

          {isInitialising && <p className="text-white/70">Initialisation de la caméra…</p>}
          {!isInitialising && isSwitchingCamera && <p className="text-white/70">Changement de caméra…</p>}
          {cameraError && <p className="text-red-300">{cameraError}</p>}
          {!isSecureOrigin && (
            <p className="flex items-start gap-2 text-left text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              La lecture des codes-barres nécessite une connexion sécurisée (https).
            </p>
          )}
          {isSecureOrigin && !supportsLinearCodes && (
            <p className="flex items-start gap-2 text-left text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              Ce navigateur ne lit pas tous les codes-barres. Utilisez Chrome ou Edge récent.
            </p>
          )}
          <p className="text-white/70">Pointez la caméra vers le code-barres ou le QR code.</p>
        </div>
      </div>
    </div>
  );
}
