export type CreateDepartmentPayload = {
  name: string;
  departmentCode: string; // ✅ required for verification/uniqueness
  campus: string; // Campus._id
  adminId?: string; // User._id of the department_admin
  domain?: string[]; // e.g. ['hostel','kitchen']
};

export type UpdateDepartmentPayload = {
  name?: string;
  departmentCode?: string; // ✅ allow updating if needed
  campus?: string; // consistent with CreateDepartmentPayload
  adminId?: string;
  domain?: string[]; // optional, replaces domain list if provided
};

export type DepartmentResponse = {
  id: string; // Department._id
  name: string;
  departmentCode: string; // ✅ expose to frontend if needed
  campus: {
    id: string;
    name: string;
  };
  admin?: {
    id: string;
    name: string;
  };
  domain: string[];
  createdAt: string;
  updatedAt: string;
};
