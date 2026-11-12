export const validateProduct = (product) => {
  const errors = {};

  if (!product.name || product.name.trim().length === 0) {
    errors.name = 'Le nom du produit est requis';
  }

  if (!(Number(product.price) > 0)) {
    errors.price = 'Le prix doit être supérieur à 0';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
