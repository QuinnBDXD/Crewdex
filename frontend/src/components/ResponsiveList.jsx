import React from 'react';

export default function ResponsiveList({ items, columns }) {
  return (
    <>
      <table className="hidden w-full text-left md:table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="border-b p-2">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b last:border-0">
              {columns.map((col) => (
                <td key={col.key} className="p-2">
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="space-y-4 md:hidden">
        {items.map((item) => (
          <div key={item.id} className="rounded border p-4">
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between">
                <span className="font-medium">{col.header}</span>
                <span>{col.render ? col.render(item) : item[col.key]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
