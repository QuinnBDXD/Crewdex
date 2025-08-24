import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../src/components/LoginForm';

describe('LoginForm', () => {
  it('accepts email and password input', async () => {
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'a@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    expect(screen.getByLabelText(/email/i)).toHaveValue('a@example.com');
    expect(screen.getByLabelText(/password/i)).toHaveValue('secret');
  });
});
