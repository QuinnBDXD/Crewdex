import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import ResponsiveList from '@/components/ResponsiveList';

export default function ProjectList() {
  const {
    data: projects = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
        const res = await fetch('/projects');
      if (!res.ok) throw new Error('Failed to load projects');
      return res.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    networkMode: 'offlineFirst',
  });

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
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error loading projects</p>}
      {!isLoading && !isError && (
        <ResponsiveList items={projects} columns={columns} />
      )}
    </ResponsiveLayout>
  );
}
