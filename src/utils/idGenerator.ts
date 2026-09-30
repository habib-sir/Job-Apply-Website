import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Generates an atomic application ID formatted as APL-YYMMDD-XXXX.
 * Uses a Firestore transaction on counters/applications_YYMMDD to ensure strict uniqueness.
 */
export async function generateApplicationId(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateKey = `${yy}${mm}${dd}`;
  const counterDocRef = doc(db, 'counters', `applications_${dateKey}`);

  const nextSeq = await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterDocRef);
    let currentCount = 0;

    if (counterSnap.exists()) {
      currentCount = counterSnap.data()?.count || 0;
    }

    const newCount = currentCount + 1;
    transaction.set(counterDocRef, {
      count: newCount,
      dateKey,
      updatedAt: new Date().toISOString(),
    });

    return newCount;
  });

  const paddedSeq = String(nextSeq).padStart(4, '0');
  return `APL-${dateKey}-${paddedSeq}`;
}
