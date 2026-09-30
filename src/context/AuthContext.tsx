import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../services/firebase';
import { mobileToEmail, emailToMobile, isValidMobile, isValidPassword } from '../utils/auth';
import { UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  mobile: string | null;
  loginUser: (mobile: string, pass: string) => Promise<void>;
  registerUser: (mobile: string, pass: string) => Promise<void>;
  loginAdmin: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [mobile, setMobile] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        try {
          // Check if admin first
          const adminDocRef = doc(db, 'admins', currentUser.uid);
          const adminDoc = await getDoc(adminDocRef);

          if (adminDoc.exists()) {
            setRole('admin');
            setMobile(null);
          } else {
            // Check if regular user
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setRole('user');
              setMobile(userDoc.data()?.mobile || emailToMobile(currentUser.email || ''));
            } else {
              setRole('user');
              setMobile(emailToMobile(currentUser.email || ''));
            }
          }
        } catch (err) {
          // Handled silently
          setRole('user');
        }
      } else {
        setUser(null);
        setRole(null);
        setMobile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginUser = async (userMobile: string, pass: string) => {
    clearError();
    if (!isValidMobile(userMobile)) {
      throw new Error('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
    }
    if (!isValidPassword(pass)) {
      throw new Error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
    }

    const email = mobileToEmail(userMobile);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        throw new Error('মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়');
      }
      throw new Error(err.message || 'লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  const registerUser = async (userMobile: string, pass: string) => {
    clearError();
    if (!isValidMobile(userMobile)) {
      throw new Error('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
    }
    if (!isValidPassword(pass)) {
      throw new Error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
    }

    const email = mobileToEmail(userMobile);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const userRef = doc(db, 'users', cred.user.uid);
      try {
        await setDoc(userRef, {
          mobile: userMobile.trim(),
          role: 'user',
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${cred.user.uid}`);
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('এই মোবাইল নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা হয়েছে। অনুগ্রহ করে লগইন করুন।');
      }
      throw new Error(err.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  const loginAdmin = async (email: string, pass: string) => {
    clearError();
    if (!email || !pass) {
      throw new Error('ইমেইল ও পাসওয়ার্ড প্রদান করুন');
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const adminDocRef = doc(db, 'admins', cred.user.uid);
      const adminDoc = await getDoc(adminDocRef);

      if (!adminDoc.exists()) {
        await signOut(auth);
        throw new Error('আপনি অ্যাডমিন নন। প্রবেশাধিকার সংরক্ষিত।');
      }
      setRole('admin');
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        throw new Error('ইমেইল বা পাসওয়ার্ড সঠিক নয়');
      }
      throw err;
    }
  };

  const logout = async () => {
    clearError();
    await signOut(auth);
    setUser(null);
    setRole(null);
    setMobile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        mobile,
        loginUser,
        registerUser,
        loginAdmin,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
