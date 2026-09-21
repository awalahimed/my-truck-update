"use client";

import { motion } from "framer-motion";
import { IconTruck, IconArrowLeft } from "@tabler/icons-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <IconTruck className="h-8 w-8 text-teal-600" />
              <span className="text-xl font-bold text-gray-900">MyTruck</span>
            </div>
            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              <IconArrowLeft className="h-4 w-4" />
              Back to Home
            </motion.a>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Terms of Use
            </h1>
            <p className="text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  By accessing, registering for, or using MyTruck, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree with these Terms, you must not use the platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Eligibility</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To use MyTruck, you must be legally capable of entering into agreements under applicable law, provide accurate information during registration, and have authority to act on behalf of a business if registering a business account. MyTruck may request identity verification where necessary.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Accounts</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You are responsible for maintaining accurate account information, keeping your login credentials secure, and all activities conducted under your account. You must notify MyTruck immediately if you suspect unauthorized access to your account. MyTruck reserves the right to suspend or terminate accounts that violate these Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You agree not to use the platform for unlawful activities, provide false information, impersonate another person or organization, attempt to gain unauthorized access to systems, disrupt or interfere with platform operations, upload malicious software or harmful content, or abuse, harass, threaten, or deceive other users. MyTruck may remove content or suspend users who violate these rules.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payments and Fees</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Certain services may require payment. By using paid services, you agree to pay all applicable fees, provide valid payment information, and comply with payment provider requirements. MyTruck may update fees from time to time. Failure to pay required fees may result in suspension of services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  All MyTruck software, technology, branding, logos, content, designs, and platform features are owned by MyTruck or its licensors. Users may not copy, modify, distribute, reverse engineer, reproduce, or commercially exploit any part of the platform without written permission.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Disclaimers</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  MyTruck provides the platform on an "as is" and "as available" basis. We do not guarantee continuous availability, error-free operation, specific business outcomes, or uninterrupted service. Users assume responsibility for decisions made using information provided through the platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To the maximum extent permitted by law, MyTruck shall not be liable for indirect damages, incidental damages, consequential damages, lost profits, lost business opportunities, or data loss arising from the use of the platform. Our total liability shall not exceed the amount paid by the user to MyTruck during the twelve (12) months preceding the claim. Nothing in these Terms excludes liability that cannot legally be excluded.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  MyTruck may suspend, restrict, or terminate access to the platform at any time if these Terms are violated, fraudulent activity is suspected, required by law, or platform security is at risk. Users may also stop using the platform and request account deletion at any time.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These Terms shall be governed by and interpreted in accordance with the laws of the Federal Democratic Republic of Ethiopia. Any disputes arising from these Terms shall be subject to the jurisdiction of Ethiopian courts unless otherwise required by applicable law.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For questions regarding these Terms, contact:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Email: mytrucklogisticseth@gmail.com</li>
                  <li>Support: support@mytruck.com</li>
                  <li>Address: Nekemte</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mb-4">
                  By using MyTruck, you acknowledge that you have read, understood, and agreed to these Terms of Use.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
