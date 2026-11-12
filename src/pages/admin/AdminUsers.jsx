import React, { useState, useEffect } from 'react';
import { Pencil, Plus, ShieldCheck, Store, Trash2, UserCheck, UserX, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { normalizeForSearch } from '../../utils/helpers';
import {
  Badge, Button, Card, EmptyState, ListSkeleton, Modal, PageHeader, SearchInput, Select, StatCard, confirmDialog,
  inputClass, labelClass,
} from '../../components/ui';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'seller' };
const ROLE_LABEL = { admin: 'Administrateur', seller: 'Vendeur' };

export default function AdminUsers() {
  const { users, isLoading, fetchUsers, createUser, updateUser, deleteUser } = useProductStore();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchUsers().catch(() => {});
  }, [fetchUsers]);

  const term = normalizeForSearch(searchTerm);
  const filtered = users.filter(
    (u) => normalizeForSearch(u.name).includes(term) || normalizeForSearch(u.email).includes(term)
  );

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { password, ...rest } = formData;
        await updateUser(editingId, password ? formData : rest);
        toast.success('Utilisateur mis à jour');
      } else {
        await createUser(formData);
        toast.success('Utilisateur créé');
      }
      closeForm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setShowForm(true);
  };

  const toggleActive = async (user) => {
    try {
      await updateUser(user.id, { is_active: !user.is_active });
      toast.success(user.is_active ? 'Compte désactivé' : 'Compte réactivé');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    }
  };

  const handleDelete = async (user) => {
    const ok = await confirmDialog({
      title: "Supprimer l'utilisateur",
      message: `Le compte de ${user.name} sera supprimé définitivement.`,
    });
    if (!ok) return;
    try {
      await deleteUser(user.id);
      toast.success('Utilisateur supprimé');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    }
  };

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const actions = (user) => {
    const isSelf = user.id === currentUserId;
    return (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" icon={Pencil} onClick={() => handleEdit(user)} title="Modifier" aria-label="Modifier" />
        {!isSelf && (
          <Button
            variant="ghost"
            size="icon"
            icon={user.is_active ? UserX : UserCheck}
            onClick={() => toggleActive(user)}
            title={user.is_active ? 'Désactiver' : 'Réactiver'}
            aria-label={user.is_active ? 'Désactiver' : 'Réactiver'}
          />
        )}
        {!isSelf && user.role !== 'admin' && (
          <Button variant="danger-ghost" size="icon" icon={Trash2} onClick={() => handleDelete(user)} title="Supprimer" aria-label="Supprimer" />
        )}
      </div>
    );
  };

  const roleBadge = (user) => <Badge tone={user.role === 'admin' ? 'primary' : 'neutral'}>{ROLE_LABEL[user.role] || user.role}</Badge>;
  const statusBadge = (user) => <Badge tone={user.is_active ? 'success' : 'danger'}>{user.is_active ? 'Actif' : 'Inactif'}</Badge>;

  return (
    <>
      <PageHeader title="Utilisateurs">
        <Button
          icon={Plus}
          onClick={() => {
            closeForm();
            setShowForm(true);
          }}
        >
          Ajouter
        </Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Total" value={users.length} icon={Users} />
        <StatCard label="Admins" value={users.filter((u) => u.role === 'admin').length} icon={ShieldCheck} tone="neutral" />
        <StatCard label="Vendeurs" value={users.filter((u) => u.role === 'seller').length} icon={Store} tone="success" />
      </div>

      <SearchInput placeholder="Rechercher par nom ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

      <Card bodyClassName="" className="overflow-hidden">
        {isLoading && users.length === 0 ? (
          <ListSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title={users.length === 0 ? 'Aucun utilisateur' : 'Aucun résultat'} />
        ) : (
          <>
            <ul className="md:hidden divide-y divide-dark-100">
              {filtered.map((user) => (
                <li key={user.id} className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary-50 text-primary-700 font-semibold flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-dark-900 truncate">{user.name}</p>
                    <p className="text-sm text-dark-500 truncate">{user.email}</p>
                    <div className="mt-1 flex gap-2">{roleBadge(user)}{statusBadge(user)}</div>
                  </div>
                  {actions(user)}
                </li>
              ))}
            </ul>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-200 bg-dark-50 text-left text-xs font-semibold uppercase tracking-wide text-dark-500">
                    <th className="py-3 px-4">Utilisateur</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Rôle</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100">
                  {filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-dark-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 shrink-0 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold flex items-center justify-center">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-dark-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-dark-600">{user.email}</td>
                      <td className="py-3 px-4">{roleBadge(user)}</td>
                      <td className="py-3 px-4">{statusBadge(user)}</td>
                      <td className="py-2 px-4">{actions(user)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {showForm && (
        <Modal
          title={editingId ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
          size="md"
          onClose={closeForm}
          footer={
            <>
              <Button variant="secondary" onClick={closeForm}>Annuler</Button>
              <Button type="submit" form="user-form" loading={isLoading}>Enregistrer</Button>
            </>
          }
        >
          <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Nom</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>{editingId ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}</label>
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
                required={!editingId}
              />
            </div>
            <div>
              <label className={labelClass}>Rôle</label>
              <Select name="role" value={formData.role} onChange={handleChange}>
                <option value="seller">Vendeur</option>
                <option value="admin">Administrateur</option>
              </Select>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
