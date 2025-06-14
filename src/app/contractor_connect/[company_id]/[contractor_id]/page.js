"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  app,
  getFirestore,
  setDoc,
  doc,
  getDoc,
  addDoc,
  collection,
} from "@/app/config/FirebaseConfig";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { UserButton, useUser } from "@civic/auth-web3/react";
import { useAutoConnect } from "@civic/auth-web3/wagmi";

export default function ContractorConnectPage() {
  const router = useRouter();
  const { company_id, contractor_id } = useParams();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasConnectedBefore, setHasConnectedBefore] = useState(false);
  const [contractorData, setContractorData] = useState(null);
  const [isValidContractor, setIsValidContractor] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const userContext = useUser();
  useAutoConnect();
  const { address, isConnected, isConnecting } = useAccount();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const validateContractor = async () => {
      setIsPageLoading(true);
      try {
        if (
          typeof company_id !== "string" ||
          typeof contractor_id !== "string"
        ) {
          showToast("Invalid URL parameters.");
          router.push("/");
          return;
        }

        const db = getFirestore(app);
        // Corrected path to match what seems intended for a multi-tenant structure
        const contractorRef = doc(
          db,
          "businesses",
          company_id,
          "contractors",
          contractor_id
        );
        const contractorSnap = await getDoc(contractorRef);

        if (!contractorSnap.exists()) {
          showToast("This contractor invitation is invalid or has expired.");
          setIsValidContractor(false);
          router.push("/");
          return;
        }

        const data = contractorSnap.data();
        setContractorData(data);
        setIsValidContractor(true);

        if (data.contractor_wallet) {
          setHasConnectedBefore(true);
          showToast(
            "A wallet is already associated with this invitation.",
            "info"
          );
        }
      } catch (error) {
        console.error("Error validating contractor:", error);
        showToast("Error validating contractor information.");
        router.push("/");
      } finally {
        setIsPageLoading(false);
      }
    };

    validateContractor();
  }, [company_id, contractor_id, router]);

  const showToast = (message, type = "error") => {
    toast[type](message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleSubmit = () => {
    if (!isConnected || !address) {
      showToast("Please log in and connect your wallet first.");
      return;
    }
    if (hasConnectedBefore) {
      showToast(
        "A wallet has already been connected. Please contact support if you need to make changes.",
        "info"
      );
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);

    try {
      if (
        !isValidContractor ||
        typeof company_id !== "string" ||
        typeof contractor_id !== "string"
      ) {
        showToast("Invalid contractor information.");
        return;
      }
      if (!isConnected || !address) {
        showToast("Wallet is not connected.");
        return;
      }
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        showToast("Invalid wallet address format.");
        return;
      }

      const db = getFirestore(app);
      const contractorRef = doc(
        db,
        "businesses",
        company_id,
        "contractors",
        contractor_id
      );

      await setDoc(
        contractorRef,
        {
          contractor_wallet: address,
          status: "Active", // Changed from "active" to "Active" for consistency
          wallet_connected_at: new Date().toISOString(),
        },
        { merge: true }
      );

      await addDoc(collection(db, "WalletConnectionLogs"), {
        contractor_id: contractor_id,
        company_id: company_id,
        wallet_address: address,
        timestamp: new Date().toISOString(),
        action: "connect_wallet",
      });

      showToast("Wallet address saved successfully!", "success");
      setShowSuccessModal(true);
      setTimeout(() => {
        // Redirect to a generic success page or dashboard login
        router.push("/auth/login");
      }, 3000);
    } catch (error) {
      console.error("Error saving wallet address:", error);
      showToast(`Error saving wallet address: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fadeInAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 mx-auto mb-4 text-black" />
          <p className="text-gray-600">Validating contractor information...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-white to-gray-50">
        <ToastContainer />
        <motion.div
          className={`${
            isMobile ? "w-full p-6" : "w-1/2 p-12"
          } flex flex-col justify-center`}
          {...fadeInAnimation}
        >
          <div className="max-w-md mx-auto w-full">
            <h1
              className={`${
                isMobile ? "text-3xl" : "text-[40px]"
              } font-medium text-gray-800 mb-4`}
            >
              Welcome to Sanwó
            </h1>
            <p
              className={`text-gray-600 mb-8 ${
                isMobile ? "text-base" : "text-lg"
              }`}
            >
              To receive payments from your employer, please connect your USDC
              wallet.
            </p>

            <div className="mb-6">
              <label
                className={`block text-gray-700 ${
                  isMobile ? "text-base" : "text-lg"
                } mb-2`}
              >
                Connected Wallet Address
              </label>
              <input
                type="text"
                value={address || ""}
                placeholder="Log in to connect your wallet"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black text-gray-600"
                readOnly
                disabled
              />
            </div>

            <div className="mb-8 flex justify-center">
              <UserButton />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !isConnected || hasConnectedBefore}
              className={`w-full bg-black text-white py-4 rounded-xl mb-4 hover:bg-gray-900 ${
                isMobile ? "text-base" : "text-lg"
              } font-medium ${
                isLoading || !isConnected || hasConnectedBefore
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-3 inline-block" />
                  Submitting...
                </>
              ) : (
                "Confirm Wallet"
              )}
            </button>

            <p
              className={`text-gray-500 ${isMobile ? "text-sm" : "text-base"}`}
            >
              By submitting or connecting your wallet you agree to{" "}
              <Link href="/terms" className="text-black hover:underline">
                Terms of service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-black hover:underline">
                privacy policy
              </Link>
              .
            </p>
          </div>
        </motion.div>

        {!isMobile && (
          <motion.div
            className="w-1/2 bg-black p-16 flex flex-col justify-center"
            {...fadeInAnimation}
          >
            <div className="text-white max-w-xl">
              <h2 className="text-5xl font-bold mb-6">
                No limits, no borders, no wahala.
              </h2>
              <p className="text-2xl mb-16">
                Receive salary payment faster, easier and more securely
              </p>
              <div className="relative mt-12">
                <div className="transform rotate-[-15deg] w-[300px]">
                  <Image
                    src="/coinbase.png"
                    alt="Coinbase Transaction Card"
                    width={300}
                    height={180}
                    className="w-full h-auto rounded-2xl shadow-lg"
                  />
                </div>
                <div className="absolute top-2 left-80 transform rotate-[15deg] w-[300px]">
                  <Image
                    src="/phantom.png"
                    alt="Phantom Transaction Card"
                    width={300}
                    height={180}
                    className="w-full h-auto rounded-2xl shadow-lg"
                  />
                </div>
                <div className="absolute -top-20 right-0 animate-[flight_3s_ease-in-out_infinite]">
                  <Image
                    src="/pplane.png"
                    alt="Paper Plane"
                    width={120}
                    height={120}
                    className="w-auto h-auto"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <h3
              className={`${isMobile ? "text-lg" : "text-xl"} font-medium mb-4`}
            >
              Confirm Wallet Address
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to save this wallet address?
              <br />
              <span className="text-sm break-all mt-2 block">{address}</span>
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-black text-white rounded-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-3 inline-block" />
                    Confirming...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl text-center max-w-md w-full">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3
              className={`${
                isMobile ? "text-xl" : "text-2xl"
              } font-medium mb-4`}
            >
              Successfully sent
            </h3>
            <p className="text-black text-lg">wallet address saved</p>
          </div>
        </div>
      )}
    </>
  );
}
