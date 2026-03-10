export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
};

export const validateBarcode = (barcode) => {
  return barcode.trim().length > 0 && barcode.trim().length <= 100;
};

export const validateProduct = (product, options = {}) => {
  const { requireBarcode = true } = options;
  const errors = {};

  if (!product.name || product.name.trim().length === 0) {
    errors.name = 'Le nom du produit est requis';
  }

  if (!product.price || product.price <= 0) {
    errors.price = 'Le prix doit être supérieur à 0';
  }

  if (requireBarcode && (!product.barcode || !validateBarcode(product.barcode))) {
    errors.barcode = 'Code-barres invalide';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateSale = (sale) => {
  const errors = {};

  if (!sale.items || sale.items.length === 0) {
    errors.items = 'Au moins un article est requis';
  }

  if (!sale.paymentMethod) {
    errors.paymentMethod = 'Le mode de paiement est requis';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
