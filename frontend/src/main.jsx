import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { registerSW } from 'virtual:pwa-register';
import { initOfflineQueue } from '@/lib/offlineQueue';
import App from './App.jsx';
import './index.css';

const updateSW = registerSW({
  onNeedRefresh() {
    if (window.confirm('New version available. Refresh now?')) {
      updateSW(true);
    }
  },
});

initOfflineQueue();

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
