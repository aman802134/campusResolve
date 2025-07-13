import { FACULTY_TYPE, GENDER, USER_ROLES } from './enums';

export interface RegisterType {
  name: string;
  email: string;
  password: string;
  role: USER_ROLES;
  campus: string;
  department?: string;
  facultyType?: FACULTY_TYPE;
  phone: string;
  gender: GENDER;
}

export interface LoginType {
  email: string;
  password: string;
}
// export interface AuthResponse {
//   accessToken: string;
//   refreshToken: string;
//   user: {
//     id: string | unknown;
//     name: string;
//     email: string;
//     role: USER_ROLES;
//     campus?: string;
//   };
// }
export interface Jwt_Payload {
  userId: string | unknown;
  role: USER_ROLES;
  email: string;
}
