// src/app/page.js (or src/app/page.tsx)

'use client'; // This is a client component

import { useState, useEffect } from 'react';

export default function Home() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTables() {
      try {
        const response = await fetch('/api/tables');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTables(data.tables);
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    }

    fetchTables();
  }, []);

  if (loading) {
    return <div>Loading tables...</div>;
  }

  if (error) {
    return <div>Error loading tables: {error}</div>;
  }

  return (
    <div>
      <h1>Database Tables</h1>
      {tables.length > 0 ? (
        <ul>
          {tables.map((table) => (
            <li key={table}>{table}</li>
          ))}
        </ul>
      ) : (
        <p>No tables found.</p>
      )}
    </div>
  );
}