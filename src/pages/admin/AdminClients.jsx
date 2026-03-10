import React, { useEffect, useState } from 'react';
import { useProductStore } from '../../store/productStore';

export default function AdminClients() {
  const { clients, fetchClients } = useProductStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClients().catch(() => {});
  }, [fetchClients]);

  const filtered = clients.filter(
    (c) =>
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Clients</h1>
          <p className="text-dark-600 mt-1">{clients.length} client(s) enregistré(s)</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-dark-900"
          />
        </div>
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
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
                {filtered.map((c) => (
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
      </div>
    </div>
  );
}
