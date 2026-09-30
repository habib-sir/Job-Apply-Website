export type JobCategory = 'govt' | 'private' | 'ngo' | 'pharma' | 'brac' | 'foreign' | 'solution';
export type JobStatus = 'draft' | 'published' | 'scheduled';

export interface JobPostItem {
  name: string;
  count: number;
  district: 'ALL' | string;
}

export interface MediaSpec {
  width: number;
  height: number;
  maxKB: number;
}

export interface JobCircular {
  id: string;
  title: string;
  slug: string;
  category: JobCategory;
  content: string;
  featuredImage?: string;
  circularFile?: string;
  deadline: any;
  applyLink: string;
  applyServiceEnabled: boolean;
  applicationFee: number;
  serviceCharge: number;
  photoSpec?: MediaSpec;
  signatureSpec?: MediaSpec;
  posts: JobPostItem[];
  status: JobStatus;
  publishedAt?: any;
  createdAt: any;
  updatedAt: any;
}
