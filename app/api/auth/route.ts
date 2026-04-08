import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import bcrypt from 'bcryptjs';
import { getAccountsDatabase } from '@/lib/db';

const db = getAccountsDatabase();
const ADMIN_EMAILS = ['admin@example.com', 'enricocatolico03@gmail.com'];
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, ...data } = body;

    console.log('=== AUTH API ===', action, email);

    if (action === 'checkEmail') {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      return NextResponse.json({ exists: !!user });
    }

    if (action === 'register') {
      const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = 'user_' + Date.now();
        const now = new Date().toISOString();
        
        db.prepare('INSERT INTO users (id, email, password, firstName, lastName, role, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
          userId, email, hashedPassword, data.firstName || '', data.lastName || '', 'customer', now
        );
        
        db.prepare('INSERT INTO customers (id, name, email, points, joinDate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
          userId, `${data.firstName} ${data.lastName}`, email, 0, now.split('T')[0], now, now
        );

        return NextResponse.json({ 
          success: true, 
          user: { email, role: 'customer', id: userId }, 
          customer: { id: userId, name: `${data.firstName} ${data.lastName}`, email, points: 0 } 
        });
      } catch (e) {
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
      }
    }

    if (action === 'login') {
      const isAdmin = ADMIN_EMAILS.includes(email);
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

      if (isAdmin) {
        if (user?.password) {
          if (await bcrypt.compare(password, user.password)) {
            console.log('✅ Admin password verified');
            return NextResponse.json({ success: true, user: { email, role: 'admin', id: 'admin' } });
          }
          return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }
        if (password.length >= 6) {
          console.log('✅ Admin whitelist login');
          return NextResponse.json({ success: true, user: { email, role: 'admin', id: 'admin' } });
        }
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }

      if (!user) {
        if (password.length >= 6) {
          try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = 'user_' + Date.now();
            const now = new Date().toISOString();
            
            db.prepare('INSERT INTO users (id, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?)').run(
              userId, email, hashedPassword, 'customer', now
            );
            
            db.prepare('INSERT INTO customers (id, name, email, points, joinDate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
              userId, email.split('@')[0], email, 0, now.split('T')[0], now, now
            );
            
            return NextResponse.json({ 
              success: true, 
              user: { email, role: 'customer', id: userId }, 
              customer: { id: userId, name: email.split('@')[0], email, points: 0 } 
            });
          } catch (e) {
            return NextResponse.json({ error: 'Login failed' }, { status: 500 });
          }
        }
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      if (await bcrypt.compare(password, user.password)) {
        console.log('✅ Customer login');
        return NextResponse.json({ 
          success: true, 
          user: { email, role: user.role, id: user.id }, 
          customer: { id: user.id, email, name: email.split('@')[0], points: 0 } 
        });
      }

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
