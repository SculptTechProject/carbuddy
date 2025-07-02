/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { Fragment, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Plus, X } from "lucide-react";
import HashLoader from "react-spinners/HashLoader";
import { Transition } from "@headlessui/react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const DEFAULT_REPAIR_TYPES = ["Naprawa", "Serwis"];

interface Vehicle {
  id: string;
  make: string;
  model: string;
}

interface RawRepair {
  id: string;
  date: string;
  type: string;
  description?: string;
  workshop?: string;
  cost: number;
  kilometers?: number;
}

interface FlatRepair extends RawRepair {
  carId: string;
  carLabel: string;
}

export default function RepairsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [repairs, setRepairs] = useState<FlatRepair[]>([]);

  // filtry
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("");
  const [filterType, setFilterType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // modal
  const [showModal, setShowModal] = useState(false);
  const [newDate, setNewDate] = useState<Date | null>(new Date());
  const [newVehicleId, setNewVehicleId] = useState<string>("");
  const [newType, setNewType] = useState<string>(DEFAULT_REPAIR_TYPES[0]);
  const [newWorkshop, setNewWorkshop] = useState<string>("");
  const [newKilometers, setNewKilometers] = useState<number | "">("");
  const [newCost, setNewCost] = useState<number>(0);
  const [newDesc, setNewDesc] = useState<string>("");
  const [newNotes, setNewNotes] = useState<string>("");

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.replace("/login");
          return;
        }

        // 1) pobierz listę pojazdów
        const { data: user } = await axios.get(`${API_URL}/api/v1/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const cars: Vehicle[] = user.user.cars.map((c: any) => ({
          id: c.id,
          make: c.make,
          model: c.model,
        }));

        setVehicles(cars);
        const firstCarId = cars[0]?.id || "";
        setNewVehicleId(firstCarId);

        // 2) pobierz naprawy osobno dla każdego auta
        const allRepairs: FlatRepair[] = [];

        for (const car of cars) {
          const { data: repairs } = await axios.get(
            `${API_URL}/api/v1/cars/${car.id}/repairs`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const flatMapped = repairs.map((r: RawRepair) => ({
            ...r,
            carId: car.id,
            carLabel: `${car.make} ${car.model}`,
          }));

          allRepairs.push(...flatMapped);
        }

        setRepairs(allRepairs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [router]);

  const filtered = repairs.filter((r) => {
    const d = new Date(r.date);
    const okFrom = !dateFrom || d >= new Date(dateFrom);
    const okTo = !dateTo || d <= new Date(dateTo);

    return (
      okFrom &&
      okTo &&
      (!filterVehicle || r.carId === filterVehicle) &&
      (!filterType || r.type === filterType) &&
      (!searchTerm ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.workshop?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  /* ── dane do kart i wykresów ───────────────────────── */
  const now = new Date();
  const thisMonthCost = repairs
    .filter((r) => {
      const d = new Date(r.date);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((s, r) => s + r.cost, 0);

  const thisYearCost = repairs
    .filter((r) => new Date(r.date).getFullYear() === now.getFullYear())
    .reduce((s, r) => s + r.cost, 0);

  const monthlyTrend: Record<string, number> = {};
  repairs.forEach((r) => {
    const d = new Date(r.date);
    const key = d.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    monthlyTrend[key] = (monthlyTrend[key] || 0) + r.cost;
  });
  const monthlyChartData = Object.entries(monthlyTrend).map(
    ([month, cost]) => ({
      month,
      cost,
    })
  );

  const typeSplit: Record<string, number> = {};
  repairs.forEach((r) => {
    typeSplit[r.type] = (typeSplit[r.type] || 0) + r.cost;
  });
  const typeChartData = Object.entries(typeSplit).map(([name, value]) => ({
    name,
    value,
  }));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/api/v1/cars/${newVehicleId}/repairs`,
        {
          date: newDate,
          type: newType,
          description: newDesc,
          workshop: newWorkshop,
          cost: newCost,
          kilometers: newKilometers,
          notes: newNotes,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      // odśwież listę
      setShowModal(false);
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/v1/user/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const all: FlatRepair[] = data.user.cars.flatMap((c: any) =>
        (c.repairs || []).map((r: RawRepair) => ({
          ...r,
          carId: c.id,
          carLabel: `${c.make} ${c.model}`,
        }))
      );
      setRepairs(all);
    } catch (err) {
      console.error(err);
      alert("Nie udało się zapisać naprawy");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <HashLoader size={60} />
      </div>
    );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Nagłówek */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Historia napraw</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-sm">
            Eksportuj
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 text-sm flex items-center gap-1 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> Dodaj naprawę
          </button>
        </div>
      </div>

      {/* KPI + Charts */}
      <div className="space-y-8">
        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Koszt w tym miesiącu", value: thisMonthCost },
            { label: "Koszt w tym roku", value: thisYearCost },
            {
              label: "Śr. koszt / naprawę",
              value: repairs.length ? thisYearCost / repairs.length : 0,
            },
          ].map((k) => (
            <div key={k.label} className="rounded-lg bg-white shadow p-4">
              <div className="text-sm text-gray-500">{k.label}</div>
              <div className="text-2xl font-bold">{k.value.toFixed(0)} zł</div>
            </div>
          ))}
        </div>

        {/* charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* line – trend */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="font-semibold mb-2">
              Koszt napraw – ostatnie 12 mies.
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyChartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* pie – Naprawa vs Serwis */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="font-semibold mb-2">Podział kosztów wg typu</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={typeChartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={70}
                >
                  {typeChartData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={["#EF4444", "#3B82F6", "#FBBF24"][i % 3]}
                    />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={24} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filtry */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-4">
        <input
          type="text"
          placeholder="Szukaj napraw..."
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          value={filterVehicle}
          onChange={(e) => setFilterVehicle(e.target.value)}
        >
          <option value="">Wszystkie pojazdy</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.make} {v.model}
            </option>
          ))}
        </select>
        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Wszystkie typy</option>
          {Array.from(
            new Set(repairs.map((r) => r.type).concat(DEFAULT_REPAIR_TYPES))
          ).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <label className="text-sm font-medium flex flex-col">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-xl border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </label>

        <label className="text-sm font-medium flex flex-col">
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-xl border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </label>
      </div>

      {/* Tabela */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <div className="h-[70vh] md:h-[250px] overflow-y-auto hide-y-scrollbar">
          <table className="w-full min-w-[700px] text-left divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-xs uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Pojazd</th>
                <th className="px-4 py-3">Typ</th>
                <th className="px-4 py-3 hidden lg:table-cell">Opis</th>
                <th className="px-4 py-3 hidden md:table-cell">Warsztat</th>
                <th className="px-4 py-3 text-right">Koszt</th>
                <th className="px-4 py-3">Akcje</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(r.date).toLocaleDateString("pl-PL")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.carLabel}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.type}</td>
                  <td className="px-4 py-3 hidden lg:table-cell max-w-xs truncate">
                    {r.description}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {r.workshop}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                    {r.cost} zł
                  </td>
                  <td
                    onClick={() => router.push(`/dashboard/repairs/${r.id}`)}
                    className="px-4 py-3 text-emerald-600 hover:underline cursor-pointer"
                  >
                    Szczegóły
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Brak zarejestrowanych napraw.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal dodawania naprawy */}
      {showModal && (
        <Transition appear show={showModal} as={Fragment}>
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
            {/* overlay */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowModal(false)}
              />
            </Transition.Child>

            {/* panel */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="bg-white rounded-lg shadow-lg w-full sm:max-w-lg md:max-w-2xl p-6 relative">
                <button
                  className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                  onClick={() => setShowModal(false)}
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold mb-4">
                  Dodaj nową naprawę
                </h2>
                <form
                  onSubmit={handleAdd}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {/* 1. Pojazd */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Pojazd</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={newVehicleId}
                      onChange={(e) => setNewVehicleId(e.target.value)}
                    >
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.make} {v.model}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* 2. Data */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Data</label>
                    <DatePicker
                      selected={newDate}
                      onChange={(d) => setNewDate(d)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                  {/* 3. Typ */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Typ naprawy</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                    >
                      {DEFAULT_REPAIR_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* 4. Warsztat */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Warsztat</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={newWorkshop}
                      onChange={(e) => setNewWorkshop(e.target.value)}
                    />
                  </div>
                  {/* 5. Przebieg */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Przebieg (km)</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="np. 120000"
                      value={newKilometers}
                      onChange={(e) =>
                        setNewKilometers(
                          e.target.value ? parseInt(e.target.value) : ""
                        )
                      }
                    />
                  </div>
                  {/* 6. Koszt */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      Całkowity koszt (zł)
                    </label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="np. 650"
                      value={newCost}
                      onChange={(e) => setNewCost(parseFloat(e.target.value))}
                    />
                  </div>
                  {/* 7. Opis */}
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-sm font-medium">Opis naprawy</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Co zostało zrobione?"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                    />
                  </div>
                  {/* 8. Notatki */}
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-sm font-medium">
                      Dodatkowe notatki
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows={3}
                      placeholder="Uwagi dodatkowe..."
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                    />
                  </div>
                </form>

                {/* Akcje */}
                <div className="flex justify-end gap-2 pt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-sm"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={(e) => handleAdd(e as any)}
                    className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 text-sm"
                  >
                    Zapisz naprawę
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Transition>
      )}
    </div>
  );
}
