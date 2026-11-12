import { create } from 'zustand';

export const useConfirmStore = create(() => ({ request: null }));

export const confirmDialog = (options) =>
  new Promise((resolve) => {
    useConfirmStore.setState({ request: { ...options, resolve } });
  });
