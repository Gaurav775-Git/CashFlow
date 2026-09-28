import { PermissionsAndroid, Platform } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';

const OTP = /\b(otp|one[- ]time password|verification code)\b/i;
const AMOUNT = /(?:rs\.?|inr|₹)\s*[\d,]+(?:\.\d{1,2})?/i;
const FINANCE =
  /\b(debited|credited|spent|withdrawn|paid|received|purchase|txn|transaction|upi|a\/c|acct|neft|imps|rtgs)\b/i;

// Returns a message shaped for your existing TransactionHistory, or null if not a payment SMS
export function parseTransaction(sms) {
  const body = sms.body || '';
  if (OTP.test(body)) return null;
  if (!FINANCE.test(body) || !AMOUNT.test(body)) return null;

  const amount = Number(body.match(AMOUNT)[0].replace(/[^\d.]/g, ''));

  return {
    id: String(sms._id ?? `${sms.address}-${sms.date}`),
    sender: sms.address,
    body,
    date: Number(sms.date) || Date.now(),
    amount,
  };
}

export async function requestReadSms() {
  if (Platform.OS !== 'android') return false;
  const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_SMS);
  return res === PermissionsAndroid.RESULTS.GRANTED;
}

export async function fetchInboxMessages({ days = 90, maxCount = 1000 } = {}) {
  if (Platform.OS !== 'android') return [];

  const allowed = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
  if (!allowed && !(await requestReadSms())) return [];

  const filter = {
    box: 'inbox',
    maxCount,
    minDate: Date.now() - days * 24 * 60 * 60 * 1000,
  };

  return new Promise((resolve) => {
    SmsAndroid.list(
      JSON.stringify(filter),
      (err) => {
        console.warn('SMS read failed:', err);
        resolve([]);
      },
      (_count, smsList) => {
        const list = JSON.parse(smsList);
        resolve(
          list
            .map(parseTransaction)
            .filter(Boolean)
            .sort((a, b) => b.date - a.date)
        );
      }
    );
  });
}