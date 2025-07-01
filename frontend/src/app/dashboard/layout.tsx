"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import {
  List,
  X,
  Car as CarIcon,
  Calendar,
  FileText,
  CreditCard,
  BarChart,
  Search,
  Cpu,
  Settings,
  LogOut,
  Bell,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { HashLoader } from "react-spinners";

interface Props {
  children: ReactNode;
}
export interface MeResponse {
  premium: boolean;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function DashboardLayout({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<MeResponse | null>(null);
  const [open, setOpen] = useState(false);

  // fetch user on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get<{ user: MeResponse }>(
          `${API_URL}/api/v1/user/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data.user);
      } catch {
        localStorage.removeItem("token");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // prevent background scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <HashLoader size={60} />
      </div>
    );
  if (!user) return null;

  const links: {
    href: string;
    Icon: React.ComponentType<{ className?: string }>;
    label: string;
    premiumOnly: boolean;
  }[] = [
    { href: "/dashboard", Icon: List, label: "Dashboard", premiumOnly: false },
    {
      href: "/dashboard/cars",
      Icon: CarIcon,
      label: "Moje pojazdy",
      premiumOnly: false,
    },
    {
      href: "/dashboard/timetable",
      Icon: Calendar,
      label: "Terminarz",
      premiumOnly: false,
    },
    {
      href: "/dashboard/repairs",
      Icon: FileText,
      label: "Historia napraw",
      premiumOnly: false,
    },
    {
      href: "/dashboard/expenses",
      Icon: CreditCard,
      label: "Wydatki",
      premiumOnly: false,
    },
    {
      href: "/dashboard/analitycs",
      Icon: BarChart,
      label: "Analityka",
      premiumOnly: true,
    },
    {
      href: "/dashboard/workshops",
      Icon: Search,
      label: "Warsztaty",
      premiumOnly: true,
    },
    {
      href: "/dashboard/prediction",
      Icon: Cpu,
      label: "Predykcja serwisowa",
      premiumOnly: true,
    },
  ];

  const NavLinks = () => (
    <nav className="flex flex-col flex-1 p-4 space-y-2 text-gray-700 text-sm">
      {links.map(({ href, Icon, label, premiumOnly }) => {
        const premiumActive = premiumOnly && user!.premium;
        const disabled = premiumOnly && !user!.premium;

        const base = "flex items-center px-2 py-2 rounded transition-all";

        const hover = disabled
          ? ""
          : "hover:bg-gray-50 hover:px-6 cursor-pointer";

        const textDisabled = disabled
          ? "text-gray-400 pointer-events-none"
          : "";

        const textPremium = premiumActive ? "text-yellow-600" : "";

        const classes = `${base} ${hover} ${textDisabled} ${textPremium}`;

        return disabled ? (
          <div
            key={href}
            className={classes}
            title="Tylko dla użytkowników Premium"
          >
            <Icon
              className={`w-5 h-5 mr-3 ${
                premiumActive ? "text-yellow-600" : "text-gray-600"
              }`}
            />{" "}
            {label}
          </div>
        ) : (
          <Link key={href} href={href} className={classes}>
            <Icon
              className={`w-5 h-5 mr-3 ${
                premiumActive ? "text-yellow-600" : "text-gray-600"
              }`}
            />{" "}
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* always-rendered mobile overlay */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-20
          transition-opacity duration-300 ease-in-out
          ${
            open
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
          md:hidden
        `}
        onClick={() => setOpen(false)}
      />

      {/* always-rendered mobile sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 w-64 bg-white z-30 shadow-lg flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:hidden
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center">
            <CarIcon className="w-6 h-6 text-emerald-500 mr-2" />
            <span className="font-bold text-lg text-gray-700">CarBuddy</span>
          </div>
          <button onClick={() => setOpen(false)} className="p-2">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div className="text-center pt-4">
          <div className="mx-6 my-2 py-2 rounded-xl border-2 border-yellow-600 bg-yellow-50">
            Plan:{" "}
            <span
              className={user.premium ? "text-yellow-700" : "text-gray-500"}
            >
              {user.premium ? "Premium" : "Darmowy"}
            </span>
          </div>
        </div>
        <NavLinks />
        <div className="p-4 border-t">
          <Link
            href="/dashboard/settings"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5 mr-3" /> Ustawienia
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.replace("/login");
            }}
            className="mt-2 flex items-center w-full px-2 py-2 rounded hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" /> Wyloguj
          </button>
        </div>
      </aside>

      {/* desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 h-full shadow-xl">
        <div
          className="flex items-center h-16 px-6 border-b cursor-pointer hover:px-12 transition-all"
          onClick={() => router.push("/dashboard")}
        >
          <CarIcon className="w-6 h-6 text-emerald-500 mr-2" />
          <span className="font-bold text-lg text-gray-700">CarBuddy</span>
        </div>
        <div className="text-center pt-4">
          <div
            className={
              user.premium
                ? "mx-6 my-2 py-2 rounded-xl border-2 border-yellow-600 bg-yellow-50"
                : "mx-6 my-2 py-2 rounded-xl border-2 border-gray-400 bg-gray-50"
            }
          >
            Plan:{" "}
            <span
              className={
                user.premium
                  ? "text-yellow-700 font-semibold"
                  : "text-gray-500 font-semibold"
              }
            >
              {user.premium ? "Premium" : "Darmowy"}
            </span>
          </div>
        </div>
        <NavLinks />
        <div className="p-4 border-t">
          <Link
            href="/dashboard/settings"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50 hover:px-6 transition-all cursor-pointers"
          >
            <Settings className="w-5 h-5 mr-3" /> Ustawienia
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.replace("/login");
            }}
            className="mt-2 flex items-center w-full px-2 py-2 rounded hover:bg-gray-50 hover:px-6 transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5 mr-3" /> Wyloguj
          </button>
        </div>
      </aside>

      {/* main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex-none flex items-center justify-between bg-white px-4 md:px-6 py-3 border-b">
          <div className="flex items-center space-x-4 pt-4">
            <button className="md:hidden p-2" onClick={() => setOpen(true)}>
              <List className="w-6 h-6 text-gray-600" />
            </button>
            <Bell className="w-6 h-6 text-gray-600" />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
