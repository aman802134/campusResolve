// types/campus.ts

export type CreateCampusPayload = {
  name: string;
  location: string;
  adminIds?: string[]; // renamed to clarify it's a list of user IDs
};

export type UpdateCampusPayload = {
  name?: string;
  location?: string;
  adminIds?: string[]; // replaces the full admin array
};

export type CampusResponse = {
  id: string;
  name: string;
  location: string;
  admins: Array<{
    id: string;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
};
