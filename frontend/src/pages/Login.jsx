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
      });
      if (!res.ok) {
        throw new Error('Login failed');
      }
      const data = await res.json();
      const token = data?.session?.token;
      if (token) {
        localStorage.setItem('token', token);
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
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded border p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded border p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="w-full" type="submit">
            Sign In
          </Button>
        </form>
      </div>
    </ResponsiveLayout>
  );
}
