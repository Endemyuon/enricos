'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { ReactNode } from 'react';

interface ReCaptchaWrapperProps {
  children: ReactNode;
}

export function ReCaptchaWrapper({ children }: ReCaptchaWrapperProps) {
  const reCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_KEY;

  // If no key is configured, still render children but log a warning
  if (!reCaptchaKey) {
    console.warn(
      'reCAPTCHA key not configured. Add NEXT_PUBLIC_RECAPTCHA_KEY to your .env.local file. ' +
      'Get keys from: https://www.google.com/recaptcha/admin'
    );
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey} useEnterprise={false}>
      {children}
    </GoogleReCaptchaProvider>
  );
}
