import React, { useState, useEffect } from 'react';
import { Camera, Plus, Sparkles, X } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { Button, Modal, Select, inputClass as baseInput, labelClass } from '../ui';
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

const inputClass = (hasError) => `${baseInput} ${hasError ? 'border-red-500 bg-red-50' : ''}`;

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
    <Modal
      title={product ? 'Modifier le produit' : 'Nouveau produit'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" form="product-form" loading={loading}>
            {product ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </>
      }
    >
      {showCameraScanner && (
        <BarcodeScanner onDetected={handleCameraScan} onClose={() => setShowCameraScanner(false)} />
      )}

      <form id="product-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
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
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className={labelClass}>Catégorie</label>
            <Select
              value={isCustomCategory ? '__autre__' : formData.category}
              onChange={(e) => {
                const isOther = e.target.value === '__autre__';
                setIsCustomCategory(isOther);
                setFormData((prev) => ({ ...prev, category: isOther ? '' : e.target.value }));
              }}
            >
              <option value="">-- Sélectionner --</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="__autre__">Autre...</option>
            </Select>
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
          <label className={labelClass}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`${inputClass(false)} h-auto py-2 resize-none`}
            rows="2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Prix (FCFA) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              inputMode="numeric"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={inputClass(errors.price)}
              placeholder="0"
              step="1"
              min="0"
            />
            {errors.price && <p className="text-red-600 text-xs mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className={labelClass}>Stock</label>
            <input
              type="number"
              inputMode="numeric"
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
          <label className={labelClass}>
            Codes-barres / QR <span className="font-normal text-dark-500">({codes.length})</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              onKeyDown={handleCodeKeyDown}
              className={`${inputClass(false)} font-mono`}
              placeholder="Saisir ou scanner puis Entrée"
            />
            <Button
              variant="secondary"
              size="icon"
              icon={Plus}
              className="h-10 w-10 shrink-0"
              onClick={() => addCode(codeInput) && setCodeInput('')}
              title="Ajouter le code"
              aria-label="Ajouter le code"
            />
            <Button
              variant="secondary"
              size="icon"
              icon={Camera}
              className="h-10 w-10 shrink-0"
              onClick={() => setShowCameraScanner(true)}
              title="Scanner avec la caméra"
              aria-label="Scanner avec la caméra"
            />
          </div>
          <button
            type="button"
            onClick={generateCode}
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
          >
            <Sparkles className="h-4 w-4" /> Générer un code interne
          </button>

          {codes.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {codes.map((code, index) => (
                <li
                  key={code}
                  className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-full bg-dark-100 text-sm font-mono text-dark-800"
                >
                  {code}
                  {index === 0 && codes.length > 1 && (
                    <span className="text-[10px] uppercase font-sans font-semibold text-primary-700">principal</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeCode(code)}
                    className="h-6 w-6 inline-flex items-center justify-center rounded-full text-dark-500 hover:bg-red-100 hover:text-red-600"
                    aria-label={`Retirer ${code}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {duplicateWarning && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-3">
            <p className="text-sm font-medium text-amber-900">
              Un produit nommé « {duplicateWarning.name} » existe déjà ({formatCurrency(duplicateWarning.price_selling)}).
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="danger"
                size="sm"
                loading={loading}
                onClick={() => {
                  setDuplicateWarning(null);
                  save(buildPayload());
                }}
              >
                Ajouter quand même
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setDuplicateWarning(null)}>
                Modifier
              </Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
