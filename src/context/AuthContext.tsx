import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  userData: any;
}

const AuthContext = createContext<AuthContextType>({ user: null, isAdmin: false, loading: true, userData: null });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if user exists in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        let data;
        let adminStatus = false;
        
        if (userSnap.exists()) {
          data = userSnap.data();
          adminStatus = data.role === 'admin' || currentUser.email === 'harshvardhantiwari39@gmail.com';
        } else {
          // Create new user profile
          adminStatus = currentUser.email === 'harshvardhantiwari39@gmail.com';
          data = {
            uid: currentUser.uid,
            name: currentUser.displayName || 'Devotee',
            email: currentUser.email || '',
            role: adminStatus ? 'admin' : 'user',
            totalJaap: 0,
            dailyJaap: 0,
            lastJaapDate: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
          };
          await setDoc(userRef, data);
          
          // Create leaderboard entry
          await setDoc(doc(db, 'leaderboard', currentUser.uid), {
            userId: currentUser.uid,
            name: data.name,
            totalJaap: 0
          });
        }
        
        setUserData(data);
        setIsAdmin(adminStatus);
      } else {
        setUserData(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, userData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
