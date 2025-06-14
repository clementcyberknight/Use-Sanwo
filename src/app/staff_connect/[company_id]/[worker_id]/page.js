"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  app,
  getFirestore,
  setDoc,
  doc,
  getDoc,
} from "@/app/config/FirebaseConfig";
import { useAccount } from "wagmi";
import { UserButton, useUser } from "@civic/auth-web3/react";
import { useAutoConnect } from "@civic/auth-web3/wagmi";

export default function WorkerConnectPage() {
  const router = useRouter();
  const { company_id, worker_id } = useParams();
  console.log("company_id", company_id);
  console.log("worker_id", worker_id);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isValidWorker, setIsValidWorker] = useState(false);
  const [hasConnectedBefore, setHasConnectedBefore] = useState(false);

  const userContext = useUser();
  const address = userContext.ethereum?.address;
  const solanaAddress = userContext.solana?.address;
  useAutoConnect();
  const { isConnected, isConnecting } = useAccount();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const validateWorker = async () => {
      setIsPageLoading(true);
      if (typeof company_id !== "string" || typeof worker_id !== "string") {
        showToast("Invalid URL. Please check the link.");
        console.log("Invalid URL. Please check the link.");
        router.push("/");
        return;
      }

      try {
        const db = getFirestore(app);
        const workerRef = doc(
          db,
          "businesses",
          company_id,
          "workers",
          worker_id
        );
        const workerSnap = await getDoc(workerRef);

        if (!workerSnap.exists()) {
          showToast("This worker invitation is invalid or has expired.");
          console.log("This worker invitation is invalid or has expired.");
          router.push("/");
          return;
        }

        const workerData = workerSnap.data();
        if (workerData.worker_wallet) {
          setHasConnectedBefore(true);
          showToast("A wallet is already connected to this profile.", "info");
        }
        setIsValidWorker(true);
      } catch (error) {
        console.error("Error validating worker:", error);
        showToast("An error occurred while validating the invitation.");
        console.log("An error occurred while validating the invitation.");
        router.push("/");
      } finally {
        setIsPageLoading(false);
      }
    };
    validateWorker();
  }, [company_id, worker_id, router]);

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
        "A wallet has already been connected for this profile.",
        "info"
      );
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);

    if (
      !isValidWorker ||
      typeof company_id !== "string" ||
      typeof worker_id !== "string"
    ) {
      showToast("Invalid worker information.");
      setIsLoading(false);
      return;
    }
    if (!isConnected || !address) {
      showToast("Wallet is not connected.");
      setIsLoading(false);
      return;
    }

    try {
      const db = getFirestore(app);
      const workerRef = doc(db, "businesses", company_id, "workers", worker_id);

      await setDoc(
        workerRef,
        {
          worker_wallet: address,
          status: "Active",
        },
        { merge: true }
      );

      showToast("Wallet address saved successfully!", "success");
      setShowSuccessModal(true);
      setTimeout(() => router.push("/"), 3000);
    } catch (error) {
      console.error("Error saving wallet address:", error);
      showToast(`Error saving wallet address: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
        <Loader2 className="animate-spin h-10 w-10 text-black" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-white to-gray-50">
        <ToastContainer />
        <div
          className={`${isMobile ? "w-full p-6" : "w-1/2 p-12"
            } flex flex-col justify-center`}
        >
          <div className="max-w-md mx-auto w-full">
            <h1
              className={`${isMobile ? "text-3xl" : "text-[40px]"
                } font-medium text-gray-800 mb-4`}
            >
              Welcome to Sanwó
            </h1>
            <p
              className={`text-gray-600 mb-8 ${isMobile ? "text-base" : "text-lg"
                }`}
            >
              To receive payments from your employer, please connect your USDC
              wallet.
            </p>
            <div className="mb-6">
              <label
                className={`block text-gray-700 ${isMobile ? "text-base" : "text-lg"
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
              className={`w-full bg-black text-white py-4 rounded-xl mb-4 hover:bg-gray-900 ${isMobile ? "text-base" : "text-lg"
                } font-medium ${isLoading || !isConnected || hasConnectedBefore
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
        </div>
        {!isMobile && (
          <div className="w-1/2 bg-black p-16 flex flex-col justify-center">
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
                <div className="absolute top-24 left-64 transform rotate-[15deg] w-[300px]">
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
          </div>
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
              className={`${isMobile ? "text-xl" : "text-2xl"
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
