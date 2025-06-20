"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, Download } from "lucide-react";
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
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { parseUnits, parseAbi, formatUnits } from "viem";
import { baseSepolia } from "viem/chains"; // Corrected to use the same chain as before
import { useUser } from "@civic/auth-web3/react";
import { useAutoConnect } from "@civic/auth-web3/wagmi";

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

const TOKEN_ABI = parseAbi([
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
]);

const EMPLOYER_POOL_ABI = EmployerPool;

interface WalletDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletDepositModal: React.FC<WalletDepositModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [depositAmount, setDepositAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [depositCategory, setDepositCategory] = useState("revenue");
  const [txStatusMessage, setTxStatusMessage] = useState<string>("");
  const [isDepositInitiated, setIsDepositInitiated] = useState<boolean>(false);

  useUser();
  useAutoConnect();
  const { address: Companyaddress, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: baseSepolia.id });

  const {
    writeContract: ApproveToken,
    isSuccess: approveSuccess,
    isPending: approveLoading,
    isError: approveError,
    error: approveWriteError,
    reset: resetApprove,
    data: approveTxHash,
  } = useWriteContract();

  const {
    writeContract: depositToken,
    isSuccess: depositSuccess,
    isPending: depositLoading,
    isError: depositError,
    error: depositWriteError,
    reset: resetDeposit,
    data: depositTxHash,
  } = useWriteContract();

  const storeDepositTransaction = useCallback(
    async (
      amount: string,
      category: string,
      token: string,
      txHash: string | null,
      status: "Success" | "Failed",
      txType: "deposit" | "approval",
      error?: string
    ) => {
      if (!Companyaddress) {
        console.error("No business address found for storing transaction");
        setTxStatusMessage("Error: Business address not found.");
        return;
      }

      try {
        const timestamp = serverTimestamp();
        const txId = Date.now().toString();
        const paymentId = `pay_${txId}`;
        const paymentsRef = doc(
          db,
          `businesses/${Companyaddress}/payments/${paymentId}`
        );
        await setDoc(paymentsRef, {
          amount: Number(amount) || 0,
          paymentId,
          category: "deposit",
          status: status,
          transactionHash: txHash ?? null,
          timestamp: timestamp,
          type: txType,
        });

        const depositsRef = collection(
          db,
          `businesses/${Companyaddress}/deposits`
        );
        await addDoc(depositsRef, {
          depositId: `dep_${txId}`,
          depositDate: timestamp,
          depositAmount: Number(amount) || 0,
          category,
          depositToken: token,
          businessId: Companyaddress,
          fromWalletAddress: Companyaddress,
          transactionHash: txHash ?? null,
          depositStatus: status,
          errorDetails: error || null,
          createdAt: timestamp,
          updatedAt: timestamp,
          transactionType: txType,
        });
      } catch (firestoreError) {
        console.error(
          `Error storing ${txType} transaction in Firestore:`,
          firestoreError
        );
        setTxStatusMessage(`Error saving ${txType} record to database.`);
      }
    },
    [Companyaddress]
  );

  const handleApprove = async () => {
    if (!Companyaddress) {
      setTxStatusMessage("Please connect your wallet.");
      return;
    }
    if (!depositAmount || Number(depositAmount) <= 0) {
      setTxStatusMessage("Invalid deposit amount.");
      return;
    }

    resetApprove();
    resetDeposit();
    setIsDepositInitiated(false);
    setTxStatusMessage("Processing approval...");

    try {
      const depositAmountParsed = parseUnits(depositAmount, 6);
      const tokenAddress = MOCK_USDC as `0x${string}`;
      const spenderAddress = EmployerPoolContractAddress as `0x${string}`;

      ApproveToken({
        chainId: baseSepolia.id,
        address: tokenAddress,
        abi: TOKEN_ABI,
        functionName: "approve",
        args: [spenderAddress, depositAmountParsed],
      });
    } catch (error: any) {
      const errorMsg =
        error.shortMessage || error.message || "Approval failed to initiate.";
      setTxStatusMessage(`Approval Error: ${errorMsg}`);
      await storeDepositTransaction(
        depositAmount,
        depositCategory,
        selectedToken,
        null,
        "Failed",
        "approval",
        errorMsg
      );
      resetApprove();
      resetDeposit();
      setIsDepositInitiated(false);
    }
  };

  useEffect(() => {
    const performDepositAfterApproval = async () => {
      if (approveSuccess && !isDepositInitiated && approveTxHash) {
        setIsDepositInitiated(true);
        setTxStatusMessage("Approval Confirmed. Processing deposit...");

        try {
          const depositAmountParsed = parseUnits(depositAmount || "0", 6);
          resetDeposit();
          depositToken({
            chainId: baseSepolia.id,
            address: EmployerPoolContractAddress as `0x${string}`,
            abi: EMPLOYER_POOL_ABI,
            functionName: "deposit",
            args: [depositAmountParsed],
            gas: BigInt(200000),
          });
        } catch (error: any) {
          const errorMsg =
            error.shortMessage ||
            error.message ||
            "Deposit failed to initiate.";
          setTxStatusMessage(`Deposit Error: ${errorMsg}`);
          setIsDepositInitiated(false);
          await storeDepositTransaction(
            depositAmount,
            depositCategory,
            selectedToken,
            approveTxHash,
            "Failed",
            "deposit",
            `Deposit Initiation Failed: ${errorMsg}`
          );
        }
      }
    };

    performDepositAfterApproval();
  }, [
    approveSuccess,
    approveTxHash,
    isDepositInitiated,
    depositAmount,
    resetDeposit,
    depositToken,
    storeDepositTransaction,
    depositCategory,
    selectedToken,
  ]);

  useEffect(() => {
    if (depositSuccess && depositTxHash) {
      setTxStatusMessage("Deposit Successful!");
      storeDepositTransaction(
        depositAmount,
        depositCategory,
        selectedToken,
        depositTxHash,
        "Success",
        "deposit"
      ).then(() => {
        setTimeout(() => handleClose(), 1500);
      });
    }
  }, [
    depositSuccess,
    depositTxHash,
    depositAmount,
    depositCategory,
    selectedToken,
    storeDepositTransaction,
  ]);

  useEffect(() => {
    if (approveError) {
      const errorMsg =
        (approveWriteError as any)?.shortMessage ||
        approveWriteError?.message ||
        "Approval Transaction Failed";
      setTxStatusMessage(`Approval Failed: ${errorMsg}`);
      setIsDepositInitiated(false);
      storeDepositTransaction(
        depositAmount,
        depositCategory,
        selectedToken,
        approveTxHash ?? null,
        "Failed",
        "approval",
        errorMsg
      );
    }
  }, [
    approveError,
    approveWriteError,
    depositAmount,
    depositCategory,
    selectedToken,
    storeDepositTransaction,
    approveTxHash,
  ]);

  useEffect(() => {
    if (depositError) {
      const errorMsg =
        (depositWriteError as any)?.shortMessage ||
        depositWriteError?.message ||
        "Deposit Transaction Failed";
      setTxStatusMessage(`Deposit Failed: ${errorMsg}`);
      setIsDepositInitiated(false);
      storeDepositTransaction(
        depositAmount,
        depositCategory,
        selectedToken,
        depositTxHash ?? approveTxHash ?? null,
        "Failed",
        "deposit",
        errorMsg
      );
    }
  }, [
    depositError,
    depositWriteError,
    depositAmount,
    depositCategory,
    selectedToken,
    storeDepositTransaction,
    depositTxHash,
    approveTxHash,
  ]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setDepositAmount("");
      setSelectedToken("USDC");
      setDepositCategory("revenue");
      setTxStatusMessage("");
      setIsDepositInitiated(false);
      resetApprove();
      resetDeposit();
    }, 300);
  };

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
            >
              <XCircle size={24} />
            </button>
            <h2 className="text-2xl font-semibold text-white mb-6">
              Deposit
            </h2>
            <div className="mb-4">
              <label
                htmlFor="depositCategory"
                className="block text-gray-300 text-sm font-medium mb-1"
              >
                Deposit Category
              </label>
              <select
                id="depositCategory"
                className="shadow-sm border border-gray-700 rounded w-full py-2 px-3 text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={depositCategory}
                onChange={(e) => setDepositCategory(e.target.value)}
                disabled={
                  approveLoading || depositLoading || isDepositInitiated
                }
              >
                <option value="revenue">Revenue</option>
                <option value="payroll">Payroll Deposit</option>
                <option value="loan">Loan</option>
                <option value="investment">Investment</option>
                <option value="refund">Refund</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="depositAmount"
                className="block text-gray-300 text-sm font-medium mb-1"
              >
                Amount (USDC)
              </label>
              <input
                type="number"
                id="depositAmount"
                className="shadow-sm appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800"
                placeholder="e.g., 100.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={
                  approveLoading || depositLoading || isDepositInitiated
                }
              />
            </div>
            {txStatusMessage && (
              <div className="mb-4 text-center min-h-[20px]">
                <p
                  className={`text-sm font-medium ${
                    txStatusMessage.includes("Failed") ||
                    txStatusMessage.includes("Error")
                      ? "text-red-500"
                      : txStatusMessage.includes("Success")
                      ? "text-green-500"
                      : "text-yellow-500"
                  }`}
                >
                  {txStatusMessage}
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="bg-gray-600 hover:bg-gray-500 text-gray-100 font-bold py-2 px-5 rounded focus:outline-none focus:shadow-outline transition-colors text-base disabled:opacity-50"
                onClick={handleClose}
                disabled={approveLoading || depositLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-5 rounded focus:outline-none focus:shadow-outline transition-colors flex items-center justify-center space-x-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleApprove}
                disabled={
                  !depositAmount ||
                  Number(depositAmount) <= 0 ||
                  approveLoading ||
                  depositLoading ||
                  isDepositInitiated ||
                  !isConnected
                }
              >
                {approveLoading ? (
                  <>
                    <span>Approving...</span>{" "}
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  </>
                ) : depositLoading ? (
                  <>
                    <span>Depositing...</span>{" "}
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  </>
                ) : (
                  <>
                    <Download size={18} /> <span>Deposit</span>
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

export default WalletDepositModal;
