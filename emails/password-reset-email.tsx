import React from 'react';

interface PasswordResetEmailProps {
  userName: string;
  resetLink: string;
}

export const PasswordResetEmail = ({ userName, resetLink }: PasswordResetEmailProps) => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {/* Header with Red Background */}
        <div style={{ backgroundColor: '#dc2626', padding: '30px 20px', textAlign: 'center' }}>
          <h1 style={{ color: '#ffffff', margin: '0', fontSize: '28px' }}>Reset Your Password</h1>
        </div>

        {/* Content */}
        <div style={{ padding: '30px 20px' }}>
          <h2 style={{ color: '#1f2937', marginTop: '0' }}>Hi {userName},</h2>
          
          <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.6' }}>
            We received a request to reset your password for your <strong>Enrico's Restaurant</strong> account. Click the button below to create a new password.
          </p>

          <div style={{ marginTop: '30px', marginBottom: '30px', textAlign: 'center' }}>
            <a
              href={resetLink}
              style={{
                display: 'inline-block',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '14px 32px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'background-color 0.3s ease',
              }}
            >
              Reset Your Password
            </a>
          </div>

          <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
            Or copy and paste this link in your browser:
          </p>
          <p style={{ color: '#dc2626', fontSize: '12px', wordBreak: 'break-all', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '4px' }}>
            {resetLink}
          </p>

          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px', padding: '15px', marginTop: '25px', marginBottom: '25px' }}>
            <p style={{ color: '#b91c1c', fontSize: '14px', margin: '0' }}>
              ⏱️ <strong>This link will expire in 1 hour.</strong> If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </p>
          </div>

          <h3 style={{ color: '#1f2937' }}>For Your Security:</h3>
          <ul style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.8' }}>
            <li>Never share your password with anyone</li>
            <li>Use a strong password with letters, numbers, and symbols</li>
            <li>This link is only valid for 1 hour</li>
          </ul>

          <div style={{ marginTop: '30px', paddingTop: '25px', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              If you have any questions, feel free to contact us at:
            </p>
            <p style={{ color: '#1f2937', fontSize: '16px', marginBottom: '5px' }}>
              📞 <strong>0977 372 8945</strong>
            </p>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '15px', marginBottom: '0' }}>
              Best regards,<br />
              <strong>Enrico's Rewards Team</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
