import React, { useState } from 'react';

export function ProjectForm({ onCreate }: { onCreate: (name: string) => void }) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(name);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name
        <input aria-label="name" value={name} onChange={e => setName(e.target.value)} />
      </label>
      <button type="submit">Create Project</button>
    </form>
  );
}
