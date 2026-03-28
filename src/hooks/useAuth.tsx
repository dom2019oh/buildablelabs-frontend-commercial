import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const REMEMBER_KEY = 'buildable_remember_expires';

interface Profile {
  displayName: string | null;
  avatarUrl: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  /** @deprecated Firebase doesn't use sessions. Always null — kept for backward compatibility. */
  session: { access_token?: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      // 30-day remember-me expiry check
      if (firebaseUser) {
        const expiresAt = localStorage.getItem(REMEMBER_KEY);
        if (expiresAt && Date.now() > parseInt(expiresAt)) {
          localStorage.removeItem(REMEMBER_KEY);
          fbSignOut(auth);
          return;
        }
      }

      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        const unsubProfile = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (snap) => {
            setProfile(snap.exists() ? (snap.data() as Profile) : {
              displayName: firebaseUser.displayName,
              avatarUrl: firebaseUser.photoURL,
            });
          },
          () => {
            setProfile({ displayName: firebaseUser.displayName, avatarUrl: firebaseUser.photoURL });
          }
        );
        return unsubProfile;
      } else {
        setProfile(null);
      }
    });

    return unsub;
  }, []);

  const signOut = async () => {
    localStorage.removeItem(REMEMBER_KEY);
    await fbSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, session: null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
