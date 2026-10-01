import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { getCached, setCached, invalidateCache } from './cache';

export type FileKind = 'photo' | 'signature' | 'screenshot' | 'softcopy' | 'paidcopy' | 'cover';

export interface StoredFileDoc {
  id?: string;
  ownerUid: string;
  kind: FileKind;
  appId?: string;
  mime: string;
  sizeBytes: number;
  data: string; // Base64 dataURL (e.g. data:image/jpeg;base64,...)
  createdAt?: any;
}

// Limits in bytes
export const FILE_LIMITS = {
  PHOTO: 100 * 1024,      // 100 KB
  SIGNATURE: 60 * 1024,   // 60 KB
  SCREENSHOT: 150 * 1024, // 150 KB
  COVER: 100 * 1024,      // 100 KB
  PDF_RAW: 650 * 1024,    // 650 KB
};

// Fixed ID helper generators
export const getFileId = {
  photo: (uid: string) => `${uid}_photo`,
  signature: (uid: string) => `${uid}_signature`,
  screenshot: (appId: string) => `${appId}_screenshot`,
  softcopy: (appId: string) => `${appId}_soft`,
  paidcopy: (appId: string) => `${appId}_paid`,
  cover: (jobId: string) => `job_${jobId}_cover`,
};

/**
 * Save file into Firestore 'files' collection
 */
export async function saveFile(payload: {
  id: string;
  ownerUid: string;
  kind: FileKind;
  appId?: string;
  mime: string;
  sizeBytes: number;
  data: string;
}): Promise<void> {
  const fileRef = doc(db, 'files', payload.id);
  const dataToSave: StoredFileDoc = {
    ownerUid: payload.ownerUid,
    kind: payload.kind,
    mime: payload.mime,
    sizeBytes: payload.sizeBytes,
    data: payload.data,
    createdAt: serverTimestamp(),
  };

  if (payload.appId) {
    dataToSave.appId = payload.appId;
  }

  try {
    await setDoc(fileRef, dataToSave);
    setCached(`file_${payload.id}`, { ...dataToSave, id: payload.id });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `files/${payload.id}`);
  }
}

/**
 * Retrieve file from Firestore 'files' collection (uses 5-min cache)
 */
export async function getFile(id: string): Promise<StoredFileDoc | null> {
  const cacheKey = `file_${id}`;
  const cached = getCached<StoredFileDoc>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const fileRef = doc(db, 'files', id);
    const snap = await getDoc(fileRef);
    if (!snap.exists()) {
      return null;
    }
    const data = { id: snap.id, ...snap.data() } as StoredFileDoc;
    setCached(cacheKey, data);
    return data;
  } catch (err) {
    console.warn(`File ${id} fetch warning:`, err);
    return null;
  }
}

/**
 * Delete file from Firestore 'files' collection
 */
export async function deleteFile(id: string): Promise<void> {
  try {
    const fileRef = doc(db, 'files', id);
    await deleteDoc(fileRef);
    invalidateCache(`file_${id}`);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `files/${id}`);
  }
}

/**
 * Validate Google Drive / Google Docs URL
 */
export function isValidDriveUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.hostname === 'drive.google.com' || parsed.hostname === 'docs.google.com';
  } catch {
    return false;
  }
}

/**
 * Read raw file (PDF, etc.) as Base64 Data URL with <=650KB check
 */
export async function readPdfAsDataUrl(file: File): Promise<{ dataUrl: string; sizeBytes: number }> {
  if (file.size > FILE_LIMITS.PDF_RAW) {
    throw new Error('PDF ছোট করুন অথবা Google Drive লিংক দিন');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        dataUrl: reader.result as string,
        sizeBytes: file.size,
      });
    };
    reader.onerror = () => reject(new Error('ফাইল পড়তে ব্যর্থ হয়েছে'));
    reader.readAsDataURL(file);
  });
}

/**
 * Browser image resize & compress utility using HTML5 Canvas
 * Produces base64 dataURL respecting maxWidth, maxHeight, and maxSizeBytes
 */
export async function compressImageToDataUrl(
  file: File,
  maxWidth: number,
  maxHeight: number,
  maxSizeBytes: number,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
): Promise<{ dataUrl: string; sizeBytes: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('ছবি পড়তে ব্যর্থ হয়েছে'));

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Scale to fit within maxWidth / maxHeight
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('ক্যানভাস প্রসেসিং ব্যর্থ হয়েছে'));
        return;
      }

      // Draw with white background for JPEG
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Iterative quality adjustment to stay strictly under maxSizeBytes
      let quality = 0.9;
      let dataUrl = canvas.toDataURL(mimeType, quality);
      let byteLength = estimateDataUrlBytes(dataUrl);

      while (byteLength > maxSizeBytes && quality > 0.1) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL(mimeType, quality);
        byteLength = estimateDataUrlBytes(dataUrl);
      }

      // If still over limit (e.g. strict 60KB/100KB with huge detail), downscale dimensions
      if (byteLength > maxSizeBytes) {
        let scale = 0.8;
        while (byteLength > maxSizeBytes && scale >= 0.4) {
          const scaledW = Math.round(width * scale);
          const scaledH = Math.round(height * scale);
          canvas.width = scaledW;
          canvas.height = scaledH;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, scaledW, scaledH);
          ctx.drawImage(img, 0, 0, scaledW, scaledH);
          dataUrl = canvas.toDataURL(mimeType, 0.7);
          byteLength = estimateDataUrlBytes(dataUrl);
          scale -= 0.2;
        }
      }

      if (byteLength > maxSizeBytes) {
        reject(new Error(`ছবির সাইজ সংকুচিত করার পরও অনুমোদিত সীমার বেশি (${Math.round(byteLength / 1024)} KB)`));
        return;
      }

      resolve({
        dataUrl,
        sizeBytes: byteLength,
      });
    };

    img.onerror = () => reject(new Error('ছবি লোড করতে ব্যর্থ হয়েছে'));
    reader.readAsDataURL(file);
  });
}

function estimateDataUrlBytes(dataUrl: string): number {
  const base64Str = dataUrl.split(',')[1] || '';
  return Math.round((base64Str.length * 3) / 4);
}

/**
 * Open or download a stored file from dataURL
 */
export async function downloadOrOpenFile(
  fileId: string,
  fallbackFilename: string,
  mode: 'download' | 'open' = 'open'
): Promise<void> {
  const fileDoc = await getFile(fileId);
  if (!fileDoc || !fileDoc.data) {
    throw new Error('ফাইল পাওয়া যায়নি বা মুছে ফেলা হয়েছে');
  }

  // Convert dataURL to Blob for reliable popup/download without url size limits
  const parts = fileDoc.data.split(',');
  const mime = fileDoc.mime || parts[0]?.match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const byteCharacters = atob(parts[1] || '');
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mime });
  const blobUrl = URL.createObjectURL(blob);

  if (mode === 'download') {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fallbackFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } else {
    // Open in new window/tab
    const w = window.open(blobUrl, '_blank');
    if (!w) {
      // Fallback to download if popup blocked
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fallbackFilename;
      a.click();
    }
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  }
}
