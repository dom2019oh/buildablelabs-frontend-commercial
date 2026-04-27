import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Heart, Loader2, Check, Coffee, Zap, Server, Sparkles } from 'lucide-react';
import FloatingNav from '@/components/FloatingNav';
import { AmbientBg, G, GCard, onGE, onGL, tint, onTE, onTL, BH, BT, BTR, spring } from '@/lib/glass';
import { API_BASE } from '@/lib/urls';
import { toast } from 'sonner';

const PRESETS = [5, 10, 25, 50, 100, 250];

const TIERS = [
  { icon: Coffee,   amount: 5,   label: 'Buy a coffee',     desc: 'Keeps the dev caffeinated.' },
  { icon: Zap,      amount: 25,  label: 'Power an AI run',  desc: 'Covers Claude API costs for ~25 bot builds.' },
  { icon: Server,   amount: 50,  label: 'A day of hosting', desc: 'Pays for a day of Railway infrastructure.' },
  { icon: Sparkles, amount: 100, label: 'Fund a feature',   desc: 'Contributes directly to new development.' },
];

export default function Donate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState<number | null>(25);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSuccess(true);
      setSearchParams({}, { replace: true });
    }
  }, []);

  const finalAmount = selected !== null ? selected : (parseFloat(custom) || 0);

  const handleDonate = async () => {
    if (finalAmount < 1) { toast.error('Minimum donation is $1.'); return; }
    if (finalAmount > 10_000) { toast.error('Maximum donation is $10,000.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? 'Something went wrong. Try again.');
        setLoading(false);
      }
    } catch {
      toast.error('Could not connect. Try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#06060b', minHeight: '100vh', position: 'relative' }}>
      <AmbientBg />
      <FloatingNav />

      <div style={{ position: 'relative', zIndex: 1, paddingTop: '96px', paddingBottom: '96px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px' }}>

          {/* ── Success State ── */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={spring.enter}
                style={{
                  ...GCard,
                  padding: '20px 24px',
                  marginBottom: '32px',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  background: 'linear-gradient(170deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.05) 100%)',
                  border: '1px solid rgba(16,185,129,0.22)',
                }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={15} color="rgba(110,231,183,0.9)" />
                </div>
                <div>
                  <p style={{ fontFamily: "'Geist', sans-serif", fontSize: '14px', fontWeight: 600, color: 'rgba(110,231,183,0.9)', margin: '0 0 2px' }}>
                    Thank you — donation received.
                  </p>
                  <p style={{ fontFamily: "'Geist', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.38)', margin: 0 }}>
                    It genuinely means a lot. Every dollar goes straight into building Buildable Labs.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Badge ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '22px' }}
          >
            <span style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '999px', padding: '4px 14px', fontFamily: "'Geist', sans-serif",
              fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.55)',
              letterSpacing: '0.04em', textTransform: 'uppercase' as const,
            }}>Support</span>
          </motion.div>

          {/* ── Headline ── */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.07 }}
            style={{
              fontFamily: "'Geist', sans-serif", fontSize: 'clamp(36px, 6vw, 54px)',
              fontWeight: 800, color: 'rgba(255,255,255,0.92)', textAlign: 'center',
              lineHeight: 1.12, marginBottom: '16px', letterSpacing: '-0.02em',
            }}
          >
            Help build what's next.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            style={{
              fontFamily: "'Geist', sans-serif", fontSize: '16px',
              color: 'rgba(255,255,255,0.38)', textAlign: 'center',
              lineHeight: 1.65, marginBottom: '56px',
            }}
          >
            Buildable Labs is built by one person. Donations cover hosting, AI API costs, and development time — and keep it free for everyone.
          </motion.p>

          {/* ── Donation Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.enter, delay: 0.15 }}
            style={{ ...GCard, padding: '32px', marginBottom: '24px' }}
          >
            {/* Amount presets */}
            <p style={{
              fontFamily: "'Geist', sans-serif", fontSize: '11px', fontWeight: 600,
              color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: '14px',
            }}>Choose an amount</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              {PRESETS.map((amount) => {
                const isActive = selected === amount;
                return (
                  <motion.button
                    key={amount}
                    whileHover={BH} whileTap={BT} transition={BTR}
                    onClick={() => { setSelected(amount); setCustom(''); }}
                    style={{
                      ...(isActive ? tint(109, 40, 217) : G),
                      borderRadius: '12px',
                      padding: '12px 0',
                      fontSize: '15px',
                      fontWeight: isActive ? 700 : 500,
                      border: isActive ? '1px solid rgba(160,120,255,0.45)' : '1px solid rgba(255,255,255,0.12)',
                    }}
                    onMouseEnter={isActive ? onTE(109, 40, 217) : onGE}
                    onMouseLeave={isActive ? onTL(109, 40, 217) : onGL}
                  >
                    ${amount}
                  </motion.button>
                );
              })}
            </div>

            {/* Custom amount */}
            <div style={{ position: 'relative', marginBottom: '28px' }}>
              <span style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                fontFamily: "'Geist', sans-serif", fontSize: '15px', color: 'rgba(255,255,255,0.35)',
                pointerEvents: 'none',
              }}>$</span>
              <input
                type="number"
                min="1"
                max="10000"
                placeholder="Custom amount"
                value={custom}
                onChange={(e) => { setCustom(e.target.value); setSelected(null); }}
                onFocus={(e) => {
                  setSelected(null);
                  e.currentTarget.style.borderColor = 'rgba(160,120,255,0.5)';
                  e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.18), 0 0 0 1px rgba(109,40,217,0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.18)';
                }}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selected === null && custom ? 'rgba(160,120,255,0.45)' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '12px',
                  padding: '12px 14px 12px 28px',
                  fontFamily: "'Geist', sans-serif",
                  fontSize: '15px',
                  color: 'rgba(255,255,255,0.88)',
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                  transition: 'border-color 0.16s ease, box-shadow 0.16s ease',
                }}
              />
            </div>

            {/* Donate button */}
            <motion.button
              whileHover={finalAmount >= 1 ? BH : undefined}
              whileTap={finalAmount >= 1 ? BT : undefined}
              transition={BTR}
              onClick={handleDonate}
              disabled={loading || finalAmount < 1}
              style={{
                ...tint(109, 40, 217),
                width: '100%',
                borderRadius: '14px',
                padding: '14px 0',
                fontSize: '16px',
                fontWeight: 700,
                opacity: loading || finalAmount < 1 ? 0.5 : 1,
                cursor: loading || finalAmount < 1 ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: '1px solid rgba(160,120,255,0.35)',
              }}
              onMouseEnter={finalAmount >= 1 && !loading ? onTE(109, 40, 217) : undefined}
              onMouseLeave={finalAmount >= 1 && !loading ? onTL(109, 40, 217) : undefined}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Heart size={15} />
                  {finalAmount >= 1 ? `Donate $${finalAmount % 1 === 0 ? finalAmount : finalAmount.toFixed(2)}` : 'Donate'}
                </>
              )}
            </motion.button>

            {/* Stripe trust line */}
            <p style={{
              textAlign: 'center', marginTop: '14px',
              fontFamily: "'Geist', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.22)',
            }}>
              Secured by Stripe · No account required
            </p>
          </motion.div>

          {/* ── What it funds ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {TIERS.map(({ icon: Icon, amount, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring.enter, delay: 0.22 + i * 0.06 }}
                whileHover={{ y: -2, scale: 1.007 }}
                onClick={() => { setSelected(amount); setCustom(''); }}
                style={{
                  background: 'linear-gradient(170deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.022) 100%)',
                  backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: selected === amount ? '1px solid rgba(160,120,255,0.3)' : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px', padding: '18px',
                  cursor: 'pointer',
                  transition: 'border-color 0.16s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Icon size={13} color="rgba(167,139,250,0.7)" />
                  <span style={{
                    fontFamily: "'Geist', sans-serif", fontSize: '11px', fontWeight: 700,
                    color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>${amount}</span>
                </div>
                <p style={{ fontFamily: "'Geist', sans-serif", fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.75)', margin: '0 0 4px' }}>
                  {label}
                </p>
                <p style={{ fontFamily: "'Geist', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.5 }}>
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
