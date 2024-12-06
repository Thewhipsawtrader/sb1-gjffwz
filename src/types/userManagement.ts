export type UserCommandType = 'ADD_USER' | 'REMOVE_USER' | 'UPDATE_USER';

export interface UserCommand {
  type: UserCommandType;
  firstName: string;
  lastName: string;
  unitNumber: string;
  username?: string;
  password?: string;
  newUnitNumber?: string;
  newUsername?: string;
}

export interface ManagedUser {
  id: string;
  firstName: string;
  lastName: string;
  unitNumber: string;
  username: string;
  createdAt: string;
  createdBy: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}