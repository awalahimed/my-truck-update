"use client";

import { motion } from "framer-motion";
import { IconTruck, IconArrowLeft, IconShieldCheck } from "@tabler/icons-react";

export default function PrivacyPage() {
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
            <div className="flex items-center gap-3 mb-4">
              <IconShieldCheck className="h-10 w-10 text-teal-600" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Privacy Policy
              </h1>
            </div>
            <p className="text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Welcome to MyTruck. MyTruck is a logistics and transportation platform that connects customers, truck owners, drivers, agents, and businesses for the movement of goods and transportation services. This Privacy Policy explains how MyTruck collects, uses, stores, protects, and shares your information when you use our mobile application, website, and related services. By using MyTruck, you agree to the collection and use of information in accordance with this Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Who We Are</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  MyTruck is operated by MyTruck PLC. For privacy-related questions, requests, or concerns, you may contact us at:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Email: privacy@mytruck.com</li>
                  <li>Support Email: support@mytruck.com</li>
                  <li>Address: Nekemte</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information We Collect</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To provide our services, we may collect the following information:
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Account Information</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Full name</li>
                  <li>Phone number</li>
                  <li>Email address</li>
                  <li>Profile photo</li>
                  <li>Username and password</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Driver and Vehicle Information</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Driver's license details</li>
                  <li>National identification details where required</li>
                  <li>Vehicle registration information</li>
                  <li>Vehicle type, model, capacity, and related details</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Business Information</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Company name</li>
                  <li>Business contact details</li>
                  <li>Shipping and delivery information</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Payment Information</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Payment records</li>
                  <li>Billing information</li>
                  <li>Transaction history</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mb-4">
                  MyTruck does not store complete payment card information. Payments are processed through secure payment providers.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Location Information</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>GPS location</li>
                  <li>Pickup and delivery locations</li>
                  <li>Route and trip tracking information</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Device Information</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Device type</li>
                  <li>Operating system</li>
                  <li>App version</li>
                  <li>IP address</li>
                  <li>Device identifiers</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Communications</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Messages exchanged through the platform</li>
                  <li>Customer support communications</li>
                  <li>Ratings and reviews</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Usage Information</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Login history</li>
                  <li>App activity</li>
                  <li>Service usage records</li>
                  <li>Error and diagnostic logs</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Use Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use your information to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Create and manage accounts</li>
                  <li>Verify drivers, agents, and businesses</li>
                  <li>Match shipments with available transport</li>
                  <li>Process bookings and deliveries</li>
                  <li>Provide GPS tracking and route services</li>
                  <li>Process payments and commissions</li>
                  <li>Communicate service updates and notifications</li>
                  <li>Improve platform performance and security</li>
                  <li>Prevent fraud and misuse</li>
                  <li>Provide customer support</li>
                  <li>Comply with legal obligations</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Where required by law, we will obtain your consent before using information for marketing purposes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. How We Share Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  MyTruck does not sell your personal information. We may share information with:
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Service Providers</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Trusted providers that help us operate the platform, including cloud hosting providers, payment processors, analytics providers, and customer support tools.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Business Partners</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Information necessary to complete transportation services may be shared between customers, drivers, truck owners, and agents.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Legal Authorities</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may disclose information when required by law, court order, government request, or to protect legal rights and public safety.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Business Transfers</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If MyTruck is involved in a merger, acquisition, restructuring, or sale, user information may be transferred as part of that transaction.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We keep information only for as long as necessary to provide services, comply with legal obligations, resolve disputes, and enforce agreements. When information is no longer needed, we securely delete or anonymize it. If you request account deletion, we will remove your personal information unless we are legally required to retain certain records.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Depending on your location and applicable law, you may have the right to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Receive a copy of your data</li>
                  <li>Withdraw consent where consent is used</li>
                  <li>Object to certain processing activities</li>
                  <li>Request restrictions on processing</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To exercise any of these rights, contact us using the information provided in this policy. We may verify your identity before fulfilling requests.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Security</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Protecting your information is important to us. We use reasonable technical and organizational security measures, including:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Encrypted connections (HTTPS/TLS)</li>
                  <li>Secure authentication systems</li>
                  <li>Access controls</li>
                  <li>Monitoring and logging systems</li>
                  <li>Data backups</li>
                  <li>Security reviews and updates</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Although we strive to protect information, no system can guarantee absolute security.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  MyTruck is not intended for children under the age required by applicable law. We do not knowingly collect personal information from children. If we become aware that a child has provided personal information without appropriate consent, we will take steps to remove that information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Your information may be processed or stored in countries other than your own. Whenever information is transferred internationally, MyTruck will take appropriate measures to ensure that your information remains protected and handled according to applicable laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time. If significant changes are made, we will notify users through the app, website, email, or other appropriate methods. Continued use of MyTruck after changes become effective means you accept the updated policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have questions about this Privacy Policy or wish to exercise your privacy rights, contact us:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Email: mytrucklogisticseth@gmail.com</li>
                  <li>Support: support@mytruck.com</li>
                  <li>Address: Nekemte</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Thank you for trusting MyTruck.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
