// app/dashboard/page.tsx (or wherever you mount it)
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Bell,
  Car as CarIcon,
  Calendar,
  CreditCard,
  List,
  FileText,
  Settings as Gear,
  Cpu,
  Plus,
  LogOut,
  Settings,
} from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<
    "przeglad" | "pojazdy" | "wydatki"
  >("przeglad");

  // dummy data
  const upcoming = [
    {
      icon: <CarIcon className="w-6 h-6 text-emerald-500" />,
      title: "Przegląd techniczny",
      details: "Audi A4 • 15.06.2025",
      days: 15,
    },
    {
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      title: "Ubezpieczenie OC",
      details: "Volkswagen Golf • 30.06.2025",
      days: 30,
    },
    {
      icon: <Gear className="w-6 h-6 text-yellow-500" />,
      title: "Wymiana oleju",
      details: "Audi A4 • 15.07.2025",
      days: 45,
    },
  ];

  const repairs = [
    {
      title: "Wymiana klocków hamulcowych",
      details: "Audi A4 • 10.04.2025",
      cost: 650,
    },
    {
      title: "Wymiana filtra powietrza",
      details: "Volkswagen Golf • 25.03.2025",
      cost: 120,
    },
    {
      title: "Wymiana oleju silnikowego",
      details: "Audi A4 • 15.03.2025",
      cost: 480,
    },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200">
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <CarIcon className="w-6 h-6 text-emerald-500 mr-2" />
          <span className="font-bold text-lg">CarBuddy</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 text-gray-700 text-sm">
          <div className="mb-4 px-2 py-1 bg-emerald-50 text-emerald-600 font-medium rounded">
            Plan: <span className="ml-1">Premium</span>
          </div>
          <Link
            href="#"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50"
          >
            <List className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link
            href="#"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50"
          >
            <CarIcon className="w-5 h-5 mr-3" /> Moje pojazdy
          </Link>
          <Link
            href="#"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50"
          >
            <Calendar className="w-5 h-5 mr-3" /> Terminarz
          </Link>
          <Link
            href="#"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50"
          >
            <FileText className="w-5 h-5 mr-3" /> Historia napraw
          </Link>
          <Link
            href="#"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50"
          >
            <CreditCard className="w-5 h-5 mr-3" /> Wydatki
          </Link>
          <Link
            href="#"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50"
          >
            <Cpu className="w-5 h-5 mr-3" /> Analityka
          </Link>
          <Link
            href="#"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50"
          >
            <Gear className="w-5 h-5 mr-3" /> Wyszukiwarka warsztatów
          </Link>
          <Link
            href="#"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50"
          >
            <Cpu className="w-5 h-5 mr-3" /> Predykcja serwisowa
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Link
            href="#"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50 text-gray-700"
          >
            <Settings className="w-5 h-5 mr-3" /> Ustawienia
          </Link>
          <Link
            href="#"
            className="mt-2 flex items-center px-2 py-2 rounded hover:bg-gray-50 text-gray-700"
          >
            <LogOut className="w-5 h-5 mr-3" /> Wyloguj
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between bg-white px-4 py-3 border-b border-gray-200">
          <div className="flex items-center md:hidden">
            <Menu className="w-6 h-6 text-gray-700" />
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Bell className="w-6 h-6 text-gray-600 relative">
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </Bell>
            <div className="w-8 h-8 bg-gray-300 rounded-full" />
          </div>
          <button className="flex items-center bg-black text-white px-3 py-1 rounded">
            <Plus className="w-4 h-4 mr-2" /> Dodaj pojazd
          </button>
        </header>

        {/* Content */}
        <main className="p-6 overflow-auto">
          <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>

          {/* Tabs */}
          <div className="flex space-x-2 mb-6">
            {[
              { key: "przeglad", label: "Przegląd" },
              { key: "pojazdy", label: "Pojazdy" },
              { key: "wydatki", label: "Wydatki" },
            ].map((tab) => (
              <button
                key={tab.key}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-1 rounded-t-lg font-medium ${
                  activeTab === tab.key
                    ? "bg-white border-t border-x border-gray-200"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "przeglad" && (
            <>
              {/* Top stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col">
                  <div className="flex items-center justify-between text-gray-500 mb-2">
                    <span>Najbliższy przegląd</span>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold mb-1">15 dni</div>
                  <div className="text-sm text-gray-600">
                    Przegląd techniczny – Audi A4
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full mt-4">
                    <div className="w-1/3 h-full bg-black rounded-full" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col">
                  <div className="flex items-center justify-between text-gray-500 mb-2">
                    <span>Wydatki w tym miesiącu</span>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold mb-1">1 250 zł</div>
                  <div className="text-sm text-gray-600">
                    +15% w porównaniu do poprzedniego miesiąca
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col">
                  <div className="flex items-center justify-between text-gray-500 mb-2">
                    <span>Łączna liczba pojazdów</span>
                    <CarIcon className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold">2</div>
                  <div className="text-sm text-gray-600">
                    Audi A4, Volkswagen Golf
                  </div>
                </div>
              </div>

              {/* Lower cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming */}
                <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col">
                  <h3 className="text-lg font-semibold mb-4">
                    Nadchodzące terminy
                  </h3>
                  <ul className="space-y-4 flex-1">
                    {upcoming.map((item) => (
                      <li
                        key={item.title}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          {item.icon}
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-gray-500">
                              {item.details}
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                          {item.days} dni
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-6 self-start px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                    Zobacz wszystkie terminy
                  </button>
                </div>

                {/* Repairs */}
                <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col">
                  <h3 className="text-lg font-semibold mb-4">
                    Ostatnie naprawy
                  </h3>
                  <ul className="space-y-4 flex-1">
                    {repairs.map((r) => (
                      <li
                        key={r.title}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div>{r.title}</div>
                          <div className="text-sm text-gray-500">
                            {r.details}
                          </div>
                        </div>
                        <div className="font-semibold">{r.cost} zł</div>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-6 self-start px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                    Zobacz pełną historię
                  </button>
                </div>
              </div>
            </>
          )}

          {/* TODO: handle other tabs… */}
        </main>
      </div>
    </div>
  );
}
