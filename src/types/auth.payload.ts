// types/auth.ts
import { USER_ROLES, GENDER, USER_STATUS } from './enums';
/**
 * Payload for user registration
 */
export interface RegisterType {
  name: string;
  email: string;
  password: string;
  externalId: string; // required: could be studentId, facultyId, etc.
  campus: string; // ObjectId as string
  department?: string; // optional, some roles may not need it
  phone?: string;
  gender?: GENDER;
  avatarUrl?: string;
}
export interface RequestedRoleType {
  requestedRole: USER_ROLES;
  campus: string;
  department?: string;
}

export interface LoginType {
  email: string;
  password: string;
}

/**
 * Auth response payload sent to frontend
 */
export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string | unknown;
  name: string;
  email: string;
  role: USER_ROLES;
  externalId: string;
  campus: string;
  department?: string;
  phone?: string;
  gender?: GENDER;
  avatarUrl?: string;
  status: USER_STATUS;
  verified: boolean;
  isBanned: boolean;
  requestedRole?: USER_ROLES;
}

/**
 * JWT payload embedded in token
 */
export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  role: USER_ROLES;
  externalId: string;
  campus?: string;
  department?: string;
  status: USER_STATUS;
  verified: boolean;
  isBanned: boolean;
  avatarUrl?: string;
  requestedRole?: USER_ROLES;
}
export interface DecodedToken extends JwtPayload {
  id: string;
}
