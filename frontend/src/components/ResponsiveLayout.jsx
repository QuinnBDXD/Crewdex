import React from 'react';

export default function ResponsiveLayout({ sidebar, children }) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-1 lg:grid-cols-[250px_1fr]">
      {sidebar && (
        <aside className="border-b p-4 lg:border-b-0 lg:border-r">
          {sidebar}
        </aside>
      )}
      <main className="p-4">{children}</main>
    </div>
  );
}
