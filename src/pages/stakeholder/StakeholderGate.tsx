import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2, ShieldCheck, LogIn } from 'lucide-react';
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import wordmarkSvg from '@/assets/buildable-wordmark.svg';

const GATE_KEY  = 'stakeholder_auth';
const GATE_PASS = 'founder';

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', boxSizing: 'border-box' as const,
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '10px', fontFamily: "'Geist', sans-serif",
  fontSize: '13px', color: 'rgba(255,255,255,0.85)', outline: 'none',
  transition: 'border-color 0.2s',
};

export default function StakeholderGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Step 1: access password
  const [unlocked,   setUnlocked]   = useState(() => {
    const stored = localStorage.getItem(GATE_KEY);
    return stored === '1' || stored === 'true';
  });
  const [passInput,  setPassInput]  = useState('');
  const [passError,  setPassError]  = useState(false);
  const [passBusy,   setPassBusy]   = useState(false);

  // Anonymous auth state
  const [anonBusy,   setAnonBusy]   = useState(false);
  const [anonFailed, setAnonFailed] = useState(false);
  const signingInRef = useRef(false);

  // Fallback manual login (shown if anonymous auth is disabled in Firebase)
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [loginError,   setLoginError]   = useState('');
  const [loginBusy,    setLoginBusy]    = useState(false);
  const [googleBusy,   setGoogleBusy]   = useState(false);

  // When password is unlocked but no Firebase user yet → auto sign-in anonymously
  useEffect(() => {
    if (unlocked && !user && !loading && !signingInRef.current) {
      signingInRef.current = true;
      setAnonBusy(true);
      setAnonFailed(false);
      signInAnonymously(auth)
        .catch(() => {
          // Anonymous auth not enabled in Firebase → show manual login fallback
          setAnonFailed(true);
        })
        .finally(() => {
          setAnonBusy(false);
          signingInRef.current = false;
        });
    }
  }, [unlocked, user, loading]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#07080d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: 20, height: 20, color: 'rgba(255,255,255,0.2)' }} className="animate-spin" />
      </div>
    );
  }

  // Fully authenticated — show dashboard
  if (unlocked && user) return <>{children}</>;

  const handlePassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassBusy(true);
    setTimeout(() => {
      if (passInput === GATE_PASS) {
        localStorage.setItem(GATE_KEY, '1');
        setUnlocked(true);
      } else {
        setPassError(true);
        setPassInput('');
      }
      setPassBusy(false);
    }, 380);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoginBusy(true);
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoginError(err.message ?? 'Incorrect credentials.');
    } finally {
      setLoginBusy(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleBusy(true);
    setLoginError('');
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') setLoginError(err.message ?? 'Google sign-in failed.');
    } finally {
      setGoogleBusy(false);
    }
  };

  // Determine which "step" to show in the card
  // - !unlocked             → password form
  // - unlocked, anonBusy    → spinner (signing in silently)
  // - unlocked, anonFailed  → manual login fallback
  const step: 'password' | 'signing-in' | 'login' =
    !unlocked ? 'password' :
    anonBusy  ? 'signing-in' :
    anonFailed ? 'login' :
    'signing-in'; // still waiting for onAuthStateChanged

  return (
    <div style={{
      minHeight: '100vh', background: '#07080d',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Amber glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 55% 45% at 50% 52%, rgba(217,119,6,0.06) 0%, transparent 70%)',
      }} />

      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px', zIndex: 1 }}>
        <img src="/logo-stack-white.svg" alt="" aria-hidden draggable={false} style={{ height: '18px', opacity: 0.55 }} />
        <img src={wordmarkSvg} alt="Buildable Labs" draggable={false} style={{ height: '20px', opacity: 0.55 }} />
      </Link>

      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${step === 'password' ? 'rgba(217,119,6,0.18)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '22px', padding: '44px 40px',
          width: '100%', maxWidth: '380px', textAlign: 'center', zIndex: 1,
        }}
      >
        {/* Icon */}
        <div style={{
          width: '48px', height: '48px', borderRadius: '13px',
          background: step === 'password' ? 'rgba(217,119,6,0.10)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${step === 'password' ? 'rgba(217,119,6,0.20)' : 'rgba(255,255,255,0.09)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px',
        }}>
          {step === 'signing-in'
            ? <Loader2 style={{ width: '19px', height: '19px', color: 'rgba(255,255,255,0.4)' }} className="animate-spin" />
            : step === 'login'
            ? <LogIn style={{ width: '19px', height: '19px', color: 'rgba(255,255,255,0.45)' }} />
            : <ShieldCheck style={{ width: '19px', height: '19px', color: 'rgba(251,191,36,0.8)' }} />
          }
        </div>

        <p style={{
          fontFamily: "'Geist', sans-serif", fontSize: '11px', fontWeight: 600,
          letterSpacing: '0.16em', textTransform: 'uppercase' as const,
          color: step === 'password' ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.28)',
          marginBottom: '6px',
        }}>
          {step === 'password' ? 'Stakeholder Access' : 'Founder Dashboard'}
        </p>
        <h2 style={{
          fontFamily: "'Geist', sans-serif", fontSize: '20px', fontWeight: 700,
          color: 'rgba(255,255,255,0.88)', marginBottom: '8px',
        }}>
          {step === 'password' ? 'Founder Dashboard'
          : step === 'signing-in' ? 'Signing you in…'
          : 'Sign in to continue'}
        </h2>
        <p style={{
          fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '13px',
          color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, marginBottom: '28px',
        }}>
          {step === 'password'
            ? 'Restricted area. Enter your access password to continue.'
          : step === 'signing-in'
            ? 'One moment…'
          : 'Use your Buildable Labs account to access the dashboard.'}
        </p>

        {/* ── Password form ── */}
        {step === 'password' && (
          <form onSubmit={handlePassSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="password"
              value={passInput}
              onChange={e => { setPassInput(e.target.value); setPassError(false); }}
              placeholder="Access password"
              autoFocus
              style={{
                ...fieldStyle,
                borderColor: passError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.10)',
                textAlign: 'center' as const, letterSpacing: '0.14em',
              }}
              onFocus={e => { if (!passError) e.currentTarget.style.borderColor = 'rgba(251,191,36,0.4)'; }}
              onBlur={e => { if (!passError) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
            />
            {passError && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                style={{ fontFamily: "'Geist', sans-serif", fontSize: '12px', color: 'rgba(239,68,68,0.8)', margin: 0 }}>
                Incorrect password.
              </motion.p>
            )}
            <motion.button type="submit" whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.98 }}
              disabled={passBusy || !passInput}
              style={{
                width: '100%', padding: '13px 0', borderRadius: '10px', border: 'none',
                background: passBusy || !passInput ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #d97706, #fbbf24)',
                color: passBusy || !passInput ? 'rgba(255,255,255,0.25)' : '#0a0612',
                fontFamily: "'Geist', sans-serif", fontSize: '13px', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                cursor: passBusy || !passInput ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {passBusy ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : 'Enter →'}
            </motion.button>
          </form>
        )}

        {/* ── Signing in silently ── */}
        {step === 'signing-in' && (
          <div style={{ height: '40px' }} />
        )}

        {/* ── Manual login fallback (if anonymous auth disabled) ── */}
        {step === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email" autoFocus
              style={fieldStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(251,191,36,0.4)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
            />
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              style={fieldStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(251,191,36,0.4)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
            />

            {loginError && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                style={{ fontFamily: "'Geist', sans-serif", fontSize: '12px', color: 'rgba(239,68,68,0.75)', margin: 0 }}>
                {loginError}
              </motion.p>
            )}

            <motion.button type="submit" whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.98 }}
              disabled={loginBusy || !email || !password}
              style={{
                width: '100%', padding: '12px 0', borderRadius: '10px', border: 'none',
                background: loginBusy || !email || !password ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.96)',
                color: loginBusy || !email || !password ? 'rgba(255,255,255,0.25)' : '#0a0612',
                fontFamily: "'Geist', sans-serif", fontSize: '13px', fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                cursor: loginBusy || !email || !password ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginTop: '2px',
              }}
            >
              {loginBusy ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : 'Sign In →'}
            </motion.button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            </div>

            <motion.button type="button" onClick={handleGoogle} disabled={googleBusy}
              whileHover={{ background: 'rgba(255,255,255,0.07)' }} whileTap={{ scale: 0.99 }}
              style={{
                width: '100%', padding: '11px 0', borderRadius: '10px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                fontFamily: "'Geist', sans-serif", fontSize: '12px', fontWeight: 500,
                color: 'rgba(255,255,255,0.55)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {googleBusy ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : (
                <>
                  <svg style={{ width: 14, height: 14, flexShrink: 0 }} viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </motion.button>
          </form>
        )}
      </motion.div>

      <p style={{ marginTop: '24px', zIndex: 1 }}>
        <Link to="/" style={{
          fontFamily: "'Geist', sans-serif", fontSize: '11px',
          color: 'rgba(255,255,255,0.22)', textDecoration: 'none',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.22)')}
        >
          ← Back to buildablelabs.dev
        </Link>
      </p>
    </div>
  );
}
