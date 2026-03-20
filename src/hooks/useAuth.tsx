import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

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
      setUser(firebaseUser);
      setLoading(false); // unblock UI immediately

      if (firebaseUser) {
        getDoc(doc(db, 'users', firebaseUser.uid)).then((snap) => {
          setProfile(snap.exists() ? (snap.data() as Profile) : {
            displayName: firebaseUser.displayName,
            avatarUrl: firebaseUser.photoURL,
          });
        }).catch(() => {
          setProfile({ displayName: firebaseUser.displayName, avatarUrl: firebaseUser.photoURL });
        });
      } else {
        setProfile(null);
      }
    });

    return unsub;
  }, []);

  const signOut = async () => {
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
