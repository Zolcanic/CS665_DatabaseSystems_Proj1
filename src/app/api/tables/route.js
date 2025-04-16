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
    for (const tableName of tableNames) {
      const tableRows = await db.all(`SELECT * FROM ${tableName}`);
      tableData[tableName] = tableRows;
    }

    return NextResponse.json({ data: tableData });
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
