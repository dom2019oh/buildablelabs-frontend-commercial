import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Grainient from '@/components/Grainient';
import wordmarkSvg from '@/assets/buildable-wordmark.svg';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';

const REMEMBER_KEY = 'buildable_remember_expires';
const THIRTY_DAYS  = 30 * 24 * 60 * 60 * 1000;
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import { redirectToDashboard } from '@/lib/urls';

export default function Login() {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  const stateFrom   = (location.state as { from?: { pathname: string } })?.from?.pathname;
  const storedReturn = sessionStorage.getItem('buildable_return_to');
  const from        = stateFrom || storedReturn || '/dashboard';

  const afterLogin = () => {
    sessionStorage.removeItem('buildable_return_to');
    const url = redirectToDashboard();
    if (!url.startsWith('http')) navigate(url, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) localStorage.setItem(REMEMBER_KEY, String(Date.now() + THIRTY_DAYS));
      else localStorage.removeItem(REMEMBER_KEY);
      toast.success('Welcome back!');
      afterLogin();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithPopup(auth, new GoogleAuthProvider());
      if (rememberMe) localStorage.setItem(REMEMBER_KEY, String(Date.now() + THIRTY_DAYS));
      else localStorage.removeItem(REMEMBER_KEY);
      toast.success('Welcome back!');
      afterLogin();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(err.message ?? 'Failed to sign in with Google');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden relative">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <Grainient
          color1="#3a3c42" color2="#141518" color3="#252729"
          timeSpeed={0.35} colorBalance={0} warpStrength={1}
          warpFrequency={5} warpSpeed={2} warpAmplitude={50}
          blendAngle={0} blendSoftness={0.05} rotationAmount={500}
          noiseScale={2} grainAmount={0.1} grainScale={2}
          grainAnimated={false} contrast={1.5} gamma={1} saturation={1}
          centerX={0} centerY={0} zoom={0.9}
        />
      </div>

      {/* Left panel */}
      <div
        className="relative z-10 w-full md:w-[460px] lg:w-[500px] flex-shrink-0 flex flex-col min-h-screen"
        style={{ background: 'rgba(4, 2, 12, 0.80)', backdropFilter: 'blur(48px)', WebkitBackdropFilter: 'blur(48px)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-10 h-16 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link to="/" className="flex items-center gap-[10px]">
            <img src="/logo-stack-white.svg" alt="" aria-hidden draggable={false} className="select-none block" style={{ height: '20px', width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
            <img src={wordmarkSvg} alt="Buildable Labs" draggable={false} className="select-none block" style={{ height: '22px', width: 'auto', objectFit: 'contain' }} />
          </Link>
          <Link to="/"
            className="text-[11px] uppercase tracking-widest transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
          >
            ← Home
          </Link>
        </div>

        {/* Form body */}
        <div className="flex-1 flex items-center justify-center px-10 lg:px-14 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[340px]"
          >
            <div className="mb-10">
              <p className="text-[11px] uppercase tracking-[0.2em] mb-3"
                style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Geist', 'DM Sans', sans-serif" }}>
                Sign in
              </p>
              <h1 style={{ fontFamily: "'Geist', sans-serif", fontSize: '2.4rem', fontWeight: 800, fontStyle: 'normal', color: '#ffffff', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                Welcome back.
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Email */}
              <div>
                <label className="block mb-2" style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>
                  Email address
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" disabled={loading}
                  className="w-full py-2.5 text-sm text-white placeholder-white/20 disabled:opacity-40 outline-none transition-colors duration-200"
                  style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', borderRadius: 0, fontFamily: "'Geist', 'DM Sans', sans-serif" }}
                  onFocus={e => (e.currentTarget.style.borderBottom = '1px solid rgba(255,255,255,0.55)')}
                  onBlur={e => (e.currentTarget.style.borderBottom = '1px solid rgba(255,255,255,0.15)')}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>
                    Password
                  </label>
                  <Link to="/forgot-password"
                    style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" disabled={loading}
                    className="w-full py-2.5 pr-8 text-sm text-white placeholder-white/20 disabled:opacity-40 outline-none transition-colors duration-200"
                    style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', borderRadius: 0, fontFamily: "'Geist', 'DM Sans', sans-serif" }}
                    onFocus={e => (e.currentTarget.style.borderBottom = '1px solid rgba(255,255,255,0.55)')}
                    onBlur={e => (e.currentTarget.style.borderBottom = '1px solid rgba(255,255,255,0.15)')}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.25)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}>
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setRememberMe(v => !v)}
                  style={{
                    width: '16px', height: '16px', flexShrink: 0,
                    borderRadius: '4px',
                    border: rememberMe ? '1px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.22)',
                    background: rememberMe ? 'rgba(255,255,255,0.9)' : 'transparent',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {rememberMe && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="#0a0612" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <span
                  style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.38)', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => setRememberMe(v => !v)}
                >
                  Remember me for 30 days
                </span>
              </div>

              <div className="pt-2 space-y-3">
                <motion.button type="submit" disabled={loading}
                  whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-40 transition-opacity"
                  style={{ background: 'rgba(255,255,255,0.96)', color: '#0a0612', borderRadius: '3px', fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
                </motion.button>

                <div className="flex items-center gap-4 py-1">
                  <div className="flex-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
                  <span style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}>or</span>
                  <div className="flex-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
                </div>

                <motion.button type="button" onClick={handleGoogleSignIn} disabled={googleLoading}
                  whileHover={{ background: 'rgba(255,255,255,0.07)' }} whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-3 py-3.5 transition-colors disabled:opacity-40"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '3px', fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '12px', fontWeight: 500, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.65)' }}
                >
                  {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            <p className="mt-10 text-center" style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}>
              No account?{' '}
              <Link to="/sign-up"
                style={{ color: 'rgba(255,255,255,0.55)', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
              >
                Create one for free
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right panel */}
      <div className="relative z-10 hidden md:flex flex-1 flex-col justify-end px-14 lg:px-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.22)' }} />
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="relative z-10 max-w-[480px]"
        >
          <div className="mb-8" style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.4)' }} />
          <blockquote style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(2rem, 3.2vw, 3rem)', fontWeight: 400, fontStyle: 'italic', color: '#ffffff', lineHeight: 1.22, letterSpacing: '-0.015em', marginBottom: '1.5rem' }}>
            "From a single sentence
            <br />to a live Discord bot —
            <br />in seconds."
          </blockquote>
          <p style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
            No code &nbsp;·&nbsp; No servers &nbsp;·&nbsp; No limits
          </p>
        </motion.div>
      </div>

    </div>
  );
}
