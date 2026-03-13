import { create } from 'zustand';
import { productAPI, inventoryAPI, salesAPI, userAPI, clientAPI } from '../services/api.js';

export const useProductStore = create((set, get) => ({
  products: [],
  inventory: [],
  sales: [],
  users: [],
  isLoading: false,
  error: null,

  // Produits
  fetchProducts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productAPI.getAll(params);
      set({ products: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors du chargement des produits';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  deleteSale: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await salesAPI.delete(id);
      set({
        sales: get().sales.filter((sale) => sale.id !== id),
        isLoading: false,
      });
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de la suppression de la facture';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  getProductByBarcode: async (barcode) => {
    try {
      const response = await productAPI.getByBarcode(barcode);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  checkProductExists: async (name, barcode = null) => {
    try {
      // Vérifier par nom
      const response = await productAPI.getAll({ search: name.trim() });
      const existingByName = response.data.find(p => 
        p.name.toLowerCase().trim() === name.toLowerCase().trim()
      );
      
      if (existingByName) {
        return { exists: true, product: existingByName, field: 'name' };
      }
      
      // Vérifier par code-barres si fourni
      if (barcode && barcode.trim()) {
        try {
          const existingByBarcode = await productAPI.getByBarcode(barcode.trim());
          return { exists: true, product: existingByBarcode.data, field: 'barcode' };
        } catch (error) {
          // Si le code-barres n'est pas trouvé, c'est normal
          if (error.response?.status !== 404) {
            throw error;
          }
        }
      }
      
      return { exists: false, product: null, field: null };
    } catch (error) {
      throw error;
    }
  },

  addProduct: async (product) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productAPI.create(product);
      const products = [...get().products, response.data];
      set({ products, isLoading: false });
      // Recharger l'inventaire pour afficher le stock du nouveau produit
      get().fetchInventory().catch(() => {});
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de la création du produit';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  updateProduct: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productAPI.update(id, updates);
      const products = get().products.map((p) => (p.id === id ? response.data : p));
      set({ products, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de la modification du produit';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await productAPI.delete(id);
      const products = get().products.filter((p) => p.id !== id);
      set({ products, isLoading: false });
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de la suppression du produit';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  // Inventaire
  fetchInventory: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await inventoryAPI.getAll();
      set({ inventory: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors du chargement de l\'inventaire';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  getInventoryQuantity: (productId) => {
    const item = get().inventory.find((i) => i.product_id === productId);
    return item?.quantity_on_hand || 0;
  },

  updateInventoryQuantity: async ({ product_id, quantity_on_hand }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await inventoryAPI.update({ product_id, quantity_on_hand });
      const updated = response.data;
      set({
        inventory: get().inventory.map((it) => (it.product_id === product_id ? { ...it, ...updated } : it)),
        isLoading: false,
      });
      return updated;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de la mise à jour du stock';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  // Ventes
  fetchSales: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await salesAPI.getAll(params);
      set({ sales: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors du chargement des ventes';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  addSale: async (saleData) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        items: (saleData.items || []).map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.total,
        })),
        discount_amount: saleData.discount ?? 0,
        payment_method: saleData.paymentMethod,
        notes: saleData.notes || null,
        client_id: saleData.client_id || null,
      };
      const response = await salesAPI.create(payload);
      const sales = [...get().sales, response.data];
      set({ sales, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de la création de la vente';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  // Clients
  clients: [],
  fetchClients: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await clientAPI.getAll(params);
      set((state) => ({ ...state, clients: response.data, isLoading: false }));
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors du chargement des clients';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },
  addClient: async (clientData) => {
    try {
      const response = await clientAPI.create(clientData);
      const clients = [...get().clients, response.data];
      set((state) => ({ ...state, clients }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Utilisateurs
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await userAPI.getAll();
      set({ users: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors du chargement des utilisateurs';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userAPI.create(userData);
      const users = [...get().users, response.data];
      set({ users, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de la création de l\'utilisateur';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  updateUser: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userAPI.update(id, updates);
      const users = get().users.map((u) => (u.id === id ? response.data : u));
      set({ users, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de la modification de l\'utilisateur';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await userAPI.delete(id);
      const users = get().users.filter((u) => u.id !== id);
      set({ users, isLoading: false });
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de la suppression de l\'utilisateur';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },
}));
