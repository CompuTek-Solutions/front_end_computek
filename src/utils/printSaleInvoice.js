import toast from 'react-hot-toast';
import { salesAPI } from '../services/api';
import { printInvoice } from './helpers';

export const printSaleInvoice = async (saleId) => {
  try {
    const { data } = await salesAPI.getById(saleId);
    printInvoice({ ...(data.sale || data), items: data.items || [] });
  } catch {
    toast.error('Impossible de charger les détails de la facture');
  }
};
