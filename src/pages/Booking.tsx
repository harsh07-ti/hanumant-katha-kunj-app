import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';

export default function Booking() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomType: 'Standard Non-AC'
  });

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort client-side since we don't have a composite index yet
      docs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(docs);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage('');
    try {
      await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        ...formData,
        guests: Number(formData.guests),
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setMessage('Booking request submitted successfully.');
      setFormData({
        name: '', phone: '', checkIn: '', checkOut: '', guests: 1, roomType: 'Standard Non-AC'
      });
    } catch (error) {
      setMessage('Error submitting request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 pb-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-orange-800">Dharamshala Booking</h2>
        <p className="text-gray-600">Request a room for your stay</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm border border-orange-100 space-y-4">
        {message && (
          <div className={`rounded-lg p-3 text-sm ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {message}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text" required value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel" required value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Check-in</label>
            <input
              type="date" required value={formData.checkIn}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Check-out</label>
            <input
              type="date" required value={formData.checkOut}
              min={formData.checkIn || new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Guests</label>
            <input
              type="number" required min="1" max="10" value={formData.guests}
              onChange={(e) => setFormData({...formData, guests: Number(e.target.value)})}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Room Type</label>
            <select
              value={formData.roomType}
              onChange={(e) => setFormData({...formData, roomType: e.target.value})}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="Standard Non-AC">Standard Non-AC</option>
              <option value="Standard AC">Standard AC</option>
              <option value="Family Room">Family Room</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-orange-600 py-2.5 font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Request Booking'}
        </button>
      </form>

      {bookings.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800">Your Bookings</h3>
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-gray-800">{booking.roomType}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Check-in: {format(new Date(booking.checkIn), 'MMM dd, yyyy')}</p>
                <p>Check-out: {format(new Date(booking.checkOut), 'MMM dd, yyyy')}</p>
                <p>Guests: {booking.guests}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
