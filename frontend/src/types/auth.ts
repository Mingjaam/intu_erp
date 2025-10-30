export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  STAFF = 'staff',
  APPLICANT = 'applicant',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  gender?: Gender;
  birthYear?: number;
  hometown?: string;
  residence?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  organizationId?: string;
  gender?: Gender;
  birthYear?: number;
  hometown?: string;
  residence?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId?: string;
  };
}
