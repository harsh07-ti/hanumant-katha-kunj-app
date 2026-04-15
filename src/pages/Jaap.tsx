import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';

export default function Jaap() {
  const { user, userData } = useAuth();
  const [localCount, setLocalCount] = useState(0);
  const [dailyCount, setDailyCount] = useState(0);
  const [isTapped, setIsTapped] = useState(false);
  const target = 108;

  useEffect(() => {
    if (userData) {
      // Check if it's a new day
      const today = new Date().toISOString().split('T')[0];
      if (userData.lastJaapDate !== today) {
        setDailyCount(0);
        if (user) {
          updateDoc(doc(db, 'users', user.uid), {
            dailyJaap: 0,
            lastJaapDate: today
          });
        }
      } else {
        setDailyCount(userData.dailyJaap || 0);
      }
    }
  }, [userData, user]);

  // Debounced Firestore update
  useEffect(() => {
    if (localCount > 0 && user) {
      const timer = setTimeout(() => {
        const userRef = doc(db, 'users', user.uid);
        const leaderboardRef = doc(db, 'leaderboard', user.uid);
        
        updateDoc(userRef, {
          totalJaap: increment(localCount),
          dailyJaap: increment(localCount)
        });
        
        updateDoc(leaderboardRef, {
          totalJaap: increment(localCount)
        });
        
        setLocalCount(0);
      }, 2000); // Update every 2 seconds of inactivity
      return () => clearTimeout(timer);
    }
  }, [localCount, user]);

  const handleTap = () => {
    setLocalCount(prev => prev + 1);
    setDailyCount(prev => prev + 1);
    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 150);
    
    // Optional: Play sound
    // const audio = new Audio('/om-sound.mp3');
    // audio.play().catch(e => console.log('Audio play failed', e));
  };

  const progress = Math.min((dailyCount / target) * 100, 100);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-8 py-8">
      <div className="text-center">
        <div className="mb-3 inline-block rounded-full bg-cream px-3 py-1 text-xs font-semibold text-deep-saffron">
          ॐ श्री रामाय नमः
        </div>
      </div>

      {/* Jaap Button */}
      <div className="relative mb-5 flex items-center justify-center">
        <div className="absolute h-[195px] w-[195px] rounded-full border-2 border-dashed border-saffron opacity-30"></div>
        <button
          onClick={handleTap}
          className="relative flex h-[180px] w-[180px] select-none items-center justify-center rounded-full border-[6px] border-gold bg-white shadow-[0_0_30px_rgba(212,175,55,0.15),inset_0_0_15px_rgba(212,175,55,0.15)] transition-transform active:scale-95"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <span className="font-serif text-[42px] font-bold text-deep-saffron">राम</span>
        </button>
      </div>

      {/* Counter Display */}
      <div className="mt-5 text-center">
        <div className="text-[48px] font-bold leading-none text-ink">{dailyCount}</div>
        <div className="mt-1 text-sm text-gray-500">Daily Target: {target}</div>
      </div>

      {/* Stats */}
      <div className="mt-2 grid w-full max-w-xs grid-cols-2 gap-4 px-5">
        <div className="rounded-2xl border border-gold/20 bg-cream p-4 text-left">
          <div className="text-lg font-bold text-deep-saffron">{(userData?.totalJaap || 0) + localCount}</div>
          <div className="text-[11px] uppercase tracking-wider text-gray-500">Lifetime Total</div>
        </div>
        <div className="rounded-2xl border border-gold/20 bg-cream p-4 text-left">
          <div className="text-lg font-bold text-deep-saffron">--</div>
          <div className="text-[11px] uppercase tracking-wider text-gray-500">Global Rank</div>
        </div>
      </div>
    </div>
  );
}
