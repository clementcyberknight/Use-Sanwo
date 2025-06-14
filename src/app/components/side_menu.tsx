"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  LayoutDashboard,
  CalendarClock,
  FileText,
  Users,
  User,
  Wallet,
  BarChart3,
  TrendingUp,
  DollarSign,
  LucideProps,
  Loader2,
} from "lucide-react";
import {
  auth,
  app,
  getFirestore,
  doc,
  getDoc,
} from "@/app/config/FirebaseConfig";
import { DocumentData } from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";
import { toast } from "react-toastify";
import { UserButton, useUser } from "@civic/auth-web3/react";

interface MenuItem {
  name: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  path: string;
  disabled?: boolean;
}

const SideMenu = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [companyData, setCompanyData] = useState<DocumentData | null>(null);
  const userContext: any = useUser();
  const address = userContext.ethereum?.address;
  const solanaAddress = userContext.solana?.address;

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (address) {
        const db = getFirestore(app);
        const companyDocRef = doc(db, "businesses", address);
        console.log(address);
        try {
          const docSnap = await getDoc(companyDocRef);
          if (docSnap.exists()) {
            setCompanyData(docSnap.data());
          } else {
            console.log("No such document!");
            setCompanyData(null);
          }
        } catch (error) {
          console.error("Error fetching company data:", error);
          setCompanyData(null);
          toast.error("Error fetching Company Data!");
        } finally {
          setIsLoading(false);
        }
      } else {
        setCompanyData(null);
        setIsLoading(false);
      }
    };

    if (address) {
      fetchCompanyData();
    } else {
      setIsLoading(false);
    }
  }, [address]);

  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/account/dashboard",
    },
    {
      name: "Scheduled Payments",
      icon: CalendarClock,
      path: "/account/scheduled-payments",
    },
    { name: "Payroll", icon: FileText, path: "/account/payroll" },
    { name: "Workers", icon: Users, path: "/account/workers" },
    {
      name: "Pay Workers",
      icon: DollarSign,
      path: "/account/pay_worker",
    },
    {
      name: "Contractors",
      icon: User,
      path: "/account/contractors",
    },
    {
      name: "Wallet",
      icon: Wallet,
      path: "/account/wallet",
    },
    {
      name: "Accounting",
      icon: BarChart3,
      path: "/account/accounting",
    },
    {
      name: "Investments",
      icon: TrendingUp,
      path: "/account/investment",
    },
  ];

  const companyInitial = companyData?.name
    ? companyData.name.charAt(0).toUpperCase()
    : "S"; // Changed default initial to "S"
  const companyName = companyData?.name || "Sanwó Business"; // Changed default company name to "Sanwó Business"

  return (
    <aside
      className={`relative h-screen sticky top-0 w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Company Logo */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
            {" "}
            {/* Changed logo background to black */}
            <span className="text-white font-bold text-xl">
              {companyInitial}
            </span>
          </div>
          <div className="overflow-hidden transition-all duration-300 w-full">
            <div className="font-semibold dark:text-white whitespace-nowrap">
              {companyName}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-hidden">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  item.disabled
                    ? "cursor-not-allowed opacity-50"
                    : pathname === item.path
                    ? "bg-gray-100 text-black dark:bg-gray-900 dark:text-white" // Changed active link styles to black and white
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
                title={item.name}
                onClick={item.disabled ? (e) => e.preventDefault() : undefined}
              >
                <item.icon
                  size={20}
                  className="flex-shrink-0 text-gray-500 dark:text-gray-400"
                />
                <span className="whitespace-nowrap transition-all duration-300 w-full opacity-100">
                  {item.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t dark:border-gray-700 flex flex-col gap-3">
        <UserButton />
      </div>
      <div className="p-4 flex flex-col gap-3"></div>
    </aside>
  );
};

export default SideMenu;
