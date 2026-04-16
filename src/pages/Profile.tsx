import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { Trophy, History, Heart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, userData, isAdmin } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    // Fetch user donations
    const qDonations = query(
      collection(db, 'donations'),
      where('userId', '==', user.uid)
    );
    const unsubDonations = onSnapshot(qDonations, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      docs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setDonations(docs);
    });

    // Fetch leaderboard
    const qLeaderboard = query(
      collection(db, 'leaderboard'),
      orderBy('totalJaap', 'desc'),
      limit(10)
    );
    const unsubLeaderboard = onSnapshot(qLeaderboard, (snapshot) => {
      setLeaderboard(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubDonations();
      unsubLeaderboard();
    };
  }, [user]);

  return (
    <div className="mx-auto max-w-md space-y-6 pb-6">
      {/* Profile Card */}
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm border border-orange-100 relative">
        {isAdmin && (
          <Link 
            to="/admin" 
            className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            <Shield size={14} />
            Admin Panel 🔐
          </Link>
        )}
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-3xl font-bold text-orange-600">
          {userData?.name?.charAt(0) || 'D'}
        </div>
        <h2 className="text-xl font-bold text-gray-800">{userData?.name}</h2>
        <p className="text-sm text-gray-500">{userData?.email}</p>
        
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
          <div>
            <div className="text-sm text-gray-500">Total Jaap</div>
            <div className="text-xl font-bold text-orange-600">{userData?.totalJaap || 0}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Daily Jaap</div>
            <div className="text-xl font-bold text-orange-600">{userData?.dailyJaap || 0}</div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-orange-100">
        <div className="mb-4 flex items-center gap-2 text-orange-600">
          <Trophy size={20} />
          <h3 className="font-bold text-gray-800">Top Devotees</h3>
        </div>
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div key={entry.id} className={`flex items-center justify-between rounded-lg p-3 ${entry.userId === user?.uid ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${index < 3 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {index + 1}
                </span>
                <span className="font-medium text-gray-800">{entry.name}</span>
              </div>
              <span className="font-bold text-orange-600">{entry.totalJaap}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Donation History */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-orange-100">
        <div className="mb-4 flex items-center gap-2 text-orange-600">
          <Heart size={20} />
          <h3 className="font-bold text-gray-800">Donation History</h3>
        </div>
        {donations.length > 0 ? (
          <div className="space-y-3">
            {donations.map((donation) => (
              <div key={donation.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <div>
                  <div className="font-medium text-gray-800">{donation.purpose}</div>
                  <div className="text-xs text-gray-500">{format(new Date(donation.date), 'MMM dd, yyyy')}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">₹{donation.amount}</div>
                  <div className={`text-xs capitalize ${donation.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {donation.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500">No donations yet.</p>
        )}
      </div>
    </div>
  );
}
