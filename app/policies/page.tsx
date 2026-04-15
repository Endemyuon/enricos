'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header with Logo */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mb-4 sm:mb-6 font-semibold text-sm sm:text-base">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Image
              src="/enricos.png"
              alt="Enrico's Logo"
              width={80}
              height={80}
              className="rounded-lg w-16 sm:w-20 md:w-20 h-16 sm:h-20 md:h-20"
            />
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 text-center mb-2">
            Enrico's Loyalty Program
          </h1>
          <h2 className="text-lg sm:text-xl text-red-600 text-center font-semibold">Terms & Conditions and Privacy Policy</h2>
          <p className="text-center text-xs sm:text-sm text-slate-500 mt-3 sm:mt-4">Effective Date: January 1, 2024</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
          {/* Jurisdiction Notice */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-3 sm:p-4 rounded">
            <p className="text-xs sm:text-sm text-blue-900">
              <strong>Jurisdiction:</strong> These Terms & Conditions and Privacy Policy are governed by the laws of the Republic of the Philippines, 
              including the Data Privacy Act of 2012 (RA 10173) and other applicable Philippine laws.
            </p>
          </div>

          {/* TERMS & CONDITIONS SECTION */}
          <div className="border-t-2 border-slate-300 pt-6 sm:pt-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-6 sm:mb-8">Terms & Conditions</h2>

            {/* Section 1 */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">1. Loyalty Program Membership</h3>
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                By registering for an Enrico's loyalty account, you acknowledge your agreement to join our exclusive loyalty program. 
                Membership is free and open to all customers 18 years or older residing in the Philippines or legally authorized to conduct 
                transactions in the Philippines. Your membership is personal and non-transferable.
              </p>
            </div>

            {/* Section 2 */}
            <div className="mb-6">
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
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">3. RFID Card Registration</h3>
              <p className="text-slate-700 leading-relaxed">
                Optional RFID card registration enables seamless point accumulation during transactions. Enrico's is not responsible for lost, 
                stolen, or damaged RFID cards. Replacement cards may be requested in-store with proper identification. A nominal processing fee 
                may apply for duplicate or replacement cards. The RFID card remains property of Enrico's and must be surrendered upon request.
              </p>
            </div>

            {/* Section 4 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">4. Account Responsibilities</h3>
              <p className="text-slate-700 leading-relaxed">
                You are responsible for maintaining the strict confidentiality of your account password and PIN (if applicable). 
                Enrico's is not liable for unauthorized access to your account or any losses arising from unauthorized transactions. 
                You agree to notify Enrico's immediately of any unauthorized activity or security breaches at our customer service hotline 
                or through our website.
              </p>
            </div>

            {/* Section 5 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">5. Member Benefits</h3>
              <p className="text-slate-700 leading-relaxed">
                Members receive exclusive promotions, early access to new menu items, birthday rewards, special event invitations, and 
                personalized offers. Additional benefits may be announced periodically. All benefits are subject to change, modification, 
                or discontinuation at Enrico's sole discretion with reasonable notice.
              </p>
            </div>

            {/* Section 6 */}
            <div className="mb-6">
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
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">7. Limitation of Liability</h3>
              <p className="text-slate-700 leading-relaxed">
                Enrico's shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use 
                of the loyalty program or inability to access the program. This includes but is not limited to loss of points, business 
                interruption, or data loss.
              </p>
            </div>

            {/* Section 8 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">8. Termination</h3>
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

            {/* Section 9 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">9. Amendments and Changes</h3>
              <p className="text-slate-700 leading-relaxed">
                Enrico's reserves the right to modify, amend, or supplement these Terms & Conditions at any time. Significant changes will be 
                communicated to members via email or through our website. Continued use of the loyalty program following any changes constitutes 
                your acceptance of the revised terms.
              </p>
            </div>

            {/* Section 10 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">10. Dispute Resolution</h3>
              <p className="text-slate-700 leading-relaxed">
                Any disputes arising from these Terms & Conditions shall be settled amicably through negotiation. If negotiation fails, 
                disputes may be escalated to the appropriate Philippine regulatory bodies or courts as applicable.
              </p>
            </div>
          </div>

          {/* PRIVACY POLICY SECTION */}
          <div className="border-t-2 border-slate-300 pt-6 sm:pt-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-6 sm:mb-8">Privacy Policy</h2>

            {/* Section 1 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">1. Introduction</h3>
              <p className="text-slate-700 leading-relaxed">
                Enrico's (hereinafter "we," "us," "our," or "Company") respects your privacy and is committed to protecting your personal data. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information in compliance with the 
                Data Privacy Act of 2012 (RA 10173) and other applicable Philippine laws.
              </p>
            </div>

            {/* Section 2 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">2. Information We Collect</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We collect personal information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                <li><strong>Identity Information:</strong> First name, last name, date of birth</li>
                <li><strong>Contact Information:</strong> Email address, phone number, mailing address</li>
                <li><strong>Account Information:</strong> Username, password, RFID card number</li>
                <li><strong>Transaction Information:</strong> Purchase history, loyalty points balance, redemption records</li>
                <li><strong>Communication Preferences:</strong> Marketing opt-in/opt-out preferences, communication method preferences</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                We may also collect information automatically when you interact with our loyalty program, including IP addresses, 
                device information, and browsing behavior through cookies and similar tracking technologies.
              </p>
            </div>

            {/* Section 3 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">3. Purpose of Data Collection</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Your personal data is collected and processed for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Program administration and account management</li>
                <li>Point calculation, tracking, and redemption</li>
                <li>Provision of personalized loyalty benefits and rewards</li>
                <li>Marketing and promotional communications (with your consent)</li>
                <li>Customer service and support</li>
                <li>Fraud detection and prevention</li>
                <li>Compliance with legal and regulatory obligations</li>
                <li>Service improvement and data analytics</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">4. Legal Basis for Processing</h3>
              <p className="text-slate-700 leading-relaxed">
                We process your personal data based on:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mt-3">
                <li><strong>Contractual Necessity:</strong> To fulfill our obligations under the loyalty program agreement</li>
                <li><strong>Consent:</strong> Your explicit consent to marketing communications and data processing</li>
                <li><strong>Legal Compliance:</strong> To comply with Philippine laws and regulations</li>
                <li><strong>Legitimate Interest:</strong> To improve our services and prevent fraud</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">5. Data Sharing and Disclosure</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We do not share your personal data with third parties without your explicit consent, except:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>With service providers who assist in program operations (under strict confidentiality agreements)</li>
                <li>When required by Philippine law, court order, or government authority</li>
                <li>In cases of fraud detection and prevention</li>
                <li>To protect our rights, privacy, safety, or property</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                All data processors handling your information are required to maintain strict confidentiality and comply with the Data Privacy Act.
              </p>
            </div>

            {/* Section 6 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">6. Data Security</h3>
              <p className="text-slate-700 leading-relaxed">
                We implement appropriate administrative, technical, and physical security measures to protect your personal data against 
                unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mt-3">
                <li>Encrypted data transmission and storage</li>
                <li>Restricted access to personal data on a need-to-know basis</li>
                <li>Regular security audits and assessments</li>
                <li>Employee training on data protection and privacy</li>
                <li>Incident response procedures for potential data breaches</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                While we strive to maintain robust security, no system is 100% secure. We will notify you immediately of any confirmed 
                data breach that may affect your personal data.
              </p>
            </div>

            {/* Section 7 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">7. Your Rights as a Data Subject</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Under the Data Privacy Act of 2012, you have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li><strong>Right to Access:</strong> Request access to your personal data we hold</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate personal data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data (subject to legal obligations)</li>
                <li><strong>Right to Data Portability:</strong> Request your data in a portable format</li>
                <li><strong>Right to Object:</strong> Object to certain types of data processing</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for marketing communications at any time</li>
                <li><strong>Right to Lodge a Complaint:</strong> File a complaint with the National Privacy Commission (NPC)</li>
              </ul>
            </div>

            {/* Section 8 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">8. Data Retention</h3>
              <p className="text-slate-700 leading-relaxed">
                We retain your personal data only as long as necessary for the purposes outlined in this Privacy Policy, or as required by 
                Philippine law. Generally:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mt-3">
                <li>Active account data is retained during the period of program membership</li>
                <li>Transaction records are retained for at least three (3) years for audit and legal compliance purposes</li>
                <li>Inactive account data may be securely deleted after 24 months of inactivity</li>
              </ul>
            </div>

            {/* Section 9 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">9. Marketing Communications</h3>
              <p className="text-slate-700 leading-relaxed">
                We will send you marketing communications and promotional offers based on your expressed preferences. You can opt-out or 
                manage your communication preferences at any time by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mt-3">
                <li>Clicking the unsubscribe link in promotional emails</li>
                <li>Updating your preferences in your account settings</li>
                <li>Contacting our customer service team directly</li>
              </ul>
            </div>

            {/* Section 10 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">10. Children's Privacy</h3>
              <p className="text-slate-700 leading-relaxed">
                The loyalty program is not targeted at children under 18 years old. We do not knowingly collect personal data from children 
                without parental consent. If we become aware that a child under 18 has registered, we will take steps to remove their information 
                and terminate their account.
              </p>
            </div>

            {/* Section 11 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">11. Third-Party Links</h3>
              <p className="text-slate-700 leading-relaxed">
                This Privacy Policy applies only to Enrico's loyalty program. We are not responsible for the privacy practices of external 
                websites or third-party services linked from our platform. We encourage you to review their privacy policies before providing 
                any personal information.
              </p>
            </div>

            {/* Section 12 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">12. Policy Changes</h3>
              <p className="text-slate-700 leading-relaxed">
                We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify you 
                of significant changes via email or through our website. Your continued use of the loyalty program following any changes 
                constitutes your acceptance of the updated Privacy Policy.
              </p>
            </div>

            {/* Section 13 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">13. Contact Us</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you have questions about these policies or wish to exercise your data subject rights, please contact our customer service team:
              </p>
              <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                <p className="text-slate-700"><strong>Enrico's Customer Service</strong></p>
                <p className="text-slate-600">Email: support@enricos.ph</p>
                <p className="text-slate-600">Phone: (02) XXXX-XXXX</p>
                <p className="text-slate-600">Hours: Monday - Sunday, 10:00 AM - 8:00 PM (Philippine Standard Time)</p>
              </div>
            </div>

            {/* Section 14 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">14. National Privacy Commission</h3>
              <p className="text-slate-700 leading-relaxed">
                If you have concerns about Enrico's data privacy practices that we cannot resolve, you may file a complaint with the 
                National Privacy Commission (NPC) of the Philippines:
              </p>
              <div className="p-4 bg-slate-50 rounded-lg space-y-2 mt-4">
                <p className="text-slate-700"><strong>National Privacy Commission</strong></p>
                <p className="text-slate-600">Website: www.privacy.gov.ph</p>
                <p className="text-slate-600">Email: dpo@privacy.gov.ph</p>
                <p className="text-slate-600">Phone: (02) 8926-2345</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center">
          <Link href="/register" className="inline-block bg-red-600 text-white font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-full hover:bg-red-700 transition-colors text-sm sm:text-base">
            Agree and Register
          </Link>
        </div>
      </div>
    </div>
  );
}
