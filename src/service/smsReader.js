import * as SMS from 'expo-sms-listener';

// Filter keyword list — matches payment-related messages
const PAYMENT_KEYWORDS = [
  'debited', 'credited', 'spent', 'withdrawn',
  'received', 'paid', 'sent', 'purchase',
  'refund', 'deposited', 'transaction', 'txn',
];

export function isPaymentMessage(body) {
  if (!body) return false;
  const lower = body.toLowerCase();
  return PAYMENT_KEYWORDS.some((kw) => lower.includes(kw));
}

export async function fetchInboxMessages() {
  try {
    // The library exposes readSmsFromInbox; check your installed version
    const raw = await SMS.readSmsFromInbox?.();
    if (!raw || !Array.isArray(raw)) return [];

    return raw
      .filter((m) => isPaymentMessage(m.body))
      .map((m, i) => ({
        id: m._id || String(i),
        sender: m.originatingAddress || m.address || 'Unknown',
        body: m.body || '',
        date: m.date || Date.now(),
      }));
  } catch (err) {
    console.log('Inbox read error:', err);
    return [];
  }
}