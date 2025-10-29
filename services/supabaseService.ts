// This is a MOCK Supabase client.
import { User, Role, AttendanceRecord, AttendanceStatus, OlympiadField } from '../types';

const generateToken = (length = 8) => {
  return Math.random().toString(36).substring(2, length + 2).toUpperCase();
};

const MOCK_USERS: User[] = [
  { id: '1', email: 'admin@soc.com', full_name: 'SOC Coordinator', role: Role.Admin },
  { id: '2', full_name: 'Ahmad Fadhil', role: Role.User, nisn: '1001', token: generateToken(), field: OlympiadField.Physics },
  { id: '3', full_name: 'Budi Santoso', role: Role.User, nisn: '1002', token: generateToken(), field: OlympiadField.Mathematics },
  { id: '4', full_name: 'Citra Lestari', role: Role.User, nisn: '1003', token: generateToken(), field: OlympiadField.Chemistry },
  { id: '5', full_name: 'Dewi Anggraini', role: Role.User, nisn: '1004', token: generateToken(), field: OlympiadField.Biology },
  { id: '6', full_name: 'Eko Prasetyo', role: Role.User, nisn: '1005', token: generateToken(), field: OlympiadField.Physics },
];

const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att1', user_id: '2', full_name: 'Ahmad Fadhil', role: Role.User, field: OlympiadField.Physics, date: '2023-10-26', time_in: '2023-10-26T09:05:12Z', time_out: '2023-10-26T17:01:30Z', status: AttendanceStatus.Pulang },
  { id: 'att2', user_id: '3', full_name: 'Budi Santoso', role: Role.User, field: OlympiadField.Mathematics, date: '2023-10-26', time_in: '2023-10-26T09:01:45Z', time_out: null, status: AttendanceStatus.Hadir },
  { id: 'att3', user_id: '4', full_name: 'Citra Lestari', role: Role.User, field: OlympiadField.Chemistry, date: '2023-10-25', time_in: null, time_out: null, status: AttendanceStatus.Alpha },
  { id: 'att4', user_id: '5', full_name: 'Dewi Anggraini', role: Role.User, field: OlympiadField.Biology, date: '2023-10-26', time_in: '2023-10-26T09:15:00Z', time_out: '2023-10-26T17:05:00Z', status: AttendanceStatus.Pulang },
  { id: 'att5', user_id: '6', full_name: 'Eko Prasetyo', role: Role.User, field: OlympiadField.Physics, date: '2023-10-26', time_in: '2023-10-26T08:59:00Z', time_out: null, status: AttendanceStatus.Hadir },
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

const mockSupabaseClient = {
  auth: {
    // This is now just for checking if a session exists, not tied to Supabase official session
    getSession: async () => {
      await delay(100);
      const currentSession = getLocalStorage<{ user: User } | null>('soc_session', null);
      if (!currentSession) return { data: { session: null }, error: null };
      return { data: { session: { user: currentSession.user } }, error: null };
    },
    signInWithPassword: async ({ email, password }: { email: string, password?: string }) => {
      await delay(500);
      const user = usersDB.find(u => u.email === email && u.role === Role.Admin);
      if (user && password === 'password') {
        const newSession = { user };
        setLocalStorage('soc_session', newSession);
        return { data: { user }, error: null };
      }
      return { data: { user: null }, error: { message: 'Invalid admin credentials' } };
    },
    signInWithNisnToken: async ({ nisn, token }: { nisn: string, token: string }) => {
        await delay(500);
        const user = usersDB.find(u => u.nisn === nisn && u.token === token && u.role === Role.User);
        if (user) {
            const newSession = { user };
            setLocalStorage('soc_session', newSession);
            return { data: { user }, error: null };
        }
        return { data: { user: null }, error: { message: 'NISN atau Token salah' } };
    },
    signOut: async () => {
      await delay(200);
      localStorage.removeItem('soc_session');
      return { error: null };
    },
    // This is no longer for "signing up" but for an admin to create a user.
    // It doesn't create a session.
    createUser: async (userData: Partial<User>) => {
        await delay(500);
        if (usersDB.some(u => u.nisn === userData.nisn)) {
            return { data: null, error: { message: 'User with this NISN already exists' }};
        }
        const newUser: User = {
            id: `mock_user_${Date.now()}`,
            full_name: userData.full_name || '',
            nisn: userData.nisn || '',
            token: generateToken(),
            field: userData.field || OlympiadField.Mathematics,
            role: Role.User,
        };
        usersDB.push(newUser);
        setLocalStorage('soc_users', usersDB);
        return { data: newUser, error: null };
    },
  },
  from: (tableName: string) => {
    let db = tableName === 'attendance' ? attendanceDB : usersDB;
    let queryBuilder: any = {
      _filters: [],
      _select: '*',
      _single: false,
    };
    
    queryBuilder.select = function(columns = '*') { this._select = columns; return this; }
    queryBuilder.eq = function(column: string, value: any) { this._filters.push((item: any) => item[column] === value); return this; }
    queryBuilder.order = function(column: string, { ascending }: { ascending: boolean }) { return this; }
    queryBuilder.single = function() { this._single = true; return this; }

    queryBuilder.insert = async function(records: any) {
      await delay(300);
      const dbToUpdate = tableName === 'attendance' ? attendanceDB : usersDB;
      const recordsToInsert = Array.isArray(records) ? records : [records];
      
      const newRecords = recordsToInsert.map(r => {
        const newUser = { ...r, id: `mock_${Date.now()}_${Math.random()}`};
        if(tableName === 'users' && !newUser.token) {
            newUser.token = generateToken();
            newUser.role = Role.User;
        }
        return newUser;
      });
      
      if(tableName === 'users') {
        usersDB.push(...newRecords);
        setLocalStorage('soc_users', usersDB);
      } else {
        attendanceDB.push(...newRecords);
        setLocalStorage('soc_attendance', attendanceDB);
      }
      return { data: newRecords, error: null };
    }
    
    queryBuilder.update = async function(dataToUpdate: any) {
      this.dataToUpdate = dataToUpdate;
      await delay(300);
      const dbToUpdate = tableName === 'attendance' ? attendanceDB : usersDB;
      let updatedItems: any[] = [];
      const newDb = dbToUpdate.map(item => {
        if (this._filters.every((filter: (item: any) => boolean) => filter(item))) {
          // Special case for regenerating token
          if(tableName === 'users' && this.dataToUpdate.regenerateToken) {
              const updated = { ...item, token: generateToken() };
              updatedItems.push(updated);
              return updated;
          }
          const updated = { ...item, ...this.dataToUpdate };
          updatedItems.push(updated);
          return updated;
        }
        return item;
      });

      if (tableName === 'attendance') { attendanceDB = newDb as AttendanceRecord[]; }
      if (tableName === 'users') { usersDB = newDb as User[]; }

      setLocalStorage(`soc_${tableName}`, newDb);
      return { data: updatedItems, error: null };
    }
    
    queryBuilder.delete = async function() {
      await delay(300);
      if (tableName !== 'users') return { error: { message: 'Delete only mocked for users' }};
      const initialCount = usersDB.length;
      const newDb = usersDB.filter(item => 
        !this._filters.every((filter: (item: any) => boolean) => filter(item))
      );
      if(newDb.length < initialCount) {
        usersDB = newDb;
        setLocalStorage('soc_users', usersDB);
        return { data: { count: initialCount - newDb.length }, error: null };
      }
      return { data: { count: 0 }, error: { message: 'No user found to delete' }};
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

    queryBuilder.then = (onfulfilled: any, onrejected: any) => execute().then(onfulfilled, onrejected);
    
    return queryBuilder;
  }
};

export const supabase = mockSupabaseClient;
