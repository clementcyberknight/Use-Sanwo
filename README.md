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

* **Speed**: Pay your team in 1–3 minutes, not days.
* **Low Fees**: Gas costs are predictable and usually much lower than bank fees.
* **Global**: Anyone with an internet connection and a wallet can get paid.
* **Secure**: Uses Civic for identity checks, so you don’t handle private documents.

*Example*: Need to pay freelancers in 5 countries? Sanwo lets you send one transaction and funds arrive almost instantly.

---

## Main Features with Examples

1. **Dashboard at a Glance**
   See total payroll, next payment date, and recent activity—all in one view.

   * *Example*: "Your next payroll run is on June 20, 2025 for 10 team members."

2. **Add & Manage People**
   Invite employees or contractors by sending a secure wallet link—no paperwork.

   * *Example*: Click “Invite” → enter email → they connect with Civic → they show up on your dashboard.

3. **Batch Payments**
   Send payroll to many wallets in one gas-optimized transaction.

   * *Example*: Run monthly salaries for 20 people with one click.

4. **One-Off Payments**
   Pay a vendor or contractor any time without setting up a full payroll.

   * *Example*: Send a \$200 invoice payment instantly.

5. **Scheduled Payments**
   Set up automatic weekly or monthly runs so you never miss payday.

   * *Example*: "Every 1st of the web
   * month, pay staff salaries automatically."

6. **Easy Reports & Exports**
   Generate PDFs for any date range. Perfect for accounting or audits.

   * *Example*: Download "June 2025 Payroll Report" as a PDF in seconds.

7. **Secure Login**
   Uses Civic Auth for private, on-chain identity checks.

   * *Example*: No more sharing copies of passports. Your team connects via wallet.

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

| Name                                 | Purpose                    | Required |
| ------------------------------------ | -------------------------- | -------- |
| NEXT\_PUBLIC\_FIREBASE\_API\_KEY     | Firebase setup             | Yes      |
| NEXT\_PUBLIC\_FIREBASE\_AUTH\_DOMAIN | Firebase authentication    | Yes      |
| NEXT\_PUBLIC\_FIREBASE\_PROJECT\_ID  | Firebase project           | Yes      |
| NEXT\_PUBLIC\_CIVIC\_CLIENT\_ID      | Civic Auth ID              | Yes      |
| NEXT\_PUBLIC\_COINGECKO\_API\_KEY    | Coin data (optional)       | No       |
| NEXT\_PUBLIC\_IPAPI\_API\_KEY        | Location lookup (optional) | No       |

---

## Quick Peek at Code Structure

```
Use-Sanwo/
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

Ready to streamline your payroll? Try Sanwo today!
