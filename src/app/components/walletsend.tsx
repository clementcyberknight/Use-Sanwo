"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, Send, Loader2 } from "lucide-react";
import {
  db,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from "@/app/config/FirebaseConfig";
import EmployerPool from "../../../contracts/abi.json";
import {
  EmployerPoolContractAddress,
  MOCK_USDC,
  base_sepolia_scan,
} from "../../../contracts/utils";
import { useAccount, useWriteContract } from "wagmi";
import { parseUnits, isAddress } from "viem";
import { baseSepolia } from "viem/chains";
import { useUser } from "@civic/auth-web3/react";
import { useAutoConnect } from "@civic/auth-web3/wagmi";

const EMPLOYER_POOL_ABI = EmployerPool;

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { y: "100vh", opacity: 0 },
  visible: {
    y: "-50%",
    opacity: 1,
    transition: { delay: 0.1, duration: 0.4, type: "spring", stiffness: 100 },
  },
  exit: { y: "100vh", opacity: 0 },
};

interface WalletSendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletSendModal: React.FC<WalletSendModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [sendAmount, setSendAmount] = useState<string>("");
  const [selectedToken] = useState<string>("USDC");
  const [withdrawalCategory, setWithdrawalCategory] =
    useState<string>("vendor");
  const [txStatusMessage, setTxStatusMessage] = useState<string>("");
  const [isValidRecipient, setIsValidRecipient] = useState<boolean>(true);

  useUser();
  useAutoConnect();
  const { address: businessAddress, isConnected } = useAccount();

  const {
    writeContract: transferByEmployer,
    data: txHash,
    isPending: isLoading,
    isSuccess,
    isError,
    error: writeError,
    reset: resetWriteContract,
  } = useWriteContract();

  const withdrawalCategories = [
    { value: "vendor", label: "Vendor Payment" },
    { value: "refund", label: "Refund" },
    { value: "investment", label: "Investment Return" },
    { value: "operational", label: "Operational Expense" },
    { value: "dividend", label: "Dividend Payout" },
    { value: "partner", label: "Partner Withdrawal" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    if (recipientAddress === "") {
      setIsValidRecipient(true);
    } else {
      setIsValidRecipient(isAddress(recipientAddress));
    }
  }, [recipientAddress]);

  const storeWithdrawalTransaction = useCallback(
    async (
      amount: string,
      recipient: string,
      category: string,
      token: string,
      txHash: string | null,
      status: "Success" | "Failed",
      error?: string
    ) => {
      if (!businessAddress) {
        setTxStatusMessage("Error: Wallet not connected.");
        return;
      }

      try {
        const timestamp = serverTimestamp();
        const txId = txHash ?? `local_${Date.now()}`;
        const withdrawalId = `wdl_${txId}`;

        const withdrawalsRef = collection(
          db,
          `businesses/${businessAddress}/withdrawals`
        );
        await addDoc(withdrawalsRef, {
          withdrawalId,
          withdrawalDate: timestamp,
          withdrawalAmount: Number(amount),
          category: category,
          withdrawalToken: token,
          businessId: businessAddress,
          recipientWalletAddress: recipient,
          transactionHash: txHash ?? null,
          withdrawalStatus: status,
          errorDetails: error || null,
          createdAt: timestamp,
          updatedAt: timestamp,
          transactionType: "withdrawal",
        });

        const paymentId = `pay_${withdrawalId}`;
        const paymentsRef = doc(
          db,
          `businesses/${businessAddress}/payments/${paymentId}`
        );
        await setDoc(paymentsRef, {
          amount: Number(amount),
          paymentId,
          linkedTransactionId: withdrawalId,
          category: "withdrawal",
          subCategory: category,
          status: status,
          transactionHash: txHash ?? null,
          timestamp: timestamp,
          type: "withdrawal",
        });
      } catch (firestoreError: any) {
        console.error("Error storing withdrawal transaction:", firestoreError);
        setTxStatusMessage(
          `Error saving transaction record: ${firestoreError.message}`
        );
      }
    },
    [businessAddress]
  );

  const handleSend = async () => {
    if (!businessAddress) {
      setTxStatusMessage("Please log in and connect your wallet.");
      return;
    }
    if (!isValidRecipient || !recipientAddress) {
      setTxStatusMessage("Invalid recipient address.");
      return;
    }
    if (!sendAmount || Number(sendAmount) <= 0) {
      setTxStatusMessage("Invalid send amount.");
      return;
    }

    resetWriteContract();
    setTxStatusMessage("Processing transaction...");

    try {
      const amountParsed = parseUnits(sendAmount, 6);
      transferByEmployer({
        chainId: baseSepolia.id,
        address: EmployerPoolContractAddress as `0x${string}`,
        abi: EMPLOYER_POOL_ABI,
        functionName: "transferByEmployer",
        args: [recipientAddress as `0x${string}`, amountParsed],
      });
    } catch (initiationError: any) {
      const errorMsg =
        initiationError.shortMessage ||
        initiationError.message ||
        "Transaction failed to initiate.";
      setTxStatusMessage(`Error: ${errorMsg}`);
      await storeWithdrawalTransaction(
        sendAmount,
        recipientAddress,
        withdrawalCategory,
        selectedToken,
        null,
        "Failed",
        `Initiation Failed: ${errorMsg}`
      );
      resetWriteContract();
    }
  };

  useEffect(() => {
    if (isSuccess && txHash) {
      setTxStatusMessage("Withdrawal Successful!");
      storeWithdrawalTransaction(
        sendAmount,
        recipientAddress,
        withdrawalCategory,
        selectedToken,
        txHash,
        "Success"
      ).then(() => {
        setTimeout(() => handleClose(), 2000);
      });
    }
  }, [
    isSuccess,
    txHash,
    storeWithdrawalTransaction,
    sendAmount,
    recipientAddress,
    withdrawalCategory,
    selectedToken,
  ]);

  useEffect(() => {
    if (isError && !isLoading) {
      const errorMsg =
        (writeError as any)?.shortMessage ||
        writeError?.message ||
        "Withdrawal transaction failed.";
      setTxStatusMessage(`Withdrawal Failed: ${errorMsg}`);
      storeWithdrawalTransaction(
        sendAmount,
        recipientAddress,
        withdrawalCategory,
        selectedToken,
        txHash ?? null,
        "Failed",
        errorMsg
      );
    }
  }, [
    isError,
    writeError,
    isLoading,
    storeWithdrawalTransaction,
    sendAmount,
    recipientAddress,
    withdrawalCategory,
    selectedToken,
    txHash,
  ]);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setRecipientAddress("");
      setSendAmount("");
      setWithdrawalCategory("vendor");
      setTxStatusMessage("");
      setIsValidRecipient(true);
      resetWriteContract();
    }, 300);
  }, [onClose, resetWriteContract]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 z-50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={handleClose}
          />
          <motion.div
            className="fixed top-1/2 left-1/2 bg-gray-900 text-white rounded-2xl shadow-lg p-8 max-w-xl w-11/12 z-50"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ x: "-50%", y: "-50%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none"
              onClick={handleClose}
              aria-label="Close"
              disabled={isLoading}
            >
              <XCircle size={24} />
            </button>
            <h2 className="text-2xl font-semibold text-white mb-6">
              Transfer
            </h2>
            <div className="mb-4">
              <label
                htmlFor="withdrawalCategory"
                className="block text-gray-300 text-sm font-medium mb-1"
              >
                Payment Category
              </label>
              <select
                id="withdrawalCategory"
                className="shadow-sm border border-gray-700 rounded w-full py-2 px-3 text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={withdrawalCategory}
                onChange={(e) => setWithdrawalCategory(e.target.value)}
                disabled={isLoading}
              >
                {withdrawalCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="recipientAddress"
                className="block text-gray-300 text-sm font-medium mb-1"
              >
                Recipient Wallet Address
              </label>
              <input
                type="text"
                id="recipientAddress"
                className={`shadow-sm appearance-none border ${
                  !isValidRecipient ? "border-red-500" : "border-gray-700"
                } rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800`}
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                disabled={isLoading}
              />
              {!isValidRecipient && recipientAddress !== "" && (
                <p className="text-red-500 text-xs mt-1">
                  Invalid wallet address format.
                </p>
              )}
            </div>
            <div className="mb-6">
              <label
                htmlFor="sendAmount"
                className="block text-gray-300 text-sm font-medium mb-1"
              >
                Amount ({selectedToken})
              </label>
              <input
                type="number"
                id="sendAmount"
                className="shadow-sm appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800"
                placeholder="e.g., 50.00"
                value={sendAmount}
                onChange={(e) =>
                  setSendAmount(e.target.value.replace(/[^0-9.]/g, ""))
                }
                min="0"
                step="any"
                disabled={isLoading}
              />
            </div>
            {txStatusMessage && (
              <div className="mb-4 text-center min-h-[20px]">
                <p
                  className={`text-sm font-medium ${
                    isError
                      ? "text-red-400"
                      : isSuccess
                      ? "text-green-400"
                      : isLoading
                      ? "text-yellow-400"
                      : "text-gray-400"
                  }`}
                >
                  {txStatusMessage}
                  {txHash && (
                    <a
                      href={`${base_sepolia_scan}/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline ml-2"
                      title="View on Basescan"
                    >
                      (View Tx)
                    </a>
                  )}
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="bg-gray-600 hover:bg-gray-500 text-gray-100 font-bold py-2 px-5 rounded focus:outline-none focus:shadow-outline transition-colors text-base disabled:opacity-50"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-5 rounded focus:outline-none focus:shadow-outline transition-colors flex items-center justify-center space-x-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSend}
                disabled={
                  !isValidRecipient ||
                  !recipientAddress ||
                  !sendAmount ||
                  Number(sendAmount) <= 0 ||
                  isLoading ||
                  !isConnected
                }
              >
                {isLoading ? (
                  <>
                    <span>Processing...</span>
                    <Loader2 size={18} className="animate-spin ml-2" />
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WalletSendModal;
