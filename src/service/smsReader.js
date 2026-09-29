import { PermissionsAndroid, Platform } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';

// ---------- Structured Regex Rules ----------

// 1. Exclude explicit OTP patterns safely
const OTP = /\b(otp|one[- ]time password|verification code|verify\s?your|secret code|two-factor)\b/i;

// 2. Modified Promo: Separated into structural vs aggressive marketing keywords
const PROMO_WORDS = /\b(win|winner|lucky draw|sale|deal|coupon|loan offer|pre-?approved|apply now|limited period|lottery|prize|instant loan|credit card offer|zero cost emi)\b/i;

// 3. Robust Amount Extraction (Handles spaces, symbols, international decimal variants)
const AMOUNT = /(?:rs\.?|inr|₹|vpa)\s*([\d,]+(?:\.\d{1,2})?)/i;

// 4. Strong Account Identifiers (Handles tight concatenation like 'A/cX0123' or 'Acct..XX12')
const ACCOUNT_REF = /\b(a\/c|acct|account|card|vpa|wallet|paytm|wallet)\b.*?\d{2,8}|\b[x*]+\d{4}\b/i;

// 5. UPI / Transaction references 
const UPI_REF = /\b(upi\s*ref|ref\s*no\.?|txn\s*id|transaction\s*id|upi[:/]|utr\s*no\.?)\b/i;

// 6. Available Balance (The single strongest proof signal of a genuine banking layout)
const AVL_BAL = /\b(avl\.?\s*bal|available\s*(bal(?:ance)?|limit)|bal\s*is|bal:\s*(?:rs|inr|₹))\b/i;

// 7. Context-Aware Verbs (Bound closely to past-tense events)
const DEBIT = /\b(debited|debit|dr\.?|spent|withdraw(?:n|al)?|paid|payment\s+of|purchase(?:d)?|sent|deducted|charged|transacted)\b/i;
const CREDIT = /\b(credited|credit|cr\.?|received|deposit(?:ed)?|refund(?:ed)?)\b/i;

// 8. Dynamic Merchant Parser (Captures anything immediately following common conjunction patterns)
const MERCHANT = /(?:\bto\b|\bat\b|vpa\b|towards\b|spent\s+on\s+|paid\s+to\s+)\s*([A-Za-z0-9][A-Za-z0-9 .&_-]{1,24})/i;

// 9. Legitimate Sender Identification (Indian DLT Framework compliance checking)
const LOOKS_LIKE_PHONE_NUMBER = /^\+?\d{9,13}\$/;
const looksLikeBankSender = (address = '') => {
  const cleanAddr = address.trim();
  if (LOOKS_LIKE_PHONE_NUMBER.test(cleanAddr)) return false;
  // Indian Bank transactional headers safely require a hyphenated corporate suffix (e.g., -HDFCBK, -T)
  return cleanAddr.includes('-') || cleanAddr.length >= 5;
};

const FINANCE_HINT = /\b(debit|credit|spent|withdraw|paid|payment|purchase|sent|deducted|charged|received|deposit|refund|a\/c|acct|account|upi|bal)\b/i;

export function parseTransaction(sms) {
  const rawBody = sms.body || '';
  // Sanitize white space anomalies natively forced by telecom aggregators
  const body = rawBody.replace(/\s+/g, ' ').trim();
  const sender = sms.address || '';

  // Step 1: Drop OTP strings immediately
  if (OTP.test(body)) return null;

  // Step 2: Amount Validation (Crucial gatekeeper step)
  const amountMatch = body.match(AMOUNT);
  if (!amountMatch) return null;

  // Step 3: Hard Structural Proof Checks
  // A transaction must include an account reference, UPI track record, or a balance confirmation
  const hasProof = ACCOUNT_REF.test(body) || UPI_REF.test(body) || AVL_BAL.test(body);
  if (!hasProof) return null;

  // Step 4: Strict Action Classification
  const debitMatch = body.match(DEBIT);
  const creditMatch = body.match(CREDIT);
  if (!debitMatch && !creditMatch) return null;

  // Step 5: Advanced Promo Filtering 
  // If it matches promo terms, ensure it's not a legitimate transactional statement (e.g. Cashback)
  if (PROMO_WORDS.test(body)) {
    const cashBackContext = /\b(cashback\s+(received|credited)|credited\s+back)\b/i.test(body);
    if (!cashBackContext) return null; // Reject if it's pure marketing spam
  }

  // Determine actual action chronology to prevent double match collisions
  let type = 'debit';
  if (debitMatch && creditMatch) {
    type = debitMatch.index <= creditMatch.index ? 'debit' : 'credit';
  } else if (creditMatch) {
    type = 'credit';
  }

  // Step 6: Smart Merchant Extraction
  let merchant = null;
  const merchantMatch = body.match(MERCHANT);
  if (merchantMatch && merchantMatch[1]) {
    const rawMerchant = merchantMatch[1].trim();
    // Strip redundant standard bank string noise or terminal boundaries
    merchant = rawMerchant.replace(/\b(ending|using|linked|ref|for|on|bal|is)\b.*/i, '').trim();
    if (merchant.length < 2) merchant = null;
  }

  return {
    id: String(sms._id ?? `${sender}-${sms.date}`),
    sender,
    body,
    date: Number(sms.date) || Date.now(),
    amount: Number(amountMatch[1].replace(/,/g, '')),
    type,
    merchant,
    likelyBank: looksLikeBankSender(sender),
  };
}

// Keep your existing permission and debug frameworks intact...
export function debugSms(body) {
  console.log('--- SMS DEBUG ---');
  console.log('body:', body);
  console.log('is OTP:', OTP.test(body));
  console.log('is PROMO:', PROMO_WORDS.test(body));
  const amountMatch = body.match(AMOUNT);
  console.log('has AMOUNT:', !!amountMatch, amountMatch?.[0]);
  console.log('has ACCOUNT_REF:', ACCOUNT_REF.test(body));
  console.log('has UPI_REF:', UPI_REF.test(body));
  console.log('has AVL_BAL:', AVL_BAL.test(body));
  const debitMatch = body.match(DEBIT);
  const creditMatch = body.match(CREDIT);
  console.log('DEBIT match:', debitMatch?.[0] ?? 'none');
  console.log('CREDIT match:', creditMatch?.[0] ?? 'none');
  console.log('-----------------');
}

export async function requestReadSms() {
  if (Platform.OS !== 'android') return false;
  const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_SMS);
  return res === PermissionsAndroid.RESULTS.GRANTED;
}

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

  const debitCount = parsed.filter((t) => t.type === 'debit').length;
  const creditCount = parsed.filter((t) => t.type === 'credit').length;
  console.log(`SMS scan: ${list.length} in inbox, ${parsed.length} matched (${debitCount} debit, ${creditCount} credit)`);

  return parsed.sort((a, b) => b.date - a.date);
}

export async function scanRejectedFinanceMessages({ days = 90, maxCount = 1000 } = {}) {
  if (Platform.OS !== 'android') return;
  const allowed = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
  if (!allowed && !(await requestReadSms())) return;

  const list = await listInboxRaw({ days, maxCount });
  let shown = 0;

  for (const sms of list) {
    const body = (sms.body || '').trim();
    if (!FINANCE_HINT.test(body)) continue; 
    const result = parseTransaction(sms);
    if (result) continue; 

    if (shown >= 15) break; 
    shown++;
    console.log(`\n--- REJECTED #${shown} (sender: ${sms.address}) ---`);
    console.log(body);
    console.log(
      'reasons ->',
      OTP.test(body) ? 'OTP ' : '',
      PROMO_WORDS.test(body) ? 'PROMO ' : '',
      !AMOUNT.test(body) ? 'NO_AMOUNT ' : '',
      !(ACCOUNT_REF.test(body) || UPI_REF.test(body) || AVL_BAL.test(body)) ? 'NO_PROOF ' : '',
      !(DEBIT.test(body) || CREDIT.test(body)) ? 'NO_VERB ' : ''
    );
  }
  console.log(`\nDone. ${shown} rejected finance-shaped messages shown.`);
}
