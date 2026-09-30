export interface CustomField {
  key: string;
  value: string;
}

export interface ProfileData {
  name: string;
  fullName: string;
  nameBn: string;
  fatherName: string;
  fatherBn: string;
  motherName: string;
  motherBn: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: string;
  nationality: string;
  religion: string;
  maritalStatus: string;
  spouseName?: string;
  bloodGroup: string;
  nidType: string;
  nidNo: string;
  birthRegNo?: string;
  passportNo?: string;
  mobile: string;
  mobileConfirm: string;
  email: string;
  quota: string;
  quotaDetails?: string;
  depStatus?: string;
  presentCareOf: string;
  presentAddress: string;
  presentDistrict: string;
  presentUpazila: string;
  presentPost: string;
  presentPostcode: string;
  permanentCareOf: string;
  permanentAddress: string;
  permanentDistrict: string;
  permanentUpazila: string;
  permanentPost: string;
  permanentPostcode: string;
  sameAsPresent: boolean;
  fatherOccupation?: string;
  sscExam?: string;
  sscRoll?: string;
  sscGroup?: string;
  sscGroupOther?: string;
  sscBoard?: string;
  sscBoardOther?: string;
  sscResultType?: string;
  sscResult?: string;
  sscYear?: string;
  hscExam?: string;
  hscRoll?: string;
  hscGroup?: string;
  hscGroupOther?: string;
  hscBoard?: string;
  hscBoardOther?: string;
  hscResultType?: string;
  hscResult?: string;
  hscYear?: string;
  graExam?: string;
  graInstitute?: string;
  graSubject?: string;
  graResultType?: string;
  graResult?: string;
  graYear?: string;
  graDuration?: string;
  masExam?: string;
  masInstitute?: string;
  masSubject?: string;
  masResultType?: string;
  masResult?: string;
  masYear?: string;
  masDuration?: string;
  bachelor?: string;
  master?: string;
  experienceComputer?: string;
  experienceSatlipi?: string;
  customFields?: CustomField[];
}

export interface CandidateProfile {
  schemaVersion: 1;
  data: ProfileData;
  presentDistrict?: string;
  permanentDistrict?: string;
  mobile?: string;
  photoPath?: string;
  signaturePath?: string;
  photoUrl?: string;
  signatureUrl?: string;
  updatedAt: any;
}
