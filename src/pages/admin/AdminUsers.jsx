import React, { useState, useEffect } from 'react';
import { useProductStore } from '../../store/productStore';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'seller' };

export default function AdminUsers() {
  const { users, isLoading, fetchUsers, createUser, updateUser, deleteUser } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchUsers().catch(() => {});
  }, [fetchUsers]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateUser(editingId, formData);
        toast.success('Utilisateur mis à jour');
      } else {
        await createUser(formData);
        toast.success('Utilisateur créé');
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await deleteUser(id);
      toast.success('Utilisateur supprimé');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const roleStyle = { admin: 'bg-red-100 text-red-800', seller: 'bg-blue-100 text-blue-800' };
  const roleLabel = { admin: 'Administrateur', seller: 'Vendeur' };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-dark-900">Gestion des Utilisateurs</h1>
          <p className="text-dark-600 mt-1 text-sm">{users.length} utilisateur(s) enregistré(s)</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm"
        >
          + Ajouter
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-dark-900 mb-4">
            {editingId ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Nom</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-dark-900"
                  required />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-dark-900"
                  required />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">
                  {editingId ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
                </label>
                <input type="password" name="password" value={formData.password} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-dark-900"
                  required={!editingId} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Rôle</label>
                <select name="role" value={formData.role} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-dark-900">
                  <option value="seller">Vendeur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 text-sm">
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-dark-700 rounded-lg hover:bg-gray-50 transition text-sm">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <input type="text" placeholder="Rechercher par nom ou email..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-dark-900" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 flex items-center justify-between">
          <div><p className="text-sm text-dark-600">Total</p><p className="text-2xl font-bold text-blue-600">{users.length}</p></div>
          <span className="text-3xl">👥</span>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 flex items-center justify-between">
          <div><p className="text-sm text-dark-600">Administrateurs</p><p className="text-2xl font-bold text-red-600">{users.filter((u) => u.role === 'admin').length}</p></div>
          <span className="text-3xl">👑</span>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 flex items-center justify-between">
          <div><p className="text-sm text-dark-600">Vendeurs</p><p className="text-2xl font-bold text-green-600">{users.filter((u) => u.role === 'seller').length}</p></div>
          <span className="text-3xl">🏪</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-dark-500">
              {users.length === 0 ? 'Aucun utilisateur.' : 'Aucun résultat pour cette recherche.'}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 md:px-6 py-3 text-left text-sm font-semibold text-dark-900">Utilisateur</th>
                  <th className="px-3 md:px-6 py-3 text-left text-sm font-semibold text-dark-900 hidden md:table-cell">Email</th>
                  <th className="px-3 md:px-6 py-3 text-left text-sm font-semibold text-dark-900">Rôle</th>
                  <th className="px-3 md:px-6 py-3 text-left text-sm font-semibold text-dark-900 hidden sm:table-cell">Statut</th>
                  <th className="px-3 md:px-6 py-3 text-left text-sm font-semibold text-dark-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <p className="font-medium text-dark-900 text-sm">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-dark-600 text-sm hidden md:table-cell">{user.email}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleStyle[user.role] || 'bg-gray-100 text-gray-800'}`}>
                        {roleLabel[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-dark-600 text-sm hidden sm:table-cell">
                      {user.is_active ? '✅ Actif' : '❌ Inactif'}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-1 md:gap-2">
                        <button onClick={() => handleEdit(user)}
                          className="px-2 md:px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition text-xs md:text-sm">
                          ✏️ <span className="hidden sm:inline">Modifier</span>
                        </button>
                        <button onClick={() => handleDelete(user.id)}
                          className="px-2 md:px-3 py-1 text-red-600 hover:bg-red-50 rounded transition text-xs md:text-sm">
                          🗑️ <span className="hidden sm:inline">Supprimer</span>
                        </button>
                      </div>
                    </td>
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
