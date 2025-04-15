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
    const rows = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames = rows.map(row => row.name);

    // Filter out SQLite system tables if needed
    const userTables = tableNames.filter(name => !name.startsWith('sqlite_'));

    return NextResponse.json({ tables: userTables });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  } finally {
    if (db) {
      await db.close();
    }
  }
}