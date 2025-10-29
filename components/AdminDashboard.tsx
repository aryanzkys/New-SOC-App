import React from 'react';
import AdminSummaryDashboard from './AdminSummaryDashboard';

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <a href="#/admin/users" className="text-blue-500 hover:underline">
        Manage Users
      </a>
      <AdminSummaryDashboard />
    </div>
  );
};

export default AdminDashboard;
