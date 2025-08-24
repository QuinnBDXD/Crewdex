import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import './index.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(() => {
      navigator.serviceWorker.ready.then((reg) => {
        reg.active?.postMessage({ type: 'GET_QUEUE_LENGTH' });
      });
    });
  });
  window.addEventListener('online', () => {
    navigator.serviceWorker.ready.then((reg) => {
      reg.active?.postMessage({ type: 'FLUSH_QUEUE' });
    });
  });
}
