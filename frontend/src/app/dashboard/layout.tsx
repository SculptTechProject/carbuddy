"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import {
  List,
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
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* --- SIDEBAR --- */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 h-full">
        <div className="flex items-center h-16 px-6 border-b">
          <CarIcon className="w-6 h-6 text-emerald-500 mr-2" />
          <span className="font-bold text-lg text-gray-700">CarBuddy</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 text-gray-700 text-sm">
          <Link
            href="/dashboard"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50"
          >
            <List className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link
            href="/dashboard/cars"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50"
          >
            <CarIcon className="w-5 h-5 mr-3" /> Moje pojazdy
          </Link>
          <Link
            href="/dashboard/terminarz"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50"
          >
            <Calendar className="w-5 h-5 mr-3" /> Terminarz
          </Link>
          <Link
            href="/dashboard/historia"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50"
          >
            <FileText className="w-5 h-5 mr-3" /> Historia napraw
          </Link>
          <Link
            href="/dashboard/expenses"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50"
          >
            <CreditCard className="w-5 h-5 mr-3" /> Wydatki
          </Link>
          <Link
            href="/dashboard/analityka"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50"
          >
            <BarChart className="w-5 h-5 mr-3" /> Analityka
          </Link>
          <Link
            href="/dashboard/warsztaty"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50"
          >
            <Search className="w-5 h-5 mr-3" /> Wyszukiwarka warsztatów
          </Link>
          <Link
            href="/dashboard/predykcja"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50"
          >
            <Cpu className="w-5 h-5 mr-3" /> Predykcja serwisowa
          </Link>
        </nav>

        <div className="p-4 border-t">
          <Link
            href="/dashboard/settings"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50"
          >
            <Settings className="w-5 h-5 mr-3" /> Ustawienia
          </Link>
          <button
            onClick={handleLogout}
            className="mt-2 flex items-center w-full px-2 py-2 rounded hover:bg-gray-50 text-left transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5 mr-3" /> Wyloguj
          </button>
        </div>
      </aside>

      {/* --- GŁÓWNA SEKCJA --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="flex-none flex items-center justify-between bg-white px-6 py-3 border-b">
          <div className="flex items-center space-x-4">
            <Bell className="w-6 h-6 text-gray-600" />
            <div className="w-8 h-8 bg-gray-300 rounded-full" />
          </div>
          <button
            onClick={() => router.push("/dashboard/add-car")}
            className="flex items-center bg-gray-700 text-gray-200 px-4 py-2 rounded hover:opacity-90 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 mr-2" /> Dodaj pojazd
          </button>
        </header>

        {/* scroll tylko w main */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
