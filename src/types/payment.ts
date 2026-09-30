export type PaymentMethod = 'bkash' | 'rocket';

export interface PaymentDetails {
  method: PaymentMethod;
  trxId: string;
  senderNumber: string;
  screenshotPath?: string;
  screenshotUrl?: string;
  verified: boolean;
  verifiedAt?: any;
  verifiedBy?: string;
}

export interface TrxRecord {
  trxId: string;
  appId: string;
  uid: string;
  createdAt: any;
}
