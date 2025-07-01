"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Fragment, useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Plus, X } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import { HashLoader } from "react-spinners";
import { Transition } from "@headlessui/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_CATEGORIES = [
  "Opony",
  "Silnik",
  "Oleje",
  "Hamulce",
  "Zawieszenie",
  "Elektryka",
  "Płyny chłodnicze",
  "Inne",
];

interface VehicleOption {
  id: string;
  label: string;
}

export default function ExpensesPage() {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [filterVehicle, setFilterVehicle] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [catData, setCatData] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [newDate, setNewDate] = useState<Date | null>(new Date());
  const [newVehicleId, setNewVehicleId] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>(DEFAULT_CATEGORIES[0]);
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newDesc, setNewDesc] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: user } = await axios.get(`${API_URL}/api/v1/user/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        // map vehicles
        const opts: VehicleOption[] = user.user.cars.map((c: any) => ({
          id: c.id,
          label: `${c.make} ${c.model}`,
        }));
        setVehicles(opts);
        setNewVehicleId(opts[0]?.id || "");

        // fetch all expenses
        const allExpenses: any[] = [];
        for (const car of user.user.cars) {
          const { data: carExpenses } = await axios.get(
            `${API_URL}/api/v1/cars/${car.id}/expenses`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          allExpenses.push(
            ...carExpenses.map((e: any) => ({
              ...e,
              car: `${car.make} ${car.model}`,
              carId: car.id,
            }))
          );
        }
        setExpenses(allExpenses);

        // build categories
        const existing = Array.from(
          new Set(allExpenses.map((e) => e.category))
        );
        const mergedCats = Array.from(
          new Set([...DEFAULT_CATEGORIES, ...existing])
        );
        setCategories(mergedCats);
        setNewCategory(mergedCats[0] || DEFAULT_CATEGORIES[0]);

        // monthly chart data
        const m: Record<string, number> = {};
        allExpenses.forEach((e) => {
          const d = new Date(e.date);
          const key = d.toLocaleString("default", {
            month: "short",
            year: "numeric",
          });
          m[key] = (m[key] || 0) + e.amount;
        });
        setMonthlyData(
          Object.entries(m).map(([month, amount]) => ({ month, amount }))
        );

        // category pie data
        const c: Record<string, number> = {};
        allExpenses.forEach((e) => {
          c[e.category] = (c[e.category] || 0) + e.amount;
        });
        setCatData(Object.entries(c).map(([name, value]) => ({ name, value })));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [refreshTrigger]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await axios.post(
        `${API_URL}/api/v1/cars/${newVehicleId}/expenses`,
        {
          date: newDate,
          category: newCategory,
          amount: newAmount,
          description: newDesc,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setShowModal(false);
      setRefreshTrigger((p) => p + 1);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || "Nie udało się dodać wydatku."
      );
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <HashLoader />
      </div>
    );

  // filtering
  const filtered = expenses.filter(
    (e) =>
      (!filterVehicle || e.carId === filterVehicle) &&
      (!filterCategory || e.category === filterCategory) &&
      (!searchTerm ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const now = new Date();
  const thisMonthSum = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((s, e) => s + e.amount, 0);
  const thisYearSum = expenses
    .filter((e) => new Date(e.date).getFullYear() === now.getFullYear())
    .reduce((s, e) => s + e.amount, 0);
  const avgMonthly = thisYearSum / 12;
  const costPerKm = thisYearSum / 1000;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Wydatki</h1>
        <div className="space-x-2">
          <button className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 border border-gray-300 transition">
            Export
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4 mr-1" /> Dodaj wydatek
          </button>
        </div>
      </div>

      {/* Modal with animation */}
      <Transition appear show={showModal} as={Fragment}>
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
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
              className="fixed inset-0 backdrop-blur-xl"
              onClick={() => setShowModal(false)}
            />
          </Transition.Child>

          {/* modal panel */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 relative z-10">
              {/* header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Nowy wydatek
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <X size={24} />
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
                  {errorMsg}
                </div>
              )}

              <form
                onSubmit={handleAdd}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Data */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-700">
                    Data
                  </label>
                  <DatePicker
                    selected={newDate}
                    onChange={(d) => setNewDate(d)}
                    className="border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    dateFormat="yyyy-MM-dd"
                  />
                </div>
                {/* Pojazd */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-700 transition-all">
                    Pojazd
                  </label>
                  <select
                    value={newVehicleId}
                    onChange={(e) => setNewVehicleId(e.target.value)}
                    className="border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Kategoria */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-700">
                    Kategoria
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Kwota */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-700">
                    Kwota (zł)
                  </label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) =>
                      setNewAmount(parseFloat(e.target.value) || 0)
                    }
                    className="border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                {/* Opis */}
                <div className="md:col-span-2 flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-700">
                    Opis
                  </label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={3}
                    className="border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none transition-all"
                  />
                </div>
                {/* Buttons */}
                <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Zapisz
                  </button>
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </Transition>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Wydatki w tym miesiącu",
            value: thisMonthSum,
            suffix: "zł",
          },
          { title: "Wydatki w tym roku", value: thisYearSum, suffix: "zł" },
          { title: "Śr. miesięczny koszt", value: avgMonthly, suffix: "zł" },
          { title: "Koszt na km", value: costPerKm, suffix: "zł" },
        ].map(({ title, value, suffix }) => (
          <div key={title} className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500 mb-1">{title}</div>
            <div className="text-2xl font-bold">
              {value.toFixed(0)} {suffix}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* line chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="font-semibold mb-2">
            Podsumowanie wydatków (ostatnie 12 mies.)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* pie & bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* pie */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="font-semibold mb-2">Wydatki według kategorii</div>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={catData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={60}
                >
                  {catData.map((entry, idx) => (
                    <Cell
                      key={entry.name}
                      fill={
                        ["#10B981", "#3B82F6", "#FBBF24", "#EF4444"][idx % 4]
                      }
                    />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={24} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* vehicle bars */}
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <div className="font-semibold mb-2">Wydatki według pojazdów</div>
            {vehicles.map((v) => {
              const sum = expenses
                .filter((e) => e.carId === v.id)
                .reduce((s, e) => s + e.amount, 0);
              const pct = thisYearSum ? (sum / thisYearSum) * 100 : 0;
              return (
                <div key={v.id}>
                  <div className="flex justify-between font-medium">
                    <span>{v.label}</span>
                    <span>{sum.toFixed(0)} zł</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-emerald-500 rounded"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {pct.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <input
            type="text"
            placeholder="Szukaj wydatków..."
            className="flex-1 border rounded px-3 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2">
            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Wszystkie pojazdy</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Wszystkie kategorie</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="text-sm text-gray-600">
              <th className="py-2">Data</th>
              <th>Pojazd</th>
              <th>Kategoria</th>
              <th>Opis</th>
              <th className="text-right">Kwota</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="py-2">
                  {new Date(e.date).toLocaleDateString()}
                </td>
                <td>{e.car}</td>
                <td>{e.category}</td>
                <td>{e.description}</td>
                <td className="text-right font-semibold">{e.amount} zł</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
