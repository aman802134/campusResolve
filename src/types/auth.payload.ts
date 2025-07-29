// types/auth.ts
import { USER_ROLES, GENDER, USER_STATUS } from './enums';

/**
 * Payload for user registration
 */
export interface RegisterType {
  name: string;
  email: string;
  password: string;
  role?: USER_ROLES; // default is STUDENT; admins will approve elevated roles
  requestedRole?: USER_ROLES; // if user wants to be deptAdmin/campusAdmin/faculty, etc.
  campus: string; // required: must refer to a Campus _id
  department?: string; // optional, based on requested role
  phone?: string;
  gender?: GENDER;
  avatarUrl?: string; // optional, can be uploaded later
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
    role: USER_ROLES;
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
  role: USER_ROLES;
  requestedRole?: USER_ROLES;
  campus?: string; // campus ObjectId
  department?: string; // department ObjectId
  status: USER_STATUS;
  verified: boolean;
  isBanned: boolean;
  avatarUrl?: string; // optional, can be used for profile picture
}
