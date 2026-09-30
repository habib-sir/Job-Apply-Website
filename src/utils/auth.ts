const DOMAIN = import.meta.env.VITE_USER_EMAIL_DOMAIN || '@users.app.local';

export const MOBILE_REGEX = /^01[3-9][0-9]{8}$/;

export function isValidMobile(mobile: string): boolean {
  return MOBILE_REGEX.test(mobile.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function mobileToEmail(mobile: string): string {
  const cleanMobile = mobile.trim();
  return `${cleanMobile}${DOMAIN}`;
}

export function emailToMobile(email: string): string {
  if (!email) return '';
  return email.split('@')[0];
}

export function formatBnNumber(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}
