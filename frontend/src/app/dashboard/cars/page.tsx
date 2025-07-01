// app/dashboard/cars/page.tsx
"use client";

import React, { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Car as CarIcon, X, Plus } from "lucide-react";
import HashLoader from "react-spinners/HashLoader";
import DatePicker from "react-datepicker";
import { Transition } from "@headlessui/react";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  engine?: string;
  power?: number;
  kilometers?: number;
  vin: string;
  registration?: string;
  purchaseDate?: string;
  upcomingServices?: Array<{
    type: string;
    date: string;
  }>;
}

export default function MyCarsPage() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Nowe stany do modala ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMake, setNewMake] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newYear, setNewYear] = useState<number | "">(new Date().getFullYear());
  const [newEngine, setNewEngine] = useState("");
  const [newPower, setNewPower] = useState<number | "">("");
  const [newKm, setNewKm] = useState<number | "">("");
  const [newVin, setNewVin] = useState("");
  const [newReg, setNewReg] = useState("");
  const [newPurchaseDate, setNewPurchaseDate] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCars = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.replace("/login");
    setLoading(true);
    try {
      const { data } = await axios.get<{ user: { cars: Car[] } }>(
        `${API_URL}/api/v1/user/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCars(data.user.cars);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // --- handler dodania ---
  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/v1/cars`,
        {
          make: newMake,
          model: newModel,
          year: newYear,
          engine: newEngine,
          power: newPower,
          kilometers: newKm,
          vin: newVin,
          registration: newReg,
          purchaseDate: newPurchaseDate?.toISOString().split("T")[0],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAddModal(false);
      // wyczyść formularz
      setNewMake("");
      setNewModel("");
      setNewYear(new Date().getFullYear());
      setNewEngine("");
      setNewPower("");
      setNewKm("");
      setNewVin("");
      setNewReg("");
      setNewPurchaseDate(null);
      // odśwież listę
      fetchCars();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Coś poszło nie tak.");
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <HashLoader size={60} />
      </div>
    );

  return (
    <div className="p-6 space-y-10">
      {/* Nagłówek */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Moje pojazdy</h1>
      </div>

      {/* Karty pojazdów */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div
            key={car.id}
            className="bg-white rounded-lg shadow p-6 flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {car.make} {car.model}
                </h2>
                <p className="text-gray-500">
                  {car.year} • {car.engine} • {car.power} KM
                </p>
              </div>
              <span className="text-sm bg-green-100 text-green-700 px-2 rounded">
                Aktywny
              </span>
            </div>

            <div className="bg-gray-100 h-40 rounded mb-4 flex items-center justify-center text-gray-300">
              <CarIcon className="w-12 h-12" />
            </div>

            <ul className="flex-1 text-sm text-gray-600 space-y-1">
              {car.kilometers != null && (
                <li>
                  <strong>Przebieg:</strong> {car.kilometers.toLocaleString()}{" "}
                  km
                </li>
              )}
              <li>
                <strong>VIN:</strong>{" "}
                <code className="bg-gray-100 px-1 rounded">{car.vin}</code>
              </li>
              {car.registration && (
                <li>
                  <strong>Rejestracja:</strong> {car.registration}
                </li>
              )}
              {car.purchaseDate && (
                <li>
                  <strong>Data zakupu:</strong>{" "}
                  {new Date(car.purchaseDate).toLocaleDateString("pl-PL")}
                </li>
              )}
            </ul>

            <div className="mt-4 flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-700 hover:text-gray-50 transition-all cursor-pointer font-semibold border border-gray-600">
                Edytuj
              </button>
              <button
                onClick={() => router.push(`/dashboard/cars/${car.id}`)}
                className="px-4 py-2 bg-gray-700 text-gray-50 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-all cursor-pointer font-semibold border border-transparent hover:border-gray-600"
              >
                Szczegóły
              </button>
            </div>
          </div>
        ))}

        <div
          onClick={() => setShowAddModal(true)}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition"
        >
          <Plus className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-gray-500 font-semibold">Dodaj nowy pojazd</p>
        </div>

        {/* Dodaj nowy */}
        <Transition appear show={showAddModal} as={Fragment}>
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowAddModal(false)}
              />
            </Transition.Child>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 z-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-700">
                    Nowy pojazd
                  </h2>
                  <button
                    className="cursor-pointer hover:text-gray-400 transition-all"
                    onClick={() => setShowAddModal(false)}
                  >
                    <X size={24} />
                  </button>
                </div>

                {errorMsg && (
                  <div className="mb-3 text-red-600 text-sm">{errorMsg}</div>
                )}

                <form
                  onSubmit={handleAddCar}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {/* Marka */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Marka
                    </label>
                    <input
                      required
                      value={newMake}
                      onChange={(e) => setNewMake(e.target.value)}
                      placeholder="Toyota"
                      className="h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Model */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Model
                    </label>
                    <input
                      required
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      placeholder="Corolla"
                      className="h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Rok */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Rok
                    </label>
                    <input
                      type="number"
                      value={newYear}
                      onChange={(e) => setNewYear(+e.target.value)}
                      className="h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Silnik */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Silnik
                    </label>
                    <input
                      value={newEngine}
                      onChange={(e) => setNewEngine(e.target.value)}
                      placeholder="1.6 16V"
                      className="h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Moc */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Moc (KM)
                    </label>
                    <input
                      type="number"
                      value={newPower}
                      onChange={(e) => setNewPower(+e.target.value)}
                      className="h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Przebieg */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Przebieg (km)
                    </label>
                    <input
                      type="number"
                      value={newKm}
                      onChange={(e) => setNewKm(+e.target.value)}
                      className="h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* VIN (pełna szer.) */}
                  <div className="flex flex-col sm:col-span-2">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      VIN
                    </label>
                    <input
                      required
                      value={newVin}
                      onChange={(e) => setNewVin(e.target.value)}
                      placeholder="1HGCM82633A004352"
                      className="h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Rejestracja */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Rejestracja
                    </label>
                    <input
                      value={newReg}
                      onChange={(e) => setNewReg(e.target.value)}
                      className="h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Data zakupu */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Data zakupu
                    </label>
                    <DatePicker
                      selected={newPurchaseDate}
                      onChange={setNewPurchaseDate}
                      dateFormat="yyyy-MM-dd"
                      className="h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholderText="——"
                    />
                  </div>

                  {/* Przyciski */}
                  <div className="sm:col-span-2 flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition cursor-pointer"
                    >
                      Anuluj
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all cursor-pointer"
                    >
                      Dodaj
                    </button>
                  </div>
                </form>
              </div>
            </Transition.Child>
          </div>
        </Transition>
      </div>
    </div>
  );
}
