// types/campus.ts

export type CreateCampusPayload = {
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  campusCode: string; // ✅ Required now, part of verification mapping
};

export type UpdateCampusPayload = {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  campusCode?: string; // ✅ Allow updating campusCode if needed
};

export type CampusResponse = {
  id: string; // maps to Campus._id
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  campusCode: string; // ✅ Expose campusCode for frontend
  admins: Array<{
    id: string;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
};
