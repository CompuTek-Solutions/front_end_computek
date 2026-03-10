import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useProductStore } from '../../store/productStore';
import BarcodeScanner from '../../components/seller/BarcodeScanner';
import { printInvoice, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function SellerNewSale() {
  const { products, addSale, clients, fetchClients, addClient, fetchProducts, fetchInventory, getInventoryQuantity } = useProductStore();
  const [cartItems, setCartItems] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', address: '' });
  const [lastScannedBarcode, setLastScannedBarcode] = useState('');
  const [lastScanTime, setLastScanTime] = useState(0);
  const [posBarcode, setPosBarcode] = useState('');
  const [showProductPanel, setShowProductPanel] = useState(false);
  const [productPage, setProductPage] = useState(0);
  const barcodeFieldRef = useRef(null);

  const PRODUCTS_PER_PAGE = 18;

  const focusBarcodeField = useCallback(() => {
    setTimeout(() => barcodeFieldRef.current?.focus(), 80);
  }, []);

  useEffect(() => {
    fetchClients().catch(() => {});
  }, [fetchClients]);

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
      const price = product.price_selling ?? product.price;
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
    toast.success(`${product.name} x${qty} ajouté au panier`);
  }, [getInventoryQuantity]);

  const addProductByBarcode = useCallback(async (rawBarcode) => {
    try {
      // Nettoyer le barcode (supprimer les espaces et caractères spéciaux)
      const barcode = (rawBarcode || '').trim().toUpperCase();
      
      // Vérifier que le barcode n'est pas vide
      if (!barcode) {
        toast.error('Code-barres invalide');
        return;
      }

      // Ignorer les scans en double rapides (moins de 500ms)
      const now = Date.now();
      if (barcode === lastScannedBarcode && now - lastScanTime < 500) {
        console.log('Scan en double ignoré:', barcode);
        return;
      }
      
      setLastScannedBarcode(barcode);
      setLastScanTime(now);

      // Chercher le produit par code-barres (comparaison normalisée)
      const product = products.find((p) => (p.barcode || '').trim().toUpperCase() === barcode);
      
      if (!product) {
        console.warn('Produit non trouvé pour barcode:', barcode);
        console.log('Produits disponibles:', products.map(p => ({ id: p.id, name: p.name, barcode: p.barcode })));
        toast.error(`Produit avec code-barres "${barcode}" non trouvé`);
        return;
      }

      console.log('Produit trouvé:', product.name, 'ID:', product.id);

      // Vérifier le stock avant d'ajouter
      const stock = getInventoryQuantity(product.id);
      if (stock <= 0) {
        toast.error(`"${product.name}" est en rupture de stock`);
        return;
      }

      // Ajouter au panier
      addToCart(product, 1);
    } catch (err) {
      console.error('Erreur lors de la recherche du produit:', err);
      toast.error('Erreur lors du scan du code-barres');
    }
  }, [products, addToCart, getInventoryQuantity, lastScannedBarcode, lastScanTime]);

  const handleCompleteSale = async () => {
    if (cartItems.length === 0) {
      toast.error('Veuillez ajouter au moins un article');
      return;
    }
    for (const item of cartItems) {
      const stock = getInventoryQuantity(item.productId);
      if (item.quantity > stock) {
        toast.error(`Stock insuffisant pour "${item.name}". Disponible: ${stock}`);
        return;
      }
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal - discountAmount;

    const sale = {
      items: cartItems,
      subtotal,
      discount: discountAmount,
      total,
      paymentMethod,
      notes,
      status: 'completed',
      client_id: selectedClientId || null,
    };

    try {
      await addSale(sale);
      fetchInventory().catch(() => {});
      printInvoice({
        ...sale,
        payment_method: sale.paymentMethod,
        discount: sale.discount,
        items: cartItems.map((i) => ({ name: i.name, quantity: i.quantity, unit_price: i.price, subtotal: i.total })),
      });
      toast.success('Vente enregistrée. Fenêtre d\'impression ouverte pour la facture.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'enregistrement de la vente');
      return;
    }
    setCartItems([]);
    setDiscount(0);
    setNotes('');
    setPaymentMethod('cash');
    setSelectedClientId('');
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newClient.name.trim()) {
      toast.error('Le nom du client est requis');
      return;
    }
    try {
      const created = await addClient(newClient);
      setSelectedClientId(created.id);
      setShowNewClient(false);
      setNewClient({ name: '', email: '', phone: '', address: '' });
      toast.success('Client ajouté');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'ajout du client');
    }
  };

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.barcode || '').includes(searchTerm)
      ),
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
  const discountAmount = (subtotal * discount) / 100;
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

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full bg-gray-100 -m-6">
      {/* Camera Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onDetected={handleCameraScan}
          onClose={() => { setShowScanner(false); focusBarcodeField(); }}
        />
      )}

      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <div className="bg-[#0369a1] text-white px-3 md:px-6 py-2 md:py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-xl md:text-2xl">🛒</span>
          <div>
            <p className="font-bold text-sm md:text-lg leading-tight">CompuTek — Caisse</p>
            <p className="text-blue-200 text-xs hidden sm:block">{dateStr} · {timeStr}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-6 text-sm">
          <div className="text-center">
            <p className="text-blue-200 text-xs">Articles</p>
            <p className="font-bold text-base md:text-lg">{cartItems.reduce((s, i) => s + i.quantity, 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-blue-200 text-xs">Total</p>
            <p className="font-bold text-base md:text-lg">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      {/* ── SCAN BAR ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 flex-shrink-0 shadow-sm">
        <button
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0369a1] hover:bg-[#0284c7] text-white rounded-lg font-medium transition-colors flex-shrink-0"
          title="Scanner avec la caméra"
        >
          <span>📷</span>
          <span className="hidden sm:inline">Caméra</span>
        </button>

        <div className="flex-1 relative">
          <input
            ref={barcodeFieldRef}
            type="text"
            value={posBarcode}
            onChange={(e) => setPosBarcode(e.target.value)}
            onKeyDown={handlePosBarcodeKey}
            autoFocus
            placeholder="Scanner ou saisir un code-barres puis Entrée…"
            className="w-full px-4 py-2.5 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-dark-900 bg-white placeholder-gray-400"
          />
          {posBarcode && (
            <button
              onClick={async () => { await addProductByBarcode(posBarcode.trim()); setPosBarcode(''); focusBarcodeField(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium"
            >
              ↵ Ajouter
            </button>
          )}
        </div>

        <button
          onClick={() => setShowProductPanel((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors flex-shrink-0 border ${
            showProductPanel
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-dark-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <span>📦</span>
          <span className="hidden sm:inline">{showProductPanel ? 'Masquer produits' : 'Chercher produit'}</span>
        </button>
      </div>

      {/* ── PRODUCT SEARCH PANEL (repliable) ─────────────────── */}
      {showProductPanel && (
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Rechercher par nom ou code-barres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-dark-900"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {paginatedProducts.map((product) => {
              const stock = getInventoryQuantity(product.id);
              const outOfStock = stock <= 0;
              return (
                <button
                  key={product.id}
                  type="button"
                  disabled={outOfStock}
                  onClick={() => { addToCart(product, 1); focusBarcodeField(); }}
                  className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                    outOfStock
                      ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                      : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                  }`}
                >
                  <p className="font-semibold text-dark-900 text-xs leading-tight line-clamp-2">{product.name}</p>
                  <p className="text-primary-600 font-bold text-sm mt-1">{formatCurrency(product.price_selling ?? product.price)}</p>
                  <p className={`text-xs mt-0.5 font-medium ${outOfStock ? 'text-red-500' : 'text-green-600'}`}>
                    {outOfStock ? 'Rupture' : `Stock: ${stock}`}
                  </p>
                </button>
              );
            })}
            {filteredProducts.length === 0 && (
              <p className="col-span-full text-dark-500 text-sm py-4 text-center">Aucun produit trouvé</p>
            )}
          </div>

          {totalProductPages > 1 && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setProductPage((p) => Math.max(0, p - 1))}
                disabled={productPage === 0}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-dark-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Précédent
              </button>
              <span className="text-xs text-dark-500">
                Page <span className="font-semibold text-dark-800">{productPage + 1}</span> / {totalProductPages}
                <span className="ml-2 text-dark-400">({filteredProducts.length} produits)</span>
              </span>
              <button
                type="button"
                onClick={() => setProductPage((p) => Math.min(totalProductPages - 1, p + 1))}
                disabled={productPage >= totalProductPages - 1}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-dark-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Suivant →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row gap-0 min-h-0 overflow-hidden">

        {/* LEFT: Panier (style reçu) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden min-h-0" style={{minHeight: '40vh'}}>
          {/* Table header */}
          <div className="bg-gray-200 px-4 py-2 grid grid-cols-12 gap-2 text-xs font-semibold text-dark-700 uppercase tracking-wide flex-shrink-0">
            <div className="col-span-5">Désignation</div>
            <div className="col-span-2 text-center">P.U.</div>
            <div className="col-span-2 text-center">Qté</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto bg-white">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-dark-400 py-16">
                <span className="text-6xl mb-4">🛒</span>
                <p className="text-lg font-medium">Panier vide</p>
                <p className="text-sm mt-1">Scannez un code-barres ou cherchez un produit</p>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={item.productId}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-gray-100 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <div className="col-span-5">
                    <p className="font-medium text-dark-900 text-sm leading-tight">{item.name}</p>
                  </div>
                  <div className="col-span-2 text-center text-sm text-dark-600">
                    {formatCurrency(item.price)}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-dark-700 font-bold text-sm flex items-center justify-center"
                      >−</button>
                      <input
                        type="number"
                        min="1"
                        max={getInventoryQuantity(item.productId)}
                        value={item.quantity}
                        onChange={(e) => updateCartQty(item.productId, parseInt(e.target.value, 10) || 1)}
                        className="w-10 text-center border border-gray-300 rounded text-sm font-semibold text-dark-900 bg-white py-0.5"
                      />
                      <button
                        onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-dark-700 font-bold text-sm flex items-center justify-center"
                      >+</button>
                    </div>
                  </div>
                  <div className="col-span-2 text-right font-semibold text-primary-700 text-sm">
                    {formatCurrency(item.total)}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => updateCartQty(item.productId, 0)}
                      className="text-red-400 hover:text-red-600 transition-colors text-lg leading-none"
                      title="Supprimer"
                    >×</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals bar at bottom of cart */}
          {cartItems.length > 0 && (
            <div className="bg-gray-100 border-t border-gray-300 px-4 py-2 flex-shrink-0 flex justify-end gap-8 text-sm">
              <span className="text-dark-600">Sous-total : <span className="font-semibold text-dark-900">{formatCurrency(subtotal)}</span></span>
              {discountAmount > 0 && (
                <span className="text-orange-600">Remise : <span className="font-semibold">−{formatCurrency(discountAmount)}</span></span>
              )}
              <span className="text-primary-700 font-bold text-base">Total : {formatCurrency(total)}</span>
            </div>
          )}
        </div>

        {/* RIGHT: Panneau paiement */}
        <div className="w-full md:w-80 flex-shrink-0 flex flex-col bg-white border-t md:border-t-0 md:border-l border-gray-200 overflow-y-auto max-h-96 md:max-h-none">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-dark-900 text-base">Finaliser la vente</h3>
          </div>

          <div className="flex-1 p-4 space-y-4">
            {/* Remise */}
            <div>
              <label className="block text-xs font-semibold text-dark-700 mb-1 uppercase tracking-wide">Remise (%)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-dark-900 bg-white"
                min="0" max="100"
              />
            </div>

            {/* Mode paiement */}
            <div>
              <label className="block text-xs font-semibold text-dark-700 mb-1 uppercase tracking-wide">Mode de paiement</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'cash', label: '💵 Cash' },
                  { value: 'paiement_marchand', label: '📲 Paiement marchand' },
                ].map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setPaymentMethod(m.value)}
                    className={`py-2 px-2 rounded-lg text-sm font-medium border transition-all ${
                      paymentMethod === m.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-dark-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Client */}
            <div>
              <label className="block text-xs font-semibold text-dark-700 mb-1 uppercase tracking-wide">Client (optionnel)</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-dark-900 text-sm"
              >
                <option value="">Sans client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.phone ? ` – ${c.phone}` : ''}</option>
                ))}
              </select>
              {!showNewClient ? (
                <button type="button" onClick={() => setShowNewClient(true)} className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1">
                  + Nouveau client
                </button>
              ) : (
                <form onSubmit={handleAddClient} className="space-y-2 mt-2 pt-2 border-t border-gray-200">
                  <input type="text" placeholder="Nom *" value={newClient.name} onChange={(e) => setNewClient((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-dark-900 bg-white text-sm" required />
                  <input type="email" placeholder="Email" value={newClient.email} onChange={(e) => setNewClient((p) => ({ ...p, email: e.target.value }))} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-dark-900 bg-white text-sm" />
                  <input type="tel" placeholder="Téléphone" value={newClient.phone} onChange={(e) => setNewClient((p) => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-dark-900 bg-white text-sm" />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Enregistrer</button>
                    <button type="button" onClick={() => { setShowNewClient(false); setNewClient({ name: '', email: '', phone: '', address: '' }); }} className="flex-1 py-1.5 border border-gray-300 text-dark-700 rounded-lg text-sm hover:bg-gray-50">Annuler</button>
                  </div>
                </form>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-dark-700 mb-1 uppercase tracking-wide">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-dark-900 bg-white text-sm resize-none"
                placeholder="Remarques..."
                rows="2"
              />
            </div>
          </div>

          {/* Total recap + Valider button */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3 flex-shrink-0">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-dark-600">
                <span>Sous-total</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Remise ({discount}%)</span>
                  <span className="font-medium">−{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-primary-700 pt-1 border-t border-gray-300">
                <span>TOTAL</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              onClick={async () => { await handleCompleteSale(); focusBarcodeField(); }}
              disabled={cartItems.length === 0}
              className="w-full bg-[#047857] hover:bg-[#059669] disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base shadow-md"
            >
              <span>✅</span>
              <span>Valider la vente</span>
            </button>

            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={() => { setCartItems([]); setDiscount(0); setNotes(''); setPaymentMethod('cash'); setSelectedClientId(''); focusBarcodeField(); }}
                className="w-full py-2 text-sm text-red-500 hover:text-red-700 font-medium"
              >
                🗑️ Vider le panier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
