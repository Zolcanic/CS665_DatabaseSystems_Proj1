// src/app/components/TableDisplay.js (Client Component)

'use client';

import React from 'react';

export default function TableDisplay({ data }) {
  if (!data) {
    return <div>No table data to display.</div>;
  }

  return (
    <>
      {Object.keys(data).map((tableName) => (
        <div key={tableName} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h2>{tableName}</h2>
          {data[tableName].length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {Object.keys(data[tableName][0]).map((columnName) => (
                    <th
                      key={columnName}
                      style={{
                        padding: '8px',
                        borderBottom: '1px solid #ddd',
                        textAlign: 'left',
                      }}
                    >
                      {columnName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data[tableName].map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, index) => (
                      <td
                        key={index}
                        style={{
                          padding: '8px',
                          borderBottom: '1px solid #ddd',
                          textAlign: 'left',
                        }}
                      >
                        {value === null ? 'NULL' : value.toString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No data in this table.</p>
          )}
        </div>
      ))}
    </>
  );
}