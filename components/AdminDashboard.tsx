import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../services/supabaseService';
import { AttendanceRecord, AttendanceStatus, User, OlympiadField, OLYMPIAD_FIELDS, Role } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

const FIELD_COLORS: { [key in OlympiadField]: string } = {
    [OlympiadField.Mathematics]: 'bg-red-500',
    [OlympiadField.Physics]: 'bg-blue-500',
    [OlympiadField.Chemistry]: 'bg-green-500',
    [OlympiadField.Biology]: 'bg-teal-500',
    [OlympiadField.Informatics]: 'bg-purple-500',
    [OlympiadField.Astronomy]: 'bg-indigo-500',
    [OlympiadField.Economics]: 'bg-yellow-500',
    [OlympiadField.EarthScience]: 'bg-orange-500',
    [OlympiadField.Geography]: 'bg-lime-500',
};

const FieldBadge: React.FC<{ field: OlympiadField }> = ({ field }) => (
    <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${FIELD_COLORS[field]}`}>{field}</span>
);

const FieldSummary: React.FC<{ users: User[], records: AttendanceRecord[] }> = ({ users, records }) => {
    const summaryByField = useMemo(() => {
        const result: { [key in OlympiadField]?: { total: number; present: number } } = {};
        for(const field of OLYMPIAD_FIELDS) {
            result[field] = { total: 0, present: 0 };
        }

        users.forEach(user => {
            if(user.role === Role.User && user.field && result[user.field]){
                 result[user.field]!.total++;
            }
        });

        records.forEach(record => {
            if(result[record.field] && (record.status === AttendanceStatus.Hadir || record.status === AttendanceStatus.Pulang)) {
                result[record.field]!.present++;
            }
        });
        
        return OLYMPIAD_FIELDS.map(field => ({
            field,
            memberCount: result[field]?.total || 0,
            attendanceRate: records.filter(r => r.field === field).length > 0 ? ((result[field]?.present || 0) / records.filter(r => r.field === field).length) * 100 : 0,
        }));
    }, [users, records]);

    const maxMemberCount = Math.max(...summaryByField.map(s => s.memberCount), 1);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Members per Field */}
            <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-bold text-soc-navy mb-3">Members per Field</h3>
                <div className="space-y-2">
                    {summaryByField.map(({ field, memberCount }) => (
                        <div key={field} className="flex items-center">
                            <span className="w-28 text-sm text-soc-gray truncate">{field}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-5">
                                <div 
                                    className={`${FIELD_COLORS[field]} h-5 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold`}
                                    style={{ width: `${(memberCount / maxMemberCount) * 100}%`}}
                                >
                                    {memberCount}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
             {/* Attendance Rate by Field */}
            <div className="bg-gray-50 p-4 rounded-lg border">
                 <h3 className="font-bold text-soc-navy mb-3">Attendance Rate by Field (%)</h3>
                 <div className="space-y-2">
                    {summaryByField.map(({ field, attendanceRate }) => (
                        <div key={field} className="flex items-center">
                            <span className="w-28 text-sm text-soc-gray truncate">{field}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-5">
                                <div 
                                    className={`${FIELD_COLORS[field]} h-5 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold`}
                                    style={{ width: `${attendanceRate}%`}}
                                >
                                    {attendanceRate.toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const AdminDashboard: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | ''>('');

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    const [attendanceRes, usersRes] = await Promise.all([
      supabase.from('attendance').select('*').order('date', { ascending: false }),
      supabase.from('users').select('*')
    ]);
    
    if (attendanceRes.error) console.error('Error fetching records:', attendanceRes.error);
    else setRecords(attendanceRes.data as AttendanceRecord[]);

    if (usersRes.error) console.error('Error fetching users:', usersRes.error);
    else setUsers(usersRes.data as User[]);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const filteredRecords = useMemo(() => {
    return records
      .filter(record => 
        record.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(record => 
        filterDate ? record.date === filterDate : true
      )
      .filter(record => 
        filterStatus ? record.status === filterStatus : true
      );
  }, [records, searchTerm, filterDate, filterStatus]);

  const summary = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysRecords = records.filter(r => r.date === today);
    return {
      hadir: todaysRecords.filter(r => r.status === AttendanceStatus.Hadir || r.status === AttendanceStatus.Pulang).length,
      izin: todaysRecords.filter(r => r.status === AttendanceStatus.Izin).length,
      alpha: todaysRecords.filter(r => r.status === AttendanceStatus.Alpha).length,
    };
  }, [records]);

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Role', 'Field', 'Date', 'Time In', 'Time Out', 'Status'];
    const rows = filteredRecords.map(r => 
      [
        r.id, 
        r.full_name, 
        r.role, 
        r.field,
        r.date, 
        r.time_in ? new Date(r.time_in).toLocaleString() : 'N/A', 
        r.time_out ? new Date(r.time_out).toLocaleString() : 'N/A',
        r.status
      ].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `soc_attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const StatusBadge: React.FC<{ status: AttendanceStatus }> = ({ status }) => {
    const colors = {
      [AttendanceStatus.Hadir]: 'bg-green-100 text-green-800',
      [AttendanceStatus.Pulang]: 'bg-blue-100 text-blue-800',
      [AttendanceStatus.Izin]: 'bg-yellow-100 text-yellow-800',
      [AttendanceStatus.Alpha]: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>{status}</span>;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border space-y-6">
      <h2 className="text-2xl font-bold text-soc-navy">Admin Overview</h2>
      
      {loading ? <div className="flex justify-center p-8"><LoadingSpinner /></div> : <FieldSummary users={users} records={records} />}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm font-medium text-green-600">Hadir (Today)</p>
          <p className="text-3xl font-bold text-green-800">{summary.hadir}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm font-medium text-yellow-600">Izin (Today)</p>
          <p className="text-3xl font-bold text-yellow-800">{summary.izin}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm font-medium text-red-600">Alpha (Today)</p>
          <p className="text-3xl font-bold text-red-800">{summary.alpha}</p>
        </div>
      </div>

      {/* Actions and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-grow w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-soc-gold"
          />
        </div>
        <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-soc-gold"
          />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as AttendanceStatus | '')}
          className="w-full md:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-soc-gold"
        >
          <option value="">All Statuses</option>
          {Object.values(AttendanceStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={exportToCSV} className="w-full md:w-auto bg-soc-navy text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
          Export CSV
        </button>
      </div>

      {/* Attendance Table */}
      <div className="overflow-x-auto">
        {loading ? <div className="flex justify-center p-8"><LoadingSpinner /></div> :
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-soc-gray">Name</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-soc-gray">Field</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-soc-gray">Date</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-soc-gray">Time In</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-soc-gray">Time Out</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-soc-gray">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredRecords.map(record => (
              <tr key={record.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{record.full_name}</td>
                <td className="py-3 px-4">{record.field && <FieldBadge field={record.field} />}</td>
                <td className="py-3 px-4">{record.date}</td>
                <td className="py-3 px-4">{record.time_in ? new Date(record.time_in).toLocaleTimeString() : 'N/A'}</td>
                <td className="py-3 px-4">{record.time_out ? new Date(record.time_out).toLocaleTimeString() : 'N/A'}</td>
                <td className="py-3 px-4"><StatusBadge status={record.status} /></td>
              </tr>
            ))}
             {filteredRecords.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-4 text-soc-gray">No records found.</td>
                </tr>
            )}
          </tbody>
        </table>
        }
      </div>
    </div>
  );
};

export default AdminDashboard;
