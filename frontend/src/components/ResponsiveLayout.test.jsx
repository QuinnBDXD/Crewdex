import { render, screen } from '@testing-library/react';
import ResponsiveLayout from './ResponsiveLayout';

jest.mock('@/lib/offlineQueue', () => ({
  useOfflineQueue: jest.fn(),
}));

const { useOfflineQueue } = require('@/lib/offlineQueue');

afterEach(() => {
  jest.clearAllMocks();
});

test('shows offline indicator when offline', () => {
  useOfflineQueue.mockReturnValue({ online: false, queued: 0 });
  render(<ResponsiveLayout>content</ResponsiveLayout>);
  expect(screen.getByText(/offline/i)).toBeInTheDocument();
});

test('shows queued count when online with queued items', () => {
  useOfflineQueue.mockReturnValue({ online: true, queued: 2 });
  render(<ResponsiveLayout>content</ResponsiveLayout>);
  expect(screen.getByText(/2 queued/i)).toBeInTheDocument();
});

test('renders sidebar when provided', () => {
  useOfflineQueue.mockReturnValue({ online: true, queued: 0 });
  render(
    <ResponsiveLayout sidebar={<div>side</div>}>content</ResponsiveLayout>
  );
  expect(screen.getByText('side')).toBeInTheDocument();
});
