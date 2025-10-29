
export enum Role {
  Admin = 'Admin',
  Member = 'Member',
}

export enum AttendanceStatus {
  Hadir = 'Hadir',
  Izin = 'Izin',
  Alpha = 'Alpha',
  Pulang = 'Pulang'
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  avatar_url?: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  full_name: string;
  role: Role;
  date: string; // YYYY-MM-DD
  time_in: string | null; // ISO 8601 format
  time_out: string | null; // ISO 8601 format
  status: AttendanceStatus;
}
