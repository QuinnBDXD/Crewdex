import ResponsiveLayout from '@/components/ResponsiveLayout';

export default function ProjectDashboard() {
  return (
    <ResponsiveLayout sidebar={<div>Sidebar</div>}>
      <h1 className="text-xl font-bold">Project Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Project details will appear here.
      </p>
    </ResponsiveLayout>
  );
}
