import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import logoPng from '@/assets/buildable-logo.png';
import wordmarkSvg from '@/assets/buildable-wordmark.svg';
import Grainient from '@/components/Grainient';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/log-in`,
      });
      setSent(true);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden relative">
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

      <div
        className="relative z-10 w-full md:w-[460px] lg:w-[500px] flex-shrink-0 flex flex-col min-h-screen"
        style={{ background: 'rgba(4, 2, 12, 0.80)', backdropFilter: 'blur(48px)', WebkitBackdropFilter: 'blur(48px)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-between px-10 h-16 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link to="/" className="flex items-center gap-[10px]">
            <img src={logoPng} alt="" aria-hidden draggable={false} className="select-none block"
              style={{ height: '26px', width: '26px', objectFit: 'contain', filter: 'invert(1)', flexShrink: 0 }} />
            <img src={wordmarkSvg} alt="Buildable Labs" draggable={false} className="select-none block"
              style={{ height: '22px', width: 'auto', objectFit: 'contain' }} />
          </Link>
          <Link to="/log-in"
            className="text-[11px] uppercase tracking-widest transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
          >
            ← Sign in
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-10 lg:px-14 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[340px]"
          >
            {sent ? (
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] mb-3"
                  style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Sans', sans-serif" }}>
                  Check your inbox
                </p>
                <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2.4rem', fontWeight: 400, fontStyle: 'italic', color: '#ffffff', lineHeight: 1.15, letterSpacing: '-0.01em', marginBottom: '1rem' }}>
                  Email sent.
                </h1>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
                  We've sent a reset link to <span style={{ color: 'rgba(255,255,255,0.75)' }}>{email}</span>. Check your spam folder if you don't see it.
                </p>
                <Link to="/log-in" className="inline-block mt-8"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                >
                  ← Back to sign in
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-10">
                  <p className="text-[11px] uppercase tracking-[0.2em] mb-3"
                    style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Sans', sans-serif" }}>
                    Reset password
                  </p>
                  <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2.4rem', fontWeight: 400, fontStyle: 'italic', color: '#ffffff', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                    Forgot your password?
                  </h1>
                  <p className="mt-3" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-7">
                  <div>
                    <label className="block mb-2"
                      style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>
                      Email address
                    </label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" disabled={loading} autoFocus
                      className="w-full py-2.5 text-sm text-white placeholder-white/20 disabled:opacity-40 outline-none transition-colors duration-200"
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', borderRadius: 0, fontFamily: "'DM Sans', sans-serif" }}
                      onFocus={e => (e.currentTarget.style.borderBottom = '1px solid rgba(255,255,255,0.55)')}
                      onBlur={e => (e.currentTarget.style.borderBottom = '1px solid rgba(255,255,255,0.15)')}
                    />
                  </div>
                  <div className="pt-2">
                    <motion.button type="submit" disabled={loading}
                      whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.99 }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-40 transition-opacity"
                      style={{ background: 'rgba(255,255,255,0.96)', color: '#0a0612', borderRadius: '3px', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
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
            "Your bots are
            <br />waiting for you."
          </blockquote>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
            No code &nbsp;·&nbsp; No servers &nbsp;·&nbsp; No limits
          </p>
        </motion.div>
      </div>
    </div>
  );
}
