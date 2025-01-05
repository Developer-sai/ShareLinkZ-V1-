import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM boards');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, type, userId } = await request.json();
    const result = await pool.query(
      'INSERT INTO boards (name, description, type, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, type, userId]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

