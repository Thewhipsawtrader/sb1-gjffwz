export type UserRole = 'admin' | 'da';

export interface UserMetadata {
  role: UserRole;
  department?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  metadata: UserMetadata;
}