// src/app/api/tables/route.js

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { NextResponse } from 'next/server';
import path from 'path';

async function getDatabaseConnection() {
  const dbPath = path.resolve(process.cwd(), 'Lego.db');
  return await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

export async function GET() {
  let db;
  try {
    db = await getDatabaseConnection();
    const rows = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    const tableNames = rows.map(row => row.name);

    const tableData = {};
    const tableSchemas = {};

    for (const tableName of tableNames) {
      const tableRows = await db.all(`SELECT * FROM ${tableName}`);
      tableData[tableName] = tableRows;

      const schema = await db.all(`PRAGMA table_info(${tableName})`);
      tableSchemas[tableName] = schema;
    }

    return NextResponse.json({ data: tableData, schema: tableSchemas });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch table data' }, { status: 500 });
  } finally {
    if (db) {
      await db.close();
    }
  }
}

export async function POST(request) {
  const { table, data } = await request.json();

  if (!table || !data || typeof data !== 'object') {
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }

  let db;
  try {
    db = await getDatabaseConnection();

    const columns = Object.keys(data);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(data);

    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

    await db.run(sql, values);

    return NextResponse.json({ message: 'Entry created successfully' });
  } catch (error) {
    console.error('Database insert error:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  } finally {
    if (db) {
      await db.close();
    }
  }
}

export async function DELETE(request) {
  let db;
  try {
    const { table, conditions } = await request.json();

    if (!table || !conditions || typeof conditions !== 'object') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const keys = Object.keys(conditions).filter(key => conditions[key] !== '');
    if (keys.length === 0) {
      return NextResponse.json({ error: 'No conditions provided' }, { status: 400 });
    }

    const whereClause = keys.map(k => `${k} = ?`).join(' AND ');
    const values = keys.map(k => conditions[k]);

    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;

    db = await getDatabaseConnection();
    const result = await db.run(sql, values);

    return NextResponse.json({ message: 'Entry deleted successfully', changes: result.changes });
  } catch (error) {
    console.error('Database delete error:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  } finally {
    if (db) {
      await db.close();
    }
  }
}

export async function PUT(request) {
  let db;
  try {
    const { table, conditions, updates } = await request.json();

    if (!table || !conditions || typeof conditions !== 'object' || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const conditionKeys = Object.keys(conditions).filter(k => conditions[k] !== '');
    const updateKeys = Object.keys(updates).filter(k => updates[k] !== '');

    if (conditionKeys.length === 0 || updateKeys.length === 0) {
      return NextResponse.json({ error: 'Conditions and updates are required' }, { status: 400 });
    }

    const whereClause = conditionKeys.map(k => `${k} = ?`).join(' AND ');
    const setClause = updateKeys.map(k => `${k} = ?`).join(', ');

    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    const values = [...updateKeys.map(k => updates[k]), ...conditionKeys.map(k => conditions[k])];

    db = await getDatabaseConnection();
    const result = await db.run(sql, values);

    return NextResponse.json({ message: 'Entry updated successfully', changes: result.changes });
  } catch (error) {
    console.error('Database update error:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  } finally {
    if (db) {
      await db.close();
    }
  }
}
