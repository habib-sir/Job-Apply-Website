export interface UserNotification {
  id: string;
  uid: string;
  title: string;
  body: string;
  appId?: string;
  read: boolean;
  createdAt: any;
}
