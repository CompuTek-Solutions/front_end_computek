import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Pages
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminInventory from './pages/admin/AdminInventory';
import AdminSales from './pages/admin/AdminSales';
import AdminStatistics from './pages/admin/AdminStatistics';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminClients from './pages/admin/AdminClients';
import AdminInvoices from './pages/admin/AdminInvoices';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerInvoices from './pages/seller/SellerInvoices';
import SellerNewSale from './pages/seller/NewSale';
import SellerSalesHistory from './pages/seller/SellerSalesHistory';
import SellerPerformance from './pages/seller/SellerPerformance';

// Layouts
import Layout from './components/Layout';

// Protected Route Component
function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/seller'} replace />;
  }

  return children;
}

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout pageTitle="Tableau de bord administrateur">
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout pageTitle="Gestion des produits">
                  <AdminProducts />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout pageTitle="Inventaire">
                  <AdminInventory />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sales"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout pageTitle="Historique des ventes">
                  <AdminSales />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/statistics"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout pageTitle="Statistiques">
                  <AdminStatistics />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout pageTitle="Gestion des utilisateurs">
                  <AdminUsers />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clients"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout pageTitle="Clients">
                  <AdminClients />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/invoices"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout pageTitle="Factures">
                  <AdminInvoices />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout pageTitle="Paramètres">
                  <AdminSettings />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Seller Routes */}
          <Route
            path="/seller"
            element={
              <ProtectedRoute requiredRole="seller">
                <Layout pageTitle="Tableau de bord vendeur">
                  <SellerDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/new-sale"
            element={
              <ProtectedRoute requiredRole="seller">
                <Layout pageTitle="Nouvelle vente">
                  <SellerNewSale />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/sales-history"
            element={
              <ProtectedRoute requiredRole="seller">
                <Layout pageTitle="Historique de mes ventes">
                  <SellerSalesHistory />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/invoices"
            element={
              <ProtectedRoute requiredRole="seller">
                <Layout pageTitle="Mes factures">
                  <SellerInvoices />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/performance"
            element={
              <ProtectedRoute requiredRole="seller">
                <Layout pageTitle="Mes performances">
                  <SellerPerformance />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
          },
        }}
      />
    </>
  );
}
