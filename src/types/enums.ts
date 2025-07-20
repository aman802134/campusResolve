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
export enum USER_ROLES {
  STUDENT = 'student',
  FACULTY_ACADEMIC = 'faculty_academic',
  FACULTY_NON_ACADEMIC = 'faculty_non_academic',
  DEPARTMENT_ADMIN = 'department_admin',
  CAMPUS_ADMIN = 'campus_admin',
  SUPER_ADMIN = 'super_admin',
}
export enum USER_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  BANNED = 'banned',
}
export enum GENDER {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}
export enum ROLE_REQUEST_STATUS {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
export enum TICKET_STATUS {
  Assigned = 'assigned',
  Pending = 'pending',
  In_progress = 'in_progress',
  Resolved = 'resolved',
  Rejected = 'rejected',
  Escalated = 'escalated',
}

export enum PRIORITY {
  low = 'low',
  medium = 'medium',
  high = 'high',
  critical = 'critical',
}
