import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState('demo@computek.com');
  const [password, setPassword] = useState('demo');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(email, password);
    if (result.success) {
      toast.success('Connexion réussie!');
      // Récupérer l'utilisateur depuis le store après la mise à jour
      setTimeout(() => {
        const user = useAuthStore.getState().user;
        if (user?.role === 'admin') {
          navigate('/admin');
        } else if (user?.role === 'seller') {
          navigate('/seller');
        }
      }, 100);
    } else {
      toast.error(result.error || 'Erreur de connexion');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-dark-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src="/logo.jpg" alt="CompuTek Solutions" className="w-20 h-20 rounded-full mx-auto mb-4 object-cover shadow-lg" />
            <h1 className="text-4xl font-bold text-dark-900 mb-1">CompuTek Solutions</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email or Username */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-dark-900 mb-2">
                Email ou Nom d'utilisateur
              </label>
              <input
                id="email"
                type="text"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 transition-colors bg-white text-dark-900 placeholder-gray-500"
                placeholder="votre@email.com ou votre_nom"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-dark-900 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 transition-colors bg-white text-dark-900 placeholder-gray-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-700 hover:text-dark-900 font-bold"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0369a1] hover:bg-[#0284c7] text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg border-0"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Connexion...</span>
                </>
              ) : (
                <span>Se connecter</span>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
