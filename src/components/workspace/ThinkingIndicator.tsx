import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Code2, Sparkles, Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThinkingIndicatorProps {
  isVisible: boolean;
  taskType?: string;
  modelUsed?: string;
}

// Different thinking phases to cycle through
const THINKING_PHASES = [
  { icon: Brain, text: 'Analyzing your request...', color: 'text-purple-400' },
  { icon: Sparkles, text: 'Planning the solution...', color: 'text-amber-400' },
  { icon: Code2, text: 'Generating code...', color: 'text-blue-400' },
  { icon: Palette, text: 'Polishing the output...', color: 'text-emerald-400' },
];

export default function ThinkingIndicator({ isVisible, taskType, modelUsed }: ThinkingIndicatorProps) {
  const [currentPhase, setCurrentPhase] = useState(0);

  // Cycle through phases while visible
  useEffect(() => {
    if (!isVisible) {
      setCurrentPhase(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentPhase((prev) => (prev + 1) % THINKING_PHASES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isVisible]);

  const phase = THINKING_PHASES[currentPhase];
  const PhaseIcon = phase.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-lg p-4 bg-gradient-to-r from-primary/5 to-transparent border border-primary/10"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Buildify</span>
            {modelUsed && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {modelUsed}
              </span>
            )}
          </div>

          {/* Thinking Animation */}
          <div className="flex items-center gap-3">
            {/* Animated Icon */}
            <motion.div
              key={currentPhase}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center bg-muted/50',
                phase.color
              )}
            >
              <PhaseIcon className="h-4 w-4" />
            </motion.div>

            {/* Text and Progress */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentPhase}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="text-sm text-foreground font-medium"
                >
                  {phase.text}
                </motion.p>
              </AnimatePresence>

              {/* Progress Steps */}
              <div className="flex items-center gap-1 mt-2">
                {THINKING_PHASES.map((_, index) => (
                  <motion.div
                    key={index}
                    className={cn(
                      'h-1 rounded-full transition-all duration-300',
                      index <= currentPhase ? 'bg-primary w-6' : 'bg-muted w-4'
                    )}
                    animate={{
                      scale: index === currentPhase ? [1, 1.1, 1] : 1,
                    }}
                    transition={{ duration: 0.5, repeat: index === currentPhase ? Infinity : 0 }}
                  />
                ))}
              </div>
            </div>

            {/* Spinning Indicator */}
            <div className="relative h-6 w-6">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/20"
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
