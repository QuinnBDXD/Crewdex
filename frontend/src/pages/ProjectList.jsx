import { Link } from 'react-router-dom';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import ResponsiveList from '@/components/ResponsiveList';

export default function ProjectList() {
  const projects = [{ id: '1', name: 'Demo Project' }];
  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (p) => <Link to={`/projects/${p.id}`}>{p.name}</Link>,
    },
  ];
  return (
    <ResponsiveLayout sidebar={<div>Sidebar</div>}>
      <h1 className="mb-4 text-xl font-bold">Projects</h1>
      <ResponsiveList items={projects} columns={columns} />
    </ResponsiveLayout>
  );
}
