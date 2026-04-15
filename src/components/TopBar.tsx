import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield } from 'lucide-react';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

export default function TopBar() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between rounded-b-[30px] bg-gradient-to-br from-saffron to-deep-saffron px-5 pb-10 pt-6 text-white shadow-md">
      <div className="flex flex-col">
        <h1 className="font-serif text-2xl font-bold leading-tight">Ayodhya Dham</h1>
        <span className="text-xs uppercase tracking-widest opacity-90">Ram Naam Jaap Counter</span>
      </div>
      {user && (
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Shield size={14} /> Admin
            </Link>
          )}
          <button onClick={handleLogout} className="rounded-full p-1 hover:bg-white/20">
            <LogOut size={20} />
          </button>
        </div>
      )}
    </header>
  );
}
