import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShoppingCart, BarChart3, MessageSquare } from 'lucide-react';

interface PreviewShowcaseProps {
  isVisible: boolean;
}

// Template showcase cards
const SHOWCASE_TEMPLATES = [
  {
    id: 'ecommerce',
    title: 'E-commerce Store',
    description: 'Full-featured online store with cart and checkout',
    icon: ShoppingCart,
    gradient: 'from-violet-500 to-purple-600',
    preview: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
  },
  {
    id: 'dashboard',
    title: 'Analytics Dashboard',
    description: 'Real-time metrics and data visualization',
    icon: BarChart3,
    gradient: 'from-blue-500 to-cyan-600',
    preview: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
  },
  {
    id: 'saas',
    title: 'SaaS Landing',
    description: 'Modern landing page with pricing tiers',
    icon: Sparkles,
    gradient: 'from-emerald-500 to-teal-600',
    preview: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
  },
  {
    id: 'chat',
    title: 'Chat Application',
    description: 'Real-time messaging with AI capabilities',
    icon: MessageSquare,
    gradient: 'from-orange-500 to-amber-600',
    preview: 'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=400&h=300&fit=crop',
  },
];

export default function PreviewShowcase({ isVisible }: PreviewShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate cards every 4 seconds
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SHOWCASE_TEMPLATES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="h-full flex flex-col items-center justify-center bg-zinc-900 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold mb-2">What would you like to build?</h2>
        <p className="text-muted-foreground">
          Describe your idea or explore our templates
        </p>
      </motion.div>

      {/* Showcase Cards */}
      <div className="relative w-full max-w-4xl h-80">
        <AnimatePresence mode="wait">
          {SHOWCASE_TEMPLATES.map((template, index) => {
            const isActive = index === activeIndex;
            const offset = index - activeIndex;
            
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.8, x: 100 }}
                animate={{
                  opacity: isActive ? 1 : 0.3,
                  scale: isActive ? 1 : 0.85,
                  x: offset * 280,
                  zIndex: isActive ? 10 : 0,
                }}
                exit={{ opacity: 0, scale: 0.8, x: -100 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute left-1/2 top-0 -translate-x-1/2 w-72"
                onClick={() => setActiveIndex(index)}
              >
                <div 
                  className={`
                    bg-zinc-800 rounded-2xl overflow-hidden cursor-pointer
                    border-2 transition-colors duration-300
                    ${isActive ? 'border-primary shadow-2xl shadow-primary/20' : 'border-zinc-700'}
                  `}
                >
                  {/* Template Preview Image */}
                  <div 
                    className={`h-40 bg-gradient-to-br ${template.gradient} relative overflow-hidden`}
                  >
                    <img 
                      src={template.preview} 
                      alt={template.title}
                      className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <template.icon className="h-16 w-16 text-white/80" />
                    </div>
                  </div>
                  
                  {/* Template Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{template.title}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Dots Indicator */}
      <div className="flex gap-2 mt-8">
        {SHOWCASE_TEMPLATES.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`
              h-2 rounded-full transition-all duration-300
              ${index === activeIndex ? 'w-8 bg-primary' : 'w-2 bg-zinc-600 hover:bg-zinc-500'}
            `}
          />
        ))}
      </div>

      {/* Feature Pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-2 mt-8 justify-center"
      >
        {['React', 'TypeScript', 'Tailwind', 'Supabase', 'AI-Powered'].map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 rounded-full bg-zinc-800 text-xs text-muted-foreground border border-zinc-700"
          >
            {tag}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
