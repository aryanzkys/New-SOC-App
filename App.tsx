
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { LoadingSpinner } from './components/LoadingSpinner';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-soc-navy">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soc-white">
      {user ? <DashboardPage /> : <LoginPage />}
    </div>
  );
};

export default App;
