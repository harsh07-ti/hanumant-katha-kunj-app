import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [appLogoUrl, setAppLogoUrl] = useState('');
  const navigate = useNavigate();

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <img src={logoToUse} alt="App Logo" className="mx-auto mb-4 h-24 w-24 rounded-full border-4 border-gold shadow-md object-cover" referrerPolicy="no-referrer" />
          <h2 className="font-serif text-2xl font-bold text-deep-saffron">Jai Shri Ram</h2>
          <p className="text-gray-500">Welcome to Ayodhya Temple App</p>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-deep-saffron focus:outline-none focus:ring-1 focus:ring-deep-saffron"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-deep-saffron focus:outline-none focus:ring-1 focus:ring-deep-saffron"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-saffron to-deep-saffron py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-sm text-gray-500">OR</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-deep-saffron hover:underline">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
