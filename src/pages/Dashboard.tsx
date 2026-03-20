import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProjectsView from '@/components/dashboard/ProjectsView';

export default function Dashboard() {
  const [showNew, setShowNew] = useState(false);
  return (
    <DashboardLayout noPadding>
      <ProjectsView showNew={showNew} onShowNewChange={setShowNew} />
    </DashboardLayout>
  );
}
