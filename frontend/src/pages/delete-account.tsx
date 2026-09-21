"use client";

import { motion } from "framer-motion";
import { IconTruck, IconArrowLeft, IconTrash, IconAlertTriangle, IconSettings, IconShieldCheck } from "@tabler/icons-react";

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <IconTruck className="h-8 w-8 text-teal-600" />
              <span className="text-xl font-bold text-gray-900">My Truck</span>
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

      {/* Content */}
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <IconTrash className="h-10 w-10 text-red-600" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Delete Your Account
              </h1>
            </div>

            {/* Main Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconSettings className="h-10 w-10 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Delete Account Through the App
                </h2>
                <p className="text-gray-600 text-lg">
                  Account deletion is available in the My Truck mobile app settings.
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Delete Your Account:</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Open the My Truck App</p>
                      <p className="text-sm text-gray-500">Launch the app on your mobile device</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Go to Settings</p>
                      <p className="text-sm text-gray-500">Tap on your profile, then select Settings</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Select "Delete Account"</p>
                      <p className="text-sm text-gray-500">Find the account deletion option at the bottom</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Confirm Deletion</p>
                      <p className="text-sm text-gray-500">Read the warning and confirm your decision</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Box */}
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <IconAlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Warning: This action cannot be undone</h3>
                  <p className="text-red-800 text-sm leading-relaxed mb-3">
                    Deleting your account will permanently remove:
                  </p>
                  <ul className="list-disc pl-5 text-red-800 text-sm space-y-1">
                    <li>Profile information and contact details</li>
                    <li>Delivery history and tracking records</li>
                    <li>Payment methods and wallet balance</li>
                    <li>Saved addresses and preferences</li>
                    <li>Referral earnings and rewards</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* What Gets Kept */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <IconShieldCheck className="h-6 w-6 text-gray-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Retained for Legal Compliance</h3>
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">
                    For legal and security reasons, some anonymized data will be kept:
                  </p>
                  <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                    <li>Transaction records (anonymized, 5-7 years)</li>
                    <li>Order history metadata (anonymized)</li>
                    <li>Financial records for tax compliance</li>
                    <li>Fraud prevention logs</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
