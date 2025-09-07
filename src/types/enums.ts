export enum USER_ROLES {
  STUDENT = 'student',
  FACULTY_ACADEMIC = 'faculty_academic',
  FACULTY_NON_ACADEMIC = 'faculty_non_academic',
  DEPARTMENT_HEAD = 'department_head',
  CAMPUS_HEAD = 'campus_head',
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
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
