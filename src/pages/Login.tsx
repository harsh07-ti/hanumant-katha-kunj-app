import React, { useState, useEffect } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [appLogoUrl, setAppLogoUrl] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

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

  const handleGuestEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setError('');
    setLoading(true);
    try {
      localStorage.setItem('guestName', name.trim());
      await signInAnonymously(auth);
      // The AuthContext will handle creating the user document
      navigate('/');
    } catch (err: any) {
      setError('Failed to enter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-gold/20">
        <div className="mb-8 text-center">
          <img src={logoToUse} alt="App Logo" className="mx-auto mb-4 h-24 w-24 rounded-full border-4 border-gold shadow-md object-cover" referrerPolicy="no-referrer" />
          <h2 className="font-serif text-2xl font-bold text-deep-saffron">Jai Shri Ram</h2>
          <p className="mt-2 text-sm text-gray-500">Enter your name and start Ram Naam Jaap 🙏</p>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <form onSubmit={handleGuestEntry} className="space-y-6">
          <div>
            <input
              type="text"
              required
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border-2 border-saffron/30 bg-cream px-4 py-3 text-center font-medium text-ink placeholder-gray-400 focus:border-deep-saffron focus:outline-none focus:ring-0"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-saffron to-deep-saffron py-3.5 font-bold tracking-wide text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Entering...' : 'Enter App'}
          </button>
        </form>

        <div className="mt-8 flex justify-center">
          <Link to="/admin-login" className="flex items-center gap-1 text-xs text-gray-400 hover:text-deep-saffron transition-colors">
            <Lock size={12} /> Admin Access
          </Link>
        </div>
      </div>
    </div>
  );
}
