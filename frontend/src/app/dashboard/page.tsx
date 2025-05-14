/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  Car as CarIcon,
  Calendar,
  CreditCard,
  FileText,
  Settings as Gear,
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HashLoader } from "react-spinners";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export interface MeResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  premium: boolean;
  cars: Array<{
    id: string;
    vin: string;
    make: string;
    model: string;
    year: number;
    engine?: string | null;
    power?: number | null;
    kilometers?: number | null;
    registration?: string | null;
    purchaseDate?: string | null; // frontend trzyma jako ISO-string
    fuelType?: string | null;
    color?: string | null;
    createdAt: string; // ISO-string
    ownerId: string;
    upcomingServices?: Array<{
      type: string;
      date: string; // ISO
    }>;
    recentRepairs?: Array<{
      title: string;
      date: string; // ISO
      cost: number;
    }>;
    expenses?: Array<{
      id: string;
      category: string;
      amount: number;
      date: string;
      description?: string;
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [planned, setPlanned] = useState<any[]>([]);

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchPlannedRepairs = async () => {
      try {
        const all: any[] = [];
        if (!user) return;
        for (const car of user.cars) {
          const res = await axios.get(
            `${API_URL}/api/v1/cars/${car.id}/planned-repairs`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          res.data.forEach((p: any) =>
            all.push({
              ...p,
              carLabel: `${car.make} ${car.model}`,
            })
          );
        }
        setPlanned(all);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPlannedRepairs();
  }, [user]);

  if (loading)
    return (
      <div className="flex h-screen justify-center items-center">
        <HashLoader size={60} />
      </div>
    );
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

  const upcomingServices =
    (user as any).upcomingServices
      ?.map((svc: any) => ({
        icon: getServiceIcon(svc.type),
        title: svc.type,
        date: svc.date,
        details: `${svc.carLabel} • ${new Date(svc.date).toLocaleDateString(
          "pl-PL"
        )}`,
        days: Math.ceil(
          (new Date(svc.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      }))
      .sort(
        (a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      ) || [];

  const repairs = user.cars.flatMap((car) =>
    (car.recentRepairs ?? []).map((r) => ({
      title: r.title,
      details: `${car.make} ${car.model} • ${new Date(
        r.date
      ).toLocaleDateString()}`,
      cost: r.cost,
    }))
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* --- MAIN AREA --- */}
      <div className="flex-1 flex flex-col">
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
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-1 rounded-t-lg font-medium ${
                  activeTab === tab.key
                    ? "bg-white border-t border-x border-gray-200 "
                    : "bg-gray-100 text-gray-600 cursor-pointer"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "przeglad" && (
            <>
              {/* statystyki */}
              <div
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
                data-aos="fade-out"
              >
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
                    {upcomingServices.map((item: any) => (
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
                        <div
                          className={`px-3 py-1 rounded-full text-sm ${
                            item.days === 0
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.days === 0 ? "Dziś" : `${item.days} dni`}
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
          {activeTab === "pojazdy" && (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              data-aos="fade-out"
            >
              {user.cars.map((car) => (
                <div
                  key={car.id}
                  className="bg-white p-4 rounded-lg shadow flex flex-col space-y-2"
                >
                  <div className="text-lg font-semibold">
                    {car.make} {car.model}
                  </div>
                  <div className="text-sm text-gray-500">Rok: {car.year}</div>
                  <div className="text-sm text-gray-500">
                    VIN:{" "}
                    <code className="bg-gray-100 px-1 rounded">{car.vin}</code>
                  </div>
                  {car.registration && (
                    <div className="text-sm text-gray-500">
                      Rejestracja: {car.registration}
                    </div>
                  )}
                  {car.kilometers != null && (
                    <div className="text-sm text-gray-500">
                      Przebieg: {car.kilometers.toLocaleString()} km
                    </div>
                  )}
                  {car.color && (
                    <div className="text-sm text-gray-500">
                      Kolor: {car.color}
                    </div>
                  )}
                  <Link
                    href={`/dashboard/cars/${car.id}`}
                    className="mt-auto self-start text-sm text-emerald-600 hover:underline cursor-pointer"
                  >
                    Szczegóły pojazdu →
                  </Link>
                </div>
              ))}
              {user.cars.length === 0 && (
                <div className="col-span-full text-center text-gray-500">
                  Nie masz jeszcze żadnych pojazdów.{" "}
                  <button
                    onClick={() => router.push("/dashboard/add-car")}
                    className="text-emerald-600 hover:underline cursor-pointer"
                  >
                    Dodaj pierwszy
                  </button>
                </div>
              )}
            </div>
          )}
          {activeTab === "wydatki" && (
            <>
              {/* --- Górne kafelki z podsumowaniem wydatków --- */}
              <div
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
                data-aos="fade-out"
              >
                {/* Wydatki w tym miesiącu */}
                <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col">
                  <div className="flex items-center justify-between text-gray-500 mb-2">
                    <span>Wydatki w tym miesiącu</span>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {/* sumujemy amount dla expense.date w bieżącym miesiącu */}
                    {user.cars
                      .flatMap((c) => c.expenses || [])
                      .filter((e) => {
                        const d = new Date(e.date);
                        const now = new Date();
                        return (
                          d.getFullYear() === now.getFullYear() &&
                          d.getMonth() === now.getMonth()
                        );
                      })
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toFixed(0)}{" "}
                    zł
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.cars
                      .flatMap((c) => c.expenses || [])
                      .filter((e) => {
                        const d = new Date(e.date);
                        const now = new Date();
                        return (
                          d.getFullYear() === now.getFullYear() &&
                          d.getMonth() === now.getMonth()
                        );
                      }).length + ""}
                    {" wydatków"}
                  </div>
                </div>

                {/* Łączna kwota wydatków */}
                <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col">
                  <div className="flex items-center justify-between text-gray-500 mb-2">
                    <span>Wydatki ogółem</span>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {user.cars
                      .flatMap((c) => c.expenses || [])
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toFixed(0)}{" "}
                    zł
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.cars.flatMap((c) => c.expenses || []).length +
                      " pozycji"}
                  </div>
                </div>

                {/* Liczba pojazdów – kopiujemy z overview */}
                <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col">
                  <div className="flex items-center justify-between text-gray-500 mb-2">
                    <span>Liczba pojazdów</span>
                    <CarIcon className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold">{user.cars.length}</div>
                  <div className="text-sm text-gray-600">
                    zarejestrowanych aut
                  </div>
                </div>
              </div>

              {/* --- Lista wszystkich wydatków --- */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Lista wydatków</h3>
                <ul className="space-y-4">
                  {user.cars
                    .flatMap((car) =>
                      (car.expenses || []).map((e) => ({
                        ...e,
                        carLabel: `${car.make} ${car.model}`,
                      }))
                    )
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((e) => (
                      <li
                        key={e.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">{e.category}</div>
                          <div className="text-sm text-gray-500">
                            {e.carLabel} •{" "}
                            {new Date(e.date).toLocaleDateString()}
                            {e.description && ` – ${e.description}`}
                          </div>
                        </div>
                        <div className="font-semibold">{e.amount} zł</div>
                      </li>
                    ))}
                </ul>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
