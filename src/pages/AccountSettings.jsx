import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { Button, Card, PageHeader, inputClass, labelClass } from '../components/ui';


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
    <>
      <PageHeader title="Mon compte" />

      <Card className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Nom</label>
          <input type="text" className={`${inputClass} bg-dark-50`} value={user?.name || ''} disabled />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" name="email" className={inputClass} value={form.email} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nouveau mot de passe</label>
            <input type="password" name="newPassword" autoComplete="new-password" className={inputClass} value={form.newPassword} onChange={handleChange} />
          </div>
          <div>
            <label className={labelClass}>Confirmation</label>
            <input type="password" name="confirmPassword" autoComplete="new-password" className={inputClass} value={form.confirmPassword} onChange={handleChange} />
          </div>
        </div>
        <div>
          <label className={labelClass}>
            Mot de passe actuel <span className="text-red-500">*</span>
          </label>
          <input type="password" name="oldPassword" autoComplete="current-password" className={inputClass} value={form.oldPassword} onChange={handleChange} required />
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={isLoading} className="w-full sm:w-auto">Enregistrer</Button>
        </div>
      </form>
      </Card>
    </>
  );
}
