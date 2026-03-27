import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { getUserByEmail, createUser, createCustomer, getCustomerByEmail } from '@/lib/db';
import { Resend } from 'resend';
import RegistrationEmail from '@/emails/registration-email';

const ADMIN_EMAILS = ['admin@example.com', 'enricocatolico03@gmail.com'];
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, ...data } = body;

    console.log('=== AUTH API CALL ===');
    console.log('Action:', action);
    console.log('Email:', email);
    console.log('Password length:', password?.length);

    if (action === 'register') {
      // Check if user already exists
      const existingUser = getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      }

      // Create user
      const userId = Date.now().toString();
      const user = createUser(userId, email, password, 'customer');

      // Create customer profile
      const customer = createCustomer({
        id: userId,
        name: `${data.firstName} ${data.lastName}`,
        email: email,
        phone: '',
        rfidCard: data.rfidCard || undefined,
        points: 0,
        joinDate: new Date().toISOString().split('T')[0],
      });

      // Send registration email
      try {
        console.log('🔍 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
        console.log('🔍 API Key value (first 10 chars):', process.env.RESEND_API_KEY?.substring(0, 10));
        
        if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key_here') {
          console.log('\n========== 📧 EMAIL SENDING ==========');
          console.log('📧 Recipient:', email);
          console.log('👤 User Name:', `${data.firstName} ${data.lastName}`);
          console.log('🔑 API Key Length:', process.env.RESEND_API_KEY.length);
          console.log('📤 Attempting to send email via Resend...');
          
          const response = await resend.emails.send({
            from: 'Enrico\'s Rewards <onboarding@resend.dev>',
            to: email,
            subject: 'Welcome to Enrico\'s Rewards! Your Account is Verified',
            html: `
              <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <div style="background-color: #dc2626; padding: 30px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to Enrico's Rewards!</h1>
                  </div>
                  <div style="padding: 30px 20px;">
                    <h2 style="color: #1f2937; margin-top: 0;">Hi ${data.firstName},</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Thank you for registering with <strong>Enrico's Restaurant</strong>! We're excited to have you join our loyalty rewards program.
                    </p>
                    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-top: 20px; margin-bottom: 20px;">
                      <h3 style="color: #dc2626; margin-top: 0;">Your Account Details</h3>
                      <p style="color: #4b5563; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                      <p style="color: #4b5563; margin: 5px 0;"><strong>Status:</strong> <span style="color: #10b981;">✓ Verified</span></p>
                    </div>
                    <h3 style="color: #1f2937;">What You Can Do Now:</h3>
                    <ul style="color: #4b5563; font-size: 15px; line-height: 1.8;">
                      <li>Log in to your account and start earning points</li>
                      <li>Earn 1 point for every 600 pesos spent</li>
                      <li>Unlock exclusive rewards and perks</li>
                      <li>Enjoy special birthday discounts</li>
                    </ul>
                    <div style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
                      <p style="color: #6b7280; font-size: 14px;">
                        If you have any questions, feel free to contact us at:
                      </p>
                      <p style="color: #1f2937; font-size: 16px; margin-bottom: 5px;">
                        📞 <strong>0977 372 8945</strong>
                      </p>
                    </div>
                  </div>
                  <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
                    <p style="margin: 0 0 8px 0;">
                      © 2026 Enrico's Restaurant - All Rights Reserved
                    </p>
                  </div>
                </div>
              </div>
            `,
          });
          
          if (response.id) {
            console.log('✅ EMAIL SENT SUCCESSFULLY!');
            console.log('📨 Email ID:', response.id);
            console.log('🎯 Sent to:', email);
            console.log('⏰ Timestamp:', new Date().toISOString());
            console.log('====================================\n');
          } else {
            console.log('⚠️ Response received but no email ID');
            console.log('Response:', response);
          }
        } else {
          console.log('\n❌ EMAIL NOT SENT - API KEY ISSUE');
          console.log('⚠️ Resend API key not configured or invalid');
          console.log('⚠️ API Key exists:', !!process.env.RESEND_API_KEY);
          console.log('⚠️ API Key value:', process.env.RESEND_API_KEY ? '***hidden***' : 'NOT SET');
          console.log('====================================\n');
        }
      } catch (emailError) {
        console.error('\n❌ EMAIL SENDING FAILED!');
        console.error('📧 Recipient:', email);
        console.error('🔴 Error details:', emailError);
        if (emailError instanceof Error) {
          console.error('💬 Error message:', emailError.message);
          console.error('📋 Error name:', emailError.name);
        }
        console.error('====================================\n');
        // Don't fail registration if email fails - log but continue
      }

      return NextResponse.json({
        success: true,
        user: { email: user.email, role: user.role },
        customer,
        message: 'Welcome! A verification email has been sent to your inbox.',
      });
    }

    if (action === 'login') {
      const user = getUserByEmail(email);

      // Check if it's an admin email
      const isAdmin = ADMIN_EMAILS.includes(email);

      console.log('Admin emails list:', ADMIN_EMAILS);
      console.log('Is admin email?', isAdmin);

      if (isAdmin) {
        // Admin login - just verify password length for demo
        if (password.length >= 6) {
          console.log('✅ Admin login successful');
          return NextResponse.json({
            success: true,
            user: { email, role: 'admin' },
          });
        }
        console.log('❌ Admin login failed - invalid password');
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }

      // Customer login
      if (!user) {
        // Auto-create customer on first login with any valid email
        if (password.length >= 6) {
          const userId = Date.now().toString();
          const newUser = createUser(userId, email, password, 'customer');

          const customer = createCustomer({
            id: userId,
            name: email.split('@')[0],
            email: email,
            phone: '',
            points: 0,
            joinDate: new Date().toISOString().split('T')[0],
          });

          return NextResponse.json({
            success: true,
            user: { email: newUser.email, role: newUser.role, id: userId, name: customer.name },
            customer,
          });
        }
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      // Verify password (in production, use proper hashing)
      if (user.password === password) {
        const customer = getCustomerByEmail(email);
        return NextResponse.json({
          success: true,
          user: { 
            email: user.email, 
            role: user.role, 
            id: user.id,
            name: customer?.name || email.split('@')[0]
          },
          customer,
        });
      }

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
