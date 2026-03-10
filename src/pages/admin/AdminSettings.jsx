import React from 'react';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-dark-900">Paramètres</h1>
        <p className="text-dark-600 mt-1">Gérez les paramètres de votre application</p>
      </div>

      <div className="space-y-6">
        {/* Paramètres de l'entreprise */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">🏢 Paramètres de l'entreprise</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">Nom de l'entreprise</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-dark-900" defaultValue="CompuTek Solutions" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">Email</label>
              <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" defaultValue="info@computek.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">Téléphone</label>
              <input type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" defaultValue="+225 00 00 00 00" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-dark-900 mb-2">Adresse</label>
              <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" rows="3" defaultValue="CompuTek Solutions, Côte d'Ivoire"></textarea>
            </div>
          </div>
        </div>

        {/* Paramètres de facturation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">💰 Paramètres de facturation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">TVA (%)</label>
              <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" defaultValue="18" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">Devise</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>XOF (Franc CFA)</option>
                <option>EUR (Euro)</option>
                <option>USD (Dollar)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Paramètres de sécurité */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">🔒 Paramètres de sécurité</h3>
          <div className="space-y-3">
            <button className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md">
              🔐 Changer le mot de passe
            </button>
            <button className="w-full md:w-auto ml-0 md:ml-3 px-6 py-2 border border-gray-300 text-dark-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
              🔒 Activer 2FA
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-end">
          <button className="flex-1 sm:flex-none px-6 py-2 border border-gray-300 text-dark-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button className="flex-1 sm:flex-none px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg transition-colors shadow-md">
            💾 Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
