import { Button } from '@/components/ui/button';
import ResponsiveLayout from '@/components/ResponsiveLayout';

export default function Login() {
  return (
    <ResponsiveLayout>
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-center text-2xl font-bold">Login</h1>
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded border p-2"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded border p-2"
          />
          <Button className="w-full">Sign In</Button>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
