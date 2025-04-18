// src/app/api/query/route.js

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

export async function POST(request) {
    let db;
    try {
        const { query } = await request.json();

        if (!query || typeof query !== 'string' || query.trim() === '') {
            return NextResponse.json({ error: 'Invalid or empty query provided' }, { status: 400 });
        }

        db = await getDatabaseConnection();
        const rows = await db.all(query);

        return NextResponse.json({ data: rows });

    } catch (error) {
        console.error('Database query error:', error);
        return NextResponse.json({ message: error.message || 'Failed to execute query' }, { status: 400 });
    } finally {
        if (db) {
            await db.close();
        }
    }
}