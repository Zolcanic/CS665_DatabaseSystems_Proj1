// src/app/page.js

'use client';

import TableDisplay from './components/TableDisplay';
import { useEffect, useState } from 'react';

export default function Home() {
  const [tableData, setTableData] = useState(null);
  const [selectedTable, setSelectedTable] = useState('');
  const [formFields, setFormFields] = useState({});
  const [inputData, setInputData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTableData();
  }, []);

  const fetchTableData = async () => {
    const host = typeof window !== 'undefined' && window.location.host;
    const protocol = window.location.protocol;
    const response = await fetch(`${protocol}//${host}/api/tables`);
    const result = await response.json();
    setTableData(result.data);
    setLoading(false);
  };

  const handleTableChange = (e) => {
    const table = e.target.value;
    setSelectedTable(table);
    const firstRow = tableData?.[table]?.[0] || {};
    setFormFields(firstRow);
    setInputData({});
  };

  const handleInputChange = (e, field) => {
    setInputData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: selectedTable, data: inputData })
    });
    if (response.ok) {
      alert('Entry added successfully!');
      fetchTableData();
    } else {
      alert('Failed to add entry.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!tableData) return <div>Error loading data.</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Database Contents</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px', borderRadius: '10px' }}>
        <h2>Create New Entry</h2>
        <label>
          Select Table:
          <select value={selectedTable} onChange={handleTableChange} style={{ marginLeft: '10px' }}>
            <option value="">-- Choose Table --</option>
            {Object.keys(tableData).map((tableName) => (
              <option key={tableName} value={tableName}>{tableName}</option>
            ))}
          </select>
        </label>

        {selectedTable && (
          <div style={{ marginTop: '15px' }}>
            {Object.keys(formFields).map((field) => (
              <div key={field} style={{ marginBottom: '10px' }}>
                <label>
                  {field}:
                  <input
                    type="text"
                    value={inputData[field] || ''}
                    onChange={(e) => handleInputChange(e, field)}
                    style={{ marginLeft: '10px' }}
                  />
                </label>
              </div>
            ))}
            <button type="submit">Add Entry</button>
          </div>
        )}
      </form>

      <TableDisplay data={tableData} />
    </div>
  );
}
