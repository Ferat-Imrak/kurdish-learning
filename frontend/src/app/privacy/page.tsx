'use client'

import { Shield, Lock, Eye, Database, Users, Cookie, Globe, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PrivacyPage() {

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
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-textNavy mb-4">
              Privacy Policy
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
                At Peyvi ("we", "us", "our"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our language learning platform ("Service"). Please read this Privacy Policy carefully. By using our Service, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            {/* 1. Information We Collect */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4 flex items-center gap-3">
                <Database className="w-6 h-6 text-primaryBlue" />
                1. Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">1.1 Information You Provide</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    We collect information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>Parent Account Information:</strong> Full name, username, email address, password (hashed)</li>
                    <li><strong>Child Profile Information:</strong> Child's name, age, language preference (Kurmanji/Sorani), optional avatar</li>
                    <li><strong>Payment Information:</strong> Payment method details (processed securely through third-party payment processors; we do not store full credit card numbers)</li>
                    <li><strong>Communication Data:</strong> Messages you send to us, feedback, support requests</li>
                    <li><strong>Subscription Information:</strong> Selected plan (monthly/yearly), subscription status, billing history</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">1.2 Automatically Collected Information</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    When you or your children use our Service, we automatically collect certain information, including:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>Usage Data:</strong> Pages visited, features used, time spent, interactions with content (linked to child profiles for progress tracking)</li>
                    <li><strong>Learning Progress:</strong> Lessons completed, scores, achievements, progress tracking data (per child profile)</li>
                    <li><strong>Game Session Data:</strong> Games played, scores, time spent, completion status (per child profile)</li>
                    <li><strong>Device Information:</strong> Device type, operating system, browser type, IP address</li>
                    <li><strong>Log Data:</strong> Access times, error logs, performance data</li>
                    <li><strong>Location Data:</strong> General location information (country/region level) based on IP address (for compliance and security purposes only)</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    <strong>Note:</strong> Learning progress and game data are associated with child profiles to provide personalized learning experiences and track educational progress.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">1.3 Cookies and Tracking Technologies</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We use cookies, web beacons, and similar tracking technologies to collect information about your browsing behavior. See Section 6 for more details about our use of cookies.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4 flex items-center gap-3">
                <Eye className="w-6 h-6 text-primaryBlue" />
                2. How We Use Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>To Provide and Improve the Service:</strong> Deliver learning content, track progress for each child profile, personalize learning experiences, and enhance features</li>
                <li><strong>To Process Payments:</strong> Process subscription payments, manage billing, prevent fraud, and maintain subscription status</li>
                <li><strong>To Communicate with Parents:</strong> Send service-related notifications to parent accounts, respond to inquiries, provide customer support, and send important updates (we do NOT send marketing emails to children)</li>
                <li><strong>To Analyze and Improve:</strong> Understand how learners interact with the Service, identify trends, and improve our content and features (using anonymized and aggregated data)</li>
                <li><strong>To Ensure Security:</strong> Detect and prevent fraud, abuse, security threats, unauthorized access, and account sharing violations</li>
                <li><strong>To Comply with Legal Obligations:</strong> Meet legal requirements (including COPPA), respond to legal requests, and protect our rights</li>
                <li><strong>For Marketing (parent accounts only, with consent):</strong> Send promotional communications about new features, special offers, and educational content to parent email addresses (you can opt-out at any time)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                <strong>Important:</strong> We do NOT use children's information for marketing, advertising, or behavioral targeting. All marketing communications are sent only to parent accounts.
              </p>
            </section>

            {/* 3. How We Share Your Information */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4 flex items-center gap-3">
                <Users className="w-6 h-6 text-primaryBlue" />
                3. How We Share Your Information
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  We do not sell your personal information. We may share your information only in the following circumstances:
                </p>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">3.1 Service Providers</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We share information with trusted third-party service providers who perform services on our behalf, such as:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                    <li>Payment processors (Stripe, PayPal, etc.)</li>
                    <li>Cloud hosting and storage providers</li>
                    <li>Analytics and performance monitoring services</li>
                    <li>Email service providers</li>
                    <li>Customer support platforms</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    These providers are contractually obligated to protect your information and use it only for the purposes we specify.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">3.2 Legal Requirements</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We may disclose your information if required by law, court order, or government regulation, or if we believe disclosure is necessary to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                    <li>Comply with legal obligations</li>
                    <li>Protect our rights, property, or safety</li>
                    <li>Protect the rights, property, or safety of our users or others</li>
                    <li>Prevent or investigate fraud or security issues</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">3.3 Business Transfers</h3>
                  <p className="text-gray-700 leading-relaxed">
                    In the event of a merger, acquisition, reorganization, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change in ownership or control.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">3.4 With Your Consent</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We may share your information with your explicit consent or at your direction.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Data Security */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4 flex items-center gap-3">
                <Lock className="w-6 h-6 text-primaryBlue" />
                4. Data Security
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Encryption of data in transit (SSL/TLS) and at rest</li>
                  <li>Secure password hashing and storage</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Secure payment processing through PCI-compliant providers</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            {/* 5. Data Retention */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4">
                5. Data Retention
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as necessary to provide the Service, fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal or legitimate business purposes.
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                Learning progress and achievement data may be retained in anonymized form for analytics and service improvement purposes.
              </p>
            </section>

            {/* 6. Cookies and Tracking Technologies */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4 flex items-center gap-3">
                <Cookie className="w-6 h-6 text-primaryBlue" />
                6. Cookies and Tracking Technologies
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  We use cookies and similar technologies to enhance your experience, analyze usage, and assist with marketing efforts. Types of cookies we use:
                </p>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">6.1 Essential Cookies</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Required for the Service to function properly (e.g., authentication, session management). These cannot be disabled.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">6.2 Analytics Cookies</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Help us understand how users interact with the Service (e.g., Google Analytics). You can opt-out through your browser settings or our cookie preferences.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">6.3 Functional Cookies</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Remember your preferences and settings to provide a personalized experience.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">6.4 Marketing Cookies</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Used to deliver relevant advertisements and track campaign effectiveness. You can opt-out at any time.
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed mt-4">
                  You can control cookies through your browser settings. Note that disabling certain cookies may affect the functionality of the Service.
                </p>
              </div>
            </section>

            {/* 7. Your Rights and Choices */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4">
                7. Your Rights and Choices
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Depending on your location, you may have certain rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                  <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                  <li><strong>Objection:</strong> Object to processing of your information for certain purposes</li>
                  <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  To exercise these rights, please contact us at support@kurdishlearning.app. We will respond to your request within 30 days, subject to applicable law.
                </p>
              </div>
            </section>

            {/* 8. Children's Privacy */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4">
                8. Children's Privacy (COPPA Compliance)
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Peyvi is specifically designed for children and families.</strong> The Service is intended for learners of all ages, including children under 13. We fully comply with the Children's Online Privacy Protection Act (COPPA) and similar international laws protecting children's privacy.
                </p>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">8.1 Account Structure</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Parents or legal guardians (age 18+) create parent accounts and then create child profiles for their children. Children do not create accounts directly. All child profiles are linked to and managed by the parent account.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">8.2 Parental Consent</h3>
                  <p className="text-gray-700 leading-relaxed">
                    By creating a child profile, you (as a parent or guardian) provide verifiable consent for us to collect and use your child's information as described in this Privacy Policy. This consent is required for all children under 13. You can revoke this consent at any time by deleting the child profile or contacting us.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">8.3 Information Collected from Children</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    For child profiles, we collect only the minimum information necessary to provide the Service:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Child's name (as provided by parent)</li>
                    <li>Child's age (for age-appropriate content)</li>
                    <li>Language preference (Kurmanji or Sorani)</li>
                    <li>Learning progress data (lessons completed, scores, achievements)</li>
                    <li>Game session data (for progress tracking)</li>
                    <li>Optional avatar selection</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    <strong>We do NOT collect:</strong> Email addresses from children, contact information from children, or any information directly from children without parental consent. We do NOT use children's information for advertising or marketing purposes.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">8.4 Parental Rights and Controls</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    Parents have full control over their children's information and can:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Review all information collected from their child at any time through the parent account</li>
                    <li>Modify or update their child's profile information</li>
                    <li>Request deletion of their child's information and profile</li>
                    <li>Refuse further collection or use of their child's information</li>
                    <li>Revoke consent at any time, which will result in deletion of the child profile</li>
                    <li>Export their child's learning progress data</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">8.5 Data Retention for Children</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We retain children's information only as long as necessary to provide the Service. When a child profile is deleted (by parent request or account cancellation), we will delete all associated personal information within 30 days, except where retention is required by law or for legitimate business purposes (such as anonymized analytics).
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-textNavy mb-2">8.6 Third-Party Disclosure for Children</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We do not share, sell, or disclose children's personal information to third parties except as necessary to provide the Service (e.g., cloud hosting) or as required by law. We never use children's information for advertising or marketing purposes.
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <strong>If you are a parent and believe we have collected information from your child without proper consent, or if you have questions about your child's privacy, please contact us immediately at support@kurdishlearning.app or privacy@kurdishlearning.app.</strong>
                </p>
              </div>
            </section>

            {/* 9. International Data Transfers */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4 flex items-center gap-3">
                <Globe className="w-6 h-6 text-primaryBlue" />
                9. International Data Transfers
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. We take appropriate safeguards to ensure your information receives adequate protection, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                <li>Using standard contractual clauses approved by data protection authorities</li>
                <li>Ensuring service providers comply with applicable data protection laws</li>
                <li>Implementing security measures consistent with international standards</li>
              </ul>
            </section>

            {/* 10. Third-Party Links */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4">
                10. Third-Party Links and Services
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our Service may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any information to them.
              </p>
            </section>

            {/* 11. California Privacy Rights (CCPA) */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4">
                11. California Privacy Rights (CCPA)
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                <li>Right to know what personal information is collected, used, shared, or sold</li>
                <li>Right to delete personal information (subject to exceptions)</li>
                <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
                <li>Right to non-discrimination for exercising your privacy rights</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise your California privacy rights, contact us at support@kurdishlearning.app.
              </p>
            </section>

            {/* 12. European Privacy Rights (GDPR) */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4">
                12. European Privacy Rights (GDPR)
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR), including the rights listed in Section 7. Our legal basis for processing your information includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                <li>Performance of a contract (providing the Service)</li>
                <li>Legitimate interests (improving the Service, security, fraud prevention)</li>
                <li>Consent (marketing communications, optional features)</li>
                <li>Legal obligations (compliance with laws)</li>
              </ul>
            </section>

            {/* 13. Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4">
                13. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                <li>Posting the updated Privacy Policy on this page</li>
                <li>Updating the "Last updated" date</li>
                <li>Sending an email notification for significant changes</li>
                <li>Displaying a notice in the Service</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Your continued use of the Service after changes become effective constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-gradient-to-r from-primaryBlue/10 to-supportLavender/10 rounded-2xl p-6 border-2 border-primaryBlue/20 mt-12">
              <h2 className="text-2xl font-heading font-bold text-textNavy mb-4 flex items-center gap-3">
                <Mail className="w-6 h-6 text-primaryBlue" />
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="text-gray-700 space-y-2">
                <li><strong>Email:</strong> support@kurdishlearning.app</li>
                <li><strong>Privacy Inquiries:</strong> privacy@kurdishlearning.app</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                We will respond to your inquiry within 30 days, as required by applicable law.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

