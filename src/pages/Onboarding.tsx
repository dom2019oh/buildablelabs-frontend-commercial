import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import logoPng from '@/assets/buildable-logo.png';
import wordmarkSvg from '@/assets/buildable-wordmark.svg';
import Grainient from '@/components/Grainient';
import { saveOnboardingAnswers } from '@/hooks/useOnboarding';
import { auth } from '@/lib/firebase';
import { getDashboardUrl } from '@/lib/urls';

const QUESTIONS = [
  {
    id: 'q1',
    step: '01',
    question: 'What should we call you?',
    hint: 'A name or nickname — however you prefer.',
    type: 'text' as const,
    placeholder: 'e.g. Alex, Captain, xX_Dev_Xx…',
    required: true,
  },
  {
    id: 'q2',
    step: '02',
    question: 'Why are you building a bot?',
    hint: 'Pick the one that feels most like you.',
    type: 'choice' as const,
    options: [
      'I run a community & want to automate it',
      'I want to add fun features to my server',
      "I'm building it for a client",
      'Just exploring what\'s possible',
      'Other',
    ],
    required: true,
  },
  {
    id: 'q3',
    step: '03',
    question: 'What kind of bot do you have in mind?',
    hint: 'You can always build more later.',
    type: 'choice' as const,
    options: [
      'Moderation & Safety',
      'Music / Entertainment',
      'Welcome & Roles',
      'Tickets & Support',
      'Giveaways & Events',
      'Something fully custom',
    ],
    required: true,
  },
  {
    id: 'q4',
    step: '04',
    question: 'How big is your Discord server?',
    hint: 'Helps us tailor the experience.',
    type: 'choice' as const,
    options: [
      'Just starting out (0–10)',
      'Small community (10–100)',
      'Growing fast (100–1,000)',
      'Established server (1,000+)',
    ],
    required: false,
  },
  {
    id: 'q5',
    step: '05',
    question: 'How did you find Buildable?',
    hint: 'We\'re curious!',
    type: 'choice' as const,
    options: [
      'Instagram',
      'TikTok',
      'Google Search',
      'YouTube',
      'Word of mouth',
      'Other',
    ],
    required: false,
  },
];

const RIGHT_PANEL_CONTENT = [
  { quote: '"Every great bot\nstarts with a name."', caption: 'Yours is next.' },
  { quote: '"Built for creators,\nnot developers."', caption: 'Whatever your reason — we\'ve got you.' },
  { quote: '"From idea\nto live bot."', caption: 'One prompt at a time.' },
  { quote: '"Big or small,\nevery server deserves great bots."', caption: 'We scale with you.' },
  { quote: '"You\'re almost\ninside."', caption: 'One last question.' },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [textValue, setTextValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string })?.returnTo || getDashboardUrl();

  const goToDashboard = (path = returnTo) => {
    if (path.startsWith('http')) {
      window.location.href = path;
    } else {
      navigate(path, { replace: true });
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (!user) { navigate('/log-in'); return; }
    };
    checkAuth();
  }, [navigate, returnTo]);

  const current = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const progress = (step / QUESTIONS.length) * 100;

  const currentAnswer = current.type === 'text'
    ? textValue
    : answers[current.id] || '';

  const canProceed = !current.required || currentAnswer.trim().length > 0;

  const handleSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [current.id]: option }));
  };

  const handleNext = async () => {
    const finalAnswers = {
      ...answers,
      ...(current.type === 'text' ? { [current.id]: textValue } : {}),
    };
    setAnswers(finalAnswers);

    if (isLast) {
      setIsSubmitting(true);
      try {
        await saveOnboardingAnswers(finalAnswers, true, false);
        goToDashboard();
      } catch {
        setIsSubmitting(false);
      }
      return;
    }

    setDirection(1);
    setStep(s => s + 1);
    setTextValue('');
  };

  const handleBack = () => {
    if (step === 0) return;
    setDirection(-1);
    setStep(s => s - 1);
    const prevQ = QUESTIONS[step - 1];
    if (prevQ.type === 'text') setTextValue(answers[prevQ.id] || '');
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await saveOnboardingAnswers(answers, false, true);
      goToDashboard();
    } catch {
      setIsSubmitting(false);
    }
  };

  const panel = RIGHT_PANEL_CONTENT[step] || RIGHT_PANEL_CONTENT[RIGHT_PANEL_CONTENT.length - 1];

  return (
    <div className="min-h-screen flex overflow-hidden relative">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <Grainient
          color1="#3a3c42"
          color2="#141518"
          color3="#252729"
          timeSpeed={0.35}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>

      {/* ── Left panel ── */}
      <div
        className="relative z-10 w-full md:w-[500px] lg:w-[540px] flex-shrink-0 flex flex-col min-h-screen"
        style={{
          background: 'rgba(4, 2, 12, 0.82)',
          backdropFilter: 'blur(48px)',
          WebkitBackdropFilter: 'blur(48px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-10 h-16 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link to="/" className="flex items-center gap-[10px]">
            <img src={logoPng} alt="" aria-hidden draggable={false} className="select-none block"
              style={{ height: '26px', width: '26px', objectFit: 'contain', filter: 'invert(1)', flexShrink: 0 }} />
            <img src={wordmarkSvg} alt="Buildable Labs" draggable={false} className="select-none block"
              style={{ height: '22px', width: 'auto', objectFit: 'contain' }} />
          </Link>

          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '9999px',
                  background: i === step
                    ? 'rgba(255,255,255,0.8)'
                    : i < step
                    ? 'rgba(255,255,255,0.4)'
                    : 'rgba(255,255,255,0.12)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-[1px]" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full"
            style={{ background: 'rgba(255,255,255,0.35)' }}
            animate={{ width: `${progress + (1 / QUESTIONS.length) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Question body */}
        <div className="flex-1 flex items-center justify-center px-10 lg:px-14 py-12 overflow-hidden">
          <div className="w-full max-w-[360px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                initial={{ opacity: 0, x: direction * 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -32 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Step label */}
                <p
                  className="mb-4"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}
                >
                  Step {current.step} of {String(QUESTIONS.length).padStart(2, '0')}
                </p>

                {/* Question */}
                <h2
                  className="mb-2"
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: '1.9rem',
                    fontWeight: 400,
                    fontStyle: 'italic',
                    color: '#ffffff',
                    lineHeight: 1.2,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {current.question}
                </h2>

                {/* Hint */}
                <p className="mb-8" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.02em' }}>
                  {current.hint}
                </p>

                {/* Text input */}
                {current.type === 'text' && (
                  <input
                    type="text"
                    value={textValue}
                    onChange={e => setTextValue(e.target.value)}
                    placeholder={current.placeholder}
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter' && canProceed) handleNext(); }}
                    className="w-full py-3 text-base text-white placeholder-white/20 outline-none transition-colors duration-200"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 0,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '1.1rem',
                    }}
                    onFocus={e => (e.currentTarget.style.borderBottom = '1px solid rgba(255,255,255,0.6)')}
                    onBlur={e => (e.currentTarget.style.borderBottom = '1px solid rgba(255,255,255,0.2)')}
                  />
                )}

                {/* Choice options */}
                {current.type === 'choice' && (
                  <div className="space-y-2">
                    {current.options?.map((option) => {
                      const selected = answers[current.id] === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleSelect(option)}
                          className="w-full text-left px-4 py-3 transition-all duration-200"
                          style={{
                            background: selected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                            border: selected ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '4px',
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '13px',
                            color: selected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
                            letterSpacing: '0.02em',
                          }}
                          onMouseEnter={e => { if (!selected) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}}
                          onMouseLeave={e => { if (!selected) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}}
                        >
                          <span className="flex items-center gap-3">
                            <span
                              style={{
                                width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0,
                                border: selected ? '4px solid rgba(255,255,255,0.9)' : '1px solid rgba(255,255,255,0.25)',
                                transition: 'all 0.2s',
                              }}
                            />
                            {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-10">
              {step > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                >
                  ← Back
                </button>
              )}

              <motion.button
                type="button"
                onClick={handleNext}
                disabled={!canProceed || isSubmitting}
                whileHover={canProceed ? { opacity: 0.9 } : {}}
                whileTap={canProceed ? { scale: 0.99 } : {}}
                className="flex items-center justify-center gap-2 py-3 px-8 disabled:opacity-30 transition-opacity"
                style={{
                  background: 'rgba(255,255,255,0.96)',
                  color: '#0a0612',
                  borderRadius: '3px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  minWidth: '120px',
                }}
              >
                {isSubmitting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : isLast ? 'Finish' : 'Continue'
                }
              </motion.button>

              {step >= 3 && !isLast && (
                <button
                  type="button"
                  onClick={handleSkip}
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
                >
                  Skip
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-5 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>
            © {new Date().getFullYear()} Buildable Labs
          </p>
        </div>
      </div>

      {/* ── Right panel — changes per step ── */}
      <div className="relative z-10 hidden md:flex flex-1 flex-col justify-end px-14 lg:px-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.22)' }} />

        <div className="relative z-10 max-w-[480px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-8" style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.4)' }} />

              <blockquote
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 'clamp(1.8rem, 2.8vw, 2.6rem)',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: '#ffffff',
                  lineHeight: 1.25,
                  letterSpacing: '-0.015em',
                  marginBottom: '1.25rem',
                  whiteSpace: 'pre-line',
                }}
              >
                {panel.quote}
              </blockquote>

              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
                {panel.caption}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
