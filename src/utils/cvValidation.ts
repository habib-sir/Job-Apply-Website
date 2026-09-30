import { ProfileData } from '../types';
import { isValidMobile } from './auth';

export const NID_REGEX = /^(?:\d{10}|\d{13}|\d{17})$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidNID(nid: string): boolean {
  return NID_REGEX.test(nid.trim());
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidDateOfBirth(dob: string): { valid: boolean; message?: string } {
  if (!dob) return { valid: false, message: 'জন্মতারিখ প্রদান করুন' };
  const birthDate = new Date(dob);
  const today = new Date();

  if (isNaN(birthDate.getTime())) {
    return { valid: false, message: 'সঠিক জন্মতারিখ দিন' };
  }

  if (birthDate > today) {
    return { valid: false, message: 'জন্মতারিখ ভবিষ্যতের হতে পারে না' };
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 14) {
    return { valid: false, message: 'প্রার্থীর বয়স কমপক্ষে ১৪ বছর হতে হবে' };
  }

  return { valid: true };
}

export function generateDegreeString(
  exam?: string,
  subject?: string,
  institute?: string,
  year?: string,
  result?: string
): string {
  const parts = [];
  if (exam && subject) parts.push(`${exam} in ${subject}`);
  else if (exam) parts.push(exam);

  if (institute) parts.push(institute);
  if (year) parts.push(year);
  if (result) parts.push(result.startsWith('CGPA') || result.startsWith('GPA') ? result : `Result: ${result}`);

  return parts.join(', ');
}

export interface CompletenessResult {
  percentage: number;
  missingFields: string[];
}

export function calculateCVCompleteness(data: Partial<ProfileData>, hasPhoto: boolean, hasSignature: boolean): CompletenessResult {
  const requiredChecks: { key: string; label: string; check: boolean }[] = [
    { key: 'fullName', label: 'পূর্ণ নাম (ইংরেজি)', check: Boolean(data.fullName?.trim()) },
    { key: 'nameBn', label: 'নাম (বাংলা)', check: Boolean(data.nameBn?.trim()) },
    { key: 'fatherName', label: 'পিতার নাম (ইংরেজি)', check: Boolean(data.fatherName?.trim()) },
    { key: 'motherName', label: 'মাতার নাম (ইংরেজি)', check: Boolean(data.motherName?.trim()) },
    { key: 'dateOfBirth', label: 'জন্মতারিখ', check: Boolean(data.dateOfBirth && isValidDateOfBirth(data.dateOfBirth).valid) },
    { key: 'gender', label: 'লিঙ্গ', check: Boolean(data.gender) },
    { key: 'religion', label: 'ধর্ম', check: Boolean(data.religion) },
    { key: 'maritalStatus', label: 'বৈবাহিক অবস্থা', check: Boolean(data.maritalStatus) },
    { key: 'nidNo', label: 'এনআইডি (NID) নম্বর', check: Boolean(data.nidNo && isValidNID(data.nidNo)) },
    { key: 'mobile', label: 'মোবাইল নম্বর', check: Boolean(data.mobile && isValidMobile(data.mobile)) },
    { key: 'email', label: 'ইমেইল এড্রেস', check: Boolean(data.email && isValidEmail(data.email)) },
    { key: 'presentDistrict', label: 'বর্তমান জেলা', check: Boolean(data.presentDistrict) },
    { key: 'presentUpazila', label: 'বর্তমান উপজেলা', check: Boolean(data.presentUpazila) },
    { key: 'presentAddress', label: 'বর্তমান গ্রাম/রাস্তা', check: Boolean(data.presentAddress?.trim()) },
    { key: 'permanentDistrict', label: 'স্থায়ী জেলা', check: Boolean(data.permanentDistrict) },
    { key: 'permanentUpazila', label: 'স্থায়ী উপজেলা', check: Boolean(data.permanentUpazila) },
    { key: 'permanentAddress', label: 'স্থায়ী গ্রাম/রাস্তা', check: Boolean(data.permanentAddress?.trim()) },
    { key: 'sscExam', label: 'এসএসসি পরীক্ষার তথ্য', check: Boolean(data.sscExam && data.sscRoll && data.sscYear) },
    { key: 'hscExam', label: 'এইচএসসি পরীক্ষার তথ্য', check: Boolean(data.hscExam && data.hscRoll && data.hscYear) },
    { key: 'photo', label: 'পাসপোর্ট সাইজ ছবি', check: hasPhoto },
    { key: 'signature', label: 'স্বাক্ষর', check: hasSignature },
  ];

  const completed = requiredChecks.filter((c) => c.check).length;
  const missingFields = requiredChecks.filter((c) => !c.check).map((c) => c.label);
  const percentage = Math.round((completed / requiredChecks.length) * 100);

  return { percentage, missingFields };
}
