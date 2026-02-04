import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThinkingIndicatorV2Props {
  isVisible: boolean;
  taskType?: string;
  currentActions?: string[];
}

// Default cycling messages when no specific actions
const DEFAULT_MESSAGES = [
  "Reading your request...",
  "Analyzing project structure...",
  "Planning changes...",
  "Writing components...",
  "Generating code...",
  "Applying styles...",
  "Validating output...",
  "Finishing up...",
];

export default function ThinkingIndicatorV2({ 
  isVisible, 
  taskType,
  currentActions = []
}: ThinkingIndicatorV2Props) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Cycle through messages
  useEffect(() => {
    if (!isVisible) {
      setMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % DEFAULT_MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isVisible]);

  const displayMessage = currentActions.length > 0 
    ? currentActions[currentActions.length - 1] 
    : DEFAULT_MESSAGES[messageIndex];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mr-auto max-w-[85%]"
        >
          {/* Main Thinking Bubble */}
          <motion.div
            className={cn(
              "rounded-2xl px-4 py-3 bg-zinc-800 cursor-pointer select-none",
              "relative overflow-hidden"
            )}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {/* Glowing animation overlay */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.15) 50%, transparent 100%)',
              }}
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            
            {/* Content */}
            <div className="relative z-10 flex items-center gap-3">
              {/* Animated dots */}
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-2 w-2 rounded-full bg-primary"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.1, 0.8],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>

              {/* Thinking text with cycling message */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  Thinking
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={displayMessage}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-sm text-muted-foreground truncate"
                  >
                    — {displayMessage}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Expand indicator */}
              {currentActions.length > 0 && (
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  className="text-muted-foreground"
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Expanded Actions List */}
          <AnimatePresence>
            {isExpanded && currentActions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 ml-4 overflow-hidden"
              >
                <div className="bg-zinc-800/50 rounded-lg p-3 space-y-1.5 border border-zinc-700/50">
                  {currentActions.map((action, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2 text-xs"
                    >
                      {/* Action icon based on type */}
                      <span className={cn(
                        "font-mono px-1.5 py-0.5 rounded text-[10px]",
                        action.startsWith('Created') && "bg-emerald-500/20 text-emerald-400",
                        action.startsWith('Read') && "bg-blue-500/20 text-blue-400",
                        action.startsWith('Edited') && "bg-amber-500/20 text-amber-400",
                        action.startsWith('Fixed') && "bg-purple-500/20 text-purple-400",
                        action.startsWith('Deleted') && "bg-red-500/20 text-red-400",
                        !action.match(/^(Created|Read|Edited|Fixed|Deleted)/) && "bg-zinc-700 text-zinc-400"
                      )}>
                        {action.split(':')[0] || action.split(' ')[0]}
                      </span>
                      <span className="text-muted-foreground truncate">
                        {action.includes(':') ? action.split(':')[1]?.trim() : action.split(' ').slice(1).join(' ')}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
