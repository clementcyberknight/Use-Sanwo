# Sanwo - Web3 Payroll & Accounting Platform

<p align="center">
  <strong>Pay anyone, anywhere, in minutes.</strong>
</p>
<p align="center">
  <a href="https://sanwo-faucet.vercel.app/"><strong>Claim Sanwo Utility Token($MUSDC)</strong></a> ·
  <a href="http://localhost:3000/"><strong>Live App</strong></a> ·
  <a href="https://github.com/clementcyberknight/Use-Sanwo"><strong>Report a Bug</strong></a>
</p>

## Overview

Sanwo is a full-stack decentralized application for managing payroll and financial operations on-chain. By leveraging USDC stablecoins and blockchain technology, we replace slow and costly international bank transfers with a fast, transparent, and affordable solution.

Our platform integrates with **Civic** for secure, decentralized identity verification, enabling businesses to confidently support global payments to both employees and contractors.

## Key Features

-   **Interactive Dashboard**: Real-time view of payroll totals, upcoming disbursements, and recent financial activity.
-   **Workforce Management**: Seamlessly add, edit, and manage employees and contractors. Onboard team members with secure, wallet-based invitations.
-   **On-Chain Payments**:
    -   **Mass Payroll**: Execute multi-recipient payroll runs in a single, gas-optimized transaction.
    -   **Individual Payments**: Process one-off payments to vendors or contractors instantly.
-   **Scheduled Payments**: Automate weekly or monthly payrolls to ensure consistent, on-time payments.
-   **Financial Reporting**: Generate detailed financial reports for any date range and export them as PDFs for record-keeping.
-   **Secure Authentication**: Employs **Civic Auth** for privacy-preserving, decentralized identity management.

## Civic Use Case: Decentralized Identity for Payroll

Sanwo's integration with Civic is fundamental to our mission of providing a secure and trustworthy payroll platform.

-   **Secure Onboarding**: Businesses can invite employees and contractors to connect their wallets without handling or storing sensitive personal documents. Civic's identity layer reduces security risks for the business and protects user privacy.
-   **Tamper-Proof Audit Trails**: By linking a verified identity to an on-chain wallet address, Civic helps create a robust and auditable trail for every transaction. This is crucial for financial compliance and transparent reporting.

By integrating Civic, Sanwo not only streamlines the onboarding process but also adds a critical layer of trust and security, making it a reliable solution for the future of on-chain finance.

## Getting Started   

<a href="https://sanwo-faucet.vercel.app/"><strong>Claim Sanwo Utility Token($MUSDC)</strong></a>

### Prerequisites

-   Node.js (v18 or later)
-   Yarn or npm

### Installation & Setup

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/clementcyberknight/Use-Sanwo.git
    cd Use-Sanwo
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set Up Environment Variables**:
    Create a `.env.local` file by copying the example file:
    ```bash
    cp .env.example .env.local
    ```
    Populate `.env.local` with your keys from Firebase and Civic.

4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## Environment Variables

| Variable | Description | Required |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key | **Yes** |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | **Yes** |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | **Yes** |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`| Firebase Storage Bucket | **Yes** |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`| Firebase Messaging Sender ID | **Yes** |
| `NEXT_PUBLIC_FIREBASE_APP_ID`| Firebase App ID | **Yes** |
| `NEXT_PUBLIC_CIVIC_CLIENT_ID` | Civic Auth Client ID | **Yes** |
| `NEXT_PUBLIC_IPAPI_API_KEY` | IPAPI Geolocation API Key | Optional |
| `NEXT_PUBLIC_COINGECKO_API_KEY`| CoinGecko API Key | Optional |
| `NEXT_PUBLIC_MEASUREMENT_ID` | Google Analytics Measurement ID | Optional |

## Project Structure

The project follows the Next.js App Router structure.

```
/
├── contracts/              # Solidity contracts and ABI
├── public/                 # Static assets
└── src/app/
    │   ├── account/        # Core dashboard and management pages
    │   ├── components/     # Reusable React components
    │   └── ...
    ├── contractor_connect/ # Public-facing page for contractors
    ├── staff_connect/      # Public-facing page for employees
    ├── config/             # Firebase configuration
    ├── layout.tsx          # Root layout
    └── providers.tsx       # Client-side context providers
```

## Comparison with Traditional Payroll

| Feature | Traditional Web2 Payroll | Sanwo (Web3 Payroll) |
| :--- | :--- | :--- |
| **Payment Speed** | 3-7 business days | **1-3 minutes** |
| **Transaction Fees** | High and variable | Low, predictable gas fees |
| **Global Reach** | Limited by banking rails | Borderless, requires only internet |
| **Currency** | Local fiat currencies | Stablecoin (**USDC**) |
| **Transparency** | Opaque financial intermediaries | On-chain, publicly auditable |
| **Data Security** | Centralized server risk | Decentralized, user-controlled identity |
| **Admin Overhead** | High compliance burden | Simplified, direct-to-wallet flow |