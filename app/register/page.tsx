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
    agreeToTerms: false,
    agreeToPrivacy: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');
  const [termsExpanded, setTermsExpanded] = useState(false);
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

      if (!formData.agreeToTerms) {
        setError('You must agree to the Terms & Conditions');
        setLoading(false);
        return;
      }

      if (!formData.agreeToPrivacy) {
        setError('You must agree to the Privacy Policy');
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
        setSuccessEmail(formData.email);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);
        
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-600 p-4 flex flex-col items-center justify-center relative overflow-hidden">
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
      <div className="w-full max-w-md relative z-10">
        {/* Registration Form */}
        {!successEmail && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8" style={{ animation: 'fadeInScale 900ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <Image
                  src="/enricos.png"
                  alt="Enrico's Logo"
                  width={100}
                  height={100}
                  className="rounded-lg"
                />
              </div>
              <h1 className="text-slate-900 text-2xl font-bold">Welcome to Enrico's!</h1>
            </div>

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-full focus:outline-none focus:border-red-600 focus:shadow-lg focus:scale-105 bg-slate-50 text-slate-900 placeholder-slate-400 transition-all duration-500"
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
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-full focus:outline-none focus:border-red-600 focus:shadow-lg focus:scale-105 bg-slate-50 text-slate-900 placeholder-slate-400 transition-all duration-500"
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
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-full focus:outline-none focus:border-red-600 focus:shadow-lg focus:scale-105 bg-slate-50 text-slate-900 placeholder-slate-400 transition-all duration-500"
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
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-full focus:outline-none focus:border-red-600 focus:shadow-lg focus:scale-105 bg-slate-50 text-slate-900 placeholder-slate-400 transition-all duration-500 pr-12"
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
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-full focus:outline-none focus:border-red-600 focus:shadow-lg focus:scale-105 bg-slate-50 text-slate-900 placeholder-slate-400 transition-all duration-500"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                  placeholder="RFID Card (Optional)"
                />
              </div>

              {/* Terms and Conditions Section */}
              <div className="mt-6 border-2 border-slate-200 rounded-2xl overflow-hidden ">
                <button
                  type="button"
                  onClick={() => setTermsExpanded(!termsExpanded)}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 hover:shadow-md transition-all duration-600 flex items-center justify-between text-slate-900 font-semibold"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                >
                  <span>Enrico's Loyalty Program Terms & Conditions</span>
                  <div style={{ transition: 'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1)', transform: termsExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    {termsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {termsExpanded && (
                  <div className="px-4 py-4 bg-white border-t border-slate-200 max-h-64 overflow-y-auto text-sm text-slate-700" style={{ animation: 'slideDown 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
                    <div className="space-y-3 text-xs leading-relaxed">
                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">1. Loyalty Program Membership</h3>
                        <p>By registering for an Enrico's loyalty account, you acknowledge your agreement to join our exclusive loyalty program. Membership is free and open to all customers 18 years or older.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">2. Points and Rewards</h3>
                        <p>Members earn loyalty points on every purchase. Points are calculated at 1 point per dollar spent. Accumulated points can be redeemed for discounts, free items, and exclusive offers. Points do not expire as long as your account remains active.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">3. RFID Card Registration</h3>
                        <p>Optional RFID card registration allows seamless point accumulation at checkout. Enrico's is not responsible for lost or damaged cards. Duplicate cards may be issued for a small fee.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">4. Account Responsibilities</h3>
                        <p>You are responsible for maintaining the confidentiality of your account password. Enrico's is not liable for unauthorized access. Please notify us immediately of any suspicious activity.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">5. Member Benefits</h3>
                        <p>Members receive exclusive promotions, early access to new menu items, birthday rewards, and special event invitations. Benefits are subject to change at Enrico's discretion.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">6. Eligibility and Restrictions</h3>
                        <p>Points cannot be transferred or shared. Accounts with fraudulent activity will be terminated without refund of accumulated points. Enrico's reserves the right to modify or discontinue the program.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">7. Data Privacy</h3>
                        <p>Your personal information will be used exclusively for loyalty program administration, marketing communications, and service improvements. We comply with all applicable data protection regulations.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">8. Termination</h3>
                        <p>Enrico's reserves the right to terminate any account that violates these terms or engages in fraudulent behavior. Upon termination, all accumulated points are forfeited.</p>
                      </div>
                    </div>
                  </div>
                )}
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

              {/* Terms & Conditions Checkbox */}
              <div className="flex items-center gap-3 py-3 px-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-red-300 transition-all duration-300">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="w-5 h-5 border-2 border-slate-300 rounded accent-red-600 cursor-pointer flex-shrink-0"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-slate-900 font-medium cursor-pointer flex-1">
                  I agree to Enrico's{' '}
                  <Link href="/terms" className="text-red-600 hover:underline font-bold" target="_blank">
                    Terms & Conditions
                  </Link>
                </label>
              </div>

              {/* Privacy Policy Checkbox */}
              <div className="flex items-center gap-3 py-3 px-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-red-300 transition-all duration-300">
                <input
                  type="checkbox"
                  name="agreeToPrivacy"
                  id="agreeToPrivacy"
                  checked={formData.agreeToPrivacy}
                  onChange={handleChange}
                  className="w-5 h-5 border-2 border-slate-300 rounded accent-red-600 cursor-pointer flex-shrink-0"
                />
                <label htmlFor="agreeToPrivacy" className="text-sm text-slate-900 font-medium cursor-pointer flex-1">
                  I agree to Enrico's{' '}
                  <Link href="/privacy" className="text-red-600 hover:underline font-bold" target="_blank">
                    Privacy Policy
                  </Link>
                  {' '}and consent to data processing for loyalty program administration
                </label>
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
                className="w-full bg-red-600 text-white font-bold py-3 rounded-full hover:bg-red-700 hover:scale-105 hover:shadow-xl transition-all duration-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-95 mt-6"
                style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Bottom Links */}
            <div className="mt-8 space-y-3">
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
