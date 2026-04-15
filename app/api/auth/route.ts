import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAccountsDatabase } from '@/lib/db';

const db = getAccountsDatabase();
const ADMIN_EMAILS = ['admin@enricos.shop', 'enricocatolico03@gmail.com'];

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
        const fullName = `${data.firstName} ${data.lastName}`.trim();
        
        // Create unverified user
        db.prepare('INSERT INTO users (id, email, password, firstName, lastName, role, emailVerified, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
          userId, email, hashedPassword, data.firstName || '', data.lastName || '', 'customer', 0, now
        );
        
        // Create customer record
        db.prepare('INSERT INTO customers (id, name, email, points, joinDate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
          userId, fullName, email, 0, now.split('T')[0], now, now
        );

        return NextResponse.json({ 
          success: true, 
          requiresVerification: true,
          user: { email, role: 'customer', id: userId, name: fullName, emailVerified: false }, 
          customer: { id: userId, name: fullName, email, points: 0 },
          message: 'Registration successful. Please check your email to verify your account.' 
        });
      } catch (e) {
        console.error('Registration error:', e);
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
            const defaultName = email.split('@')[0];
            
            db.prepare('INSERT INTO users (id, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?)').run(
              userId, email, hashedPassword, 'customer', now
            );
            
            db.prepare('INSERT INTO customers (id, name, email, points, joinDate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
              userId, defaultName, email, 0, now.split('T')[0], now, now
            );
            
            return NextResponse.json({ 
              success: true, 
              user: { email, role: 'customer', id: userId, name: defaultName }, 
              customer: { id: userId, name: defaultName, email, points: 0 } 
            });
          } catch (e) {
            return NextResponse.json({ error: 'Login failed' }, { status: 500 });
          }
        }
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      if (await bcrypt.compare(password, user.password)) {
        console.log('✅ Customer login');
        
        // Check if email is verified
        if (!user.emailVerified) {
          return NextResponse.json({ 
            error: 'Email not verified', 
            requiresVerification: true,
            email: user.email
          }, { status: 403 });
        }
        
        // Get customer data to fetch the full name
        const customer = db.prepare('SELECT name FROM customers WHERE email = ?').get(email) as any;
        const fullName = customer?.name || `${user.firstName} ${user.lastName}`.trim() || email.split('@')[0];
        
        return NextResponse.json({ 
          success: true, 
          user: { email, role: user.role, id: user.id, name: fullName }, 
          customer: { id: user.id, email, name: fullName, points: 0 } 
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
