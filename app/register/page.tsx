'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { RegistrationSuccessPopup } from '@/components/RegistrationSuccessPopup';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    rfidCard: '',
    agreeToTermsAndPrivacy: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState(0);
  const [userCaptchaAnswer, setUserCaptchaAnswer] = useState('');

  // Generate random CAPTCHA on component mount
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const answer = num1 + num2;
    setCaptchaQuestion(`${num1} + ${num2}`);
    setCaptchaAnswer(answer);
    setUserCaptchaAnswer('');
  };

  // Generate CAPTCHA on mount and reset
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Password strength validation
  const validatePasswordStrength = (pwd: string) => {
    let strength = 0;
    const checks = [];
    
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;
    
    if (pwd.length >= 12) strength++;

    if (strength === 0) return { level: 'Weak', color: 'text-red-600', bgColor: 'bg-red-200' };
    if (strength <= 2) return { level: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-200' };
    if (strength <= 3) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-200' };
    return { level: 'Strong', color: 'text-green-600', bgColor: 'bg-green-200' };
  };

  // Check if email already exists
  const checkEmailExists = async (email: string) => {
    if (!email) return;
    setEmailCheckLoading(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checkEmail',
          email,
        }),
      });
      const data = await response.json();
      if (data.exists) {
        setError('This email is already registered. Please use a different email or login.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking email:', error);
      return true;
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'password') {
      const strength = validatePasswordStrength(value);
      setPasswordStrength(strength.level);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEmailBlur = async () => {
    if (formData.email) {
      await checkEmailExists(formData.email);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation checks
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Stronger password validation
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        setLoading(false);
        return;
      }

      if (!/[A-Z]/.test(formData.password)) {
        setError('Password must contain at least one uppercase letter');
        setLoading(false);
        return;
      }

      if (!/[0-9]/.test(formData.password)) {
        setError('Password must contain at least one number');
        setLoading(false);
        return;
      }

      if (!/[!@#$%^&*]/.test(formData.password)) {
        setError('Password must contain at least one special character (!@#$%^&*)');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (!formData.agreeToTermsAndPrivacy) {
        setError('You must agree to the Terms & Conditions and Privacy Policy');
        setLoading(false);
        return;
      }

      // Verify CAPTCHA
      if (parseInt(userCaptchaAnswer) !== captchaAnswer) {
        setError('CAPTCHA answer is incorrect. Please try again.');
        generateCaptcha();
        setLoading(false);
        return;
      }

      // Check email one more time before registration
      const emailExists = await checkEmailExists(formData.email);
      if (!emailExists) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          rfidCard: formData.rfidCard || null,
          agreeToTerms: formData.agreeToTerms,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Registration failed');
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success) {
        // Send verification email
        try {
          const verifyResponse = await fetch('/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'sendVerificationEmail',
              email: formData.email,
              userName: `${formData.firstName} ${formData.lastName}`,
            }),
          });

          console.log('Verification email sent:', verifyResponse.ok);
        } catch (error) {
          console.error('Error sending verification email:', error);
        }

        // Store info for verify-email page
        localStorage.setItem('registrationEmail', formData.email);
        localStorage.setItem('registrationName', `${formData.firstName} ${formData.lastName}`);
        
        setSuccessEmail(formData.email);
        
        // Redirect to email verification page after 2 seconds
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-600 p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Interactive Background Elements */}
      <style>{`
        @keyframes smoothPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        @keyframes smoothBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
      `}</style>
      <div className="absolute top-10 right-10 w-32 h-32 bg-red-500 rounded-full opacity-30" style={{ animation: 'smoothPulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-red-500 rounded-full opacity-25" style={{ animation: 'smoothBounce 5s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '0.5s' }}></div>
      <div className="absolute top-1/3 left-5 w-24 h-24 bg-white/10 rounded-full opacity-20" style={{ animation: 'smoothPulse 4.5s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '0.3s' }}></div>
      <div className="absolute bottom-10 right-1/4 w-28 h-28 bg-red-700 rounded-full opacity-20" style={{ animation: 'smoothBounce 6s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '1s' }}></div>

      {/* Popup Notification */}
      {successEmail && (
        <RegistrationSuccessPopup email={successEmail} firstName={formData.firstName} />
      )}

      {/* Content */}
      <div className="w-full max-w-md relative z-10 px-2 sm:px-0">
        {/* Registration Form */}
        {!successEmail && (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden p-4 sm:p-6 md:p-8" style={{ animation: 'fadeInScale 900ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            {/* Logo */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex justify-center mb-4 sm:mb-6">
                <Image
                  src="/enricos.png"
                  alt="Enrico's Logo"
                  width={80}
                  height={80}
                  className="rounded-lg sm:w-[100px] sm:h-[100px]"
                />
              </div>
              <h1 className="text-slate-900 text-xl sm:text-2xl md:text-3xl font-bold">Welcome to Enrico's!</h1>
            </div>

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-200 rounded-full focus:outline-none focus:border-red-600 focus:shadow-lg focus:scale-105 bg-slate-50 text-slate-900 placeholder-slate-400 transition-all duration-500 text-sm sm:text-base"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-200 rounded-full focus:outline-none focus:border-red-600 focus:shadow-lg focus:scale-105 bg-slate-50 text-slate-900 placeholder-slate-400 transition-all duration-500 text-sm sm:text-base"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-200 rounded-full focus:outline-none focus:border-red-600 focus:shadow-lg focus:scale-105 bg-slate-50 text-slate-900 placeholder-slate-400 transition-all duration-500 text-sm sm:text-base"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                  placeholder="Enter your email"
                />
                {emailCheckLoading && <p className="text-xs text-slate-500 mt-2">Checking email...</p>}
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-200 rounded-full focus:outline-none focus:border-red-600 focus:shadow-lg focus:scale-105 bg-slate-50 text-slate-900 placeholder-slate-400 transition-all duration-500 pr-12 text-sm sm:text-base"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-xs mb-2">
                      <span className="text-slate-600">Strength:</span>
                      <span className={`${validatePasswordStrength(formData.password).color} font-bold`}>
                        {passwordStrength}
                      </span>
                    </div>
                    <div className="bg-slate-200 rounded-full h-2 w-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${validatePasswordStrength(formData.password).bgColor}`}
                        style={{
                          width: passwordStrength === 'Weak' ? '25%' : passwordStrength === 'Fair' ? '50%' : passwordStrength === 'Good' ? '75%' : '100%'
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      • At least 8 characters
                      <br />
                      • One uppercase letter
                      <br />
                      • One number
                      <br />
                      • One special character (!@#$%^&*)
                    </p>
                  </div>
                )}
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-full focus:outline-none focus:border-red-600 focus:shadow-lg focus:scale-105 bg-slate-50 text-slate-900 placeholder-slate-400 transition-all duration-500 pr-12"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.password && formData.confirmPassword && (
                  <p className={`text-xs mt-2 ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  name="rfidCard"
                  value={formData.rfidCard}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-200 rounded-full focus:outline-none focus:border-red-600 focus:shadow-lg focus:scale-105 bg-slate-50 text-slate-900 placeholder-slate-400 transition-all duration-500 text-sm sm:text-base"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                  placeholder="RFID Card (Optional)"
                />
              </div>

              <style>{`
                @keyframes slideDown {
                  from { 
                    opacity: 0; 
                    max-height: 0;
                    transform: scaleY(0.95);
                  }
                  to { 
                    opacity: 1; 
                    max-height: 500px;
                    transform: scaleY(1);
                  }
                }
                @keyframes slideUp {
                  from { 
                    opacity: 1; 
                    max-height: 500px;
                    transform: scaleY(1);
                  }
                  to { 
                    opacity: 0; 
                    max-height: 0;
                    transform: scaleY(0.95);
                  }
                }
                @keyframes fadeInScale {
                  from { opacity: 0; transform: scale(0.95); }
                  to { opacity: 1; transform: scale(1); }
                }
              `}</style>

              {/* Combined Terms & Conditions and Privacy Policy Checkbox */}
              <div className="space-y-3">
                {/* Philippine Law Notice */}
                <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded text-xs text-blue-900">
                  <p className="font-semibold mb-1">Philippines Data Privacy Notice</p>
                  <p>This registration complies with the Data Privacy Act of 2012 (RA 10173) and Philippine personal data protection regulations.</p>
                </div>

                {/* Combined Checkbox */}
                <div className="flex items-start gap-3 py-4 px-4 bg-slate-50 rounded-lg border-2 border-slate-200 hover:border-red-300 transition-all duration-300">
                  <input
                    type="checkbox"
                    name="agreeToTermsAndPrivacy"
                    id="agreeToTermsAndPrivacy"
                    checked={formData.agreeToTermsAndPrivacy}
                    onChange={handleChange}
                    className="w-5 h-5 border-2 border-slate-300 rounded accent-red-600 cursor-pointer flex-shrink-0 mt-1"
                  />
                  <label htmlFor="agreeToTermsAndPrivacy" className="text-sm text-slate-900 cursor-pointer flex-1 leading-relaxed">
                    I agree to Enrico's{' '}
                    <Link href="/policies" className="text-red-600 hover:text-red-700 hover:underline font-bold transition-colors" target="_blank" rel="noopener noreferrer">
                      Terms & Conditions and Privacy Policy
                    </Link>
                    , including consent to data processing for loyalty program administration and marketing communications.
                  </label>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-200 font-medium transition-all duration-500" style={{ animation: 'fadeInScale 500ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                  {error}
                </div>
              )}

              {/* Simple Math CAPTCHA - Redesigned */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-2xl border-2 border-red-300 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-red-600 text-white font-bold text-sm">
                    ✓
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-red-900 mb-1">Security Verification</h3>
                    <p className="text-xs text-red-700">Please solve this math problem to complete registration</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 mb-4 border-2 border-red-200 min-h-24 flex flex-col items-center justify-center">
                  <p className="text-center text-3xl font-extrabold text-red-600 mb-1">{captchaQuestion}</p>
                  <p className="text-center text-xs text-slate-500 font-medium">What is the answer?</p>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={userCaptchaAnswer}
                    onChange={(e) => setUserCaptchaAnswer(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200 bg-white text-center text-2xl font-bold text-red-600 placeholder-slate-400 transition-all duration-300"
                    placeholder="0"
                    inputMode="numeric"
                    maxLength={3}
                  />

                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="w-full bg-white text-red-600 font-semibold py-3 px-4 rounded-lg border-2 border-red-300 hover:bg-red-50 hover:border-red-600 transition-all duration-300 text-sm"
                  >
                    Get new question
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white font-bold py-2 sm:py-3 rounded-full hover:bg-red-700 hover:scale-105 hover:shadow-xl transition-all duration-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-95 mt-4 sm:mt-6 text-sm sm:text-base"
                style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Bottom Links */}
            <div className="mt-6 sm:mt-8 space-y-2 sm:space-y-3">
              {/* Login Button */}
              <Link href="/login" className="w-full block">
                <button className="w-full bg-white text-red-600 font-bold py-3 rounded-full border-2 border-red-600 hover:bg-red-50 hover:scale-105 hover:shadow-xl transition-all duration-500 shadow-lg" style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                  Sign In
                </button>
              </Link>

              {/* Home Button */}
              <Link href="/" className="w-full block">
                <button className="w-full bg-white text-red-600 font-bold py-3 rounded-full border-2 border-red-600 hover:bg-red-50 hover:scale-105 hover:shadow-xl transition-all duration-500 shadow-lg" style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                  Back to Home
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
