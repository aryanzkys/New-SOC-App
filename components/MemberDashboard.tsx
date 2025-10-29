
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseService';
import { AttendanceRecord, AttendanceStatus } from '../types';
import Modal from './Modal';
import { LoadingSpinner } from './LoadingSpinner';

const MemberDashboard: React.FC = () => {
  const { user } = useAuth();
  const [todaysRecord, setTodaysRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'in' | 'out' | null>(null);

  const fetchTodaysRecord = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (error && error.message.includes('Multiple rows')) {
        setError('Error: Found multiple records for today. Please contact an admin.');
    } else {
        setTodaysRecord(data as AttendanceRecord | null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTodaysRecord();
  }, [fetchTodaysRecord]);

  const handleAttendance = async () => {
    if (!user || !modalAction) return;

    const now = new Date().toISOString();
    const today = now.split('T')[0];
    
    setLoading(true);
    setShowModal(false);

    try {
      if (modalAction === 'in' && !todaysRecord) {
        // Check in
        const { error } = await supabase.from('attendance').insert({
          user_id: user.id,
          full_name: user.full_name,
          role: user.role,
          date: today,
          time_in: now,
          status: AttendanceStatus.Hadir,
        });
        if (error) throw error;
      } else if (modalAction === 'out' && todaysRecord && !todaysRecord.time_out) {
        // Check out
        const { error } = await supabase.from('attendance').update({ 
            time_out: now,
            status: AttendanceStatus.Pulang,
        }).eq('id', todaysRecord.id);
        if (error) throw error;
      }
    } catch (err: any) {
      setError(`Failed to update attendance: ${err.message}`);
    } finally {
      await fetchTodaysRecord();
      setLoading(false);
      setModalAction(null);
    }
  };

  const openModal = (action: 'in' | 'out') => {
    setModalAction(action);
    setShowModal(true);
  };
  
  const getStatusMessage = () => {
    if (!todaysRecord) {
        return { text: "You haven't checked in today.", color: "text-soc-gray" };
    }
    if (todaysRecord.time_in && !todaysRecord.time_out) {
        return { text: `Checked in at ${new Date(todaysRecord.time_in).toLocaleTimeString()}.`, color: "text-green-600" };
    }
    if (todaysRecord.time_in && todaysRecord.time_out) {
        return { text: `You have checked out for the day.`, color: "text-blue-600" };
    }
    return { text: 'Your status for today is recorded.', color: "text-soc-navy" };
  }

  const { text: statusText, color: statusColor } = getStatusMessage();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border">
      <h2 className="text-2xl font-bold text-soc-navy mb-4">Your Attendance</h2>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <LoadingSpinner />
        </div>
      ) : (
        <>
        <div className={`text-lg font-semibold mb-6 p-4 rounded-md bg-gray-100 ${statusColor}`}>
          {statusText}
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => openModal('in')}
            disabled={!!todaysRecord}
            className="flex-1 py-4 px-6 text-lg font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Presensi Masuk (Check In)
          </button>
          <button
            onClick={() => openModal('out')}
            disabled={!todaysRecord || !!todaysRecord.time_out}
            className="flex-1 py-4 px-6 text-lg font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Presensi Pulang (Check Out)
          </button>
        </div>
        </>
      )}
      {showModal && (
        <Modal
          title={`Confirm Check ${modalAction === 'in' ? 'In' : 'Out'}`}
          onClose={() => setShowModal(false)}
          onConfirm={handleAttendance}
        >
          Are you sure you want to mark your attendance for check {modalAction === 'in' ? 'in' : 'out'}? The current time will be recorded.
        </Modal>
      )}
    </div>
  );
};

export default MemberDashboard;
