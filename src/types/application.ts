import { PaymentDetails } from './payment';

export type ApplicationStatus =
  | 'waiting'
  | 'apply_now'
  | 'checking'
  | 'payment_now'
  | 'applied'
  | 'rejected'
  | 'correction';

export interface ApplicationFee {
  applicationFee: number;
  serviceCharge: number;
  total: number;
}

export interface JobApplication {
  id: string; // Format: APL-YYMMDD-0001
  uid: string;
  mobile: string;
  fullName: string;
  jobId: string;
  jobTitle: string;
  postName: string;
  postCount: number;
  district: string;
  educationLevel: string;
  smsNumber: string;
  termsAccepted: true;
  status: ApplicationStatus;
  applyLink?: string;
  deadline?: any;
  fee: ApplicationFee;
  payment: PaymentDetails;
  softCopyPath?: string;
  paidCopyPath?: string;
  softCopyUrl?: string;
  paidCopyUrl?: string;
  correctionNote?: string;
  rejectReason?: string;
  createdAt: any;
  updatedAt: any;
}
