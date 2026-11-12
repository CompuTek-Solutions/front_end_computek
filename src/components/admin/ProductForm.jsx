import React, { useState, useEffect } from 'react';
import { useProductStore } from '../../store/productStore';
import { validateProduct } from '../../utils/validation';
import { formatCurrency, getProductCodes } from '../../utils/helpers';
import { toast } from 'react-hot-toast';
import BarcodeScanner from '../seller/BarcodeScanner';

const PRODUCT_CATEGORIES = [
  'Réseau informatique',
  'Matériel informatique',
  'Câble et connectique',
  'Sécurité électronique',
  'Sécurité électrique',
];

const inputClass = (hasError) =>
  `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-dark-900 ${
    hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
  }`;

export default function ProductForm({ product, onClose }) {
  const { addProduct, updateProduct, updateInventoryQuantity, inventory, checkProductExists } = useProductStore();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product ? String(product.price_selling ?? '') : '',
    category: product?.category || '',
    quantity: '',
  });
  const [codes, setCodes] = useState(() => (product ? getProductCodes(product) : []));
  const [codeInput, setCodeInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(
    Boolean(product?.category) && !PRODUCT_CATEGORIES.includes(product.category)
  );

  useEffect(() => {
    if (!product?.id) return;
    const inventoryItem = inventory.find((i) => i.product_id === product.id);
    if (inventoryItem) {
      setFormData((prev) => ({ ...prev, quantity: String(inventoryItem.quantity_on_hand ?? 0) }));
    }
  }, [product, inventory]);

  const addCode = (raw) => {
    const code = (raw || '').trim();
    if (!code) return false;
    if (code.length > 100) {
      toast.error('Code trop long (100 caractères max)');
      return false;
    }
    if (codes.some((c) => c.toUpperCase() === code.toUpperCase())) {
      toast.error(`Le code "${code}" est déjà dans la liste`);
      return false;
    }
    setCodes((prev) => [...prev, code]);
    return true;
  };

  const handleCodeKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (addCode(codeInput)) setCodeInput('');
    }
  };

  const handleCameraScan = (code) => {
    if (addCode(code)) toast.success(`Code ajouté : ${code.trim()}`);
    setShowCameraScanner(false);
  };

  const removeCode = (code) => setCodes((prev) => prev.filter((c) => c !== code));

  const generateCode = () => {
    addCode('COMP' + Date.now().toString().slice(-8));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const buildPayload = () => {
    const pending = codeInput.trim();
    const allCodes =
      pending && !codes.some((c) => c.toUpperCase() === pending.toUpperCase())
        ? [...codes, pending]
        : codes;
    return {
      name: formData.name.trim(),
      description: formData.description || null,
      category: formData.category || null,
      barcodes: allCodes,
      price_selling: parseFloat(formData.price),
      quantity_on_hand: parseInt(formData.quantity, 10) || 0,
    };
  };

  const save = async (payload) => {
    setLoading(true);
    try {
      if (product) {
        const { quantity_on_hand, ...productData } = payload;
        await updateProduct(product.id, productData);
        const currentQuantity = inventory.find((i) => i.product_id === product.id)?.quantity_on_hand ?? 0;
        if (quantity_on_hand !== currentQuantity) {
          await updateInventoryQuantity({ product_id: product.id, quantity_on_hand });
        }
        toast.success('Produit mis à jour');
      } else {
        await addProduct(payload);
        toast.success('Produit ajouté');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateProduct(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const payload = buildPayload();

    if (!product) {
      setLoading(true);
      try {
        const duplicate = await checkProductExists(payload.name);
        if (duplicate.exists) {
          setDuplicateWarning(duplicate.product);
          return;
        }
      } catch {
        toast.error('Erreur lors de la vérification des doublons');
        return;
      } finally {
        setLoading(false);
      }
    }

    await save(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[#0369a1] px-6 py-4 border-b border-[#075985]">
          <h3 className="text-xl font-bold text-white">
            {product ? 'Modifier le produit' : 'Nouveau produit'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors font-bold text-lg leading-none"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {showCameraScanner && (
          <BarcodeScanner onDetected={handleCameraScan} onClose={() => setShowCameraScanner(false)} />
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                className={inputClass(errors.name)}
                placeholder="Ex : Laptop Dell"
                autoFocus
              />
              {errors.name && <span className="text-red-500 text-sm mt-1 block">{errors.name}</span>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">Catégorie</label>
              <select
                value={isCustomCategory ? '__autre__' : formData.category}
                onChange={(e) => {
                  const isOther = e.target.value === '__autre__';
                  setIsCustomCategory(isOther);
                  setFormData((prev) => ({ ...prev, category: isOther ? '' : e.target.value }));
                }}
                className={inputClass(false)}
              >
                <option value="">-- Sélectionner --</option>
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
                  className={`${inputClass(false)} mt-2`}
                  placeholder="Nom de la catégorie"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-900 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`${inputClass(false)} resize-none`}
              rows="2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">
                Prix de vente (FCFA) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={inputClass(errors.price)}
                placeholder="0"
                step="1"
                min="0"
              />
              {errors.price && <span className="text-red-500 text-sm mt-1 block">{errors.price}</span>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">Quantité en stock</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className={inputClass(false)}
                placeholder="0"
                min="0"
                step="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-900 mb-2">
              Codes-barres / QR <span className="font-normal text-dark-500">({codes.length})</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyDown={handleCodeKeyDown}
                className={`${inputClass(false)} font-mono`}
                placeholder="Saisir ou scanner un code puis Entrée"
              />
              <button
                type="button"
                onClick={() => addCode(codeInput) && setCodeInput('')}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                title="Ajouter le code"
              >
                ➕
              </button>
              <button
                type="button"
                onClick={() => setShowCameraScanner(true)}
                className="px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg"
                title="Scanner avec la caméra"
              >
                📷
              </button>
              <button
                type="button"
                onClick={generateCode}
                className="px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm whitespace-nowrap"
                title="Générer un code interne"
              >
                Générer
              </button>
            </div>

            {codes.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {codes.map((code, index) => (
                  <li
                    key={code}
                    className="inline-flex items-center gap-2 pl-3 pr-1 py-1 rounded-full bg-gray-100 border border-gray-200 text-sm font-mono"
                  >
                    {code}
                    {index === 0 && codes.length > 1 && (
                      <span className="text-[10px] uppercase font-sans text-primary-700">principal</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeCode(code)}
                      className="w-6 h-6 rounded-full hover:bg-red-100 text-red-600 leading-none"
                      aria-label={`Retirer ${code}`}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-dark-500">Aucun code : le produit pourra être ajouté par recherche.</p>
            )}
          </div>

          {duplicateWarning && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 space-y-3">
              <p className="font-semibold text-red-900">
                Un produit nommé « {duplicateWarning.name} » existe déjà
                {' '}({formatCurrency(duplicateWarning.price_selling)}).
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDuplicateWarning(null);
                    save(buildPayload());
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  Ajouter quand même
                </button>
                <button
                  type="button"
                  onClick={() => setDuplicateWarning(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg"
                >
                  Modifier
                </button>
              </div>
            </div>
          )}

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
              className="px-6 py-2 bg-[#0369a1] hover:bg-[#0284c7] text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'En cours...' : product ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
