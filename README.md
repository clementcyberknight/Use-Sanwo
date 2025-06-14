# Sanwo - Web3 Payroll & Accounting Platform

**Overview**
Sanwo enables businesses to pay anyone, anywhere, in minutes. By leveraging USDC stablecoins and blockchain technology, we replace slow and costly international bank transfers with a fast, transparent, and affordable solution.

Sanwo is a full-stack decentralized application for managing payroll and financial operations on-chain. It integrates with Civic for secure identity verification and supports global payments to both employees and contractors.

## Key Features

* **Interactive Dashboard**: Real-time view of payroll totals, upcoming disbursements, and recent transactions.
* **Workforce Management**: Add, edit, and manage employees and contractors. Send secure invitations to connect wallets.
* **On-Chain Payments**

  * **Mass Payroll**: Execute multi-recipient payroll in a single, gas-optimized transaction.
  * **Individual Payments**: Process one-off payments quickly.
* **Scheduled Payments**: Automate weekly or monthly payrolls; ensure funds are available.
* **Financial Reporting**: Generate detailed reports for any date range; export as PDF for records.
* **Secure Authentication**: Uses Civic Auth for privacy-preserving, decentralized identity verification.

## Tech Stack

* **Frontend**: Next.js, React, Tailwind CSS, Framer Motion
* **Backend**: Firebase Firestore
* **Blockchain**: Base Sepolia network; smart contracts in Solidity
* **Web3**: Wagmi, Viem
* **Authentication**: Civic Auth

## Getting Started

### Prerequisites

* Node.js (v18 or later)
* npm or Yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/clementcyberknight/Use-Sanwo.git
   cd Use-Sanwo
   ```
2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```
3. Create a `.env` file in the project root with the following variables:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   NEXT_PUBLIC_MEASUREMENT_ID=

   NEXT_PUBLIC_CIVIC_CLIENT_ID=

   # Optional
   NEXT_PUBLIC_COINGECKO_API_KEY=
   NEXT_PUBLIC_IPAPI_API_KEY=
   ```
4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Visit [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable                                   | Description                             |
| ------------------------------------------ | --------------------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | Firebase API key                        |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain                    |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Firebase project ID                     |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket                 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID            |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Firebase app ID for the web app         |
| `NEXT_PUBLIC_MEASUREMENT_ID`               | Google Analytics measurement ID         |
| `NEXT_PUBLIC_CIVIC_CLIENT_ID`              | Civic Auth client ID for authentication |
| `NEXT_PUBLIC_COINGECKO_API_KEY`            | (Optional) CoinGecko API key            |
| `NEXT_PUBLIC_IPAPI_API_KEY`                | (Optional) IPAPI geolocation API key    |

## Project Structure

```
Directory structure:
└── clementcyberknight-use-sanwo.git/
    ├── README.md
    ├── next.config.mjs
    ├── package.json
    ├── postcss.config.js
    ├── postcss.config.mjs
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── worker.csv
    ├── .eslintrc.json
    ├── contracts/
    │   ├── abi.json
    │   ├── EmployerPool.sol
    │   └── utils.ts
    └── src/
        └── app/
            ├── globals.css
            ├── layout.tsx
            ├── manifest.json
            ├── page.js
            ├── provider.tsx
            ├── about/
            │   └── page.js
            ├── account/
            │   ├── layout.js
            │   ├── accounting/
            │   │   └── page.js
            │   ├── contractors/
            │   │   └── page.tsx
            │   ├── dashboard/
            │   │   └── page.js
            │   ├── investment/
            │   │   └── page.js
            │   ├── pay_worker/
            │   │   └── page.tsx
            │   ├── payroll/
            │   │   └── page.js
            │   ├── scheduled-payments/
            │   │   └── page.js
            │   ├── wallet/
            │   │   └── page.tsx
            │   └── workers/
            │       └── page.js
            ├── auth/
            │   ├── login/
            │   │   └── page.tsx
            │   └── signup/
            │       └── page.tsx
            ├── book-demo/
            │   └── page.js
            ├── components/
            │   ├── FinancialReportPDF.js
            │   ├── header.js
            │   ├── side_menu.tsx
            │   ├── TransactionDetailsModal.tsx
            │   ├── TransactionStatementPDF.js
            │   ├── waitlist.js
            │   ├── walletdeposit.tsx
            │   ├── WalletModal.tsx
            │   └── walletsend.tsx
            ├── config/
            │   └── FirebaseConfig.js
            ├── contractor_connect/
            │   └── [company_id]/
            │       └── [contractor_id]/
            │           └── page.js
            ├── fonts/
            │   ├── Aeonik.otf
            │   ├── AeonikTRIAL-Bold.otf
            │   ├── AeonikTRIAL-BoldItalic.otf
            │   ├── AeonikTRIAL-Light.otf
            │   ├── AeonikTRIAL-LightItalic.otf
            │   ├── AeonikTRIAL-RegularItalic.otf
            │   ├── GeistMonoVF.woff
            │   └── GeistVF.woff
            ├── pricing/
            │   └── page.js
            ├── product/
            │   └── page.js
            └── staff_connect/
                └── [company_id]/
                    └── [worker_id]/
                        └── page.js

```

## Comparison with Traditional Payroll

| Feature          | Traditional Web2 Payroll | Sanwo (Web3 Payroll)           |
| ---------------- | ------------------------ | ------------------------------ |
| Payment Speed    | 3-7 business days        | 1-3 minutes                    |
| Transaction Fees | High and variable        | Low, predictable gas fees      |
| Currency         | Local fiat               | Stablecoin (USDC)              |
| Global Reach     | Limited                  | Borderless, internet-enabled   |
| Admin Overhead   | High compliance burden   | Simplified, direct-to-wallet   |
| Transparency     | Opaque                   | On-chain, auditable            |
| Data Security    | Centralized              | Decentralized, user-controlled |

```}
```
