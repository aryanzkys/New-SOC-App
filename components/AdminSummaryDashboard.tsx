import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseService';
import { User, OlympiadField } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const AdminSummaryDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('users').select('*');
      if (data) {
        setUsers(data);
      }
    };
    fetchUsers();
  }, []);

  const membersPerField = users.reduce((acc, user) => {
    if (user.field) {
      acc[user.field] = (acc[user.field] || 0) + 1;
    }
    return acc;
  }, {} as Record<OlympiadField, number>);

  const data = Object.entries(membersPerField).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Members per Olympiad Field</h2>
      <BarChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </div>
  );
};

export default AdminSummaryDashboard;
