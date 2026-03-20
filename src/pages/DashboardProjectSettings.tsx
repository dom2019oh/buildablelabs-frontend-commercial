import DashboardLayout from '@/components/dashboard/DashboardLayout';
import BotSettingsView from '@/components/dashboard/BotSettingsView';

export default function DashboardProjectSettings() {
  return (
    <DashboardLayout noPadding>
      <BotSettingsView />
    </DashboardLayout>
  );
}
