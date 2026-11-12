import React, { useEffect, useState } from 'react';
import { Mail, MapPin, Phone, Users } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import Pagination from '../../components/common/Pagination';
import { Card, EmptyState, ListSkeleton, PageHeader, SearchInput } from '../../components/ui';

export default function AdminClients() {
  const { clients, fetchClients, clientsPagination, isLoading } = useProductStore();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const params = { page, pageSize };
    if (debouncedSearch) params.search = debouncedSearch;
    fetchClients(params).catch(() => {});
  }, [page, pageSize, debouncedSearch, fetchClients]);

  const totalCount = clientsPagination?.total ?? clients.length;
  const totalPages = clientsPagination?.totalPages ?? 1;

  return (
    <>
      <PageHeader title="Clients" subtitle={`${totalCount} client(s)`} />

      <SearchInput
        placeholder="Rechercher par nom, email ou téléphone..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      <Card bodyClassName="" className="overflow-hidden">
        {isLoading && clients.length === 0 ? (
          <ListSkeleton />
        ) : totalCount === 0 ? (
          <EmptyState
            icon={Users}
            title="Aucun client trouvé"
            description="Les clients sont ajoutés depuis l'écran Nouvelle vente."
          />
        ) : (
          <>
            <ul className="md:hidden divide-y divide-dark-100">
              {clients.map((c) => (
                <li key={c.id} className="p-4 space-y-1.5">
                  <p className="font-medium text-dark-900">{c.name}</p>
                  {c.phone && <p className="flex items-center gap-2 text-sm text-dark-600"><Phone className="h-4 w-4 text-dark-400" />{c.phone}</p>}
                  {c.email && <p className="flex items-center gap-2 text-sm text-dark-600 break-all"><Mail className="h-4 w-4 shrink-0 text-dark-400" />{c.email}</p>}
                  {c.address && <p className="flex items-center gap-2 text-sm text-dark-600"><MapPin className="h-4 w-4 shrink-0 text-dark-400" />{c.address}</p>}
                </li>
              ))}
            </ul>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-200 bg-dark-50 text-left text-xs font-semibold uppercase tracking-wide text-dark-500">
                    <th className="py-3 px-4">Nom</th>
                    <th className="py-3 px-4">Téléphone</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Adresse</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100">
                  {clients.map((c) => (
                    <tr key={c.id} className="hover:bg-dark-50">
                      <td className="py-3 px-4 font-medium text-dark-900">{c.name}</td>
                      <td className="py-3 px-4 text-dark-600">{c.phone || '—'}</td>
                      <td className="py-3 px-4 text-dark-600">{c.email || '—'}</td>
                      <td className="py-3 px-4 text-dark-600">{c.address || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      <Pagination
        currentPage={Math.min(page, totalPages)}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={totalCount}
        itemsPerPage={pageSize}
        onItemsPerPageChange={(n) => {
          setPageSize(n);
          setPage(1);
        }}
      />
    </>
  );
}
