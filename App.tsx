import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminLoginPage, UserLoginPage, LoginGatePage } from './pages/LoginPage';
import TokenCheckerPage from './pages/TokenCheckerPage';
import DashboardPage from './pages/DashboardPage';
import { LoadingSpinner } from './components/LoadingSpinner';

// --- Toast Notification System ---
type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error';
};

interface ToastContextType {
  addToast: (message: string, type: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast: React.FC<ToastMessage & { onDismiss: (id: number) => void }> = ({ message, type, id, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';

  return (
    <div className={`flex items-center justify-between w-full max-w-sm p-4 text-white ${bgColor} rounded-lg shadow-lg animate-fade-in-up`}>
      <div className="flex-1 font-medium">{message}</div>
      <button onClick={() => onDismiss(id)} className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// This component now only renders the toasts.
const ToastsManager: React.FC<{
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
}> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};

const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastsManager toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};


// --- Main App Router ---
const AppRouter: React.FC = () => {
  const { user, loading } = useAuth();
  const [route, setRoute] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-soc-navy">
        <LoadingSpinner />
      </div>
    );
  }

  if (user) {
    // If user is logged in, always show dashboard.
    // Redirect from public pages if they try to access them.
    if (route.startsWith('#/login') || route.startsWith('#/check-token')) {
        window.location.hash = '#/';
    }
    return <DashboardPage />;
  }
  
  // Public routes for logged-out users
  switch (route) {
    case '#/login/admin':
        return <AdminLoginPage />;
    case '#/login/user':
        return <UserLoginPage />;
    case '#/check-token':
        return <TokenCheckerPage />;
    default:
        return <LoginGatePage />;
  }
};

const App: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-soc-white">
          {children || <AppRouter />}
        </div>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
