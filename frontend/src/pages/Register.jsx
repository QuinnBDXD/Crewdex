import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ResponsiveLayout from '@/components/ResponsiveLayout';

export default function Register() {
  const [accountName, setAccountName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_name: accountName, email, password }),
        credentials: 'include',
      });
      if (!res.ok) {
        const message = await res.text();
        setError(message || 'Registration failed');
        return;
      }
      await res.json();
      setSuccess('Registration successful. Redirecting to login...');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.message || 'Registration failed');
      console.error(err);
    }
  };

  return (
    <ResponsiveLayout>
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm">
          {error && (
            <p className="mb-4 text-center text-sm text-red-600">{error}</p>
          )}
          {success && (
            <p className="mb-4 text-center text-sm text-green-600">{success}</p>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
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
      </div>
    </ResponsiveLayout>
  );
}
