import React, { useState, useEffect, useRef } from 'react';
import { useProductStore } from '../../store/productStore';
import { validateProduct } from '../../utils/validation';
import { generateBarcode } from '../../utils/barcodeUtils';
import { toast } from 'react-hot-toast';
import BarcodeScanner from '../seller/BarcodeScanner';

const PRODUCT_CATEGORIES = [
  'Réseau informatique',
  'Matériel informatique',
  'Câble et connectique',
  'Sécurité électronique',
  'Sécurité électrique',
];

export default function ProductForm({ product, onClose }) {
  const { addProduct, updateProduct, inventory } = useProductStore();
  const [formData, setFormData] = useState(
    product ? {
      name: product.name || '',
      description: product.description || '',
      price: String(product.price_selling || product.price || ''),
      category: product.category || '',
      barcode: product.barcode || '',
      quantity: '',
    } : {
      name: '',
      description: '',
      price: '',
      category: '',
      barcode: '',
      quantity: '',
    }
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeConfirmed, setBarcodeConfirmed] = useState(!!product);
  const [barcodeMode, setBarcodeMode] = useState('manual');
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [hasBarcode, setHasBarcode] = useState(product ? (product.barcode ? true : false) : null);
  const initialIsCustom = product?.category
    ? !PRODUCT_CATEGORIES.includes(product.category)
    : false;
  const [isCustomCategory, setIsCustomCategory] = useState(initialIsCustom);
  const barcodeInputRef = useRef(null);

  // Charger la quantité depuis l'inventaire si c'est une modification
  useEffect(() => {
    if (product && product.id && inventory.length > 0) {
      const inventoryItem = inventory.find((i) => i.product_id === product.id);
      if (inventoryItem) {
        setFormData((prev) => ({
          ...prev,
          quantity: String(inventoryItem.quantity_on_hand || 0),
        }));
      }
    }
  }, [product, inventory]);

  const handleCameraScan = (code) => {
    const trimmed = (code || '').trim();
    if (!trimmed) return;
    setFormData((prev) => ({ ...prev, barcode: trimmed }));
    setBarcodeInput(trimmed);
    setBarcodeConfirmed(true);
    setShowCameraScanner(false);
    toast.success('Code-barres scanné : ' + trimmed);
  };

  // Gérer le scan du code-barres
  const handleBarcodeInput = (e) => {
    const value = e.target.value;
    setBarcodeInput(value);
    // Mettre à jour le barcode directement dans formData, peu importe la longueur
    setFormData((prev) => ({
      ...prev,
      barcode: value,
    }));
  };

  const handleBarcodeKeyDown = (e) => {
    // Quand l'utilisateur appuie sur Entrée après scanner
    if (e.key === 'Enter') {
      e.preventDefault();
      if (barcodeInput.trim().length > 0) {
        setFormData((prev) => ({
          ...prev,
          barcode: barcodeInput.trim(),
        }));
        setBarcodeConfirmed(true);
        setBarcodeInput('');
        // Focus sur le champ nom après scan
        document.querySelector('input[name="name"]')?.focus();
        toast.success('Code-barres scanné avec succès! Entrez maintenant le nom du produit.');
      } else {
        toast.error('Le code-barres ne peut pas être vide');
        setBarcodeInput('');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const generateRandomBarcode = () => {
    const barcode = 'COMP' + Date.now().toString().slice(-8);
    setFormData((prev) => ({
      ...prev,
      barcode,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateProduct(formData, { requireBarcode: hasBarcode !== false });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category || null,
        barcode: formData.barcode || null,
        price_selling: parseFloat(formData.price),
      };

      if (product) {
        // Modification de produit existant
        await updateProduct(product.id, productData);
        
        // Mise à jour de la quantité si elle a changé
        const quantity = parseInt(formData.quantity) || 0;
        const currentInventory = inventory.find((i) => i.product_id === product.id);
        const currentQuantity = currentInventory?.quantity_on_hand || 0;
        
        if (quantity !== currentQuantity) {
          const { updateInventoryQuantity } = useProductStore.getState();
          await updateInventoryQuantity({
            product_id: product.id,
            quantity_on_hand: quantity,
          }).catch((err) => {
            console.error('Erreur mise à jour inventaire:', err);
            // Continuer même si la mise à jour d'inventaire échoue
          });
        }
        toast.success('Produit mis à jour avec succès!');
      } else {
        // Création de nouveau produit
        const newProduct = await addProduct(productData);
        
        // Créer l'entrée inventaire avec la quantité
        const quantity = parseInt(formData.quantity) || 0;
        if (quantity > 0) {
          const { updateInventoryQuantity } = useProductStore.getState();
          try {
            await updateInventoryQuantity({
              product_id: newProduct.id,
              quantity_on_hand: quantity,
            });
          } catch (err) {
            console.error('Erreur création inventaire:', err);
            // Le backend devrait créer une entrée inventaire par défaut
          }
        }
        toast.success('Produit ajouté avec succès!');
      }

      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Une erreur est survenue');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between bg-[#0369a1] px-6 py-4 border-b border-[#075985]">
          <h3 className="text-xl font-bold text-white">
            {product ? '✏️ Modifier le produit' : '➕ Ajouter un nouveau produit'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors font-bold text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Barcode Scanner - First Step */}
          {!barcodeConfirmed && !product && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6">
              <div className="text-center mb-5">
                <span className="text-4xl">📱</span>
                <h3 className="text-lg font-bold text-dark-900 mt-2">Étape 1 : Code-barres du produit</h3>
                <p className="text-sm text-dark-600 mt-1">Ce produit a-t-il un code-barres ?</p>
              </div>

              {/* Choose barcode option */}
              {hasBarcode === null && (
                <div className="flex gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => setHasBarcode(true)}
                    className="flex flex-col items-center gap-2 px-6 py-4 bg-white border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 rounded-xl font-medium transition-all text-dark-700 min-w-[140px] shadow-sm"
                  >
                    <span className="text-3xl">🔖</span>
                    <span>Avec code-barres</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setHasBarcode(false); setBarcodeConfirmed(true); }}
                    className="flex flex-col items-center gap-2 px-6 py-4 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl font-medium transition-all text-dark-700 min-w-[140px] shadow-sm"
                  >
                    <span className="text-3xl">🚫</span>
                    <span>Sans code-barres</span>
                  </button>
                </div>
              )}

              {/* Barcode input - shown after choosing "Avec code-barres" */}
              {hasBarcode === true && (
                <>
                  {/* Toggle mode */}
                  <div className="flex gap-2 justify-center mb-4">
                    <button
                      type="button"
                      onClick={() => { setBarcodeMode('manual'); setShowCameraScanner(false); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        barcodeMode === 'manual'
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-white border border-gray-300 text-dark-700 hover:bg-gray-50'
                      }`}
                    >
                      ⌨️ Saisie manuelle
                    </button>
                    <button
                      type="button"
                      onClick={() => { setBarcodeMode('camera'); setShowCameraScanner(true); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        barcodeMode === 'camera'
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-white border border-gray-300 text-dark-700 hover:bg-gray-50'
                      }`}
                    >
                      📷 Scanner caméra
                    </button>
                  </div>

                  {barcodeMode === 'manual' && (
                    <>
                      <input
                        ref={barcodeInputRef}
                        type="text"
                        value={barcodeInput}
                        onChange={handleBarcodeInput}
                        onKeyDown={handleBarcodeKeyDown}
                        autoFocus
                        className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono bg-white"
                        placeholder="Tapez ou scannez le code-barres..."
                      />
                      <p className="text-xs text-dark-500 text-center mt-3">
                        Appuyez sur <kbd className="bg-gray-200 px-1 rounded">Entrée</kbd> pour confirmer
                      </p>
                    </>
                  )}

                  {barcodeMode === 'camera' && !showCameraScanner && (
                    <div className="text-center mt-2">
                      <button
                        type="button"
                        onClick={() => setShowCameraScanner(true)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                      >
                        📷 Ouvrir la caméra
                      </button>
                    </div>
                  )}

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setHasBarcode(null)}
                      className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      ← Retour
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Camera Scanner overlay */}
          {showCameraScanner && (
            <BarcodeScanner
              onDetected={handleCameraScan}
              onClose={() => { setShowCameraScanner(false); setBarcodeMode('manual'); }}
            />
          )}

          {/* Badge : Sans code-barres */}
          {barcodeConfirmed && product && !product.barcode && (
            <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 flex items-center gap-3">
              <span className="text-2xl">🏷️</span>
              <div>
                <p className="font-semibold text-orange-900">Sans code-barres</p>
                <p className="text-sm text-orange-700">Ce produit est enregistré sans code-barres</p>
              </div>
              <button
                type="button"
                onClick={() => { setHasBarcode(true); setBarcodeConfirmed(false); }}
                className="ml-auto text-sm px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors"
              >
                Ajouter un code-barres
              </button>
            </div>
          )}

          {/* Badge : Sans code-barres */}
          {barcodeConfirmed && !product && hasBarcode === false && (
            <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 flex items-center gap-3">
              <span className="text-2xl">🏷️</span>
              <div>
                <p className="font-semibold text-orange-900">Sans code-barres</p>
                <p className="text-sm text-orange-700">Ce produit sera enregistré sans code-barres</p>
              </div>
              <button
                type="button"
                onClick={() => { setHasBarcode(null); setBarcodeConfirmed(false); }}
                className="ml-auto text-sm px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors"
              >
                Changer
              </button>
            </div>
          )}

          {/* Confirmation du Code-barres */}
          {barcodeConfirmed && formData.barcode && (
            <div className="bg-green-50 border border-green-300 rounded-lg p-4 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-green-900">Code-barres scanné</p>
                <p className="text-sm text-green-800 font-mono">{formData.barcode}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, barcode: '' }));
                  setBarcodeInput('');
                  setBarcodeConfirmed(false);
                  barcodeInputRef.current?.focus();
                }}
                className="ml-auto text-sm px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
              >
                Changer
              </button>
            </div>
          )}

          {barcodeConfirmed && (
            <>
              <div className="border-t-2 border-gray-200 pt-4">
                <h3 className="text-lg font-bold text-dark-900 mb-4">Étape 2: Informations du produit</h3>
              </div>

          {/* Name and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">
                Nom du produit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-dark-900 ${
                  errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Ex: Laptop Dell"
              />
              {errors.name && <span className="text-red-500 text-sm mt-1 block">{errors.name}</span>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">Catégorie</label>
              <select
                name="category"
                value={isCustomCategory ? '__autre__' : (formData.category || '')}
                onChange={(e) => {
                  if (e.target.value === '__autre__') {
                    setIsCustomCategory(true);
                    setFormData((prev) => ({ ...prev, category: '' }));
                  } else {
                    setIsCustomCategory(false);
                    setFormData((prev) => ({ ...prev, category: e.target.value }));
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-dark-900"
              >
                <option value="">-- Sélectionner une catégorie --</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__autre__">Autre...</option>
              </select>
              {isCustomCategory && (
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-dark-900"
                  placeholder="Entrez la catégorie..."
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-dark-900 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Description du produit..."
              rows="3"
            />
          </div>

          {/* Price and Quantity Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">
                Prix de vente <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.price && <span className="text-red-500 text-sm mt-1 block">{errors.price}</span>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">📦 Quantité stock</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-dark-900"
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
          </div>
            </>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-dark-900 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#0369a1] hover:bg-[#0284c7] text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  En cours...
                </>
              ) : product ? (
                'Mettre à jour'
              ) : (
                'Ajouter'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
