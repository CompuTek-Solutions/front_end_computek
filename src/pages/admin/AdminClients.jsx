import React, { useEffect, useState, useCallback } from 'react';
import { useProductStore } from '../../store/productStore';

export default function AdminClients() {
  const { clients, fetchClients, clientsPagination, isLoading } = useProductStore();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCurrentClients = useCallback(() => {
    const params = { page, pageSize };
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    return fetchClients(params);
  }, [page, pageSize, debouncedSearch, fetchClients]);

  useEffect(() => {
    fetchCurrentClients().catch(() => {});
  }, [fetchCurrentClients]);

  useEffect(() => {
    if (!clientsPagination?.totalPages) return;
    setPage((current) => {
      const maxPage = Math.max(1, clientsPagination.totalPages);
      return current > maxPage ? maxPage : current;
    });
  }, [clientsPagination?.totalPages]);

  const totalCount = clientsPagination?.total ?? clients.length;
  const totalPages = clientsPagination?.totalPages ?? 1;
  const showingFrom = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = totalCount === 0 ? 0 : Math.min((page - 1) * pageSize + clients.length, totalCount);

  return (
    <div className="space-y-6" translate="no">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Clients</h1>
          <p className="text-dark-600 mt-1">
            {totalCount} client{totalCount > 1 ? 's' : ''} enregistré{totalCount > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" translate="no">
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">Rechercher</label>
            <input
              type="text"
              placeholder="Nom, email ou téléphone"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-dark-900"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                if (!search) return;
                setSearch('');
                setPage(1);
              }}
              className="px-4 py-2 border border-primary-200 text-primary-700 rounded-lg font-medium hover:bg-primary-50 transition"
            >
              Réinitialiser
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading && clients.length === 0 ? (
            <div className="text-center py-12 text-dark-500">Chargement des clients...</div>
          ) : totalCount === 0 ? (
            <div className="text-center py-12 text-dark-500">
              Aucun client trouvé. Les clients peuvent être ajoutés lors d&apos;une vente (Nouvelle vente).
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-3 md:px-4 font-semibold text-dark-700 text-sm">Nom</th>
                  <th className="text-left py-3 px-3 md:px-4 font-semibold text-dark-700 text-sm hidden sm:table-cell">Email</th>
                  <th className="text-left py-3 px-3 md:px-4 font-semibold text-dark-700 text-sm">Téléphone</th>
                  <th className="text-left py-3 px-3 md:px-4 font-semibold text-dark-700 text-sm hidden md:table-cell">Adresse</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 md:px-4 font-medium text-dark-900 text-sm">{c.name}</td>
                    <td className="py-3 px-3 md:px-4 text-dark-600 text-sm hidden sm:table-cell">{c.email || '–'}</td>
                    <td className="py-3 px-3 md:px-4 text-dark-600 text-sm">{c.phone || '–'}</td>
                    <td className="py-3 px-3 md:px-4 text-dark-600 text-sm hidden md:table-cell">{c.address || '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 py-3 border-t border-gray-200 bg-gray-50 mt-4">
          <div className="text-sm text-dark-600">
            {totalCount === 0
              ? 'Aucun résultat'
              : `Affichage ${showingFrom}-${showingTo} sur ${totalCount} client${totalCount > 1 ? 's' : ''}`}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span>Par page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white"
              >
                {[10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || totalCount === 0 || isLoading}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="text-sm text-dark-600">
                Page {totalPages === 0 ? 0 : page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || totalCount === 0 || isLoading}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
