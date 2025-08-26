import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ClientAuth from './pages/ClientAuth';
import ClientDashboard from './pages/ClientDashboard';
import AdminAuth from './pages/AdminAuth';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Components
const ProtectedClientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated || user?.role !== 'client') {
    return <Navigate to="/client/auth" replace />;
  }
  
  return <>{children}</>;
};

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/admin/auth" replace />;
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/client/auth" element={<ClientAuth />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          
          {/* Protected Client Routes */}
          <Route 
            path="/client/dashboard" 
            element={
              <ProtectedClientRoute>
                <ClientDashboard />
              </ProtectedClientRoute>
            } 
          />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } 
          />
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <OrderProvider>
        <AppContent />
      </OrderProvider>
    </AuthProvider>
  );
};

export default App;