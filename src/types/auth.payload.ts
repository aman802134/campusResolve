// types/auth.ts
import { USER_ROLES, GENDER, USER_STATUS } from './enums';
/**
 * Payload for user registration
 */
export interface RegisterType {
  name: string;
  email: string;
  password: string;
  campus: string; // required: must refer to a Campus _id
  department?: string; // optional, based on requested role
  phone?: string;
  gender?: GENDER;
  avatarUrl?: string; // optional, can be uploaded later
}
export interface RequestedRoleType {
  requestedRole: USER_ROLES; // optional, can be used to request a different role
  campus: string; // required: must refer to a Campus _id
  department?: string; // optional, based on requested role
}
/**
 * Payload for login
 */
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
  user: {
    id: string;
    name: string;
    email: string;
    role: USER_ROLES; // ✅ Add this
    requestedRole?: USER_ROLES;
    campus: string; // ObjectId as string
    department?: string; // ObjectId as string (optional)
    phone?: string;
    gender?: GENDER;
    avatarUrl?: string;
    status: USER_STATUS;
    verified: boolean;
    isBanned: boolean;
  };
}

/**
 * JWT payload embedded in token
 */
export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  // Note: `role` is required for access control
  role: USER_ROLES; // ✅ Required for access control
  requestedRole?: USER_ROLES; // Optional – only present if role upgrade is pending
  campus?: string; // ObjectId as string
  department?: string; // ObjectId as string
  status: USER_STATUS;
  verified: boolean;
  isBanned: boolean;
  avatarUrl?: string;
}
