import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CostsView from '@/components/dashboard/CostsView';

export default function DashboardCosts() {
  return (
    <DashboardLayout noPadding>
      <CostsView />
    </DashboardLayout>
  );
}
