import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

// --- Login Gate Page (Default) ---
export const LoginGatePage: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-soc-navy to-gray-800 p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-soc-white rounded-2xl shadow-2xl text-center">
             <div className="text-center">
              <h1 className="text-3xl font-bold text-soc-navy">SMANESI Olympiad Club</h1>
              <p className="text-soc-gold font-semibold text-lg">Member Attendance</p>
            </div>
            <p className="text-soc-gray">Please select your login method.</p>
            <div className="flex flex-col space-y-4">
                <a href="#/login/user" className="w-full text-center py-3 px-4 rounded-lg shadow-sm text-lg font-medium text-white bg-soc-navy hover:bg-opacity-90 transition-colors">
                    Login as Member (NISN)
                </a>
                 <a href="#/login/admin" className="w-full text-center py-3 px-4 rounded-lg shadow-sm text-lg font-medium text-soc-navy bg-gray-200 hover:bg-gray-300 transition-colors">
                    Login as Admin
                </a>
            </div>
             <div className="pt-4 border-t">
                <a href="#/check-token" className="text-sm text-soc-gold hover:underline">
                    Forgot your token? Check here.
                </a>
            </div>
        </div>
    </div>
);


// --- Admin Login Page ---
export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: loginError } = await loginAdmin(email, password);
    if (loginError) {
      setError(loginError);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-soc-navy to-gray-800 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-soc-white rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-soc-navy">Admin Login</h1>
          <p className="text-soc-gold">SOC Attendance Management</p>
        </div>
        <div className="text-center bg-blue-100 border-l-4 border-soc-navy text-soc-navy p-4 rounded-md">
          <p className="font-bold">Demo Credentials</p>
          <p>Email: <span className="font-mono">admin@soc.com</span></p>
          <p>Password: <span className="font-mono">password</span></p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-soc-gray">Email Address</label>
            <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-soc-gold" />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-soc-gray">Password</label>
            <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-soc-gold" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm font-medium text-white bg-soc-navy hover:bg-opacity-90 disabled:bg-soc-gray transition-colors">
              {loading ? <LoadingSpinner /> : 'Sign In'}
            </button>
          </div>
        </form>
         <div className="text-center">
            <a href="#/" className="text-sm text-soc-gold hover:underline">&larr; Back to main login</a>
        </div>
      </div>
    </div>
  );
};


// --- User (Member) Login Page ---
export const UserLoginPage: React.FC = () => {
  const [nisn, setNisn] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: loginError } = await loginUser(nisn, token);
    if (loginError) {
      setError(loginError);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-soc-navy to-gray-800 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-soc-white rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-soc-navy">Member Login</h1>
          <p className="text-soc-gold">SOC Attendance</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="nisn" className="text-sm font-medium text-soc-gray">NISN</label>
            <input id="nisn" name="nisn" type="text" value={nisn} onChange={(e) => setNisn(e.target.value)} required className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-soc-gold" />
          </div>
          <div>
            <label htmlFor="token" className="text-sm font-medium text-soc-gray">Token</label>
            <input id="token" name="token" type="text" value={token} onChange={(e) => setToken(e.target.value)} required className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-soc-gold" />
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm font-medium text-white bg-soc-navy hover:bg-opacity-90 disabled:bg-soc-gray transition-colors">
              {loading ? <LoadingSpinner /> : 'Sign In'}
            </button>
          </div>
        </form>
         <div className="text-center">
            <a href="#/check-token" className="text-sm text-soc-gold hover:underline">Forgot your token?</a>
            <span className="mx-2 text-soc-gray">|</span>
            <a href="#/" className="text-sm text-soc-gold hover:underline">Back to main login</a>
        </div>
      </div>
    </div>
  );
};
