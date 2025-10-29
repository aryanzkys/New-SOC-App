import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseService';
import { useToast } from '../App';
import { OLYMPIAD_FIELDS, Role, User } from '../types';
import Papa from 'papaparse';
import Modal from '../components/Modal';

const AdminUserManagementPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.User);
  const [field, setField] = useState(OLYMPIAD_FIELDS[0]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { addToast } = useToast();

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (data) {
      setUsers(data);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.createUser({
      full_name: fullName,
      email,
      password,
      role,
      field,
    });

    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast('User added successfully', 'success');
      setFullName('');
      setEmail('');
      setPassword('');
      setRole(Role.User);
      setField(OLYMPIAD_FIELDS[0]);
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const { error } = await supabase.auth.deleteUser(userId);
      if (error) {
        addToast(error.message, 'error');
      } else {
        addToast('User deleted successfully', 'success');
        fetchUsers();
      }
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async () => {
    if (editingUser) {
      const { error } = await supabase.from('users').update({
        full_name: editingUser.full_name,
        email: editingUser.email,
        role: editingUser.role,
        field: editingUser.field,
      }).eq('id', editingUser.id);

      if (error) {
        addToast(error.message, 'error');
      } else {
        addToast('User updated successfully', 'success');
        setEditingUser(null);
        fetchUsers();
      }
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const newUsers = results.data as any[];
          for (const user of newUsers) {
            await supabase.auth.createUser({
              full_name: user.full_name,
              email: user.email,
              password: user.password,
              role: user.role,
              field: user.field,
            });
          }
          addToast('Users added successfully from CSV', 'success');
          fetchUsers();
        },
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin User Management</h1>

      {/* Add User Form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Add New User</h2>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value={Role.User}>Member</option>
              <option value={Role.Admin}>Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Olympiad Field</label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              {OLYMPIAD_FIELDS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-soc-navy text-white rounded-md"
          >
            Add User
          </button>
        </form>
      </div>

      {/* CSV Upload Option */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Upload Users via CSV</h2>
        <input type="file" accept=".csv" onChange={handleCsvUpload} />
      </div>

      {/* Users Table */}
      <div>
        <h2 className="text-xl font-semibold mb-2">All Users</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 p-2 border rounded-md"
        />
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Full Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Role</th>
                <th className="py-2 px-4 border-b">Field</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="py-2 px-4 border-b">{user.full_name}</td>
                  <td className="py-2 px-4 border-b">{user.email || '-'}</td>
                  <td className="py-2 px-4 border-b">{user.role}</td>
                  <td className="py-2 px-4 border-b">{user.field || '-'}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-500 hover:underline mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <Modal
          title="Edit User"
          onClose={() => setEditingUser(null)}
          onConfirm={handleUpdateUser}
        >
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input
                type="text"
                value={editingUser.full_name}
                onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Role</label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as Role })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value={Role.User}>Member</option>
                <option value={Role.Admin}>Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Olympiad Field</label>
              <select
                value={editingUser.field}
                onChange={(e) => setEditingUser({ ...editingUser, field: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                {OLYMPIAD_FIELDS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminUserManagementPage;
