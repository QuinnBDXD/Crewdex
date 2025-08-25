import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  mockNavigate.mockReset();
});

test('redirects to project dashboard when only one project is returned', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      session: { project_roles: { p1: 'Viewer' } },
    }),
  });
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
  await userEvent.type(screen.getByLabelText(/Email/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/Password/i), 'secret');
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
  expect(fetch).toHaveBeenCalledWith(
    '/api/auth/login',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'a@b.com', password: 'secret' }),
    }),
  );
  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith('/projects/p1'),
  );
});

test('redirects to project list when multiple projects are returned', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      session: { project_roles: { p1: 'Viewer', p2: 'Viewer' } },
    }),
  });
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
  await userEvent.type(screen.getByLabelText(/Email/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/Password/i), 'secret');
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith('/projects'),
  );
});

test('shows an error message when login fails', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    text: async () => 'Invalid credentials',
  });
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
  await userEvent.type(screen.getByLabelText(/Email/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/Password/i), 'secret');
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
  expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  expect(mockNavigate).not.toHaveBeenCalled();
});
