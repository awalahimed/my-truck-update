"use client";

import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Timeline } from "@/components/ui/timeline";
import { orpc } from "@/lib/oprc";
import { 
  IconGift, 
  IconBrandApple, 
  IconBrandGooglePlay,
  IconDownload,
  IconUserPlus,
  IconShoppingCart,
  IconCoin
} from "@tabler/icons-react";

interface ReferralConfig {
  referrerRewardAmount: string;
  refereeRewardAmount: string;
  minOrderAmount: string;
  expiryDays: number;
  enabled: boolean;
}

export default function ReferralPage() {
  const { code } = useParams<{ code: string }>();
  const [config, setConfig] = useState<ReferralConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await orpc.referral.getProgramStatus();
        if (response.success) {
          setConfig({
            referrerRewardAmount: response.referrerReward || "50.00",
            refereeRewardAmount: response.refereeReward || "25.00",
            minOrderAmount: response.minOrderAmount || "100.00",
            expiryDays: response.expiryDays || 30,
            enabled: response.enabled ?? true,
          });
        }
      } catch (error) {
        console.error('Failed to fetch referral config:', error);
        // Set default values if fetch fails
        setConfig({
          referrerRewardAmount: "00.00",
          refereeRewardAmount: "00.00",
          minOrderAmount: "00.00",
          expiryDays: 30,
          enabled: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!config?.enabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Referral Program Unavailable</h1>
          <p className="text-gray-600 mb-8">The referral program is currently not active. Please check back later.</p>
          <a href="/" className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  const refereeReward = parseFloat(config.refereeRewardAmount);
  const minOrder = parseFloat(config.minOrderAmount);

  const timelineData = [
    {
      title: "Step 1",
      content: (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <IconDownload className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Download My Truck App</h3>
          </div>
          <p className="text-neutral-800 dark:text-neutral-200 text-base mb-6">
            Download the My Truck app from Google Play Store or Apple App Store to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <IconBrandGooglePlay className="h-7 w-7" />
              <div className="text-left">
                <div className="text-xs">GET IT ON</div>
                <div className="text-base font-semibold">Google Play</div>
              </div>
            </motion.a>
            <motion.a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <IconBrandApple className="h-7 w-7" />
              <div className="text-left">
                <div className="text-xs">Download on the</div>
                <div className="text-base font-semibold">App Store</div>
              </div>
            </motion.a>
          </div>
        </div>
      ),
    },
    {
      title: "Step 2",
      content: (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <IconUserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Create Your Account</h3>
          </div>
          <p className="text-neutral-800 dark:text-neutral-200 text-base mb-4">
            Sign up for a new account using your phone number. During registration, enter the referral code:
          </p>
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-xl p-6 mb-4">
            <p className="text-sm text-gray-600 mb-2">Your Referral Code:</p>
            <div className="flex items-center justify-between">
              <p className="text-4xl font-bold text-teal-600 font-mono tracking-wider">{code || "XXXXXX"}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigator.clipboard.writeText(code || "");
                  alert("Referral code copied!");
                }}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Copy Code
              </motion.button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            💡 Tip: Make sure to enter the code during registration to receive your bonus!
          </p>
        </div>
      ),
    },
    {
      title: "Step 3",
      content: (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <IconShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Complete Your First Order</h3>
          </div>
          <p className="text-neutral-800 dark:text-neutral-200 text-base mb-6">
            Place and complete your first delivery order with a minimum value of <span className="font-bold text-teal-600">{minOrder} ETB</span> to activate your referral bonus.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ℹ️ Your bonus will be automatically credited to your wallet once your first order is delivered successfully.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Step 4",
      content: (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <IconCoin className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Get Your {refereeReward} ETB Bonus!</h3>
          </div>
          <p className="text-neutral-800 dark:text-neutral-200 text-base mb-6">
            Congratulations! You'll receive <span className="font-bold text-green-600">{refereeReward} ETB</span> bonus in your wallet that you can use for future deliveries.
          </p>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🎉</div>
              <div>
                <p className="text-2xl font-bold text-green-600">{refereeReward} ETB Bonus</p>
                <p className="text-sm text-gray-600">Ready to use on your next delivery</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
              <IconGift className="h-4 w-4" />
              Special Referral Offer
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              Get <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">{refereeReward} ETB Bonus</span>
              <br />
              When You Join My Truck!
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              You've been invited to join My Truck delivery service. Follow the simple steps below to claim your welcome bonus.
            </p>

            {/* Referral Code Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-teal-200"
            >
              <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
              <p className="text-5xl md:text-6xl font-bold text-teal-600 font-mono tracking-wider mb-4">
                {code || "XXXXXX"}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigator.clipboard.writeText(code || "");
                  alert("Referral code copied to clipboard!");
                }}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-colors font-semibold"
              >
                Copy Referral Code
              </motion.button>
            </motion.div>

            {/* Quick Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
              >
                <IconBrandGooglePlay className="h-8 w-8" />
                <div className="text-left">
                  <div className="text-xs">GET IT ON</div>
                  <div className="text-lg font-semibold">Google Play</div>
                </div>
              </motion.a>
              <motion.a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
              >
                <IconBrandApple className="h-8 w-8" />
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-lg font-semibold">App Store</div>
                </div>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            How to Claim Your Bonus
          </h2>
          <p className="text-center text-gray-600 text-lg max-w-2xl mx-auto">
            Follow these simple steps to get your {refereeReward} ETB welcome bonus
          </p>
        </div>
        <Timeline data={timelineData} />
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Download the app now and claim your {refereeReward} ETB bonus!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                <IconBrandGooglePlay className="h-8 w-8" />
                <div className="text-left">
                  <div className="text-xs">GET IT ON</div>
                  <div className="text-lg font-semibold">Google Play</div>
                </div>
              </motion.a>
              <motion.a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                <IconBrandApple className="h-8 w-8" />
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-lg font-semibold">App Store</div>
                </div>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
