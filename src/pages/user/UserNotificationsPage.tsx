import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { UserNotification } from '../../types';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Bell, CheckCheck } from 'lucide-react';

export const UserNotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const q = query(
          collection(db, 'notifications'),
          where('uid', '==', user.uid)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserNotification));
        setNotifications(list);

        // Mark unread as read
        list.forEach(async (notif) => {
          if (!notif.read) {
            try {
              await updateDoc(doc(db, 'notifications', notif.id), { read: true });
            } catch (e) {
              // Silently ignore individual read update fail
            }
          }
        });
      } catch (err) {
        // Silently handled
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-900">নোটিফিকেশন ও বার্তা</h1>
        <p className="text-xs text-gray-500 mt-1">আপনার আবেদনের অগ্রগতি ও স্ট্যাটাস পরিবর্তনের বার্তা</p>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <Spinner text="নোটিফিকেশন লোড হচ্ছে..." />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="কোনো নতুন নোটিফিকেশন নেই"
          description="আপনার কোনো পেন্ডিং বা নতুন নোটিফিকেশন নেই।"
          icon={<Bell className="w-6 h-6" />}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">{n.title}</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.body}</p>
                <span className="text-[10px] text-gray-400 mt-2 block">
                  {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString('bn-BD') : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
