
import React from 'react';
import Navbar from '../components/Navbar';
import Clock from '../components/Clock';
import AdminDashboard from '../components/AdminDashboard';
import MemberDashboard from '../components/MemberDashboard';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-soc-navy">Welcome, {user?.full_name}!</h1>
            <p className="text-soc-gray">Manage your attendance for the Olympiad Club.</p>
          </div>
          <Clock />
        </div>

        {user?.role === Role.Admin ? <AdminDashboard /> : <MemberDashboard />}
      </main>
    </div>
  );
};

export default DashboardPage;
