'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header with Logo */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mb-6 font-semibold">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center mb-6">
            <Image
              src="/enricos.png"
              alt="Enrico's Logo"
              width={80}
              height={80}
              className="rounded-lg"
            />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-2">
            Enrico's Loyalty Program
          </h1>
          <h2 className="text-xl text-red-600 text-center font-semibold">Terms & Conditions</h2>
          <p className="text-center text-sm text-slate-500 mt-4">Effective Date: January 1, 2024</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* Jurisdiction Notice */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <p className="text-sm text-blue-900">
              <strong>Jurisdiction:</strong> These Terms & Conditions are governed by the laws of the Republic of the Philippines, 
              including but not limited to the Data Privacy Act of 2012 (RA 10173) and other applicable Philippine laws.
            </p>
          </div>

          {/* Section 1 */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">1. Loyalty Program Membership</h3>
            <p className="text-slate-700 leading-relaxed">
              By registering for an Enrico's loyalty account, you acknowledge your agreement to join our exclusive loyalty program. 
              Membership is free and open to all customers 18 years or older residing in the Philippines or legally authorized to conduct 
              transactions in the Philippines. Your membership is personal and non-transferable.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">2. Points and Rewards</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Members earn loyalty points on every purchase at Enrico's establishments. Points are calculated at a rate of 1 point per 
              Philippine Peso (₱1) spent. Terms may vary for promotional offers as announced. Accumulated points can be redeemed for discounts, 
              free items, and exclusive offers as listed in our rewards catalog.
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>Point Validity:</strong> Points do not expire as long as your account remains active. An account is deemed inactive 
              if no transactions or account access occur for a period of 24 months. Enrico's reserves the right to deactivate inactive accounts, 
              at which point accumulated points may be forfeited.
            </p>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">3. RFID Card Registration</h3>
            <p className="text-slate-700 leading-relaxed">
              Optional RFID card registration enables seamless point accumulation during transactions. Enrico's is not responsible for lost, 
              stolen, or damaged RFID cards. Replacement cards may be requested in-store with proper identification. A nominal processing fee 
              may apply for duplicate or replacement cards. The RFID card remains property of Enrico's and must be surrendered upon request.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">4. Account Responsibilities</h3>
            <p className="text-slate-700 leading-relaxed">
              You are responsible for maintaining the strict confidentiality of your account password and PIN (if applicable). 
              Enrico's is not liable for unauthorized access to your account or any losses arising from unauthorized transactions. 
              You agree to notify Enrico's immediately of any unauthorized activity or security breaches at our customer service hotline 
              or through our website.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">5. Member Benefits</h3>
            <p className="text-slate-700 leading-relaxed">
              Members receive exclusive promotions, early access to new menu items, birthday rewards, special event invitations, and 
              personalized offers. Additional benefits may be announced periodically. All benefits are subject to change, modification, 
              or discontinuation at Enrico's sole discretion with reasonable notice.
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">6. Eligibility and Restrictions</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>Points cannot be transferred, traded, or shared between accounts</li>
              <li>Points have no monetary value and cannot be exchanged for cash</li>
              <li>Accounts engaged in fraudulent activity will be terminated without warning</li>
              <li>Upon account termination, all accumulated points are forfeited and cannot be recovered</li>
              <li>Enrico's reserves the right to modify, suspend, or terminate the loyalty program at any time</li>
            </ul>
          </div>

          {/* Section 7 */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">7. Data Privacy Compliance</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Your personal information will be used exclusively for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
              <li>Loyalty program administration and point tracking</li>
              <li>Marketing communications and promotional offers</li>
              <li>Service improvements and customer experience enhancement</li>
              <li>Compliance with legal and regulatory requirements</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              Enrico's fully complies with the Data Privacy Act of 2012 (RA 10173) and respects your rights as a data subject. 
              Your data will not be shared with third parties without your explicit consent, except as required by law.
            </p>
          </div>

          {/* Section 8 */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">8. Limitation of Liability</h3>
            <p className="text-slate-700 leading-relaxed">
              Enrico's shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use 
              of the loyalty program or inability to access the program. This includes but is not limited to loss of points, business 
              interruption, or data loss.
            </p>
          </div>

          {/* Section 9 */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">9. Termination</h3>
            <p className="text-slate-700 leading-relaxed">
              Enrico's reserves the right to terminate or suspend any account that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 mt-3">
              <li>Violates these terms and conditions</li>
              <li>Engages in fraudulent or illegal behavior</li>
              <li>Remains inactive for more than 24 consecutive months</li>
              <li>Is found to have unauthorized access</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mt-4">
              Upon termination, all accumulated points are immediately forfeited and cannot be recovered.
            </p>
          </div>

          {/* Section 10 */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">10. Amendments and Changes</h3>
            <p className="text-slate-700 leading-relaxed">
              Enrico's reserves the right to modify, amend, or supplement these Terms & Conditions at any time. Significant changes will be 
              communicated to members via email or through our website. Continued use of the loyalty program following any changes constitutes 
              your acceptance of the revised terms.
            </p>
          </div>

          {/* Section 11 */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">11. Dispute Resolution</h3>
            <p className="text-slate-700 leading-relaxed">
              Any disputes arising from these Terms & Conditions shall be settled amicably through negotiation. If negotiation fails, 
              disputes may be escalated to the appropriate Philippine regulatory bodies or courts as applicable.
            </p>
          </div>

          {/* Section 12 */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">12. Contact Us</h3>
            <p className="text-slate-700 leading-relaxed">
              For questions or concerns regarding these Terms & Conditions, please contact our customer service team at:
            </p>
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <p className="text-slate-700"><strong>Enrico's Customer Service</strong></p>
              <p className="text-slate-600">Email: support@enricos.ph</p>
              <p className="text-slate-600">Hours: Monday - Sunday, 10:00 AM - 8:00 PM</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/register" className="inline-block bg-red-600 text-white font-bold py-3 px-8 rounded-full hover:bg-red-700 transition-colors">
            Agree and Register
          </Link>
        </div>
      </div>
    </div>
  );
}
