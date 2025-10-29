
// This is a MOCK Supabase client.
// In a real application, you would use the official @supabase/supabase-js library
// and configure it with your actual Supabase URL and anon key.
// These would be stored in environment variables (e.g., in Netlify).

import { User, Role, AttendanceRecord, AttendanceStatus } from '../types';

const MOCK_USERS: User[] = [
  { id: '1', email: 'admin@soc.com', full_name: 'SOC Coordinator', role: Role.Admin },
  { id: '2', email: 'member@soc.com', full_name: 'Ahmad Fadhil', role: Role.Member },
  { id: '3', email: 'member2@soc.com', full_name: 'Budi Santoso', role: Role.Member },
  { id: '4', email: 'member3@soc.com', full_name: 'Citra Lestari', role: Role.Member },
];

const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att1', user_id: '2', full_name: 'Ahmad Fadhil', role: Role.Member, date: '2023-10-26', time_in: '2023-10-26T09:05:12Z', time_out: '2023-10-26T17:01:30Z', status: AttendanceStatus.Pulang },
  { id: 'att2', user_id: '3', full_name: 'Budi Santoso', role: Role.Member, date: '2023-10-26', time_in: '2023-10-26T09:01:45Z', time_out: null, status: AttendanceStatus.Hadir },
  { id: 'att3', user_id: '4', full_name: 'Citra Lestari', role: Role.Member, date: '2023-10-25', time_in: null, time_out: null, status: AttendanceStatus.Alpha },
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const getLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const setLocalStorage = <T,>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

let attendanceDB = getLocalStorage<AttendanceRecord[]>('soc_attendance', MOCK_ATTENDANCE);
let usersDB = getLocalStorage<User[]>('soc_users', MOCK_USERS);
let session = getLocalStorage<{ user: User } | null>('soc_session', null);


const mockSupabaseClient = {
  auth: {
    getSession: async () => {
      await delay(100);
      const currentSession = getLocalStorage<{ user: User } | null>('soc_session', null);
      if (!currentSession) return { data: { session: null }, error: null };
      return { data: { session: { user: currentSession.user } }, error: null };
    },
    signInWithPassword: async ({ email, password }: { email: string, password?: string }) => {
      await delay(500);
      const user = usersDB.find(u => u.email === email);
      // In a real app, password would be validated. Here we just check for existence.
      if (user && password === 'password') {
        const newSession = { user };
        setLocalStorage('soc_session', newSession);
        return { data: { user }, error: null };
      }
      return { data: { user: null }, error: { message: 'Invalid credentials' } };
    },
    signOut: async () => {
      await delay(200);
      localStorage.removeItem('soc_session');
      return { error: null };
    },
  },
  from: (tableName: string) => {
    const db = tableName === 'attendance' ? attendanceDB : usersDB;
    let queryBuilder: any = {
      _filters: [],
      _select: '*',
      _single: false,
    };
    
    queryBuilder.select = function(columns = '*') {
      this._select = columns;
      return this;
    }
    
    queryBuilder.eq = function(column: string, value: any) {
      this._filters.push((item: any) => item[column] === value);
      return this;
    }

    queryBuilder.order = function(column: string, { ascending }: { ascending: boolean }) {
       // Mock implementation, sorting is done on client for simplicity
      return this;
    }
    
    queryBuilder.single = function() {
      this._single = true;
      return this;
    }

    queryBuilder.insert = async function(records: any) {
      await delay(300);
      const dbToUpdate = tableName === 'attendance' ? attendanceDB : usersDB;
      const recordsToInsert = Array.isArray(records) ? records : [records];
      
      const newRecords = recordsToInsert.map(r => ({ ...r, id: `mock_${Date.now()}_${Math.random()}` }));
      dbToUpdate.push(...newRecords);

      setLocalStorage(`soc_${tableName}`, dbToUpdate);
      return { data: newRecords, error: null };
    }
    
    queryBuilder.update = async function(dataToUpdate: any) {
      this.dataToUpdate = dataToUpdate;
      await delay(300);
      const dbToUpdate = tableName === 'attendance' ? attendanceDB : usersDB;
      let updatedItems: any[] = [];
      const newDb = dbToUpdate.map(item => {
        if (this._filters.every((filter: (item: any) => boolean) => filter(item))) {
          const updated = { ...item, ...this.dataToUpdate };
          updatedItems.push(updated);
          return updated;
        }
        return item;
      });

      if (tableName === 'attendance') attendanceDB = newDb;
      if (tableName === 'users') usersDB = newDb;

      setLocalStorage(`soc_${tableName}`, newDb);
      return { data: updatedItems, error: null };
    }
    
    // Execute the query
    const execute = async () => {
      await delay(400);
      let results = [...db];
      queryBuilder._filters.forEach((filter: (item: any) => boolean) => {
        results = results.filter(filter);
      });
      
      if(queryBuilder._single) {
          return { data: results[0] || null, error: results.length > 1 ? { message: 'Multiple rows returned for single()' } : null };
      }
      return { data: results, error: null };
    };

    // The functions are async, so we attach .then to simulate promise
    queryBuilder.then = (onfulfilled: any, onrejected: any) => execute().then(onfulfilled, onrejected);
    
    return queryBuilder;
  }
};

// Exporting the mock client with the same name as the real one
export const supabase = mockSupabaseClient;
