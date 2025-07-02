"use client";

import React, { Fragment, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { Transition } from "@headlessui/react";
import { X } from "lucide-react";
import DatePicker from "react-datepicker";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

interface Repair {
  id: string;
  date: string;
  type: string;
  description?: string;
  workshop?: string;
  cost: number;
  kilometers?: number;
  notes?: string;
  carId: string;
  car: {
    make: string;
    model: string;
    registration?: string;
  };
}

const REPAIR_TYPES = ["Naprawa", "Serwis"];

interface Car {
  id: string;
  make: string;
  model: string;
}

interface Repair {
  id: string;
  date: string;
  type: string;
  description?: string;
  workshop?: string;
  cost: number;
  kilometers?: number;
  notes?: string;
  carId: string;
  car: {
    make: string;
    model: string;
    registration?: string;
  };
}

export default function RepairDetailsPage() {
  const { repairId } = useParams();
  const router = useRouter();

  const [repair, setRepair] = useState<Repair | null>(null);
  const [vehicles, setVehicles] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // pola edycyjne
  const [editId, setEditId] = useState("");
  const [editDate, setEditDate] = useState<Date | null>(new Date());
  const [editVehicleId, setEditVehicleId] = useState("");
  const [editType, setEditType] = useState(REPAIR_TYPES[0]);
  const [editWorkshop, setEditWorkshop] = useState("");
  const [editKilometers, setEditKilometers] = useState<number | "">("");
  const [editCost, setEditCost] = useState(0);
  const [editDesc, setEditDesc] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const token = localStorage.getItem("token") || "";

  // pobierz listę pojazdów do selecta
  const fetchVehicles = async () => {
    try {
      const { data } = await axios.get<Car[]>(`${API_URL}/api/v1/cars`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(data);
    } catch (err) {
      console.error("Błąd pobierania pojazdów:", err);
    }
  };

  // pobierz pojedynczą naprawę
  const fetchRepair = async () => {
    try {
      const { data } = await axios.get<Repair>(
        `${API_URL}/api/v1/repairs/${repairId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRepair(data);
    } catch (err) {
      console.error("Błąd pobierania naprawy:", err);
      router.replace("/dashboard/repairs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (repairId) fetchRepair();
  }, [repairId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!repair) {
    return <div className="p-6 text-red-600">Nie znaleziono naprawy.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Nagłówek */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-6 py-4 rounded-lg shadow">
        <h1 className="text-2xl font-bold">
          {repair.car.make} {repair.car.model}
          {repair.car.registration ? ` (${repair.car.registration})` : ""}
        </h1>
        <p className="text-sm opacity-90">
          Naprawa z dnia {new Date(repair.date).toLocaleDateString("pl-PL")}
        </p>
      </div>

      {/* Szczegóły */}
      <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Typ naprawy</p>
          <p className="font-semibold text-gray-800">{repair.type}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Koszt</p>
          <p className="font-semibold text-gray-800">{repair.cost} zł</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Warsztat</p>
          <p className="text-gray-700">{repair.workshop || "–"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Przebieg</p>
          <p className="text-gray-700">
            {repair.kilometers ? `${repair.kilometers} km` : "–"}
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm text-gray-500 mb-1">Opis naprawy</p>
          <p className="text-gray-700">{repair.description || "–"}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm text-gray-500 mb-1">Notatki</p>
          <p className="text-gray-700 whitespace-pre-line">
            {repair.notes || "–"}
          </p>
        </div>
      </div>

      {/* Wróć */}
      {/* Akcje */}
      <div className="flex gap-4 text-gray-600 ">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm font-semibold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Wróć do historii napraw
        </button>

        <div className="flex gap-4 flex-1 justify-end">
          <button
            onClick={() => {
              setEditId(repair.id);
              setEditDate(new Date(repair.date));
              setEditVehicleId(repair.carId);
              setEditType(repair.type);
              setEditWorkshop(repair.workshop ?? "");
              setEditKilometers(repair.kilometers ?? "");
              setEditCost(repair.cost);
              setEditDesc(repair.description ?? "");
              setEditNotes(repair.notes ?? "");
              setShowEditModal(true);
            }}
            className="text-gray-200 hover:bg-gray-100 hover:text-gray-600 px-6 py-2 bg-gray-600 rounded-xl transition-all border font-semibold border-transparent hover:border-gray-600 cursor-pointer"
          >
            Edytuj
          </button>
          <button
            onClick={async () => {
              if (!confirm("Usuń tę naprawę?")) return;
              setLoading(true);
              await axios.delete(
                `${API_URL}/api/v1/cars/${repair.carId}/repairs/${repair.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              router.replace("/dashboard/repairs");
            }}
            className="text-gray-200 hover:bg-gray-100 hover:text-gray-600 px-6 py-2 bg-red-600 rounded-xl transition-all border font-semibold border-transparent hover:border-gray-600 cursor-pointer"
          >
            Usuń
          </button>
        </div>
      </div>

      {/* Modal edycji */}
      {showEditModal && (
        <Transition appear show={showEditModal} as={Fragment}>
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
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
                onClick={() => setShowEditModal(false)}
              />
            </Transition.Child>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
                <button
                  className="absolute top-4 right-4 text-gray-600"
                  onClick={() => setShowEditModal(false)}
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold mb-4">Edytuj naprawę</h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);
                    await axios.patch(
                      `${API_URL}/api/v1/cars/${editVehicleId}/repairs/${editId}`,
                      {
                        date: editDate,
                        type: editType,
                        description: editDesc,
                        workshop: editWorkshop,
                        cost: editCost,
                        kilometers: editKilometers,
                        notes: editNotes,
                      },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setShowEditModal(false);
                    await fetchRepair();
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium">Pojazd</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={editVehicleId}
                      onChange={(e) => setEditVehicleId(e.target.value)}
                    >
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.make} {v.model}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Data</label>
                    <DatePicker
                      selected={editDate}
                      onChange={(d) => setEditDate(d)}
                      className="w-full border rounded px-3 py-2"
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Typ</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                    >
                      {REPAIR_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Warsztat
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={editWorkshop}
                      onChange={(e) => setEditWorkshop(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Przebieg (km)
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2"
                      value={editKilometers}
                      onChange={(e) =>
                        setEditKilometers(
                          e.target.value ? parseInt(e.target.value) : ""
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Koszt (zł)
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2"
                      value={editCost}
                      onChange={(e) => setEditCost(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium">
                      Opis naprawy
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium">Notatki</label>
                    <textarea
                      className="w-full border rounded px-3 py-2"
                      rows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4 md:col-span-2">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Anuluj
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                    >
                      Zapisz
                    </button>
                  </div>
                </form>
              </div>
            </Transition.Child>
          </div>
        </Transition>
      )}
    </div>
  );
}
