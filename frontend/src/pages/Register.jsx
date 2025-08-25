import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ResponsiveLayout from '@/components/ResponsiveLayout';

export default function Register() {
  const [accountName, setAccountName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_name: accountName, email, password }),
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Registration failed');
      }
      await res.json();
      alert('Registration successful. Please log in.');
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ResponsiveLayout>
      <div className="flex min-h-screen items-center justify-center">
        <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
          <h1 className="text-center text-2xl font-bold">Register</h1>
          <label htmlFor="accountName" className="block">
            <span className="mb-1 block">Account Name</span>
            <input
              id="accountName"
              type="text"
              className="w-full rounded border p-2"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </label>
          <label htmlFor="email" className="block">
            <span className="mb-1 block">Email</span>
            <input
              id="email"
              type="email"
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
              className="w-full rounded border p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <Button className="w-full" type="submit">
            Create Account
          </Button>
          <p className="text-center text-sm">
            Already have an account? <Link to="/">Login</Link>
          </p>
        </form>
      </div>
    </ResponsiveLayout>
  );
}
