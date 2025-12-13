import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, nickname } = await request.json();

    if (!email || !password || !nickname) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]) as any[];
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const existingCharacter = await query('SELECT id FROM characters WHERE nickname = ?', [nickname]) as any[];
    if (existingCharacter.length > 0) {
      return NextResponse.json({ error: 'Nickname already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const characterResult = await query(
      'INSERT INTO characters (nickname, completedStage, dexterity, intelligence, strength, level, exp) VALUES (?, 0, 5, 5, 5, 1, 0)',
      [nickname]
    ) as any;

    const characterId = characterResult.insertId;

    const userResult = await query(
      'INSERT INTO users (email, password, characterId) VALUES (?, ?, ?)',
      [email, hashedPassword, characterId]
    ) as any;

    const token = signToken({ userId: userResult.insertId, characterId });

    const response = NextResponse.json({
      message: 'Registration successful',
      user: { id: userResult.insertId, email, characterId, nickname }
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
