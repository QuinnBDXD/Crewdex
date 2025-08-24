import { Link } from 'react-router-dom';

export default function ProjectList() {
  const projects = [{ id: '1', name: 'Demo Project' }];
  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">Projects</h1>
      <ul className="space-y-2">
        {projects.map((p) => (
          <li key={p.id}>
            <Link
              to={`/projects/${p.id}`}
              className="block rounded border p-2 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              aria-label={`Open project ${p.name}`}
            >
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
