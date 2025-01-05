import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { boardId, url, description, deadline } = await request.json();
    const result = await pool.query(
      'INSERT INTO links (board_id, url, description, deadline) VALUES ($1, $2, $3, $4) RETURNING *',
      [boardId, url, description, deadline]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

