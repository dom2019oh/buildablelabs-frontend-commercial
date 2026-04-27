import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { AmbientBg } from '@/lib/glass';
import wordmarkSvg from '@/assets/buildable-wordmark.svg';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

export default function ResetPassword() {
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [verifying, setVerifying]     = useState(true);
  const [validCode, setValidCode]     = useState(false);
  const [done, setDone]               = useState(false);
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode        = searchParams.get('oobCode') ?? '';

  useEffect(() => {
    if (!oobCode) { setVerifying(false); return; }
    verifyPasswordResetCode(auth, oobCode)
      .then(() => setValidCode(true))
      .catch(() => setValidCode(false))
      .finally(() => setVerifying(false));
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { toast.error('Please enter a new password'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setDone(true);
      setTimeout(() => navigate('/log-in', { replace: true }), 2500);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden relative">
      <AmbientBg />

      <div
        className="relative z-10 w-full md:w-[460px] lg:w-[500px] flex-shrink-0 flex flex-col min-h-screen"
        style={{ background: 'rgba(4, 2, 12, 0.80)', backdropFilter: 'blur(48px)', WebkitBackdropFilter: 'blur(48px)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center px-10 h-16 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link to="/" className="flex items-center gap-[10px]">
            <img src="/logo-stack-white.svg" alt="" aria-hidden draggable={false} className="select-none block" style={{ height: '20px', width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
            <img src={wordmarkSvg} alt="Buildable Labs" draggable={false} className="select-none block" style={{ height: '22px', width: 'auto', objectFit: 'contain' }} />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-10 lg:px-14 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[340px]"
          >
            {verifying ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'rgba(255,255,255,0.3)' }} />
                <p style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
                  Verifying reset link…
                </p>
              </div>
            ) : !validCode ? (
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] mb-3"
                  style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Geist', 'DM Sans', sans-serif" }}>
                  Link expired
                </p>
                <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2.4rem', fontWeight: 400, fontStyle: 'italic', color: '#ffffff', lineHeight: 1.15, letterSpacing: '-0.01em', marginBottom: '1rem' }}>
                  Invalid link.
                </h1>
                <p style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
                  This password reset link has expired or already been used.
                </p>
                <Link to="/forgot-password" className="inline-block mt-8"
                  style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                >
                  Request a new link →
                </Link>
              </div>
            ) : done ? (
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] mb-3"
                  style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Geist', 'DM Sans', sans-serif" }}>
                  All done
                </p>
                <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2.4rem', fontWeight: 400, fontStyle: 'italic', color: '#ffffff', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                  Password updated.
                </h1>
                <p className="mt-4" style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                  Redirecting you to sign in…
                </p>
              </div>
            ) : (
              <>
                <div className="mb-10">
                  <p className="text-[11px] uppercase tracking-[0.2em] mb-3"
                    style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Geist', 'DM Sans', sans-serif" }}>
                    New password
                  </p>
                  <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2.4rem', fontWeight: 400, fontStyle: 'italic', color: '#ffffff', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                    Set a new password.
                  </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-7">
                  <div>
                    <label className="block mb-2"
                      style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>
                      New password
                    </label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 6 characters" disabled={loading} autoFocus
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

                  <div>
                    <label className="block mb-2"
                      style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>
                      Confirm password
                    </label>
                    <input type={showPassword ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat your password" disabled={loading}
                      className="w-full py-2.5 text-sm text-white placeholder-white/20 disabled:opacity-40 outline-none transition-colors duration-200"
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', borderRadius: 0, fontFamily: "'Geist', 'DM Sans', sans-serif" }}
                      onFocus={e => (e.currentTarget.style.borderBottom = '1px solid rgba(255,255,255,0.55)')}
                      onBlur={e => (e.currentTarget.style.borderBottom = '1px solid rgba(255,255,255,0.15)')}
                    />
                  </div>

                  <div className="pt-2">
                    <motion.button type="submit" disabled={loading}
                      whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.99 }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-40 transition-opacity"
                      style={{ background: 'rgba(255,255,255,0.96)', color: '#0a0612', borderRadius: '3px', fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update password'}
                    </motion.button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 hidden md:flex flex-1 flex-col justify-end px-14 lg:px-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.22)' }} />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="relative z-10 max-w-[480px]"
        >
          <div className="mb-8" style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.4)' }} />
          <blockquote style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(2rem, 3.2vw, 3rem)', fontWeight: 400, fontStyle: 'italic', color: '#ffffff', lineHeight: 1.22, letterSpacing: '-0.015em', marginBottom: '1.5rem' }}>
            "Fresh start,
            <br />same great bots."
          </blockquote>
          <p style={{ fontFamily: "'Geist', 'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
            No code &nbsp;·&nbsp; No servers &nbsp;·&nbsp; No limits
          </p>
        </motion.div>
      </div>
    </div>
  );
}
