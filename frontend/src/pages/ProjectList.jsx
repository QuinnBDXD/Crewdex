import { Link } from 'react-router-dom';

export default function ProjectList() {
  const projects = [{ id: '1', name: 'Demo Project' }];
  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">Projects</h1>
      <ul className="space-y-2">
        {projects.map((p) => (
          <li key={p.id} className="rounded border p-2 hover:bg-accent">
            <Link to={`/projects/${p.id}`}>{p.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
