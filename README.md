# CashFlow

**An Android-first, privacy-first expense tracker that builds your spending picture from your bank SMS. No bank login, no API connection, no cloud sync.**

CashFlow reads your incoming and existing bank messages on-device, filters them down to payment-related ones, extracts the details that matter, and stores everything locally. Nothing ever leaves the phone.

---

## Features

- **Automatic tracking from SMS.** Reads the device inbox and listens for new messages, with no manual entry.
- **Payment-only filtering.** Uses sender and keyword checks to keep bank and payment messages and drop OTPs, promos, and personal chats.
- **Smart extraction.** Pulls out amount, type (debit or credit), merchant, and date from each message.
- **Minimal dashboard.** Summary cards for **Spent**, **Received**, and **Savings**, followed by a payment message history list.
- **Control panel.** Pinned to the bottom of the dashboard for rescanning messages or clearing all data.
- **Onboarding flow.** Light-themed, with floating 3D finance stickers, a terms-agreement card, and a permission screen with a clear on-device privacy promise.
- **Fully offline.** All parsing and storage happen on the device.

## Privacy

CashFlow is built around one promise: **your data stays on your phone.**

- No bank credentials or API connections
- No cloud sync or server uploads
- No analytics on message content
- SMS access is requested only after a clear explanation, and "Not now" is always available
- "Clear All Data" wipes everything stored locally

## How it works

1. **Read.** The inbox is read through Android's SMS provider (`react-native-get-sms-android`). New messages arrive through a live listener (`expo-sms-listener`).
2. **Filter.** Each message is checked against sender patterns and payment keywords (`debited`, `credited`, `UPI`, `txn`, and so on). OTPs are excluded, and a currency amount must be present.
3. **Extract.** A regex parser pulls the amount, debit/credit type, merchant, and timestamp.
4. **Store.** Parsed transactions are saved locally with AsyncStorage.
5. **Display.** The dashboard aggregates totals and lists the payment history.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Expo + React Native (JSX) |
| Navigation | Expo Router |
| SMS reading | `react-native-get-sms-android` |
| Live SMS | `expo-sms-listener` |
| Local storage | AsyncStorage |
| Builds | EAS Build (cloud APK generation) |

> **Note:** SMS access uses native modules, so the app runs in an Expo **development build**, not Expo Go.

## Project structure

```
cashflow/
├── app/
│   ├── Permission.jsx        # SMS permission screen
│   └── Dashboard.jsx         # Summary + history + control panel
├── components/
│   ├── TransactionHistory.jsx
│   └── ControlPanel.jsx
├── service/
│   └── smsReader.js          # Inbox reading, filtering, and parsing
├── assets/                   # Stickers and images
└── app.json
```

## Getting started

### Prerequisites

- Node.js 18+
- Android device or emulator (SMS reading is Android-only)
- Android Studio, for local builds
- An [Expo](https://expo.dev) account, for EAS builds

### Install

```bash
git clone <your-repo-url>
cd cashflow
npm install
```

### Run locally (development build)

```bash
npx expo prebuild
npx expo run:android
```

Start Metro with a clean cache if you change assets or native packages:

```bash
npx expo start -c
```

### Build an APK with EAS

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

### Android permissions

Declared in `app.json`:

```json
{
  "expo": {
    "android": {
      "permissions": ["READ_SMS", "RECEIVE_SMS"]
    }
  }
}
```

## Testing the parser

On an emulator, send a test SMS from the emulator controls, for example:

```
Rs.450.00 debited from A/c XX1234 to SWIGGY via UPI on 12-09-26
```

Then tap **Rescan Messages** on the dashboard. It should appear in the history list.

## Platform support

- **Android:** fully supported
- **iOS:** not supported, since iOS does not allow apps to read SMS
- **Target markets:** United States and UAE. Message formats, currencies (USD, AED), and sender patterns are being added per market.

## Roadmap

- [x] Onboarding and SMS permission flow
- [x] Inbox reading and payment-message filtering
- [x] Live listener for incoming SMS
- [ ] Amount, type, merchant, and date extraction shown in the UI
- [ ] Persistent local storage with AsyncStorage
- [ ] Spent / Received / Savings summary from real data
- [ ] Working Rescan and Clear All Data controls
- [ ] US and UAE bank message formats (USD and AED)
- [ ] Sender-ID whitelist to reduce false positives
- [ ] Category detection (food, travel, bills)
- [ ] **Agentic AI layer:** watches transactions, detects unused subscriptions, and takes action on the user's behalf, turning a passive tracker into a proactive money assistant

## Google Play note

Google Play restricts `READ_SMS` and `RECEIVE_SMS` to apps whose core functionality depends on them. CashFlow's core feature qualifies, but publishing requires completing the Permissions Declaration Form in Play Console.

## Contributing

Issues and pull requests are welcome. If a bank's SMS format is not parsed correctly, open an issue with a **redacted** sample message (remove account numbers and personal details).

## License

Add your license here (e.g. MIT).
