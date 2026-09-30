export type UserRole = 'user' | 'admin';

export interface UserAccount {
  mobile: string;
  role: 'user';
  createdAt: any;
}

export interface AdminAccount {
  email: string;
  createdAt: any;
}

export * from './profile';
export * from './job';
export * from './application';
export * from './payment';
export * from './notification';
export * from './settings';
