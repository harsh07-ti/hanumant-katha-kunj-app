import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { Settings, Users, Calendar, Heart, Activity } from 'lucide-react';

export default function Admin() {
  const [stats, setStats] = useState({ users: 0, jaap: 0, donations: 0, bookings: 0 });
  const [settings, setSettings] = useState({ liveDarshanUrl: '', upiQrUrl: '', aartiTimings: '', notices: '', appLogoUrl: '' });
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch Settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as any);
      }
    });

    // Fetch Users & Stats
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(docs);
      const totalJaap = docs.reduce((acc, curr: any) => acc + (curr.totalJaap || 0), 0);
      setStats(s => ({ ...s, users: docs.length, jaap: totalJaap }));
    });

    // Fetch Bookings
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(docs);
      setStats(s => ({ ...s, bookings: docs.length }));
    });

    // Fetch Donations
    const unsubDonations = onSnapshot(collection(db, 'donations'), (snapshot) => {
      const total = snapshot.docs.reduce((acc, curr) => acc + (curr.data().amount || 0), 0);
      setStats(s => ({ ...s, donations: total }));
    });

    return () => {
      unsubSettings();
      unsubUsers();
      unsubBookings();
      unsubDonations();
    };
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleBookingStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
    } catch (error) {
      alert('Error updating status.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['dashboard', 'settings', 'bookings', 'users'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize whitespace-nowrap ${
              activeTab === tab ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-orange-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-orange-100">
            <Users className="mb-2 text-orange-500" size={24} />
            <div className="text-2xl font-bold text-gray-800">{stats.users}</div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-orange-100">
            <Activity className="mb-2 text-orange-500" size={24} />
            <div className="text-2xl font-bold text-gray-800">{stats.jaap}</div>
            <div className="text-sm text-gray-500">Total Jaap</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-orange-100">
            <Heart className="mb-2 text-orange-500" size={24} />
            <div className="text-2xl font-bold text-gray-800">₹{stats.donations}</div>
            <div className="text-sm text-gray-500">Total Donations</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-orange-100">
            <Calendar className="mb-2 text-orange-500" size={24} />
            <div className="text-2xl font-bold text-gray-800">{stats.bookings}</div>
            <div className="text-sm text-gray-500">Total Bookings</div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="rounded-2xl bg-white p-6 shadow-sm border border-orange-100 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">App Logo Image URL</label>
            <input
              type="url" value={settings.appLogoUrl || ''}
              onChange={e => setSettings({...settings, appLogoUrl: e.target.value})}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-deep-saffron focus:outline-none"
              placeholder="https://..."
            />
            <p className="mt-1 text-xs text-gray-500">Leave empty to use the default Om logo.</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Live Darshan YouTube URL</label>
            <input
              type="url" value={settings.liveDarshanUrl}
              onChange={e => setSettings({...settings, liveDarshanUrl: e.target.value})}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
              placeholder="https://www.youtube.com/embed/..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">UPI QR Code Image URL</label>
            <input
              type="url" value={settings.upiQrUrl}
              onChange={e => setSettings({...settings, upiQrUrl: e.target.value})}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Aarti Timings</label>
            <textarea
              rows={4} value={settings.aartiTimings}
              onChange={e => setSettings({...settings, aartiTimings: e.target.value})}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notices</label>
            <textarea
              rows={4} value={settings.notices}
              onChange={e => setSettings({...settings, notices: e.target.value})}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>
          <button
            type="submit" disabled={saving}
            className="rounded-lg bg-orange-600 px-6 py-2 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="rounded-xl bg-white p-5 shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h4 className="font-bold text-gray-800">{booking.name}</h4>
                <p className="text-sm text-gray-600">Phone: {booking.phone}</p>
                <p className="text-sm text-gray-600">Room: {booking.roomType} ({booking.guests} guests)</p>
                <p className="text-sm text-gray-600">Dates: {booking.checkIn} to {booking.checkOut}</p>
                <p className="text-xs text-gray-400 mt-1">Requested: {format(new Date(booking.createdAt), 'PPp')}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                  booking.status === 'approved' ? 'bg-green-100 text-green-700' :
                  booking.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {booking.status}
                </span>
                {booking.status === 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => handleBookingStatus(booking.id, 'approved')} className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700">Approve</button>
                    <button onClick={() => handleBookingStatus(booking.id, 'rejected')} className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700">Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {bookings.length === 0 && <p className="text-gray-500">No bookings found.</p>}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-orange-100">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Total Jaap</th>
                <th className="px-6 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-100 bg-white">
                  <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">{u.totalJaap}</td>
                  <td className="px-6 py-4 capitalize">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
