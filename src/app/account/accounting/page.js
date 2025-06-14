"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Loader2,
  FileSpreadsheet,
  Clock,
  TrendingUp,
  DollarSign,
  Briefcase,
  BarChart2,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Users,
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import FinancialReportPDF from "@/app/components/FinancialReportPDF";
import TransactionStatementPDF from "@/app/components/TransactionStatementPDF";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  db,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "@/app/config/FirebaseConfig";
import { Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { UserButton, useUser } from "@civic/auth-web3/react";
import { useAutoConnect } from "@civic/auth-web3/wagmi";

//@clement i'm feeling so sleepyyyy this is 3:52am the d
//just one coffee fr
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "N/A";
  const numericAmount =
    typeof amount === "number"
      ? amount
      : parseFloat(String(amount).replace(/[^0-9.-]+/g, ""));
  return isNaN(numericAmount)
    ? "Invalid Amount"
    : currencyFormatter.format(numericAmount);
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

const FinancialReportingPage = () => {
  const [activeTab, setActiveTab] = useState("financial-report");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [financialReportData, setFinancialReportData] = useState(null);
  const [transactionData, setTransactionData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  });
  const [transactionFilters, setTransactionFilters] = useState({
    category: "all",
    status: "all",
    minAmount: "",
    maxAmount: "",
  });
  const router = useRouter();

  const userContext = useUser();
  useAutoConnect();
  const { address, isConnected, isConnecting } = useAccount();

  const showErrorToast = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const showSuccessToast = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const fetchFinancialTransactions = async (companyAddress, filters = {}) => {
    try {
      setIsLoadingTransactions(true);
      const paymentsCollectionRef = collection(
        db,
        `businesses/${companyAddress}/payments`
      );

      let queryConstraints = [orderBy("timestamp", "desc")];

      if (filters.startDate && filters.endDate) {
        const startTimestamp = Timestamp.fromDate(new Date(filters.startDate));
        const endTimestamp = Timestamp.fromDate(new Date(filters.endDate));
        queryConstraints.push(where("timestamp", ">=", startTimestamp));
        queryConstraints.push(where("timestamp", "<=", endTimestamp));
      }

      if (filters.category && filters.category !== "all") {
        queryConstraints.push(where("category", "==", filters.category));
      }

      if (filters.status && filters.status !== "all") {
        queryConstraints.push(where("status", "==", filters.status));
      }

      const q = query(paymentsCollectionRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);

      const transactions = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate() || null;
        const amount = Number(data.amount);
        const minAmount = filters.minAmount ? Number(filters.minAmount) : null;
        const maxAmount = filters.maxAmount ? Number(filters.maxAmount) : null;

        if (
          (minAmount === null || amount >= minAmount) &&
          (maxAmount === null || amount <= maxAmount)
        ) {
          transactions.push({
            id: doc.id,
            amount,
            category: data.category || "unknown",
            status: data.status || "unknown",
            timestamp,
            transactionHash: data.transactionHash || null,
          });
        }
      });

      return transactions;
    } catch (error) {
      console.error("Error fetching financial transactions:", error);
      throw error;
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const generateFinancialReport = (transactions) => {
    const metrics = transactions.reduce(
      (acc, tx) => {
        const amount = Number(tx.amount) || 0;
        acc.transactionCount++;
        acc.totalAmount += amount;

        if (tx.category === "deposit") {
          acc.totalDeposits += amount;
          acc.depositCount++;
        } else if (
          tx.category === "withdrawal" ||
          tx.category === "Payroll" ||
          tx.category === "Contractor Payment"
        ) {
          acc.totalWithdrawals += amount;
          acc.withdrawalCount++;
          if (
            tx.category === "Payroll" ||
            tx.category === "Contractor Payment"
          ) {
            acc.totalPayroll += amount;
            acc.payrollCount++;
          }
        }

        if (tx.status === "Success") {
          acc.successfulTransactions++;
          acc.successfulAmount += amount;
        } else if (tx.status === "Failed") {
          acc.failedTransactions++;
        } else if (tx.status === "Pending") {
          acc.pendingTransactions++;
          acc.pendingAmount += amount;
        }
        return acc;
      },
      {
        transactionCount: 0,
        totalAmount: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalPayroll: 0,
        depositCount: 0,
        withdrawalCount: 0,
        payrollCount: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        pendingTransactions: 0,
        successfulAmount: 0,
        pendingAmount: 0,
      }
    );

    const netProfit = metrics.totalDeposits - metrics.totalWithdrawals;
    const avgTransactionAmount =
      metrics.transactionCount > 0
        ? metrics.totalAmount / metrics.transactionCount
        : 0;
    const avgPayrollAmount =
      metrics.payrollCount > 0
        ? metrics.totalPayroll / metrics.payrollCount
        : 0;

    const dates = transactions.map((tx) => tx.timestamp).filter(Boolean);
    const oldestDate =
      dates.length > 0 ? new Date(Math.min(...dates)) : new Date();
    const newestDate =
      dates.length > 0 ? new Date(Math.max(...dates)) : new Date();

    return {
      reportTitle: "Financial Performance Report",
      reportDate: formatDate(new Date()),
      reportingPeriodStart: formatDate(oldestDate),
      reportingPeriodEnd: formatDate(newestDate),
      currency: "USDC",
      totalRevenue: formatCurrency(metrics.totalDeposits),
      totalExpenses: formatCurrency(metrics.totalWithdrawals),
      netProfit: formatCurrency(netProfit),
      numberOfTransactions: metrics.transactionCount,
      totalPaymentsToWorkers: formatCurrency(metrics.totalPayroll),
      averageWorkerPayment: formatCurrency(avgPayrollAmount),
      numberOfWorkersPaid: metrics.payrollCount,
      totalMoneySentOut: formatCurrency(metrics.totalWithdrawals),
      totalMoneyDeposited: formatCurrency(metrics.totalDeposits),
      transactionFees: formatCurrency(metrics.totalAmount * 0.0),
      averageTransactionAmount: formatCurrency(avgTransactionAmount),
      depositVsWithdrawal: {
        deposits: metrics.totalDeposits,
        withdrawals: metrics.totalWithdrawals,
      },
      transactionsByStatus: {
        successful: metrics.successfulTransactions,
        failed: metrics.failedTransactions,
        pending: metrics.pendingTransactions,
      },
      rawMetrics: metrics,
      recentTransactions: transactions.slice(0, 5),
    };
  };

  const generateTransactionStatement = (transactions) => {
    const groupedByMonth = transactions.reduce((acc, tx) => {
      if (!tx.timestamp) return acc;
      const date = new Date(tx.timestamp);
      const monthYear = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push({
        ...tx,
        formattedDate: formatDate(tx.timestamp),
        formattedAmount: formatCurrency(tx.amount),
        type: tx.category === "deposit" ? "Credit" : "Debit",
      });
      return acc;
    }, {});

    const summary = {
      totalTransactions: transactions.length,
      totalDeposits: formatCurrency(
        transactions
          .filter((tx) => tx.category === "deposit")
          .reduce((sum, tx) => sum + Number(tx.amount), 0)
      ),
      totalWithdrawals: formatCurrency(
        transactions
          .filter((tx) => tx.category !== "deposit")
          .reduce((sum, tx) => sum + Number(tx.amount), 0)
      ),
      startDate: formatDate(dateRange.startDate),
      endDate: formatDate(dateRange.endDate),
      generatedDate: formatDate(new Date()),
    };

    return { transactionsByMonth: groupedByMonth, summary };
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setFinancialReportData(null);
    if (!address) {
      showErrorToast("Please log in to generate a report.");
      setIsGeneratingReport(false);
      return;
    }
    try {
      const transactions = await fetchFinancialTransactions(address, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      if (transactions.length === 0) {
        showErrorToast("No transactions found in the selected date range.");
        setIsGeneratingReport(false);
        return;
      }
      const reportData = generateFinancialReport(transactions);
      setFinancialReportData(reportData);
      showSuccessToast("Financial report generated successfully!");
    } catch (error) {
      showErrorToast("Failed to generate financial report. Please try again.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleGenerateTransactionStatement = async () => {
    setIsLoadingTransactions(true);
    setTransactionData(null);
    if (!address) {
      showErrorToast("Please log in to generate a statement.");
      setIsLoadingTransactions(false);
      return;
    }
    try {
      const transactions = await fetchFinancialTransactions(address, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        category: transactionFilters.category,
        status: transactionFilters.status,
        minAmount: transactionFilters.minAmount,
        maxAmount: transactionFilters.maxAmount,
      });
      if (transactions.length === 0) {
        showErrorToast("No transactions found matching the selected filters.");
        setIsLoadingTransactions(false);
        return;
      }
      const statementData = generateTransactionStatement(transactions);
      setTransactionData(statementData);
      showSuccessToast("Transaction statement generated successfully!");
    } catch (error) {
      showErrorToast(
        "Failed to generate transaction statement. Please try again."
      );
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleDateRangeChange = (e, field) => {
    setDateRange((prev) => ({ ...prev, [field]: new Date(e.target.value) }));
  };

  const handleFilterChange = (e, field) => {
    setTransactionFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const resetFilters = () => {
    setTransactionFilters({
      category: "all",
      status: "all",
      minAmount: "",
      maxAmount: "",
    });
    setDateRange({
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      endDate: new Date(),
    });
  };

  useEffect(() => {
    if (
      activeTab === "financial-statement" &&
      isConnected &&
      !transactionData
    ) {
      handleGenerateTransactionStatement();
    }
  }, [activeTab, isConnected]);

  const renderContent = () => {
    if (userContext.userLoading || isConnecting) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-10 w-10 text-black" />
        </div>
      );
    }

    if (!isConnected || !address) {
      return (
        <div className="text-center p-8 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200">
          <Briefcase size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">Access Your Financial Data</p>
          <p>Please log in with your Civic account to view your reports.</p>
        </div>
      );
    }

    return (
      <>
        {activeTab === "financial-report" && (
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Financial Report UI */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.startDate.toISOString().split("T")[0]}
                      onChange={(e) => handleDateRangeChange(e, "startDate")}
                      className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.endDate.toISOString().split("T")[0]}
                      onChange={(e) => handleDateRangeChange(e, "endDate")}
                      className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>
                </div>
                <button
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                  className={`flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors ${
                    isGeneratingReport ? "opacity-70 cursor-wait" : ""
                  }`}
                >
                  {isGeneratingReport ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Generating
                      Report...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet size={18} /> Generate Financial Report
                    </>
                  )}
                </button>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {financialReportData ? (
                <motion.div
                  key="reportDisplay"
                  variants={fadeInUpVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white rounded-lg shadow-md border border-gray-200"
                >
                  {/* Report content */}
                </motion.div>
              ) : (
                !isGeneratingReport && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-center p-8 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200"
                  >
                    <FileText
                      size={48}
                      className="mx-auto mb-4 text-gray-400"
                    />
                    <p className="text-lg font-medium mb-2">
                      No financial report generated yet
                    </p>
                    <p className="mb-6">
                      Select a date range and click "Generate Financial Report"
                      to create one.
                    </p>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </motion.div>
        )}
        {activeTab === "financial-statement" && (
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Transaction Statement UI */}
          </motion.div>
        )}
        {activeTab === "tax-filing" && (
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-center p-8 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <Clock size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              Tax Filing Feature Coming Soon!
            </p>
          </motion.div>
        )}
      </>
    );
  };

  return (
    <motion.div
      className="container mx-auto p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-2">
            Financial Reporting
          </h1>
          <p className="text-gray-500">
            Generate financial reports and manage transaction statements
          </p>
        </div>
        <UserButton />
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <nav className="flex">
          <button
            onClick={() => setActiveTab("financial-report")}
            className={`flex items-center gap-2 py-4 px-6 font-medium transition-colors ${
              activeTab === "financial-report"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-gray-700"
            } focus:outline-none`}
          >
            <FileSpreadsheet size={18} /> Financial Report
          </button>
          <button
            onClick={() => setActiveTab("financial-statement")}
            className={`flex items-center gap-2 py-4 px-6 font-medium transition-colors ${
              activeTab === "financial-statement"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-gray-700"
            } focus:outline-none`}
          >
            <FileText size={18} /> Transaction Statement
          </button>
          <button
            onClick={() => setActiveTab("tax-filing")}
            className={`flex items-center gap-2 py-4 px-6 font-medium transition-colors ${
              activeTab === "tax-filing"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-gray-700"
            } focus:outline-none`}
          >
            <Clock size={18} /> Tax Filing{" "}
            <span className="ml-1 text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full">
              Soon
            </span>
          </button>
        </nav>
      </div>
      <div>{renderContent()}</div>
    </motion.div>
  );
};

export default FinancialReportingPage;
