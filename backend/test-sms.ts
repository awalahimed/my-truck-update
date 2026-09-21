import 'dotenv/config';
import { sendSMS, sendOTPSMS, sendPasswordResetOTPSMS, sendWelcomeSMS } from './src/utils/sms.js';

/**
 * SMS Testing Script
 * 
 * Usage:
 * npm run test:sms
 * 
 * Or with ts-node:
 * npx ts-node test-sms.ts
 */

const TEST_PHONE = '251925319177'; // Ethiopia format

async function testSMS() {
  console.log('='.repeat(60));
  console.log('SMS TESTING SCRIPT');
  console.log('='.repeat(60));
  console.log('');
  
  console.log('Configuration:');
  console.log('- Phone Number:', TEST_PHONE);
  console.log('- API Key:', process.env.AFROSMS_API_KEY ? '✓ Set' : '✗ Not Set');
  console.log('- Sender ID:', process.env.AFROSMS_SENDER_ID || 'Not Set');
  console.log('- Base URL:', process.env.AFROSMS_BASE_URL || 'Not Set');
  console.log('');

  if (!process.env.AFROSMS_API_KEY) {
    console.error('❌ ERROR: AFROSMS_API_KEY not set in .env file');
    console.log('');
    console.log('Please add to your .env file:');
    console.log('AFROSMS_API_KEY=your_api_key_here');
    console.log('AFROSMS_SENDER_ID=MyTrack');
    console.log('AFROSMS_BASE_URL=https://api.afrosms.com/api/send');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('TEST 1: Simple SMS');
  console.log('='.repeat(60));
  
  const test1 = await sendSMS(
    TEST_PHONE,
    'Hello from MyTrack! This is a test message. If you receive this, SMS integration is working perfectly.'
  );
  
  console.log('Result:', test1.success ? '✓ SUCCESS' : '✗ FAILED');
  console.log('Message:', test1.message);
  if (test1.data) {
    console.log('Response:', JSON.stringify(test1.data, null, 2));
  }
  console.log('');

  // Wait 3 seconds between messages
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('='.repeat(60));
  console.log('TEST 2: OTP SMS');
  console.log('='.repeat(60));
  
  const testOTP = '123456';
  const test2 = await sendOTPSMS(TEST_PHONE, testOTP);
  
  console.log('Result:', test2.success ? '✓ SUCCESS' : '✗ FAILED');
  console.log('Message:', test2.message);
  console.log('OTP Code:', testOTP);
  if (test2.data) {
    console.log('Response:', JSON.stringify(test2.data, null, 2));
  }
  console.log('');

  // Wait 3 seconds between messages
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('='.repeat(60));
  console.log('TEST 3: Password Reset OTP SMS');
  console.log('='.repeat(60));
  
  const resetOTP = '789012';
  const test3 = await sendPasswordResetOTPSMS(TEST_PHONE, resetOTP);
  
  console.log('Result:', test3.success ? '✓ SUCCESS' : '✗ FAILED');
  console.log('Message:', test3.message);
  console.log('Reset OTP:', resetOTP);
  if (test3.data) {
    console.log('Response:', JSON.stringify(test3.data, null, 2));
  }
  console.log('');

  // Wait 3 seconds between messages
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('='.repeat(60));
  console.log('TEST 4: Welcome SMS');
  console.log('='.repeat(60));
  
  const test4 = await sendWelcomeSMS(TEST_PHONE, 'Calanow');
  
  console.log('Result:', test4.success ? '✓ SUCCESS' : '✗ FAILED');
  console.log('Message:', test4.message);
  if (test4.data) {
    console.log('Response:', JSON.stringify(test4.data, null, 2));
  }
  console.log('');

  console.log('='.repeat(60));
  console.log('TESTING COMPLETE');
  console.log('='.repeat(60));
  console.log('');
  console.log('Summary:');
  console.log('- Test 1 (Simple SMS):', test1.success ? '✓ PASSED' : '✗ FAILED');
  console.log('- Test 2 (OTP SMS):', test2.success ? '✓ PASSED' : '✗ FAILED');
  console.log('- Test 3 (Reset OTP):', test3.success ? '✓ PASSED' : '✗ FAILED');
  console.log('- Test 4 (Welcome SMS):', test4.success ? '✓ PASSED' : '✗ FAILED');
  console.log('');
  
  const allPassed = test1.success && test2.success && test3.success && test4.success;
  
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! SMS integration is working correctly.');
  } else {
    console.log('⚠️  SOME TESTS FAILED. Please check the error messages above.');
  }
  console.log('');
  console.log('Check your phone (925319177) for the SMS messages.');
  console.log('');
}

// Run tests
testSMS()
  .then(() => {
    console.log('Test script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ FATAL ERROR:');
    console.error(error);
    console.error('');
    process.exit(1);
  });
