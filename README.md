# Sanwo – Simple Web3 Payroll & Accounting

**Pay anyone, anywhere, in minutes.**

**Try it now:**

- ⚡ [Get Test Tokens from Faucet](https://sanwo-faucet.vercel.app/)
- 🚀 [Open Live App](https://sanwo-gilt.vercel.app/)
- 🐞 [Report Bugs on GitHub](https://github.com/clementcyberknight/Use-Sanwo)

---

## What Is Sanwo?

Sanwo is a user-friendly app that uses blockchain and USDC stablecoins to make international payments fast, cheap, and transparent.

### Why Use Sanwo?

- **Speed**: Pay your team in 1–3 minutes, not days.
- **Low Fees**: Gas costs are predictable and usually much lower than bank fees.
- **Global**: Anyone with an internet connection and a wallet can get paid.
- **Secure**: Uses Civic for identity checks, so you don’t handle private documents.

_Example_: Need to pay freelancers in 5 countries? Sanwo lets you send one transaction and funds arrive almost instantly.

---

## Main Features with Examples

1. **Dashboard at a Glance**
   See total payroll, next payment date, and recent activity—all in one view.

   - _Example_: "Your next payroll run is on June 20, 2025 for 10 team members."

2. **Add & Manage People**
   Invite employees or contractors by sending a secure wallet link—no paperwork.

   - _Example_: Click “Invite” → enter email → they connect with Civic → they show up on your dashboard.

3. **Batch Payments**
   Send payroll to many wallets in one gas-optimized transaction.

   - _Example_: Run monthly salaries for 20 people with one click.

4. **One-Off Payments**
   Pay a vendor or contractor any time without setting up a full payroll.

   - _Example_: Send a \$200 invoice payment instantly.

5. **Scheduled Payments**
   Set up automatic weekly or monthly runs so you never miss payday.

   - _Example_: "Every 1st of the web
   - month, pay staff salaries automatically."

6. **Easy Reports & Exports**
   Generate PDFs for any date range. Perfect for accounting or audits.

   - _Example_: Download "June 2025 Payroll Report" as a PDF in seconds.

7. **Secure Login**
   Uses Civic Auth for private, on-chain identity checks.

   - _Example_: No more sharing copies of passports. Your team connects via wallet.

---

## Quick Start Guide

1. **Get the Code**

   ```bash
   git clone https://github.com/clementcyberknight/Use-Sanwo.git
   cd Use-Sanwo
   ```

2. **Install**

   ```bash
   npm install   # or yarn install
   ```

3. **Set Up Keys**

   ```bash
   cp .env.example .env.local
   ```

   Open `.env.local` and add your Firebase and Civic API keys.

4. **Run Locally**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` in your browser.

---

## Environment Variables

| Name                             | Purpose                    | Required |
| -------------------------------- | -------------------------- | -------- |
| NEXT_PUBLIC_FIREBASE_API_KEY     | Firebase setup             | Yes      |
| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN | Firebase authentication    | Yes      |
| NEXT_PUBLIC_FIREBASE_PROJECT_ID  | Firebase project           | Yes      |
| NEXT_PUBLIC_CIVIC_CLIENT_ID      | Civic Auth ID              | Yes      |
| NEXT_PUBLIC_COINGECKO_API_KEY    | Coin data (optional)       | No       |
| NEXT_PUBLIC_IPAPI_API_KEY        | Location lookup (optional) | No       |

---

## Quick Peek at Code Structure

```
Use-Sanwo/
├── backend/
├── contracts/        # Solidity smart contracts
├── public/           # Images and static files
└── src/app/
    ├── account/      # Dashboard and payroll pages
    ├── components/   # Reusable UI pieces
    └── providers.tsx # App-wide settings
```

---

## How Sanwo Compares to Banks

| Feature          | Traditional Banks        | Sanwo Web3                |
| ---------------- | ------------------------ | ------------------------- |
| **Speed**        | 3–7 business days        | 1–3 minutes               |
| **Fees**         | High & variable          | Predictable low gas fees  |
| **Global**       | Limited by banking rails | Borderless, internet only |
| **Currency**     | Local fiat               | USDC stablecoin           |
| **Transparency** | Hidden intermediaries    | On-chain audit trails     |

---

## How Sanwo Auto Payment Schedule Work

Sanwo simplifies payroll management with its automated scheduled payment feature. Here's how it works under the hood:

1.  **Setting Up the Schedule:** Businesses configure their desired payment schedule through the Sanwo interface. This includes setting the:

    - **Payment Interval:** (e.g., Weekly, Monthly)
    - **Payment Day:**
      - **Monthly:** A specific date (e.g., the 15th), or "Last working day."
      - **Weekly:** A specific day of the week (e.g., Monday).

    Sanwo stores these settings within the business's document in Firebase.

2.  **Google Cloud Scheduler:** We utilize Google Cloud Scheduler to trigger a Cloud Functions endpoint on a recurring schedule. This schedule is set to "every day 00:00 UTC" to ensure daily checks for due payments.

3.  **Payroll Schedule Check:** When the Cloud Function is triggered (the `scheduledPayrollWorker` function), it performs the following steps:

    - **Fetches Businesses:** It retrieves all businesses from the "businesses" collection in Firestore.
    - **Iterates Through Businesses:** For each business, it checks:
      - If a `nextPaymentDate` is set.
      - If the `nextPaymentDate` is in the past (i.e., payroll is due).
    - **Processes Due Payrolls:** If payroll is due, the function:
      - **Fetches Workers:** Retrieves all active workers associated with that business from the "workers" subcollection.
      - **Processes Each Worker:** For each active worker with a defined salary and wallet address:
        - **Sends Payroll Data to API:** This step (using the `sendPayrollDataToAPI` function) is intended to trigger the actual payment (details below). It logs success or failure.
        - **Sends Worker Payment Email:** Notifies the worker via email that a payment has been processed. It also logs success or failure.
      - **Sends Company Payroll Report Email:** Sends a summary email to the business owner (or designated contact) with details of successful and failed payments.
      - **Calculates Next Payment Date:** Based on the `paymentInterval` and `paymentDay` settings, it determines the next payment date using the `calculateNextPaymentDate` function.
      - **Updates Firestore:**
        - Updates the `nextPaymentDate` in the business's document in the "businesses" collection.
        - Updates the "payroll_schedules" subcollection with the new `nextPaymentDate` and schedule information.

4.  **Admin Backend Wallet Signing:** Sanwo use an admin backend wallet that signs the worker salary payment when payroll is scheduled and release payment to worker .

5.  **Error Handling:** Throughout the process, the Cloud Function employs robust error handling and logging to ensure that any issues are captured and can be investigated.

Ready to streamline your payroll? Try Sanwo today!
