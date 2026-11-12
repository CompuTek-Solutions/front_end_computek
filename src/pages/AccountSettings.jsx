import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const inputClass =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-dark-900';

export default function AccountSettings() {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [form, setForm] = useState({
    email: user?.email || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailChanged = form.email.trim() && form.email.trim() !== user?.email;
    const passwordChanged = form.newPassword.length > 0;

    if (!emailChanged && !passwordChanged) {
      toast.error('Aucune modification à enregistrer');
      return;
    }
    if (passwordChanged && form.newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (passwordChanged && form.newPassword !== form.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    const result = await updateProfile({
      oldPassword: form.oldPassword,
      ...(passwordChanged && { newPassword: form.newPassword }),
      ...(emailChanged && { newEmail: form.email.trim() }),
    });

    if (result.success) {
      toast.success('Compte mis à jour');
      setForm((prev) => ({ ...prev, oldPassword: '', newPassword: '', confirmPassword: '' }));
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-dark-900">Mon compte</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-dark-900 mb-2">Nom</label>
          <input type="text" className={`${inputClass} bg-gray-50`} value={user?.name || ''} disabled />
        </div>
        <div>
          <label className="block text-sm font-semibold text-dark-900 mb-2">Email</label>
          <input type="email" name="email" className={inputClass} value={form.email} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-dark-900 mb-2">Nouveau mot de passe</label>
            <input type="password" name="newPassword" autoComplete="new-password" className={inputClass} value={form.newPassword} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark-900 mb-2">Confirmation</label>
            <input type="password" name="confirmPassword" autoComplete="new-password" className={inputClass} value={form.confirmPassword} onChange={handleChange} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-dark-900 mb-2">
            Mot de passe actuel <span className="text-red-500">*</span>
          </label>
          <input type="password" name="oldPassword" autoComplete="current-password" className={inputClass} value={form.oldPassword} onChange={handleChange} required />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-[#0369a1] hover:bg-[#0284c7] text-white font-semibold rounded-lg disabled:opacity-50"
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
