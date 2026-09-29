import { PermissionsAndroid, Platform } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';

// ---------- FILTER (translated from SmsFilter.kt) ----------

const OTP_MARKERS = [
  'otp',
  'one time password',
  'verification code',
];

const PROMO_MARKERS = [
  'offer',
  'discount',
  'cashback offer',
  'win ',
];

const PAYMENT_REQUEST_MARKERS = [
  'has requested',
  'payment request',
  'collect request',
  'requesting payment',
  'requests rs',
  'ignore if already paid',
];

const MERCHANT_ACK_MARKERS = [
  'have received payment',
];

const REMINDER_MARKERS = [
  'is due',
  'min amount due',
  'minimum amount due',
  'in arrears',
  'is overdue',
  'ignore if paid',
];

const TRANSACTION_KEYWORDS = [
  'debited', 'credited', 'withdrawn', 'withdrawal', 'withdrawing', 'deposited',
  'spent', 'received', 'transferred', 'paid', 'credit', 'debit',
];

function containsAny(text, markers) {
  return markers.some((m) => text.includes(m));
}

export function isTransactionMessage(body = '') {
  const lower = body.toLowerCase();

  if (containsAny(lower, OTP_MARKERS)) return false;
  if (containsAny(lower, PROMO_MARKERS)) return false;
  if (containsAny(lower, PAYMENT_REQUEST_MARKERS)) return false;
  if (containsAny(lower, MERCHANT_ACK_MARKERS)) return false;
  if (containsAny(lower, REMINDER_MARKERS)) return false;

  // Special case: "pls pay" combined with "min of" is a reminder
  if (lower.includes('pls pay') && lower.includes('min of')) return false;

  // Must contain at least one transaction keyword
  return containsAny(lower, TRANSACTION_KEYWORDS);
}

// ---------- EXTRACTION ----------

const AMOUNT_PATTERNS = [
  /(?:rs\.?|inr|₹|usd|aed|eur|gbp|\$)\s*([\d,]+(?:\.\d{1,2})?)/i,
  /([\d,]+(?:\.\d{1,2})?)\s*(?:rs\.?|inr|₹|usd|aed|eur|gbp|\$)/i,
];

const BALANCE_CTX = /\b(?:avl\.?\s*bal|available\s*bal(?:ance)?|bal(?:ance)?\s*is)\b\s*(?:rs\.?|inr|₹|usd|aed|eur|gbp|\$)?\s*([\d,]+(?:\.\d{1,2})?)/i;

function extractAmount(body) {
  let working = body;
  let balance = null;

  const balMatch = working.match(BALANCE_CTX);
  if (balMatch) {
    balance = Number(balMatch[1].replace(/,/g, ''));
    working =
      working.slice(0, balMatch.index) +
      ' '.repeat(balMatch[0].length) +
      working.slice(balMatch.index + balMatch[0].length);
  }

  for (const pattern of AMOUNT_PATTERNS) {
    const m = working.match(pattern);
    if (m) return { amount: Number(m[1].replace(/,/g, '')), balance };
  }
  return { amount: null, balance };
}

const MERCHANT_PATTERNS = [
  /(?:paid\s+to|spent\s+on|sent\s+to|to|at|from|towards)\s+([A-Za-z0-9][A-Za-z0-9 .&_@/-]{1,32})/i,
  /\bto\s+([A-Za-z0-9._-]+@[A-Za-z]+)/i,
];

function extractMerchant(body) {
  for (const pattern of MERCHANT_PATTERNS) {
    const m = body.match(pattern);
    if (m && m[1]) {
      let merchant = m[1].trim().replace(/[.,;:]+$/, '');
      merchant = merchant
        .replace(/\b(ending|using|linked|ref|reference|bal|balance|on|dt|dated)\b.*/i, '')
        .trim();
      if (merchant.length >= 2) return merchant;
    }
  }
  return null;
}

const ACCOUNT_REF = /\b(?:a\/c|acct|account|card|vpa|wallet)\s*(?:no\.?|number)?[:.]?\s*[x*\d]+[\d]{2,8}\b|\b[x*]{2,}\d{2,4}\b/i;
const UPI_REF = /\b(?:upi\s*ref|ref\s*no\.?|rrn|txn\s*id|transaction\s*id|utr\s*no\.?)\b\s*[:.-]?\s*([A-Z0-9]{6,})/i;

// ---------- PARSER ----------

export function parseTransaction(sms) {
  const body = (sms.body || '').replace(/\s+/g, ' ').trim();
  const sender = sms.address || '';

  // Gate 1: the Kotlin filter
  if (!isTransactionMessage(body)) return null;

  // Gate 2: extract amount
  const { amount, balance } = extractAmount(body);
  if (!amount || amount <= 0) return null;

  // Gate 3: structural proof
  const refMatch = body.match(UPI_REF);
  const hasProof = ACCOUNT_REF.test(body) || balance !== null || !!refMatch;
  if (!hasProof) return null;

  // Determine type
  const debitIdx = body.search(/\b(debited|spent|withdrawn|paid|sent|deducted|charged)\b/i);
  const creditIdx = body.search(/\b(credited|received|deposited|refunded)\b/i);
  let type = 'debit';
  if (debitIdx !== -1 && creditIdx !== -1) {
    type = debitIdx <= creditIdx ? 'debit' : 'credit';
  } else if (creditIdx !== -1) {
    type = 'credit';
  }

  return {
    id: String(sms._id ?? `${sender}-${sms.date ?? Date.now()}`),
    sender,
    body,
    date: Number(sms.date) || Date.now(),
    amount,
    balance,
    type,
    merchant: extractMerchant(body),
    reference: refMatch ? refMatch[1] : null,
  };
}

// ---------- PERMISSIONS ----------

export async function requestReadSms() {
  if (Platform.OS !== 'android') return false;
  const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_SMS);
  return res === PermissionsAndroid.RESULTS.GRANTED;
}

// ---------- INBOX ----------

function listInboxRaw({ days = 90, maxCount = 1000 } = {}) {
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
      (_count, smsList) => resolve(JSON.parse(smsList))
    );
  });
}

export async function fetchInboxMessages({ days = 90, maxCount = 1000 } = {}) {
  if (Platform.OS !== 'android') return [];
  const allowed = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
  if (!allowed && !(await requestReadSms())) return [];

  const list = await listInboxRaw({ days, maxCount });
  const parsed = list.map(parseTransaction).filter(Boolean);

  // Deduplicate
  const seen = new Set();
  const unique = [];
  for (const tx of parsed) {
    const key = `${tx.sender}|${tx.amount}|${tx.type}|${Math.floor(tx.date / 60000)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(tx);
  }

  console.log(
    `SMS scan: ${list.length} inbox, ${parsed.length} matched, ${unique.length} unique`
  );

  return unique.sort((a, b) => b.date - a.date);
}