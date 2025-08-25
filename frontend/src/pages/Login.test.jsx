import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

test('submits form and navigates on success', async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({}) });
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
  await userEvent.type(screen.getByLabelText(/Email/i), 'a@b.com');
  await userEvent.type(screen.getByLabelText(/Password/i), 'secret');
  await userEvent.type(screen.getByLabelText(/Project ID/i), 'p1');
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
  expect(fetch).toHaveBeenCalledWith(
    '/api/auth/login',
    expect.objectContaining({ method: 'POST' })
  );
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/projects'));
});
