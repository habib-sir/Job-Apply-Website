import { getCached, setCached } from './cache';
import { JobCategory } from '../types';
import { R2_BASE } from './jobsStore';
import { sortJobsByDeadline } from '../utils/jobSort';

export interface FeedJobSummary {
  id: string;
  title: string;
  slug: string;
  category: JobCategory | string;
  deadline?: any;
  publishedAt?: any;
  applyServiceEnabled: boolean;
}

export interface FeedDocument {
  posts: FeedJobSummary[];
  updatedAt: any;
}

const CACHE_KEY = 'feed_latest';

/**
 * হোমপেজের ফিড: R2 feed.json → same-origin /feed.json।
 * চলমান সার্কুলার আগে, মেয়াদ শেষ সবার নিচে। R2 ই একমাত্র উৎস।
 */
export async function getFeedLatest(forceRefresh = false): Promise<FeedJobSummary[]> {
  if (!forceRefresh) {
    const cached = getCached<FeedJobSummary[]>(CACHE_KEY);
    if (cached && cached.length > 0) return cached;
  }

  const sources = [`${R2_BASE}/feed.json`, '/feed.json'];
  for (const url of sources) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data?.posts) && data.posts.length > 0) {
        const sorted = sortJobsByDeadline<FeedJobSummary>(data.posts as FeedJobSummary[]);
        setCached(CACHE_KEY, sorted);
        return sorted;
      }
    } catch {
      // পরের source-এ যাও
    }
  }

  return [];
}

/**
 * @deprecated Firestore সরানো হয়েছে। feed.json এখন Worker তৈরি করে।
 */
export async function syncJobToFeed(): Promise<void> {
  return;
}
