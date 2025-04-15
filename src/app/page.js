// src/app/page.js (Server Component)

import TableDisplay from './components/TableDisplay';
import { headers } from 'next/headers';

async function getTableData() {
  try {
    const headersList = headers();
    const host = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const response = await fetch(`${protocol}://${host}/api/tables`);

    if (!response.ok) {
      console.error('Failed to fetch table data from API:', response.status);
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching table data from API:', error);
    return null;
  }
}

export default async function Home() {
  const tableData = await getTableData();

  if (!tableData) {
    return <div>Error loading database contents.</div>;
  }

  return (
    <div>
      <h1>Database Contents</h1>
      <TableDisplay data={tableData} />
    </div>
  );
}
