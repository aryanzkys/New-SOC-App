export enum Role {
  Admin = 'Admin',
  User = 'User',
}

export enum AttendanceStatus {
  Hadir = 'Hadir',
  Izin = 'Izin',
  Alpha = 'Alpha',
  Pulang = 'Pulang'
}

export enum OlympiadField {
  Mathematics = 'Mathematics',
  Physics = 'Physics',
  Chemistry = 'Chemistry',
  Biology = 'Biology',
  Informatics = 'Informatics',
  Astronomy = 'Astronomy',
  Economics = 'Economics',
  EarthScience = 'Earth Science',
  Geography = 'Geography',
}

export const OLYMPIAD_FIELDS = Object.values(OlympiadField);

export interface User {
  id: string;
  full_name: string;
  role: Role;
  // Admin-specific
  email?: string;
  // User-specific
  nisn?: string;
  token?: string;
  field?: OlympiadField;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  full_name: string;
  role: Role;
  field: OlympiadField;
  date: string; // YYYY-MM-DD
  time_in: string | null; // ISO 8601 format
  time_out: string | null; // ISO 8601 format
  status: AttendanceStatus;
}
