import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Clock from '../components/Clock';
import AdminDashboard from '../components/AdminDashboard';
import MemberDashboard from '../components/MemberDashboard';
import Modal from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../App';
import { supabase } from '../services/supabaseService';
import { Role, User, OlympiadField, OLYMPIAD_FIELDS } from '../types';

// --- User Management Components ---

const AddUserManually: React.FC<{ onUserAdded: () => void }> = ({ onUserAdded }) => {
    const [formData, setFormData] = useState({ full_name: '', nisn: '', field: OlympiadField.Mathematics });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successData, setSuccessData] = useState<User | null>(null);
    const toast = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.full_name || !formData.nisn) {
            setError('Please fill all fields.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccessData(null);

        try {
            const { data, error } = await supabase.auth.createUser({
                full_name: formData.full_name,
                nisn: formData.nisn,
                field: formData.field,
            });
            if (error) throw error;
            toast.addToast('User added successfully!', 'success');
            setSuccessData(data);
            setFormData({ full_name: '', nisn: '', field: OlympiadField.Mathematics }); // Reset form
            onUserAdded();
        } catch (err: any) {
            setError(err.message);
            toast.addToast(`Error: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };
    
    if (successData) {
        return (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md space-y-2">
                <h4 className="font-bold">User Created Successfully!</h4>
                <p><strong>Name:</strong> {successData.full_name}</p>
                <p><strong>NISN:</strong> {successData.nisn}</p>
                <p><strong>Generated Token:</strong> <code className="bg-green-200 p-1 rounded font-mono">{successData.token}</code></p>
                <button onClick={() => setSuccessData(null)} className="mt-2 bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700">Add Another User</button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-soc-gray">Full Name</label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-soc-gold" required/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-soc-gray">NISN</label>
                    <input type="text" name="nisn" value={formData.nisn} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-soc-gold" required/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-soc-gray">Field</label>
                    <select name="field" value={formData.field} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-soc-gold">
                        {OLYMPIAD_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end">
                <button type="submit" disabled={loading} className="bg-soc-navy text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-semibold disabled:bg-soc-gray flex items-center">
                    {loading ? <LoadingSpinner /> : 'Add User'}
                </button>
            </div>
        </form>
    );
};

const UploadUserCSV: React.FC<{ onUploadComplete: () => void }> = ({ onUploadComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Omit<User, 'id' | 'role' | 'token'>[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const toast = useToast();

    const handleDownloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8," + "full_name,nisn\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "soc_member_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };
    
    const parseCSV = (csvFile: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n').slice(1); // ignore header
            const users: Omit<User, 'id' | 'role' | 'token'>[] = [];
            rows.forEach(rowStr => {
                const [full_name, nisn] = rowStr.split(',').map(s => s.trim());
                if (full_name && nisn) { users.push({ full_name, nisn }); }
            });
            setParsedData(users);
        };
        reader.readAsText(csvFile);
    };

    const handleUpload = async () => {
        if (parsedData.length === 0) { return; }
        setLoading(true);
        setError('');
        try {
            // In a real app, this would be a single bulk insert call
            for (const user of parsedData) {
                await supabase.from('users').insert(user);
            }
            toast.addToast(`${parsedData.length} users uploaded successfully!`, 'success');
            onUploadComplete();
            setParsedData([]);
            setFile(null);
        } catch(err: any) {
            setError(`Upload failed: ${err.message}`);
            toast.addToast(`Upload failed: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <button onClick={handleDownloadTemplate} className="w-full md:w-auto bg-soc-gold text-soc-navy px-4 py-2 rounded-lg hover:bg-soc-gold-light transition-colors font-semibold">Download CSV Template</button>
                <div className="flex-grow">
                     <input type="file" accept=".csv" onChange={handleFileChange} className="w-full text-sm text-soc-gray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-soc-navy file:text-white hover:file:bg-opacity-90"/>
                </div>
            </div>

            {parsedData.length > 0 && (
                <div className="space-y-3">
                    <div className="mt-4 max-h-48 overflow-y-auto border rounded-lg p-2 bg-white">
                        <h4 className="font-semibold text-soc-navy">Users to be imported: {parsedData.length}</h4>
                        <ul className="text-sm list-disc list-inside">
                            {parsedData.map(u => <li key={u.nisn}>{u.full_name} ({u.nisn})</li>)}
                        </ul>
                    </div>
                    <div className="flex justify-end">
                         <button onClick={handleUpload} disabled={loading} className="bg-soc-navy text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-semibold disabled:bg-soc-gray flex items-center">
                            {loading ? <LoadingSpinner /> : `Confirm & Upload ${parsedData.length} Users`}
                         </button>
                    </div>
                </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
};


const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'manual' | 'csv'>('manual');
  const toast = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      toast.addToast(`Error fetching users: ${error.message}`, 'error');
    } else {
      // Filter out the admin from the user management list
      setUsers((data as User[]).filter(u => u.role === Role.User));
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const handleDelete = async () => {
      if(!userToDelete) return;
      setLoading(true);
      const { error } = await supabase.from('users').delete().eq('id', userToDelete.id);
      if(error) { toast.addToast(`Error: ${error.message}`, 'error'); } 
      else { toast.addToast('User deleted successfully!', 'success'); fetchUsers(); }
      setUserToDelete(null);
      setLoading(false);
  };

  const handleRegenerateToken = async (user: User) => {
    setLoading(true);
    const { error } = await supabase.from('users').update({ regenerateToken: true }).eq('id', user.id);
    if(error) { toast.addToast(`Error: ${error.message}`, 'error'); }
    else { toast.addToast(`Token for ${user.full_name} regenerated!`, 'success'); fetchUsers(); }
    setLoading(false);
  };

  const filteredUsers = useMemo(() =>
    users.filter(u => u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || u.nisn?.includes(searchTerm))
  , [users, searchTerm]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border space-y-6">
      <h2 className="text-2xl font-bold text-soc-navy">User Management</h2>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          <button onClick={() => setActiveTab('manual')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'manual' ? 'border-soc-gold text-soc-navy' : 'border-transparent text-soc-gray hover:text-soc-navy'}`}>
            Manual Input
          </button>
          <button onClick={() => setActiveTab('csv')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'csv' ? 'border-soc-gold text-soc-navy' : 'border-transparent text-soc-gray hover:text-soc-navy'}`}>
            Upload CSV
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'manual' && <AddUserManually onUserAdded={fetchUsers} />}
        {activeTab === 'csv' && <UploadUserCSV onUploadComplete={fetchUsers} />}
      </div>
       
       <input
            type="text"
            placeholder="Search by name or NISN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-soc-gold"
       />

      <div className="overflow-x-auto">
        {loading ? <div className="flex justify-center p-8"><LoadingSpinner /></div> :
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-soc-gray">Name</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-soc-gray">NISN</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-soc-gray">Field</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-soc-gray">Token</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-soc-gray">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{user.full_name}</td>
                <td className="py-3 px-4">{user.nisn}</td>
                <td className="py-3 px-4">{user.field}</td>
                <td className="py-3 px-4 font-mono text-sm">{user.token}</td>
                <td className="py-3 px-4 flex flex-wrap gap-2 text-sm">
                    <button onClick={() => handleRegenerateToken(user)} className="text-blue-600 hover:underline">Regenerate</button>
                    <button onClick={() => setUserToDelete(user)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        }
      </div>

       {userToDelete && (
        <Modal title="Confirm Deletion" onClose={() => setUserToDelete(null)} onConfirm={handleDelete}>
            Are you sure you want to delete the user {userToDelete.full_name}? This action cannot be undone.
        </Modal>
       )}
    </div>
  );
};

// --- Main Dashboard Page ---
const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [adminView, setAdminView] = useState<'dashboard' | 'users'>('dashboard');

  const isAdmin = user?.role === Role.Admin;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar setView={isAdmin ? setAdminView : undefined} activeView={isAdmin ? adminView : undefined}/>
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-soc-navy">Welcome, {user?.full_name}!</h1>
            <p className="text-soc-gray">
              {isAdmin ? (adminView === 'users' 
                ? 'Add, edit, and manage club member data.'
                : 'View attendance summary and records.')
                : 'Manage your attendance for the Olympiad Club.'
              }
            </p>
          </div>
          <Clock />
        </div>

        {isAdmin ? (
          <>
            {adminView === 'dashboard' && <AdminDashboard />}
            {adminView === 'users' && <AdminUsersPage />}
          </>
        ) : (
          <MemberDashboard />
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
