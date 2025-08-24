import React from 'react';
import { useOfflineQueue } from '@/lib/offlineQueue';

export default function ResponsiveLayout({ sidebar, children }) {
  const { online, queued } = useOfflineQueue();
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-1 lg:grid-cols-[250px_1fr]">
      {sidebar && (
        <aside className="border-b p-4 lg:border-b-0 lg:border-r">
          {sidebar}
        </aside>
      )}
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 border-b bg-white p-2 text-sm">
          {!online && <span className="text-red-600">Offline</span>}
          {online && queued > 0 && (
            <span className="text-yellow-600">{queued} queued</span>
          )}
        </header>
        <main className="p-4 flex-1">{children}</main>
      </div>
    </div>
  );
}
