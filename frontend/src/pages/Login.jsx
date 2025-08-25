import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ResponsiveLayout from '@/components/ResponsiveLayout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Login failed');
      }
      const data = await res.json();
      const projects = Object.keys(data.session?.project_roles || {});
      if (projects.length === 1) {
        navigate(`/projects/${projects[0]}`);
      } else {
        navigate('/projects');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ResponsiveLayout>
      <div className="flex min-h-screen items-center justify-center">
        <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
          <h1 className="text-center text-2xl font-bold">Login</h1>
          <label htmlFor="email" className="block">
            <span className="mb-1 block">Email</span>
            <input
              id="email"
              type="email"
              placeholder="Email"
              className="w-full rounded border p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label htmlFor="password" className="block">
            <span className="mb-1 block">Password</span>
            <input
              id="password"
              type="password"
              placeholder="Password"
              className="w-full rounded border p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <Button className="w-full" type="submit">
            Sign In
          </Button>
        </form>
      </div>
    </ResponsiveLayout>
  );
}
