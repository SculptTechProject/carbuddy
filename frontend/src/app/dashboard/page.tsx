"use client";

import React, { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Menu,
  Bell,
  Car as CarIcon,
  Calendar,
  CreditCard,
  List,
  FileText,
  Settings as Gear,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Cpu,
  Plus,
  LogOut,
  Settings,
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

interface MeResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  premium: boolean;
  cars: Array<{
    id: number;
    make: string;
    model: string;
    upcomingServices: Array<{
      type: string;
      date: string;
    }>;
    recentRepairs: Array<{
      title: string;
      date: string;
      cost: number;
    }>;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "przeglad" | "pojazdy" | "wydatki"
  >("przeglad");
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      if (token) {
        await axios.post(
          `${API_URL}/api/v1/user/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("token");
      router.replace("/login");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        // backend zwraca `{ user: MeResponse }`
        const res = await axios.get<{ user: MeResponse }>(
          `${API_URL}/api/v1/user/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(res.data.user);
      } catch (err) {
        // token nieważny / brak dostępu
        localStorage.removeItem("token");
        router.replace("/login");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) return <div>Ładowanie…</div>;
  if (!user) return null;

  // Ikony według typu usługi
  const getServiceIcon = (type: string) => {
    if (type.includes("Przegląd"))
      return <Calendar className="w-6 h-6 text-emerald-500" />;
    if (type.includes("Ubezpieczenie"))
      return <FileText className="w-6 h-6 text-blue-500" />;
    if (type.includes("Wymiana oleju"))
      return <Gear className="w-6 h-6 text-yellow-500" />;
    return <CarIcon className="w-6 h-6 text-gray-500" />;
  };

  // Przygotowujemy dane
  const upcomingServices = user.cars.flatMap((car) =>
    car.upcomingServices.map((svc) => ({
      icon: getServiceIcon(svc.type),
      title: svc.type,
      details: `${car.make} ${car.model} • ${new Date(
        svc.date
      ).toLocaleDateString()}`,
      days: Math.ceil(
        (new Date(svc.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
    }))
  );

  const repairs = user.cars.flatMap((car) =>
    car.recentRepairs.map((r) => ({
      title: r.title,
      details: `${car.make} ${car.model} • ${new Date(
        r.date
      ).toLocaleDateString()}`,
      cost: r.cost,
    }))
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* --- SIDEBAR --- */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200">
        {/* logo */}
        <div className="flex items-center h-16 px-6 border-b">
          <CarIcon className="w-6 h-6 text-emerald-500 mr-2" />
          <span className="font-bold text-lg">CarBuddy</span>
        </div>
        {/* plan */}
        <nav className="flex-1 p-4 space-y-2 text-gray-700 text-sm">
          <div className="mb-4 px-2 py-1 bg-emerald-50 text-emerald-600 rounded">
            Plan:{" "}
            <span className="font-medium">{user.premium ? "Pro" : "Free"}</span>
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
            <CarIcon className="w-5 h-5 mr-3" /> Moje pojazdy (
            {user.cars.length})
          </Link>
          {/* … pozostałe linki */}
        </nav>
        <div className="p-4 border-t">
          <Link
            href="#"
            className="flex items-center px-2 py-2 rounded hover:bg-gray-50"
          >
            <Settings className="w-5 h-5 mr-3" /> Ustawienia
          </Link>
          <button
            onClick={handleLogout}
            className="mt-2 flex items-center w-full px-2 py-2 rounded hover:bg-gray-50 text-left"
          >
            <LogOut className="w-5 h-5 mr-3" /> Wyloguj
          </button>
        </div>
      </aside>

      {/* --- MAIN AREA --- */}
      <div className="flex-1 flex flex-col">
        {/* top bar */}
        <header className="flex items-center justify-between bg-white px-4 py-3 border-b">
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {upcomingServices.length}
              </span>
            </div>
            <div className="w-8 h-8 bg-gray-300 rounded-full" />
          </div>
          <button className="flex items-center bg-black text-white px-3 py-1 rounded">
            <Plus className="w-4 h-4 mr-2" /> Dodaj pojazd
          </button>
        </header>

        {/* content */}
        <main className="p-6 overflow-auto">
          <h2 className="text-2xl font-semibold mb-4">
            Witaj, {user.firstName}!
          </h2>

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
              {/* statystyki */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-gray-500 mb-2 flex justify-between">
                    <span>Nadchodzące usługi</span>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {upcomingServices.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    razem dla wszystkich aut
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-gray-500 mb-2 flex justify-between">
                    <span>Ostatnie naprawy</span>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {repairs.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    w ostatnich serwisach
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-gray-500 mb-2 flex justify-between">
                    <span>Liczba pojazdów</span>
                    <CarIcon className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold">{user.cars.length}</div>
                  <div className="text-sm text-gray-600">
                    zarejestrowanych aut
                  </div>
                </div>
              </div>

              {/* Nadchodzące terminy */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col">
                  <h3 className="text-lg font-semibold mb-4">
                    Nadchodzące terminy
                  </h3>
                  <ul className="space-y-4 flex-1">
                    {upcomingServices.map((item) => (
                      <li
                        key={item.title + item.details}
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
                </div>

                {/* Ostatnie naprawy */}
                <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col">
                  <h3 className="text-lg font-semibold mb-4">
                    Ostatnie naprawy
                  </h3>
                  <ul className="space-y-4 flex-1">
                    {repairs.map((r) => (
                      <li
                        key={r.title + r.details}
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
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
