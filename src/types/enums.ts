export enum STATUS_CODE {
  ok = 200,
  created = 201,
  no_content = 204,
  bad_request = 400,
  unauthorized = 401,
  forbidden = 403,
  not_found = 404,
  conflict = 409,
  internal_server_err = 500,
  network_connec_timeout = 599,
}
export type USER_ROLES =
  | 'student'
  | 'faculty'
  | 'department_admin'
  | 'campus_admin'
  | 'super_admin';
export type USER_STATUS = 'active' | 'inactive' | 'suspended';

export type FACULTY_TYPE = 'academic' | 'non_academic';

export type GENDER = 'male' | 'female' | 'other';
