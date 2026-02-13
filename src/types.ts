export type UserStatus = "active" | "inactive" | "pending";

export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  status: UserStatus;
  city: string;
  updatedAt: number;
}

export interface UserPatch {
  name: string;
  age: number;
  status: UserStatus;
  city: string;
}
