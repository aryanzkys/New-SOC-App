import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import AdminDashboard from '../components/AdminDashboard';
import MemberDashboard from '../components/MemberDashboard';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-md"
        >
          Logout
        </button>
      </div>

      <p className="mb-4">Welcome, {user?.full_name}!</p>

      {user?.role === Role.Admin ? <AdminDashboard /> : <MemberDashboard />}
    </div>
  );
};

export default DashboardPage;
