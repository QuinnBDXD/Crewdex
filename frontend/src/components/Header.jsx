import { useEffect, useState } from 'react';

export default function Header() {
  const [online, setOnline] = useState(navigator.onLine);
  const [queueLength, setQueueLength] = useState(0);

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);

    const handleMessage = (event) => {
      if (event.data?.type === 'QUEUE_LENGTH') {
        setQueueLength(event.data.length);
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <header className="p-2 bg-gray-100 flex justify-between text-sm">
      <span className="font-bold">Crewdex</span>
      <span>
        {online ? 'Online' : 'Offline'}
        {queueLength > 0 && ` • Queue: ${queueLength}`}
      </span>
    </header>
  );
}
