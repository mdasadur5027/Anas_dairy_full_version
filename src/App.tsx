import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ClientAuth from './pages/ClientAuth';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Components
const ProtectedClientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  console.log('ProtectedClientRoute - User:', user); // Debug log
  console.log('ProtectedClientRoute - Loading:', loading); // Debug log
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== 'client') return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  console.log('ProtectedAdminRoute - User:', user); // Debug log
  console.log('ProtectedAdminRoute - Loading:', loading); // Debug log
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== 'admin') {
    console.log('User role is not admin, redirecting to auth. Role:', user.role); // Debug log
    return <Navigate to="/auth" replace />;
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
          <Route path="/auth" element={<ClientAuth />} />
          
          {/* Legacy redirects - redirect old auth routes to new unified auth */}
          <Route path="/client/auth" element={<Navigate to="/auth" replace />} />
          <Route path="/admin/auth" element={<Navigate to="/auth" replace />} />
          
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