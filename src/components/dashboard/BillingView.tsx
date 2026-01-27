import { motion } from 'framer-motion';
import { CreditCard, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function BillingView() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <CreditCard className="w-6 h-6" />
          Billing
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your subscription and billing
        </p>
      </motion.div>

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium mb-1">Current Plan</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">Free / Beta</span>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Beta
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Coming Soon */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-12 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Billing Coming Soon</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We're working on bringing you flexible billing options. For now, enjoy free access during our beta period.
        </p>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-8 glass-card p-6"
      >
        <h3 className="font-medium mb-2">Beta Access</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Full access to all features during beta</li>
          <li>• Unlimited projects</li>
          <li>• Early access to new features</li>
          <li>• Priority support feedback channel</li>
        </ul>
      </motion.div>
    </div>
  );
}
