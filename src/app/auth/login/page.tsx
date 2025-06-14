"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Check, ChevronRight } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { app, getFirestore, doc, getDoc } from "@/app/config/FirebaseConfig";
import { UserButton, useUser } from "@civic/auth-web3/react";
import { useAccount } from "wagmi";

const SigninPage = () => {
  const router = useRouter();

  const userContext: any = useUser();
  console.log(userContext);
  const address = userContext.ethereum?.address;
  console.log(address);
  const solanaAddress = userContext.solana?.address;

  const account = useAccount();
  const businessAddress = account.address;

  console.log(`this is the wallet check ${businessAddress}`);

  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const showErrorToast = (message: string) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const showSuccessToast = (message: string) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleSignIn = async () => {
    if (!address) {
      showErrorToast("Please connect your wallet before signing in.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const db = getFirestore(app);
      const businessDocRef = doc(db, "users", solanaAddress);
      const docSnap = await getDoc(businessDocRef);

      if (docSnap.exists()) {
        const businessData = docSnap.data();
        const registeredAddress = businessData.wallet_address.toLowerCase();
        const currentAddress = address.toLowerCase();

        if (registeredAddress !== currentAddress) {
          showErrorToast(
            "Wallet address does not match the registered business account."
          );
          setIsLoading(false);
          return;
        }

        //@ts-ignore
        setUserData(businessData);
        showSuccessToast("Sign in successful! Proceeding...");
        router.push("/account/dashboard");
        console.log("Current user UID:", solanaAddress);
      } else {
        showErrorToast("User data not found in Firestore.");
      }
    } catch (firebaseError) {
      console.error("Firebase sign-in error:", firebaseError);
      //@ts-ignore
      showErrorToast(`Firebase sign-in failed: ${firebaseError.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white to-gray-50 overflow-hidden">
      <ToastContainer />

      <div className="flex w-full max-w-7xl mx-auto my-8 rounded-2xl overflow-hidden shadow-2xl">
        {/* Left Section - Form */}
        <div className="w-1/2 p-10 bg-white">
          <div className="mb-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/owo.png"
                alt="Sanwó Logo"
                width={140}
                height={140}
                className="mr-2"
              />
            </Link>
          </div>

          <div className="max-w-lg">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h1>
            <p className="text-gray-600 mb-8">
              Sign in to access your business account
            </p>

            <div className="space-y-5">
              <div className="pt-4">
                <UserButton />
              </div>
              <button
                onClick={handleSignIn}
                className={`w-full py-3 rounded-lg bg-black hover:bg-gray-900 transition-colors duration-200 text-white flex items-center justify-center`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-3" />
                    Signing In...
                  </>
                ) : (
                  <span className="flex items-center">
                    Sign In
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>

              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-black font-medium hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Feature Showcase */}
        <div className="w-1/2 bg-gradient-to-br from-gray-900 to-gray-800 p-10 flex flex-col justify-between">
          <div className="text-white">
            <h2 className="text-3xl font-semibold mb-4">
              The simplest way to manage your workforce payroll
            </h2>
            <p className="text-xl opacity-90 mb-6">
              Seamlessly pay your remote workers with just a click
            </p>

            <div className="space-y-4 mt-8">
              {[
                {
                  title: "Global Payments",
                  description: "Pay anyone, anywhere in the world instantly",
                },
                {
                  title: "Low Fees",
                  description: "Save up to 90% on international transfers",
                },
                {
                  title: "Compliance Built-in",
                  description: "Automatic tax and regulatory compliance",
                },
              ].map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm opacity-80">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-white/20 border-2 border-gray-700 flex items-center justify-center text-xs text-white"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-white text-sm">
                Join <span className="font-bold">2,500+</span> businesses
                already using Sanwó
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
