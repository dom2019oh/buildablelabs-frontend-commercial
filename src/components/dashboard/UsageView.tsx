import { motion } from 'framer-motion';
import { BarChart3, FolderKanban, Hammer, MessageSquare, Loader2 } from 'lucide-react';
import { useUsageStats } from '@/hooks/useProjects';

export default function UsageView() {
  const { data: stats, isLoading } = useUsageStats();

  const metrics = [
    {
      icon: FolderKanban,
      label: 'Total Projects',
      value: stats?.totalProjects ?? 0,
      description: 'Projects created on your account',
    },
    {
      icon: Hammer,
      label: 'Total Builds',
      value: stats?.totalBuilds ?? 0,
      description: 'All build runs across projects',
    },
    {
      icon: MessageSquare,
      label: 'Total Prompts',
      value: stats?.totalPrompts ?? 0,
      description: 'Prompts used for generation',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <BarChart3 className="w-6 h-6" />
          Usage
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          View your platform usage metrics
        </p>
      </motion.div>

      {/* Metrics Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <metric.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{metric.label}</span>
              </div>
              <p className="text-4xl font-bold">{metric.value}</p>
              <p className="text-sm text-muted-foreground mt-2">{metric.description}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 glass-card p-6"
      >
        <h3 className="font-medium mb-2">Usage Notes</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Usage data is updated in real-time</li>
          <li>• Archived projects are not included in the count</li>
          <li>• Build counts include both successful and failed builds</li>
        </ul>
      </motion.div>
    </div>
  );
}
