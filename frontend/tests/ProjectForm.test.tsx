import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ProjectForm } from '../src/components/ProjectForm';

describe('ProjectForm', () => {
  it('calls onCreate with project name', async () => {
    const onCreate = vi.fn();
    render(<ProjectForm onCreate={onCreate} />);
    await userEvent.type(screen.getByLabelText(/name/i), 'My Project');
    await userEvent.click(screen.getByText(/create project/i));
    expect(onCreate).toHaveBeenCalledWith('My Project');
  });
});
