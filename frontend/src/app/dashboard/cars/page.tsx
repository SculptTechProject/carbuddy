/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/cars/page.tsx
"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Car as CarIcon, Plus, X, Lock, AlertTriangle } from "lucide-react";
import { Transition, Dialog } from "@headlessui/react";
import HashLoader from "react-spinners/HashLoader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

/* ---------- typy ---------- */
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
}

interface MeResponse {
  premium: boolean;
  cars: Car[];
}
/* -------------------------------- */

export default function MyCarsPage() {
  const router = useRouter();

  /* ------------- stan globalny strony ------------- */
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  /* --------- stany modali --------- */
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);

  /* --------- formularz “nowy pojazd” --------- */
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

  /* --------- helpery --------- */
  const resetForm = () => {
    setNewMake("");
    setNewModel("");
    setNewYear(new Date().getFullYear());
    setNewEngine("");
    setNewPower("");
    setNewKm("");
    setNewVin("");
    setNewReg("");
    setNewPurchaseDate(null);
  };

  const freeLimitReached = me && !me.premium && me.cars.length >= 3;

  /* --------- pobranie danych użytkownika --------- */
  const fetchMe = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get<{ user: MeResponse }>(
        `${API_URL}/api/v1/user/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMe(data.user);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  /* --------- klik w kafelek “Dodaj” --------- */
  const handleOpenAdd = () => {
    if (freeLimitReached) {
      setShowUpsell(true);
    } else {
      setShowAddModal(true);
    }
  };

  /* --------- POST /cars --------- */
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
          purchaseDate: newPurchaseDate
            ? newPurchaseDate.toISOString().split("T")[0]
            : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAddModal(false);
      resetForm();
      fetchMe();
    } catch (err: any) {
      if (err.response?.data?.code === "CAR_LIMIT_REACHED") {
        setShowAddModal(false);
        setShowUpsell(true);
      } else {
        setErrorMsg("Coś poszło nie tak. Spróbuj ponownie.");
      }
    }
  };

  /* ====================== RENDER ======================= */
  if (loading || !me)
    return (
      <div className="flex h-screen items-center justify-center">
        <HashLoader size={60} />
      </div>
    );

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-semibold">Moje pojazdy</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* istniejące auta */}
        {me.cars.map((car) => (
          <div
            key={car.id}
            className="bg-white rounded-lg shadow p-6 flex flex-col"
          >
            <div className="flex justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {car.make} {car.model}
                </h2>
                <p className="text-gray-500">
                  {car.year} • {car.engine || "-"} •{" "}
                  {car.power ? `${car.power} KM` : "-"}
                </p>
              </div>
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

            <button
              onClick={() => router.push(`/dashboard/cars/${car.id}`)}
              className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-all cursor-pointer"
            >
              Szczegóły
            </button>
          </div>
        ))}

        {/* kafelek “Dodaj nowy” */}
        <div
          onClick={handleOpenAdd}
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition select-none
          ${
            freeLimitReached
              ? "cursor-not-allowed border-gray-300 text-gray-400"
              : "cursor-pointer hover:border-gray-400"
          }`}
        >
          {freeLimitReached ? (
            <>
              <Lock className="w-8 h-8 mb-2" />
              <p className="text-center text-sm">
                Limit 3 pojazdów <br />
                <span
                  className="text-emerald-600 underline"
                  onClick={() => setShowUpsell(true)}
                >
                  Ulepsz do Premium
                </span>
              </p>
            </>
          ) : (
            <>
              <Plus className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-gray-500 font-semibold">Dodaj nowy pojazd</p>
            </>
          )}
        </div>
      </div>

      {/* ────────────────── MODAL UPSALE PREMIUM ────────────────── */}
      <Transition appear show={showUpsell} as={Fragment}>
        <Dialog onClose={() => setShowUpsell(false)} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
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
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-6">
                <div className="flex justify-center">
                  <AlertTriangle className="w-10 h-10 text-yellow-500" />
                </div>
                <Dialog.Title className="text-xl font-semibold text-center">
                  Limit osiągnięty
                </Dialog.Title>
                <p className="text-center text-sm text-gray-600">
                  W planie&nbsp;<b>Free</b> możesz dodać maksymalnie&nbsp;3
                  samochody.
                  <br />
                  Przejdź na&nbsp;
                  <b className="text-emerald-600">CarBuddy Premium</b>, aby
                  korzystać z nielimitowanej liczby pojazdów oraz dodatkowych
                  funkcji (powiadomienia push, analityka, itp.).
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setShowUpsell(false)}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all cursor-pointer"
                  >
                    Zamknij
                  </button>
                  <button
                    onClick={() => router.push("/dashboard/settings")}
                    className="px-4 py-2 bg-emerald-600 text-gray-50 rounded-lg hover:bg-emerald-700 transition-all cursor-pointer"
                  >
                    Zobacz Premium
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>

      {/* ────────────────── MODAL “NOWY POJAZD” ────────────────── */}
      <Transition appear show={showAddModal} as={Fragment}>
        <Dialog
          onClose={() => setShowAddModal(false)}
          className="relative z-50"
        >
          {/* backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          {/* panel */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
                <div className="flex justify-between items-start mb-6">
                  <Dialog.Title className="text-2xl font-semibold">
                    Nowy pojazd
                  </Dialog.Title>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="hover:text-gray-400 cursor-pointer transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                {errorMsg && (
                  <div className="mb-3 text-red-600 text-sm">{errorMsg}</div>
                )}

                {/* ---------- FORMULARZ ---------- */}
                <form
                  onSubmit={handleAddCar}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {/* poniżej wszystkie inputy jak wcześniej … */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Marka
                    </label>
                    <input
                      required
                      value={newMake}
                      onChange={(e) => setNewMake(e.target.value)}
                      className="h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all hover:px-4 focus:px-5"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Model
                    </label>
                    <input
                      required
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      className="h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all hover:px-4 focus:px-5"
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
                      className="h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all hover:px-4 focus:px-5"
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
                      className="h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all hover:px-4 focus:px-5"
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
                      className="h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all hover:px-4 focus:px-5"
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
                      className="h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all hover:px-4 focus:px-5"
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
                      className="h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all hover:px-4 focus:px-5"
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
                      className="h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all hover:px-4 focus:px-5"
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
                      className="h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all hover:px-4 focus:px-5"
                      placeholderText="——"
                    />
                  </div>

                  {/* przyciski */}
                  <div className="sm:col-span-2 flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-600 hover:text-gray-50 text-gray-600 transition-all cursor-pointer border border-transparent"
                    >
                      Anuluj
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 text-gray-50 rounded-lg hover:bg-emerald-700 transition-all cursor-pointer"
                    >
                      Dodaj
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  );
}
