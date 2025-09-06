import { GENDER, USER_STATUS } from './enums';

export interface CreateAdmin {
  name: string;
  email: string;
  externalId: string;
  role: string;
  campus: string;
  phone?: string;
  gender?: GENDER;
}
export interface UpdateAdmin {
  name?: string;
  email?: string;
  externalId?: string;
  campus?: string;
  phone?: string;
  gender?: GENDER;
}
