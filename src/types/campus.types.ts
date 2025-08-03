// types/campus.ts

export type CreateCampusPayload = {
  name: string;
  location: string;
  campusCode: string; // ✅ Required now, part of verification mapping
  adminIds?: string[]; // optional list of User._id
};

export type UpdateCampusPayload = {
  name?: string;
  location?: string;
  campusCode?: string; // ✅ Allow updating campusCode if needed
  adminIds?: string[]; // optional, replaces entire admin list
};

export type CampusResponse = {
  id: string; // maps to Campus._id
  name: string;
  location: string;
  campusCode: string; // ✅ Expose campusCode for frontend
  admins: Array<{
    id: string;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
};
