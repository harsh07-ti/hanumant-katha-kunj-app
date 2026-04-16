import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { Trophy, History, Heart, Shield, X, Delete } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, userData, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  // PIN Modal State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  useEffect(() => {
    if (!lockoutUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setPinError('');
        clearInterval(interval);
      } else {
        setLockoutRemaining(remaining);
        setPinError(`Locked. Try again in ${remaining}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleKeyPress = (key: string) => {
    if (lockoutUntil && Date.now() < lockoutUntil) return;
    setPinError('');
    if (key === 'back') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 4) {
      const newPin = pin + key;
      setPin(newPin);
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const verifyPin = (currentPin: string) => {
    if (currentPin === '9696') {
      sessionStorage.setItem('adminPinVerified', 'true');
      setShowPinModal(false);
      setPin('');
      navigate('/admin');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin('');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);

      if (newAttempts >= 3) {
        setLockoutUntil(Date.now() + 30000); // 30 seconds
        setPinError('Too many attempts. Locked for 30s.');
        setAttempts(0); // reset attempts after lockout
      } else {
        setPinError('Incorrect PIN ❌');
      }
    }
  };

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
          <button 
            onClick={() => setShowPinModal(true)}
            className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            <Shield size={14} />
            Admin Panel 🔐
          </button>
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

      {/* PIN Verification Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl ${isShaking ? 'animate-shake' : ''}`}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-ink">Enter Admin PIN 🔑</h3>
              <button 
                onClick={() => { setShowPinModal(false); setPin(''); setPinError(''); }} 
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-8 flex justify-center gap-4">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`flex h-14 w-12 items-center justify-center rounded-xl border-2 ${pin.length > i ? 'border-deep-saffron bg-saffron/10' : 'border-gray-200 bg-gray-50'} text-2xl font-bold text-ink`}>
                  {pin.length > i ? '•' : ''}
                </div>
              ))}
            </div>

            {pinError && <p className="mb-4 text-center font-medium text-red-500">{pinError}</p>}

            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button 
                  key={num} 
                  onClick={() => handleKeyPress(num.toString())} 
                  disabled={!!lockoutUntil} 
                  className="flex h-14 items-center justify-center rounded-2xl bg-gray-50 text-xl font-semibold text-ink transition-colors hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50"
                >
                  {num}
                </button>
              ))}
              <div className="col-start-2">
                <button 
                  onClick={() => handleKeyPress('0')} 
                  disabled={!!lockoutUntil} 
                  className="flex h-14 w-full items-center justify-center rounded-2xl bg-gray-50 text-xl font-semibold text-ink transition-colors hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50"
                >
                  0
                </button>
              </div>
              <div className="col-start-3">
                <button 
                  onClick={() => handleKeyPress('back')} 
                  disabled={!!lockoutUntil} 
                  className="flex h-14 w-full items-center justify-center rounded-2xl bg-gray-50 text-xl font-semibold text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50"
                >
                  <Delete size={24} />
                </button>
              </div>
            </div>
            
            <p className="mt-6 text-center text-xs text-gray-400">Forgot PIN? Check admin documentation.</p>
          </div>
        </div>
      )}
    </div>
  );
}
