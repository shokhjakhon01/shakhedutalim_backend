import { UserDocument } from './user.schema';

export type RoleUser = 'ADMIN' | 'INSTRUCTOR' | 'USER';

export type UserTypeData = keyof UserDocument;

export interface InterfaceEmailAndPassword {
  email: string;
  password: string;
}
