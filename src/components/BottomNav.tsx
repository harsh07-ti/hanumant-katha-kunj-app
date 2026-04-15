import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Activity, Heart, Calendar, User } from 'lucide-react';
import { clsx } from 'clsx';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/jaap', icon: Activity, label: 'Jaap' },
    { path: '/donate', icon: Heart, label: 'Donate' },
    { path: '/booking', icon: Calendar, label: 'Booking' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-gray-100 bg-white pb-5 pt-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={clsx(
              'flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
              isActive ? 'text-deep-saffron' : 'text-gray-400 hover:text-deep-saffron'
            )}
          >
            <Icon size={24} className={clsx(isActive && 'fill-orange-100')} />
            <span>{label}</span>
          </Link>
        );
      })}
      <div className="absolute bottom-2 left-1/2 h-1.5 w-32 -translate-x-1/2 rounded-full bg-gray-200"></div>
    </nav>
  );
}
