'use client';

import TableDisplay from './components/TableDisplay';
import { useEffect, useState } from 'react';

export default function Home() {
  const [tableData, setTableData] = useState(null);
  const [selectedTable, setSelectedTable] = useState('');
  const [actionType, setActionType] = useState('');
  const [formFields, setFormFields] = useState({});
  const [inputData, setInputData] = useState({});
  const [deleteData, setDeleteData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTableData();
  }, []);

  const fetchTableData = async () => {
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      const protocol = window.location.protocol;
      try {
        const response = await fetch(`${protocol}//${host}/api/tables`);
        if (!response.ok) {
          console.error('Failed to fetch table data:', response.status);
          setLoading(false);
          return;
        }
        const result = await response.json();
        setTableData(result.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching table data:', error);
        setLoading(false);
      }
    }
  };

  const handleTableChange = (e) => {
    const table = e.target.value;
    setSelectedTable(table);
    setActionType('');
    const firstRow = tableData?.[table]?.[0] || {};
    setFormFields(firstRow);
    setInputData({});
    setDeleteData({});
  };

  const handleActionChange = (e) => {
    setActionType(e.target.value);
  };

  const handleInputChange = (e, field) => {
    setInputData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleDeleteChange = (e, field) => {
    setDeleteData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const inferInputType = (value) => {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') return 'text';
    if (typeof value === 'boolean') return 'checkbox';
    return 'text';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedData = {};
    for (const [key, value] of Object.entries(inputData)) {
      if (value === '') {
        cleanedData[key] = null;
      } else if (!isNaN(value) && formFields[key] !== undefined && typeof formFields[key] === 'number') {
        cleanedData[key] = Number(value);
      } else {
        cleanedData[key] = value;
      }
    }

    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: selectedTable, data: cleanedData })
      });

      if (response.ok) {
        alert('Entry added successfully!');
        fetchTableData();
        setSelectedTable('');
        setFormFields({});
        setInputData({});
        setActionType('');
      } else {
        const errorData = await response.json();
        alert(`Failed to add entry: ${errorData?.message || 'An error occurred'}`);
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Failed to add entry due to a network error.');
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tables', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: selectedTable, conditions: deleteData })
      });

      if (response.ok) {
        alert('Entry deleted successfully!');
        fetchTableData();
        setSelectedTable('');
        setFormFields({});
        setDeleteData({});
        setActionType('');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete entry: ${errorData?.message || 'An error occurred'}`);
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Failed to delete entry due to a network error.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!tableData) return <div>Error loading data.</div>;

  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#111', minHeight: '100vh' }}>
      <h1>Database Contents</h1>

      {/* Select Table */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          Select Table:
          <select
            value={selectedTable}
            onChange={handleTableChange}
            style={{
              marginLeft: '10px',
              backgroundColor: 'black',
              color: 'white',
              padding: '5px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          >
            <option value="">-- Choose Table --</option>
            {Object.keys(tableData).map((tableName) => (
              <option key={tableName} value={tableName}>
                {tableName}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Select Action */}
      {selectedTable && (
        <div style={{ marginBottom: '20px' }}>
          <label>
            Select Action:
            <select
              value={actionType}
              onChange={handleActionChange}
              style={{
                marginLeft: '10px',
                backgroundColor: 'black',
                color: 'white',
                padding: '5px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            >
              <option value="">-- Choose Action --</option>
              <option value="insert">Insert Entry</option>
              <option value="delete">Delete Entry</option>
            </select>
          </label>
        </div>
      )}

      {/* Insert Entry Form */}
      {selectedTable && actionType === 'insert' && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginBottom: '30px',
            border: '1px solid #ccc',
            padding: '15px',
            borderRadius: '10px'
          }}
        >
          <h2>Create New Entry</h2>
          {Object.entries(formFields).map(([field, value]) => {
            if (field.toLowerCase().endsWith('_id')) return null;
            return (
              <div key={field} style={{ marginBottom: '10px' }}>
                <label>
                  {field} ({typeof value}):
                  <input
                    type={inferInputType(value)}
                    value={inputData[field] || ''}
                    onChange={(e) => handleInputChange(e, field)}
                    style={{ marginLeft: '10px' }}
                  />
                </label>
              </div>
            );
          })}
          <button type="submit">Add Entry</button>
        </form>
      )}

      {/* Delete Entry Form */}
      {selectedTable && actionType === 'delete' && (
        <form
          onSubmit={handleDeleteSubmit}
          style={{
            marginBottom: '30px',
            border: '2px solid red',
            padding: '15px',
            borderRadius: '10px'
          }}
        >
          <h2>Delete Entry</h2>
          {Object.entries(formFields).map(([field]) => (
            <div key={field} style={{ marginBottom: '10px' }}>
              <label>
                {field}:
                <input
                  type="text"
                  value={deleteData[field] || ''}
                  onChange={(e) => handleDeleteChange(e, field)}
                  style={{ marginLeft: '10px' }}
                />
              </label>
            </div>
          ))}
          <button type="submit" style={{ backgroundColor: 'red', color: 'white', padding: '8px 16px', borderRadius: '5px' }}>
            Delete Entry
          </button>
        </form>
      )}

      <TableDisplay data={tableData} />
    </div>
  );
}
