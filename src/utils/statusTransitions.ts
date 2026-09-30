import { ApplicationStatus } from '../types';
import { doc, updateDoc, serverTimestamp, setDoc, collection } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Spec 6: Allowed status transitions matrix.
 */
export const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  waiting: ['apply_now', 'rejected'],
  apply_now: ['checking', 'rejected'],
  checking: ['payment_now', 'correction', 'rejected'],
  correction: ['checking', 'rejected'],
  payment_now: ['applied', 'rejected'],
  applied: [],
  rejected: [],
};

export function canTransitionStatus(
  current: ApplicationStatus,
  target: ApplicationStatus
): boolean {
  const allowed = ALLOWED_TRANSITIONS[current] || [];
  return allowed.includes(target);
}

/**
 * Creates an in-app user notification when an application status updates.
 */
export async function createUserNotification(
  uid: string,
  appId: string,
  title: string,
  body: string
) {
  try {
    const notifId = doc(collection(db, 'notifications')).id;
    await setDoc(doc(db, 'notifications', notifId), {
      uid,
      title,
      body,
      appId,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    // Handled silently
  }
}
