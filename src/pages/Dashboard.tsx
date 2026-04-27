import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProjectsView from '@/components/dashboard/ProjectsView';

export default function Dashboard() {
  return (
    <DashboardLayout noPadding>
      <ProjectsView />
    </DashboardLayout>
  );
}
