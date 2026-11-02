const STORAGE_KEY = 'bdjobapply_saved_jobs';
const CHANGE_EVENT = 'bdjobapply:saved-jobs-changed';

function readIds(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)]));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Private browsing/storage restrictions should not break job browsing.
  }
}

export function getSavedJobIds(): string[] {
  if (typeof window === 'undefined') return [];
  return readIds();
}

export function isJobSaved(jobId: string): boolean {
  return getSavedJobIds().includes(String(jobId));
}

export function toggleSavedJob(jobId: string): boolean {
  const id = String(jobId);
  const ids = getSavedJobIds();
  const saved = ids.includes(id);
  writeIds(saved ? ids.filter((item) => item !== id) : [...ids, id]);
  return !saved;
}

export function subscribeToSavedJobs(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}
