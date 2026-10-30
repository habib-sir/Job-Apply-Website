export interface SalaryScaleOption {
  grade: string;
  minValue?: number;
  maxValue?: number;
}

export interface SalaryScaleConfig {
  version: string;
  sourceUrl?: string;
  updatedAt?: string;
  scales: SalaryScaleOption[];
}

export const DEFAULT_SALARY_SCALE_CONFIG: SalaryScaleConfig = {
  version: 'জাতীয় বেতন স্কেল ২০২৬',
  sourceUrl: 'https://mof.gov.bd/pages/static-pages/6ac353cd5f8380a72a53bfca',
  scales: Array.from({ length: 20 }, (_, index) => ({
    grade: `${index + 1}তম গ্রেড`,
  })),
};

export const formatSalary = (value?: number) =>
  value == null || Number.isNaN(Number(value)) ? '' : Number(value).toLocaleString('bn-BD');
