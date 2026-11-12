import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useProductStore } from '../../store/productStore';
import BarcodeScanner from '../../components/seller/BarcodeScanner';
import ClientPicker from '../../components/seller/ClientPicker';
import { printInvoice, formatCurrency, normalizeForSearch, getProductCodes, productMatchesSearch } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  Camera, CheckCircle2, ChevronLeft, ChevronRight, Minus, Package, Plus, ScanBarcode, ShoppingCart,
  Trash2, X,
} from 'lucide-react';
import { Badge, Button, EmptyState, Modal, SearchInput, inputClass, labelClass } from '../../components/ui';

export default function SellerNewSale() {
  const { products, addSale, addClient, fetchProducts, fetchInventory, getInventoryQuantity, getProductByBarcode } = useProductStore();
  const [cartItems, setCartItems] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discountAmountInput, setDiscountAmountInput] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    rccm: '',
    postal_box: '',
    nc: '',
  });
  const [lastScannedBarcode, setLastScannedBarcode] = useState('');
  const [lastScanTime, setLastScanTime] = useState(0);
  const [posBarcode, setPosBarcode] = useState('');
  const [showProductPanel, setShowProductPanel] = useState(false);
  const [productPage, setProductPage] = useState(0);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const barcodeFieldRef = useRef(null);

  const PRODUCTS_PER_PAGE = 18;

  const focusBarcodeField = useCallback(() => {
    setTimeout(() => barcodeFieldRef.current?.focus(), 80);
  }, []);

  useEffect(() => {
    fetchProducts().catch(() => {});
  }, [fetchProducts]);

  useEffect(() => {
    fetchInventory().catch(() => {});
  }, [fetchInventory]);

  const addToCart = useCallback((product, quantity = 1) => {
    const stock = getInventoryQuantity(product.id);
    if (stock <= 0) {
      toast.error('Rupture de stock pour ce produit');
      return;
    }
    const qty = Math.min(Math.max(1, quantity), stock);
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id);
      const maxStock = getInventoryQuantity(product.id);
      if (existingItem) {
        const newQty = Math.min(existingItem.quantity + qty, maxStock);
        if (newQty <= 0) return prevItems;
        return prevItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQty, total: item.price * newQty }
            : item
        );
      }
      const price = Number(product.price_selling) || 0;
      return [
        ...prevItems,
        {
          productId: product.id,
          name: product.name,
          price,
          quantity: qty,
          total: price * qty,
        },
      ];
    });
    setShowScanner(false);
    toast.success(`${product.name} ajouté`, { id: 'cart-add', duration: 1500 });
  }, [getInventoryQuantity]);

  const addProductByBarcode = useCallback(async (rawBarcode) => {
    const barcode = (rawBarcode || '').trim().toUpperCase();
    if (!barcode) return;

    const now = Date.now();
    if (barcode === lastScannedBarcode && now - lastScanTime < 500) return;
    setLastScannedBarcode(barcode);
    setLastScanTime(now);

    let product = products.find((p) =>
      getProductCodes(p).some((code) => code.trim().toUpperCase() === barcode)
    );

    if (!product) {
      try {
        product = await getProductByBarcode(barcode);
      } catch {
        toast.error(`Aucun produit pour le code "${barcode}"`);
        return;
      }
    }

    addToCart(product, 1);
  }, [products, addToCart, getProductByBarcode, lastScannedBarcode, lastScanTime]);

  const resetSale = () => {
    setCartItems([]);
    setDiscountAmountInput('');
    setNotes('');
    setPaymentMethod('cash');
    setSelectedClient(null);
  };

  const handleCompleteSale = async () => {
    if (cartItems.length === 0) {
      toast.error('Veuillez ajouter au moins un article');
      return;
    }
    for (const item of cartItems) {
      const stock = getInventoryQuantity(item.productId);
      if (item.quantity > stock) {
        toast.error(`Stock insuffisant pour "${item.name}". Disponible : ${stock}`);
        return;
      }
    }

    const sale = {
      items: cartItems,
      discount: discountAmount,
      paymentMethod,
      notes,
      client_id: selectedClient?.id || null,
    };

    setIsGeneratingInvoice(true);
    try {
      const created = await addSale(sale);
      fetchInventory().catch(() => {});
      printInvoice({
        ...created,
        subtotal,
        discount_percent: derivedDiscountPercent,
        client: selectedClient,
        items: cartItems.map((i) => ({ name: i.name, quantity: i.quantity, unit_price: i.price, subtotal: i.total })),
      });
      toast.success('Vente enregistrée');
      resetSale();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de l'enregistrement de la vente");
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const openNewClient = (term = '') => {
    const value = term.trim();
    const field = value.includes('@') ? 'email' : /^[+\d\s().-]{6,}$/.test(value) ? 'phone' : 'name';
    setNewClient({ name: '', email: '', phone: '', address: '', rccm: '', postal_box: '', nc: '', [field]: value });
    setShowNewClient(true);
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newClient.name.trim()) {
      toast.error('Le nom du client est requis');
      return;
    }
    setIsAddingClient(true);
    try {
      const created = await addClient(newClient);
      setSelectedClient(created);
      setShowNewClient(false);
      setNewClient({ name: '', email: '', phone: '', address: '', rccm: '', postal_box: '', nc: '' });
      toast.success('Client ajouté');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'ajout du client');
    } finally {
      setIsAddingClient(false);
    }
  };

  const filteredProducts = useMemo(
    () => {
      const normalizedSearchTerm = normalizeForSearch(searchTerm);
      return products.filter((product) => productMatchesSearch(product, normalizedSearchTerm));
    },
    [products, searchTerm]
  );

  useEffect(() => {
    setProductPage(0);
  }, [searchTerm]);

  const totalProductPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(
    () => filteredProducts.slice(productPage * PRODUCTS_PER_PAGE, (productPage + 1) * PRODUCTS_PER_PAGE),
    [filteredProducts, productPage, PRODUCTS_PER_PAGE]
  );

  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const numericAmount = Math.max(0, parseFloat(discountAmountInput));
  const discountAmount = Math.min(Number.isFinite(numericAmount) ? numericAmount : 0, subtotal);
  const derivedDiscountPercent = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0;
  const total = subtotal - discountAmount;

  const updateCartQty = (productId, quantity) => {
    const maxQty = getInventoryQuantity(productId);
    const clamped = quantity === 0 ? 0 : Math.min(Math.max(1, quantity), maxQty);
    setCartItems((prev) =>
      clamped === 0
        ? prev.filter((item) => item.productId !== productId)
        : prev.map((item) =>
            item.productId === productId
              ? { ...item, quantity: clamped, total: item.price * clamped }
              : item
          )
    );
  };

  const handlePosBarcodeKey = async (e) => {
    if (e.key === 'Enter') {
      const val = posBarcode.trim();
      if (!val) return;
      await addProductByBarcode(val);
      setPosBarcode('');
      focusBarcodeField();
    }
  };

  const handleCameraScan = async (code) => {
    await addProductByBarcode(code);
    setShowScanner(false);
    focusBarcodeField();
  };

  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const emptyClient = { name: '', email: '', phone: '', address: '', rccm: '', postal_box: '', nc: '' };

  const qtyControl = (item, size = 'h-8 w-8') => (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => updateCartQty(item.productId, item.quantity - 1)}
        className={`${size} inline-flex items-center justify-center rounded-lg bg-dark-100 hover:bg-dark-200 text-dark-700`}
        aria-label="Diminuer"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min="1"
        max={getInventoryQuantity(item.productId)}
        value={item.quantity}
        onChange={(e) => updateCartQty(item.productId, parseInt(e.target.value, 10) || 1)}
        className="h-8 w-12 rounded-lg border border-dark-200 text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label={`Quantité de ${item.name}`}
      />
      <button
        type="button"
        onClick={() => updateCartQty(item.productId, item.quantity + 1)}
        className={`${size} inline-flex items-center justify-center rounded-lg bg-dark-100 hover:bg-dark-200 text-dark-700`}
        aria-label="Augmenter"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );

  const removeButton = (item) => (
    <button
      type="button"
      onClick={() => updateCartQty(item.productId, 0)}
      className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-dark-400 hover:bg-red-50 hover:text-red-600"
      aria-label={`Retirer ${item.name}`}
    >
      <X className="h-4 w-4" />
    </button>
  );

  const totals = (
    <div className="space-y-1 text-sm">
      <div className="flex justify-between text-dark-600">
        <span>Sous-total</span>
        <span className="font-medium">{formatCurrency(subtotal)}</span>
      </div>
      {discountAmount > 0 && (
        <div className="flex justify-between text-amber-700">
          <span>Remise ({derivedDiscountPercent.toFixed(1)} %)</span>
          <span className="font-medium">−{formatCurrency(discountAmount)}</span>
        </div>
      )}
      <div className="flex justify-between pt-1 border-t border-dark-200 text-lg font-bold text-dark-900">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );

  const completeSale = async () => {
    if (isGeneratingInvoice || showNewClient) return;
    await handleCompleteSale();
    setShowCheckout(false);
    focusBarcodeField();
  };

  const completeSaleRef = useRef(completeSale);
  useEffect(() => {
    completeSaleRef.current = completeSale;
  });

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'F9') return;
      e.preventDefault();
      completeSaleRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const checkoutFields = (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>Remise (FCFA)</label>
        <input
          type="number"
          inputMode="numeric"
          value={discountAmountInput}
          onChange={(e) => setDiscountAmountInput(e.target.value)}
          className={inputClass}
          min="0"
          placeholder="0"
        />
      </div>

      <div>
        <label className={labelClass}>Mode de paiement</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'cash', label: 'Espèces' },
            { value: 'paiement_marchand', label: 'Paiement marchand' },
          ].map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setPaymentMethod(m.value)}
              className={`h-10 rounded-lg border px-2 text-sm font-medium transition-colors ${
                paymentMethod === m.value
                  ? 'border-primary-700 bg-primary-50 text-primary-800 ring-1 ring-primary-700'
                  : 'border-dark-200 bg-white text-dark-700 hover:bg-dark-50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Client</label>
        <ClientPicker value={selectedClient} onChange={setSelectedClient} onCreate={openNewClient} />
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${inputClass} h-auto py-2 resize-none`}
          rows="2"
        />
      </div>
    </div>
  );

  const validateButton = (
    <Button
      variant="success"
      size="lg"
      icon={CheckCircle2}
      loading={isGeneratingInvoice}
      disabled={cartItems.length === 0}
      onClick={completeSale}
      className="w-full"
    >
      Valider la vente
      <kbd className="hidden md:inline rounded bg-white/20 px-1.5 py-0.5 text-xs font-semibold">F9</kbd>
    </Button>
  );

  return (
    <div className="flex flex-col h-full">
      {showScanner && (
        <BarcodeScanner
          onDetected={handleCameraScan}
          onClose={() => { setShowScanner(false); focusBarcodeField(); }}
        />
      )}

      <div className="shrink-0 bg-white border-b border-dark-200 px-3 sm:px-6 py-3 flex items-center gap-2">
        <Button icon={Camera} onClick={() => setShowScanner(true)} className="shrink-0" aria-label="Scanner avec la caméra">
          <span className="hidden sm:inline">Caméra</span>
        </Button>
        <div className="relative flex-1 min-w-0">
          <ScanBarcode className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
          <input
            ref={barcodeFieldRef}
            type="text"
            value={posBarcode}
            onChange={(e) => setPosBarcode(e.target.value)}
            onKeyDown={handlePosBarcodeKey}
            autoFocus
            placeholder="Scanner ou saisir un code…"
            className={`${inputClass} pl-9 font-mono`}
          />
        </div>
        <Button
          variant={showProductPanel ? 'primary' : 'secondary'}
          icon={Package}
          onClick={() => setShowProductPanel((v) => !v)}
          className="shrink-0"
          aria-label="Chercher un produit"
        >
          <span className="hidden sm:inline">Produits</span>
        </Button>
      </div>

      {showProductPanel && (
        <div className="shrink-0 bg-white border-b border-dark-200 px-3 sm:px-6 py-3 space-y-3 max-h-[45vh] overflow-y-auto">
          <SearchInput
            placeholder="Rechercher par nom ou code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2">
            {paginatedProducts.map((product) => {
              const stock = getInventoryQuantity(product.id);
              const outOfStock = stock <= 0;
              return (
                <button
                  key={product.id}
                  type="button"
                  disabled={outOfStock}
                  onClick={() => { addToCart(product, 1); focusBarcodeField(); }}
                  className="flex flex-col items-start rounded-lg border border-dark-200 p-3 text-left transition-colors hover:border-primary-400 hover:bg-primary-50 disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-dark-200"
                >
                  <p className="text-sm font-medium text-dark-900 leading-tight line-clamp-2">{product.name}</p>
                  <p className="mt-1 text-sm font-bold text-primary-700">{formatCurrency(product.price_selling)}</p>
                  <p className={`text-xs font-medium ${outOfStock ? 'text-red-600' : 'text-dark-500'}`}>
                    {outOfStock ? 'Rupture' : `Stock : ${stock}`}
                  </p>
                </button>
              );
            })}
            {filteredProducts.length === 0 && (
              <p className="col-span-full py-4 text-center text-sm text-dark-500">Aucun produit trouvé</p>
            )}
          </div>
          {totalProductPages > 1 && (
            <div className="flex items-center justify-between text-sm text-dark-600">
              <Button
                variant="secondary"
                size="icon"
                icon={ChevronLeft}
                onClick={() => setProductPage((p) => Math.max(0, p - 1))}
                disabled={productPage === 0}
                aria-label="Page précédente"
              />
              <span>{productPage + 1} / {totalProductPages}</span>
              <Button
                variant="secondary"
                size="icon"
                icon={ChevronRight}
                onClick={() => setProductPage((p) => Math.min(totalProductPages - 1, p + 1))}
                disabled={productPage >= totalProductPages - 1}
                aria-label="Page suivante"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col md:flex-row">
        <section className="flex-1 min-w-0 min-h-0 flex flex-col bg-white">
          <header className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-dark-200">
            <h2 className="font-semibold text-dark-900">Panier</h2>
            <div className="flex items-center gap-2">
              <Badge tone="primary">{itemCount} article(s)</Badge>
              {cartItems.length > 0 && (
                <Button variant="danger-ghost" size="sm" icon={Trash2} onClick={() => { resetSale(); focusBarcodeField(); }}>
                  <span className="hidden sm:inline">Vider</span>
                </Button>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <EmptyState icon={ShoppingCart} title="Panier vide" description="Scannez un code ou cherchez un produit." />
            ) : (
              <>
                <ul className="md:hidden divide-y divide-dark-100">
                  {cartItems.map((item) => (
                    <li key={item.productId} className="p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-dark-900">{item.name}</p>
                          <p className="text-xs text-dark-500">{formatCurrency(item.price)} / unité</p>
                        </div>
                        {removeButton(item)}
                      </div>
                      <div className="flex items-center justify-between">
                        {qtyControl(item, 'h-9 w-9')}
                        <p className="font-bold text-dark-900">{formatCurrency(item.total)}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <table className="hidden md:table w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-200 bg-dark-50 text-left text-xs font-semibold uppercase tracking-wide text-dark-500">
                      <th className="py-2.5 px-4">Désignation</th>
                      <th className="py-2.5 px-4 text-right">P.U.</th>
                      <th className="py-2.5 px-4 text-center">Qté</th>
                      <th className="py-2.5 px-4 text-right">Total</th>
                      <th className="py-2.5 px-2 w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-100">
                    {cartItems.map((item) => (
                      <tr key={item.productId}>
                        <td className="py-2.5 px-4 font-medium text-dark-900">{item.name}</td>
                        <td className="py-2.5 px-4 text-right text-dark-600 whitespace-nowrap">{formatCurrency(item.price)}</td>
                        <td className="py-2.5 px-4"><div className="flex justify-center">{qtyControl(item)}</div></td>
                        <td className="py-2.5 px-4 text-right font-semibold whitespace-nowrap">{formatCurrency(item.total)}</td>
                        <td className="py-2.5 px-2">{removeButton(item)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>

          <div className="md:hidden shrink-0 border-t border-dark-200 bg-white p-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-dark-500">Total</p>
              <p className="text-lg font-bold text-dark-900 truncate">{formatCurrency(total)}</p>
            </div>
            <Button size="lg" disabled={cartItems.length === 0} onClick={() => setShowCheckout(true)}>
              Encaisser
            </Button>
          </div>
        </section>

        <aside className="hidden md:flex w-80 lg:w-96 shrink-0 flex-col border-l border-dark-200 bg-white">
          <div className="flex-1 overflow-y-auto p-5">{checkoutFields}</div>
          <div className="shrink-0 border-t border-dark-200 bg-dark-50 p-5 space-y-4">
            {totals}
            {validateButton}
          </div>
        </aside>
      </div>

      {showCheckout && (
        <div className="md:hidden">
          <Modal
            title="Encaissement"
            onClose={() => setShowCheckout(false)}
            footer={<div className="w-full space-y-3">{totals}{validateButton}</div>}
          >
            {checkoutFields}
          </Modal>
        </div>
      )}

      {showNewClient && (
        <Modal
          title="Nouveau client"
          size="md"
          onClose={() => {
            setShowNewClient(false);
            setNewClient(emptyClient);
          }}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowNewClient(false);
                  setNewClient(emptyClient);
                }}
              >
                Annuler
              </Button>
              <Button type="submit" form="new-client-form" loading={isAddingClient}>Enregistrer</Button>
            </>
          }
        >
          <form id="new-client-form" onSubmit={handleAddClient} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'name', label: 'Nom *', type: 'text', required: true, full: true },
              { key: 'phone', label: 'Téléphone', type: 'tel' },
              { key: 'email', label: 'Email', type: 'email' },
              { key: 'address', label: 'Adresse', type: 'text', full: true },
              { key: 'rccm', label: 'RCCM', type: 'text' },
              { key: 'postal_box', label: 'Boîte postale', type: 'text' },
              { key: 'nc', label: 'NC', type: 'text' },
            ].map((f) => (
              <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
                <label className={labelClass}>{f.label}</label>
                <input
                  type={f.type}
                  value={newClient[f.key]}
                  onChange={(e) => setNewClient((p) => ({ ...p, [f.key]: e.target.value }))}
                  className={inputClass}
                  required={f.required}
                />
              </div>
            ))}
          </form>
        </Modal>
      )}
    </div>
  );
}
