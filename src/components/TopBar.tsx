import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

export default function TopBar() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [appLogoUrl, setAppLogoUrl] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setAppLogoUrl(doc.data().appLogoUrl || '');
      }
    });
    return () => unsubscribe();
  }, []);

  const defaultLogo = "https://storage.googleapis.com/mpx-node/temp/11388d01-e251-4043-9828-98e3b08e709a/Screenshot_2025-02-28-15-56-07-74_1c337646f29875672b5a61192b9010f9.jpg";
  const logoToUse = appLogoUrl || defaultLogo;

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between rounded-b-[30px] bg-gradient-to-br from-saffron to-deep-saffron px-5 pb-10 pt-6 text-white shadow-md">
      <div className="flex items-center gap-3">
        <img src={logoToUse} alt="Logo" className="h-10 w-10 rounded-full border-2 border-gold object-cover shadow-sm" referrerPolicy="no-referrer" />
        <div className="flex flex-col">
          <h1 className="font-serif text-2xl font-bold leading-tight">Ayodhya Dham</h1>
          <span className="text-xs uppercase tracking-widest opacity-90">Ram Naam Jaap</span>
        </div>
      </div>
      {user && (
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Shield size={14} /> Admin
            </Link>
          )}
          {isAdmin && (
            <button onClick={handleLogout} className="rounded-full p-1 hover:bg-white/20">
              <LogOut size={20} />
            </button>
          )}
        </div>
      )}
    </header>
  );
}
