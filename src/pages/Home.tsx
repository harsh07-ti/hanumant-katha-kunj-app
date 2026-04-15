import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Bell, Clock, Quote } from 'lucide-react';

export default function Home() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const quotes = [
    "Ram is not just a name, it is the ultimate truth.",
    "Where there is Ram, there is peace.",
    "Chant the name of Ram with love, and all your worries will fade.",
    "Dharma protects those who protect Dharma."
  ];
  const dailyQuote = quotes[new Date().getDate() % quotes.length];

  // Helper function to automatically convert normal YouTube URLs to embed URLs
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11)
        ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1`
        : url;
    } catch (e) {
      return url;
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Welcome Banner */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
        <div className="p-6">
          <h2 className="mb-2 text-2xl font-bold">Jai Shri Ram</h2>
          <p className="text-orange-100">Welcome to the divine Ayodhya Temple App. Start your spiritual journey today.</p>
        </div>
      </div>

      {/* Daily Devotional */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-orange-100">
        <div className="mb-3 flex items-center gap-2 text-orange-600">
          <Quote size={20} />
          <h3 className="font-semibold">Daily Reflection</h3>
        </div>
        <p className="text-gray-700 italic">"{dailyQuote}"</p>
      </div>

      {/* Live Darshan */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-orange-100">
        <div className="mb-4 flex items-center justify-between rounded-xl border-l-4 border-deep-saffron bg-[#FFF0E0] px-4 py-3">
          <div className="text-[13px] font-semibold text-ink">
            <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-red-600"></span>
            Live Aarti Darshan
          </div>
          <div className="text-[11px] font-bold text-deep-saffron">WATCH NOW</div>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
          {settings?.liveDarshanUrl ? (
            <iframe
              width="100%"
              height="100%"
              src={getEmbedUrl(settings.liveDarshanUrl)}
              title="Live Darshan"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              Live stream not available
            </div>
          )}
        </div>
      </div>

      {/* Aarti Timings & Notices */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-orange-100">
          <div className="mb-3 flex items-center gap-2 text-orange-600">
            <Clock size={20} />
            <h3 className="font-semibold">Aarti Timings</h3>
          </div>
          <div className="whitespace-pre-line text-sm text-gray-600">
            {settings?.aartiTimings || "Mangala Aarti: 5:00 AM\nShringar Aarti: 8:00 AM\nRajbhog Aarti: 12:00 PM\nSandhya Aarti: 7:00 PM"}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border border-orange-100">
          <div className="mb-3 flex items-center gap-2 text-orange-600">
            <Bell size={20} />
            <h3 className="font-semibold">Notices</h3>
          </div>
          <div className="whitespace-pre-line text-sm text-gray-600">
            {settings?.notices || "No new notices at the moment."}
          </div>
        </div>
      </div>
    </div>
  );
}
