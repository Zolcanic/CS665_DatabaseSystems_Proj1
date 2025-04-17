'use client';

import TableDisplay from './components/TableDisplay';
import { useEffect, useState } from 'react';

export default function Home() {
  const [tableData, setTableData] = useState(null);
  const [tableSchema, setTableSchema] = useState(null);
  const [selectedTable, setSelectedTable] = useState('');
  const [action, setAction] = useState('');
  const [formFields, setFormFields] = useState({});
  const [inputData, setInputData] = useState({});
  const [deleteData, setDeleteData] = useState({});
  const [editConditions, setEditConditions] = useState({});
  const [editUpdates, setEditUpdates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTableData();
  }, []);

  const fetchTableData = async () => {
    const host = window.location.host;
    const protocol = window.location.protocol;
    try {
      const response = await fetch(`${protocol}//${host}/api/tables`);
      const result = await response.json();
      setTableData(result.data);
      setTableSchema(result.schema);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching table data:', error);
      setLoading(false);
    }
  };

  const handleTableChange = (e) => {
    const table = e.target.value;
    setSelectedTable(table);
    const firstRow = tableData?.[table]?.[0] || {};
    setFormFields(firstRow);
    setInputData({});
    setDeleteData({});
    setEditConditions({});
    setEditUpdates({});
    setAction('');
  };

  const handleActionChange = (e) => setAction(e.target.value);

  const handleInputChange = (e, field, setFn) => {
    setFn(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const inferInputType = (type) => {
    if (type === 'INTEGER' || type === 'REAL') return 'number';
    if (type === 'BOOLEAN') return 'checkbox';
    return 'text';
  };

  const cleanData = (data, schema) => {
    const cleaned = {};
    for (const key in data) {
      const val = data[key];
      if (val === '') continue;
      const fieldType = schema?.find(col => col.name === key)?.type || '';
      if (fieldType === 'INTEGER' || fieldType === 'REAL') {
        cleaned[key] = Number(val);
      } else {
        cleaned[key] = val;
      }
    }
    return cleaned;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const cleaned = cleanData(inputData, tableSchema[selectedTable]);
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: selectedTable, data: cleaned })
      });
      if (res.ok) {
        alert('Entry added');
        fetchTableData();
        setInputData({});
      } else {
        alert('Add failed');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    const conditions = cleanData(deleteData, tableSchema[selectedTable]);
    try {
      const res = await fetch('/api/tables', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: selectedTable, conditions })
      });
      if (res.ok) {
        alert('Entry deleted');
        fetchTableData();
        setDeleteData({});
      } else {
        alert('Delete failed');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const conditions = cleanData(editConditions, tableSchema[selectedTable]);
    const updates = cleanData(editUpdates, tableSchema[selectedTable]);
    if (Object.keys(updates).length === 0) {
      alert('Nothing to update.');
      return;
    }
    try {
      const res = await fetch('/api/tables', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: selectedTable, conditions, updates })
      });
      if (res.ok) {
        alert('Entry updated');
        fetchTableData();
        setEditConditions({});
        setEditUpdates({});
      } else {
        alert('Update failed');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!tableData || !tableSchema) return <div>Error loading data</div>;

  const schemaFields = tableSchema[selectedTable] || [];

  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#121212', minHeight: '100vh' }}>
      <h1>Database Contents</h1>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>Select Table:</label>
        <select value={selectedTable} onChange={handleTableChange} style={{ backgroundColor: 'black', color: 'white' }}>
          <option value="">-- Choose Table --</option>
          {Object.keys(tableData).map(table => (
            <option key={table} value={table}>{table}</option>
          ))}
        </select>

        {selectedTable && (
          <>
            <label style={{ marginLeft: '20px', marginRight: '10px' }}>Select Action:</label>
            <select value={action} onChange={handleActionChange} style={{ backgroundColor: 'black', color: 'white' }}>
              <option value="">-- Choose Action --</option>
              <option value="add">Add</option>
              <option value="edit">Edit</option>
              <option value="delete">Delete</option>
            </select>
          </>
        )}
      </div>

      {action === 'add' && (
        <form onSubmit={handleAddSubmit} style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px', borderRadius: '10px' }}>
          <h2>Create New Entry</h2>
          {schemaFields.map(field => (
            <div key={field.name} style={{ marginBottom: '10px' }}>
              <label>{field.name} ({field.type.toLowerCase()}):</label>
              <input
                type={inferInputType(field.type)}
                value={inputData[field.name] || ''}
                onChange={(e) => handleInputChange(e, field.name, setInputData)}
                style={{ marginLeft: '10px', border: '1px solid #ccc' }}
              />
            </div>
          ))}
          <button type="submit">Add Entry</button>
        </form>
      )}

      {action === 'delete' && (
        <form onSubmit={handleDeleteSubmit} style={{ marginBottom: '30px', border: '1px solid red', padding: '15px', borderRadius: '10px' }}>
          <h2>Delete Entry</h2>
          {schemaFields.map(field => (
            <div key={field.name} style={{ marginBottom: '10px' }}>
              <label>{field.name} ({field.type.toLowerCase()}):</label>
              <input
                type={inferInputType(field.type)}
                value={deleteData[field.name] || ''}
                onChange={(e) => handleInputChange(e, field.name, setDeleteData)}
                style={{ marginLeft: '10px', border: '1px solid red' }}
              />
            </div>
          ))}
          <button type="submit" style={{ backgroundColor: 'red', color: 'white' }}>Delete Entry</button>
        </form>
      )}

      {action === 'edit' && (
        <form onSubmit={handleEditSubmit} style={{ marginBottom: '30px', border: '1px solid #00f', padding: '15px', borderRadius: '10px' }}>
          <h2>Edit Entry</h2>
          
          {/* Find Entry section - needs styling changes */}
          <div style={{ backgroundColor: '#0a0a2a', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>Find Entry (Conditions)</h3>
            {schemaFields.map(field => (
              <div key={field.name + '-cond'} style={{ marginBottom: '10px' }}>
                <label>{field.name} ({field.type.toLowerCase()}):</label>
                <input
                  type={inferInputType(field.type)}
                  value={editConditions[field.name] || ''}
                  onChange={(e) => handleInputChange(e, field.name, setEditConditions)}
                  style={{ marginLeft: '10px', border: '1px solid #00f' }}
                />
              </div>
            ))}
          </div>
          
          {/* Divider between sections */}
          <hr style={{ border: 'none', borderTop: '1px dashed #00f', margin: '20px 0' }} />
          
          {/* Update Values section - needs different styling */}
          <div style={{ backgroundColor: '#0a1a2a', padding: '15px', borderRadius: '8px' }}>
            <h3>Update Values</h3>
            {schemaFields.map(field => (
              <div key={field.name + '-update'} style={{ marginBottom: '10px' }}>
                <label>{field.name} ({field.type.toLowerCase()}):</label>
                <input
                  type={inferInputType(field.type)}
                  value={editUpdates[field.name] || ''}
                  onChange={(e) => handleInputChange(e, field.name, setEditUpdates)}
                  style={{ marginLeft: '10px', border: '1px solid #007bff' }}
                />
              </div>
            ))}
          </div>
          
          <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', marginTop: '20px' }}>Update Entry</button>
        </form>
      )}

      <TableDisplay data={tableData} />
    </div>
  );
}
