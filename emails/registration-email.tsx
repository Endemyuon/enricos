import React from 'react';

interface RegistrationEmailProps {
  userName: string;
  userEmail: string;
}

export const RegistrationEmail = ({ userName, userEmail }: RegistrationEmailProps) => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {/* Header with Red Background */}
        <div style={{ backgroundColor: '#dc2626', padding: '30px 20px', textAlign: 'center' }}>
          <h1 style={{ color: '#ffffff', margin: '0', fontSize: '28px' }}>Welcome to Enrico's Rewards!</h1>
        </div>

        {/* Content */}
        <div style={{ padding: '30px 20px' }}>
          <h2 style={{ color: '#1f2937', marginTop: '0' }}>Hi {userName},</h2>
          
          <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.6' }}>
            Thank you for registering with <strong>Enrico's Restaurant</strong>! We're excited to have you join our loyalty rewards program.
          </p>

          <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '20px', marginTop: '20px', marginBottom: '20px' }}>
            <h3 style={{ color: '#dc2626', marginTop: '0', marginBottom: '10px' }}>Your Account Details</h3>
            <p style={{ color: '#4b5563', margin: '5px 0' }}>
              <strong>Email:</strong> {userEmail}
            </p>
            <p style={{ color: '#4b5563', margin: '5px 0' }}>
              <strong>Status:</strong> <span style={{ color: '#10b981' }}>✓ Verified</span>
            </p>
          </div>

          <h3 style={{ color: '#1f2937', marginTop: '30px' }}>What You Can Do Now:</h3>
          <ul style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.8' }}>
            <li>Log in to your account and start earning points</li>
            <li>Earn 1 point for every 600 pesos spent</li>
            <li>Unlock exclusive rewards and perks</li>
            <li>Enjoy special birthday discounts</li>
            <li>Register your RFID card for seamless transactions</li>
          </ul>

          <div style={{ marginTop: '30px', paddingTop: '25px', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              If you have any questions, feel free to contact us at:
            </p>
            <p style={{ color: '#1f2937', fontSize: '16px', marginBottom: '5px' }}>
              📞 <strong>0977 372 8945</strong>
            </p>
            <p style={{ color: '#1f2937', fontSize: '16px' }}>
              📍 <strong>62 A Bonifacio Ave, Barangka Marikina</strong>
            </p>
          </div>

          <div style={{ marginTop: '30px', textAlign: 'center', padding: '20px', backgroundColor: '#fef2f2', borderRadius: '6px', borderLeft: '4px solid #dc2626' }}>
            <p style={{ color: '#1f2937', margin: '0', fontWeight: 'bold' }}>
              🎁 Start Earning Rewards Today!
            </p>
            <p style={{ color: '#4b5563', fontSize: '14px', margin: '8px 0 0 0' }}>
              "It's All About Food!"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: '#1f2937', color: '#9ca3af', padding: '20px', textAlign: 'center', fontSize: '12px' }}>
          <p style={{ margin: '0 0 8px 0' }}>
            © 2026 Enrico's Restaurant - All Rights Reserved
          </p>
          <p style={{ margin: '0' }}>
            62 A Bonifacio Ave, Barangka Marikina, Metro Manila
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationEmail;
