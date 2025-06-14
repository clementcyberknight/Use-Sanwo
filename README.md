# TrivixPay - Web3 Payroll & Accounting Platform

TrivixPay is a full-stack decentralized application designed to streamline payroll and financial management for modern businesses operating in the Web3 space. It empowers companies to manage and pay their global workforce—both employees and contractors—using cryptocurrency, directly on-chain.

The platform provides a comprehensive suite of tools for financial reporting, transaction management, and payroll automation, all secured with decentralized identity verification through Civic.

## ✨ Key Features

- **📊 Interactive Dashboard**: Get a real-time overview of your company's financial health, including total payroll, upcoming payments, and recent transaction activity.
- **👥 Workforce Management**: Easily add, edit, and manage your employees and contractors. Invite contractors with a unique link to securely connect their wallets.
- **💸 On-Chain Payments**:
  - **Mass Payroll**: Pay multiple employees or contractors in a single, gas-efficient transaction using our custom smart contract.
  - **Individual Payments**: Send one-off payments to contractors with ease.
- **🗓️ Scheduled Payments**: Automate your payroll by setting up weekly or monthly payment schedules. The platform handles the timing, you just ensure the funds are there.
- **📄 Financial Reporting**: Generate detailed financial reports and transaction statements for any date range. Download your data as a PDF for accounting and record-keeping.
- **🔐 Secure & Decentralized**: Built on a robust Web3 stack, using Civic for secure, privacy-preserving authentication and on-chain transactions for payment transparency.

## 🚀 Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/), [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore)
- **Blockchain**:
  - **Networks**: Base Sepolia
  - **Smart Contracts**: [Solidity](https://soliditylang.org/)
- **Web3 Integration**: [Wagmi](https://wagmi.sh/), [Viem](https://viem.sh/)
- **Authentication**: [Civic Pass](https://www.civic.com/)

## 🏁 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later)
- [Yarn](https://yarnpkg.com/) or npm
- A crypto wallet extension like [MetaMask](https://metamask.io/)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/trivixpay.git
    cd trivixpay
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a file named `.env` in the root of your project and add the following environment variables.

    ```env
    # Firebase Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
    NEXT_PUBLIC_FIREBASE_APP_ID=
    NEXT_PUBLIC_MEASUREMENT_ID=

    # Civic Authentication
    NEXT_PUBLIC_CIVIC_CLIENT_ID=

    # Optional Services
    NEXT_PUBLIC_COINGECKO_API_KEY=
    NEXT_PUBLIC_IPAPI_API_KEY=
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔑 Environment Variables

Here's a detailed explanation of the environment variables required to run the application.

- `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase project's API key.
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase project's auth domain (e.g., `your-project-id.firebaseapp.com`).
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project's ID.
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase project's Cloud Storage bucket.
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase project's messaging sender ID.
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase project's app ID for the web app.
- `NEXT_PUBLIC_MEASUREMENT_ID`: Your Google Analytics measurement ID for the Firebase project.

- `NEXT_PUBLIC_CIVIC_CLIENT_ID`: Your client ID from the [Civic Developer Portal](https://developer.civic.com/) for setting up Civic Pass authentication.

- `NEXT_PUBLIC_COINGECKO_API_KEY`: (Optional) An API key from [CoinGecko](https://www.coingecko.com/en/api) to fetch cryptocurrency price data.
- `NEXT_PUBLIC_IPAPI_API_KEY`: (Optional) An API key from a service like [ipapi](https://ipapi.co/) for IP-based geolocation.
