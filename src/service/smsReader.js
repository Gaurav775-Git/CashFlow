import { PermissionsAndroid, Platform } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';

// ---------- FILTER ----------

const OTP_MARKERS = ['otp', 'one time password', 'verification code'];
const PROMO_MARKERS = ['offer', 'discount', 'cashback offer', 'win '];
const PAYMENT_REQUEST_MARKERS = [
  'has requested', 'payment request', 'collect request',
  'requesting payment', 'requests rs', 'ignore if already paid',
];
const MERCHANT_ACK_MARKERS = ['have received payment'];
const REMINDER_MARKERS = [
  'is due', 'min amount due', 'minimum amount due', 'in arrears',
  'is overdue', 'ignore if paid',
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
  if (lower.includes('pls pay') && lower.includes('min of')) return false;
  return containsAny(lower, TRANSACTION_KEYWORDS);
}

// ---------- AMOUNT EXTRACTION ----------

const BALANCE_CTX = /\b(?:avl\.?\s*bal|available\s*bal(?:ance)?|bal(?:ance)?\s*is)\b\s*(?:rs\.?|inr|₹|usd|aed|eur|gbp|\$)?\s*([\d,]+(?:\.\d{1,2})?)/i;

// Amount patterns, in priority order. The "debited by X" form is now included.
const AMOUNT_PATTERNS = [
  // "debited by 150.00", "credited by 1200", "spent 500", "paid 99.50"
  /\b(?:debited|credited|spent|paid|withdrawn|deposited|received|sent|transferred)\s*(?:by|of|with|for|rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  // Currency prefix: "Rs.500", "INR 1,200", "₹99"
  /(?:rs\.?|inr|₹|usd|aed|eur|gbp|\$)\s*([\d,]+(?:\.\d{1,2})?)/i,
  // Currency suffix: "500 Rs", "1200 INR"
  /([\d,]+(?:\.\d{1,2})?)\s*(?:rs\.?|inr|₹|usd|aed|eur|gbp|\$)/i,
];

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

// ---------- MERCHANT EXTRACTION ----------

// Added "trf to" and "transfer to" before plain "to"
const MERCHANT_PATTERNS = [
  /\b(?:trf\s+to|transfer(?:red)?\s+to|paid\s+to|spent\s+on|sent\s+to|towards)\s+([A-Za-z][A-Za-z0-9 .&_@/-]{1,32})/i,
  /\b(?:to|at|from)\s+([A-Za-z][A-Za-z0-9 .&_@/-]{1,32})/i,
  /\bto\s+([A-Za-z0-9._-]+@[A-Za-z]+)/i,
];

function extractMerchant(body) {
  for (const pattern of MERCHANT_PATTERNS) {
    const m = body.match(pattern);
    if (m && m[1]) {
      let merchant = m[1]
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/[.,;:]+$/, '');
      merchant = merchant
        .replace(
          /\b(ending|using|linked|ref|reference|refno|bal|balance|on|dt|dated|if not|call|for other)\b.*/i,
          ''
        )
        .trim();
      if (merchant.length >= 2) return merchant;
    }
  }
  return null;
}

// ---------- REFERENCE / ACCOUNT ----------

// Added "refno" (one word) alongside "ref no"
const UPI_REF = /\b(?:upi\s*ref(?:no)?|ref(?:erence)?\s*(?:no|number|#)?|refno|rrn|txn\s*id|transaction\s*id|utr\s*no)\b\s*[:.#-]?\s*([A-Z0-9]{6,})/i;

const ACCOUNT_REF = /\b(?:a\/c|acct|account|card|vpa|wallet)\s*(?:no\.?|number)?[:.]?\s*[x*\d]+[\d]{2,8}\b|\b[x*]{2,}\d{2,4}\b/i;

// ---------- DATE EXTRACTION ----------

// Handles: "28Sep26", "28 Sep 26", "28-Sep-2026", "28/09/26", "2026-09-28"
const DATE_PATTERNS = [
  /\b(\d{1,2})[-\s]?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[-\s]?(\d{2,4})\b/i,
  /\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b/,
  /\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/,
];

const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

function extractDate(body, fallbackTs) {
  // Named-month formats: "28Sep26", "28 Sep 2026"
  const namedMatch = body.match(DATE_PATTERNS[0]);
  if (namedMatch) {
    const day = Number(namedMatch[1]);
    const month = MONTHS.indexOf(namedMatch[2].toLowerCase().slice(0, 3));
    let year = Number(namedMatch[3]);
    if (year < 100) year += 2000;
    if (month >= 0 && day >= 1 && day <= 31) {
      return new Date(year, month, day).getTime();
    }
  }

  // Numeric d/m/y: "28/09/26"
  const dmyMatch = body.match(DATE_PATTERNS[1]);
  if (dmyMatch) {
    let day = Number(dmyMatch[1]);
    let month = Number(dmyMatch[2]) - 1;
    let year = Number(dmyMatch[3]);
    if (year < 100) year += 2000;
    // If day > 12 and month <= 12, likely already d/m/y
    if (day > 12 && month + 1 <= 12) {
      return new Date(year, month, day).getTime();
    }
    // Fallback: assume d/m/y for Indian bank SMS
    if (day <= 31 && month >= 0 && month <= 11) {
      return new Date(year, month, day).getTime();
    }
  }

  // Numeric y/m/d: "2026-09-28"
  const ymdMatch = body.match(DATE_PATTERNS[2]);
  if (ymdMatch) {
    const year = Number(ymdMatch[1]);
    const month = Number(ymdMatch[2]) - 1;
    const day = Number(ymdMatch[3]);
    return new Date(year, month, day).getTime();
  }

  return fallbackTs;
}

// ---------- PARSER ----------

export function parseTransaction(sms) {
  const body = (sms.body || '').replace(/\s+/g, ' ').trim();
  const sender = sms.address || '';

  if (!isTransactionMessage(body)) return null;

  const { amount, balance } = extractAmount(body);
  if (!amount || amount <= 0) return null;

  const refMatch = body.match(UPI_REF);
  const hasProof = ACCOUNT_REF.test(body) || balance !== null || !!refMatch;
  if (!hasProof) return null;

  const debitIdx = body.search(/\b(debited|spent|withdrawn|paid|sent|deducted|charged|trf)\b/i);
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
    date: extractDate(body, Number(sms.date) || Date.now()),
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