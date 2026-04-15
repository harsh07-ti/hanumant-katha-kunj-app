import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Donate() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('General Donation');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || isNaN(Number(amount))) return;

    setLoading(true);
    setMessage('');
    try {
      await addDoc(collection(db, 'donations'), {
        userId: user.uid,
        amount: Number(amount),
        purpose,
        date: new Date().toISOString(),
        status: 'pending' // In a real app, this would be updated by a payment gateway webhook
      });
      setMessage('Donation request recorded. Please complete the payment using the QR code.');
      setAmount('');
    } catch (error) {
      setMessage('Error recording donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 pb-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-orange-800">Make a Donation</h2>
        <p className="text-gray-600">Support the temple activities</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-orange-100 text-center">
        <h3 className="mb-4 font-semibold text-gray-800">Scan to Pay via UPI</h3>
        <div className="mx-auto mb-4 flex aspect-square w-48 items-center justify-center overflow-hidden rounded-xl bg-gray-50 border-2 border-dashed border-gray-200">
          {settings?.upiQrUrl ? (
            <img src={settings.upiQrUrl} alt="UPI QR Code" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
          ) : (
            <span className="text-sm text-gray-400">QR Code not available</span>
          )}
        </div>
        <p className="text-sm text-gray-500">Scan using any UPI app (GPay, PhonePe, Paytm)</p>
      </div>

      <form onSubmit={handleDonate} className="rounded-2xl bg-white p-6 shadow-sm border border-orange-100 space-y-4">
        {message && (
          <div className={`rounded-lg p-3 text-sm ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {message}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Purpose</label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="General Donation">General Donation</option>
            <option value="Sponsor Aarti">Sponsor Aarti</option>
            <option value="Bhandara Donation">Bhandara Donation</option>
            <option value="Temple Construction">Temple Construction</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Amount (₹)</label>
          <input
            type="number"
            required
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-orange-600 py-2.5 font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Record Donation'}
        </button>
      </form>
    </div>
  );
}
