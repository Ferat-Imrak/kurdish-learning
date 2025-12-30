'use client'

import { FileText, Shield, CreditCard, UserX, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TermsPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-backgroundCream via-white to-backgroundCream relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primaryBlue/10 to-supportLavender/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-accentCoral/10 to-brand-orange/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-br from-brand-green/10 to-supportMint/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 p-8 md:p-12"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primaryBlue to-supportLavender flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-textNavy mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-600 text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Peyvi! These Terms of Service ("Terms") govern your access to and use of the Peyvi language learning platform ("Service", "Platform", "we", "us", or "our"). By creating an account, accessing, or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.
              </p>
            </section>

            {/* 1. Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4 flex items-center gap-3">
                <Shield className="w-6 h-6 text-primaryBlue" />
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing or using Peyvi, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the updated Terms on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* 2. Account Registration */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4 flex items-center gap-3">
                <UserX className="w-6 h-6 text-primaryBlue" />
                2. Account Registration and Eligibility
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">2.1 Account Creation</h3>
                  <p className="text-gray-700 leading-relaxed">
                    To access certain features of the Service, you must create an account. You agree to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                    <li>Provide accurate, current, and complete information during registration</li>
                    <li>Maintain and promptly update your account information</li>
                    <li>Maintain the security of your password and account</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Notify us immediately of any unauthorized use of your account</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">2.2 Eligibility and Age Requirements</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Peyvi is designed for learners of all ages, including children. Accounts must be created by a parent or legal guardian who is at least 18 years old. Parents or guardians are responsible for:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                    <li>Creating and managing accounts for their children</li>
                    <li>Supervising their children's use of the Service</li>
                    <li>Ensuring appropriate content and usage</li>
                    <li>Providing consent for data collection from children under 13 (as required by COPPA)</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    By creating an account, you represent that you are a parent or legal guardian with the authority to create accounts for the children listed in your account.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">2.3 Account Termination</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    We reserve the right to suspend or terminate your account and access to the Service immediately, with or without notice, for any of the following reasons:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Violation of these Terms or our policies</li>
                    <li>Fraudulent, abusive, or illegal activity</li>
                    <li>Non-payment of subscription fees</li>
                    <li>Sharing account credentials or unauthorized access</li>
                    <li>Attempting to circumvent payment or access controls</li>
                    <li>Any conduct harmful to other users, us, or third parties</li>
                    <li>At our sole discretion for any reason</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    Upon termination, you will immediately lose all access to the Service. We are not obligated to provide refunds for terminated accounts, except as required by law.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Subscription and Payment */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-primaryBlue" />
                3. Subscription Plans and Payment
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">3.1 Subscription Required</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    Access to Peyvi requires an active paid subscription. There is no free tier or free access to the Service. Peyvi offers the following subscription plans:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>Monthly Plan:</strong> $4.99 per month, billed monthly</li>
                    <li><strong>Yearly Plan:</strong> $49.99 per year, billed annually (includes 2 months free, equivalent to $4.17 per month)</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    All features, content, lessons, games, and functionality require an active subscription. Without a valid subscription, you will not have access to any part of the Service.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">3.2 Free Trial</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We may offer a limited free trial period for new users. The trial period and terms will be clearly stated at signup. During the trial, you have full access to the Service. After the trial period ends, your subscription will automatically convert to a paid subscription unless you cancel before the trial ends. If you cancel during the trial, your access will terminate immediately upon cancellation.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">3.3 Payment Terms</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>All fees are in USD and are non-refundable except as required by law</li>
                    <li>Payment is processed securely through our third-party payment processor</li>
                    <li>You authorize us to charge your payment method for all fees associated with your subscription</li>
                    <li>If payment fails, we may suspend or terminate your access to the Service</li>
                    <li>Prices are subject to change with 30 days' notice to existing subscribers</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">3.4 Cancellation and Access Termination</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    You may cancel your subscription at any time through your account settings. <strong>IMPORTANT:</strong> Upon cancellation, your access to the Service will terminate at the end of your current billing period. You will have access to all features until the last day of your paid subscription period.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-2 bg-red-50 p-4 rounded-lg border border-red-200">
                    <strong>Data Loss Warning:</strong> After your subscription ends or is cancelled, you will immediately lose all access to the Service, including:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-2">
                    <li>All lessons, games, and content</li>
                    <li>Learning progress data for all child profiles</li>
                    <li>Achievements and scores</li>
                    <li>Account and profile information</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed">
                    We recommend exporting any important progress data before cancelling. We are not responsible for any data loss resulting from subscription cancellation or termination. We reserve the right to immediately terminate your access if you violate these Terms, engage in fraudulent activity, or fail to pay subscription fees. In such cases, no refund will be provided.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">3.5 Refund Policy</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    All subscription fees are non-refundable except as required by applicable law. Refunds may be available in the following limited circumstances:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>Legal Requirements:</strong> In jurisdictions where consumer protection laws require refunds (e.g., EU 14-day cooling-off period for digital services), we will comply with such requirements</li>
                    <li><strong>Service Failure:</strong> If we are unable to provide the Service due to technical issues on our end for an extended period, we may provide a prorated refund at our discretion</li>
                    <li><strong>Duplicate Charges:</strong> If you are charged multiple times in error, we will refund the duplicate charges</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    Refund requests must be submitted within 30 days of the charge. Contact us at support@kurdishlearning.app for refund requests. All refund decisions are at our sole discretion, except where required by law.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">3.6 Auto-Renewal</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Subscriptions automatically renew at the end of each billing period unless cancelled. You will be charged the then-current subscription fee. You can disable auto-renewal at any time in your account settings. If auto-renewal is disabled and your subscription expires, your access to the Service will terminate immediately.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">3.7 Price Changes</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to modify subscription prices at any time. Price changes will not affect your current subscription period but will apply to renewals. We will provide at least 30 days' notice of any price increases to existing subscribers via email. If you do not agree to the new price, you may cancel your subscription before the renewal date.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Use of Service */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-primaryBlue" />
                4. Acceptable Use
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">4.1 Permitted Use</h3>
                  <p className="text-gray-700 leading-relaxed">
                    You may use Peyvi solely for personal, non-commercial educational purposes for yourself and your children. With an active subscription, you may:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                    <li>Access and use all learning materials, lessons, games, and features</li>
                    <li>Create and manage child profiles for your children</li>
                    <li>Track learning progress and achievements</li>
                    <li>Use the Service for educational purposes within your household</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    Your subscription is for personal, household use only. Commercial use, resale, or use in educational institutions requires a separate enterprise license.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">4.2 Prohibited Activities</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    You agree NOT to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Share your account credentials with others, allow unauthorized access, or create multiple accounts to circumvent payment</li>
                    <li>Attempt to reverse engineer, decompile, disassemble, or extract source code from the Service</li>
                    <li>Use automated systems (bots, scrapers, scripts) to access, monitor, or extract data from the Service</li>
                    <li>Copy, reproduce, distribute, modify, create derivative works, publicly display, or publicly perform our content without explicit written permission</li>
                    <li>Use the Service for any illegal purpose, violate any laws, or infringe on any rights</li>
                    <li>Interfere with, disrupt, damage, or impair the Service, servers, networks, or security</li>
                    <li>Transmit viruses, malware, worms, or any harmful code</li>
                    <li>Impersonate others, provide false information, or misrepresent your identity</li>
                    <li>Harass, abuse, threaten, or harm other users or our staff</li>
                    <li>Use the Service to compete with us, build a similar service, or use our content to train AI models</li>
                    <li>Circumvent or attempt to circumvent payment, access controls, or security measures</li>
                    <li>Resell, sublicense, or commercially exploit the Service or content</li>
                    <li>Remove, alter, or obscure copyright, trademark, or proprietary notices</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    Violation of these prohibitions may result in immediate account termination without refund and may subject you to legal action.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Intellectual Property */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4">
                5. Intellectual Property Rights
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  The Service, including all content, features, functionality, design, text, graphics, images, audio, video, software, and other materials, is owned by Peyvi and protected by copyright, trademark, and other intellectual property laws.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Service for personal, non-commercial educational purposes in accordance with these Terms. This license does not include the right to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Resell or commercially use the Service or content</li>
                  <li>Copy, modify, or create derivative works</li>
                  <li>Remove any copyright or proprietary notices</li>
                  <li>Use our trademarks, logos, or branding without permission</li>
                </ul>
              </div>
            </section>

            {/* 6. User Content */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4">
                6. User Content and Data
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  You retain ownership of any content you create or submit through the Service (such as progress data, achievements, or user-generated content). By using the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, store, and process your content solely for the purpose of providing and improving the Service.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We respect your privacy and handle your personal data in accordance with our Privacy Policy. You are responsible for ensuring that any content you provide does not violate any third-party rights or applicable laws.
                </p>
              </div>
            </section>

            {/* 7. Disclaimers and Limitations */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4">
                7. Disclaimers and Limitation of Liability
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">7.1 Service Availability</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We strive to provide a reliable Service but do not guarantee that the Service will be available, uninterrupted, error-free, or secure. We may modify, suspend, or discontinue any part of the Service at any time with or without notice.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">7.2 Educational Content</h3>
                  <p className="text-gray-700 leading-relaxed">
                    While we strive for accuracy and quality, we do not guarantee that all educational content is error-free, complete, or suitable for all learners. The Service is provided for educational purposes only and should not be the sole basis for important academic, professional, or personal decisions. We are not responsible for learning outcomes or results.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">7.3 No Warranty</h3>
                  <p className="text-gray-700 leading-relaxed">
                    THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE. WE DO NOT WARRANT THAT THE SERVICE WILL MEET YOUR REQUIREMENTS, BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">7.4 Limitation of Liability</h3>
                  <p className="text-gray-700 leading-relaxed">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, PEYVI, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND LICENSORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, REVENUES, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                    <li>Your use or inability to use the Service</li>
                    <li>Unauthorized access to or alteration of your data</li>
                    <li>Statements or conduct of third parties on the Service</li>
                    <li>Termination of your account or access</li>
                    <li>Any other matter relating to the Service</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    Our total liability for any claims arising from or related to the Service, regardless of the form of action, shall not exceed the amount you paid us in the 12 months preceding the claim, or $50, whichever is greater. Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you.
                  </p>
                </div>
              </div>
            </section>

            {/* 8. Indemnification */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4">
                8. Indemnification
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify, defend, and hold harmless Peyvi, its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising out of or in any way connected with your use of the Service, violation of these Terms, or infringement of any rights of another.
              </p>
            </section>

            {/* 9. Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4">
                9. Dispute Resolution
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  If you have any concerns or disputes regarding the Service, please contact us at support@kurdishlearning.app. We will work in good faith to resolve any issues.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, except where prohibited by law. You waive any right to a jury trial and agree to resolve disputes on an individual basis, not as part of a class action.
                </p>
                <p className="text-gray-700 leading-relaxed mt-2">
                  Notwithstanding the above, we reserve the right to seek injunctive relief in any court of competent jurisdiction to protect our intellectual property or prevent unauthorized use of the Service.
                </p>
              </div>
            </section>

            {/* 10. Miscellaneous */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4">
                10. Miscellaneous
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">10.1 Entire Agreement</h3>
                  <p className="text-gray-700 leading-relaxed">
                    These Terms, together with our Privacy Policy, constitute the entire agreement between you and Peyvi regarding the Service.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">10.2 Severability</h3>
                  <p className="text-gray-700 leading-relaxed">
                    If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">10.3 Waiver</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Our failure to enforce any right or provision of these Terms will not be considered a waiver of such right or provision.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">10.4 Assignment</h3>
                  <p className="text-gray-700 leading-relaxed">
                    You may not assign, transfer, or sublicense these Terms, your account, or any rights or obligations hereunder without our prior written consent. Any attempted assignment in violation of this provision is void. We may assign, transfer, or delegate these Terms and our rights and obligations without restriction, including in connection with a merger, acquisition, or sale of assets.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">10.5 Force Majeure</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We shall not be liable for any failure or delay in performance under these Terms due to circumstances beyond our reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, labor disputes, internet or telecommunications failures, or government actions.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">10.6 Survival</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Sections 5 (Intellectual Property), 7 (Disclaimers and Limitation of Liability), 8 (Indemnification), and 9 (Dispute Resolution) shall survive termination of these Terms and your use of the Service.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gradient-to-r from-primaryBlue/10 to-supportLavender/10 rounded-2xl p-6 border-2 border-primaryBlue/20 mt-12">
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4">
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <ul className="text-gray-700 space-y-2">
                <li><strong>Email:</strong> support@kurdishlearning.app</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

