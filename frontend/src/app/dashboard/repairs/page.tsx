/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { Fragment, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Plus, X } from "lucide-react";
import HashLoader from "react-spinners/HashLoader";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const DEFAULT_REPAIR_TYPES = ["Naprawa", "Serwis"];
import { Transition } from "@headlessui/react";

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
    return (
      (!filterVehicle || r.carId === filterVehicle) &&
      (!filterType || r.type === filterType) &&
      (!searchTerm ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.workshop?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

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
    <div className="p-6 space-y-6">
      {/* Nagłówek */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Historia napraw</h1>
        <div className="space-x-2">
          <button className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
            Eksportuj
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-800 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 inline-block mr-1" /> Dodaj naprawę
          </button>
        </div>
      </div>

      {/* Filtry */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Szukaj napraw..."
          className="flex-1 border rounded px-3 py-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2"
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
          className="border rounded px-3 py-2"
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
      </div>

      {/* Tabela */}
      <div className="bg-white shadow rounded-lg overflow-auto">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2">Data</th>
              <th className="px-4 py-2">Pojazd</th>
              <th className="px-4 py-2">Typ</th>
              <th className="px-4 py-2">Opis</th>
              <th className="px-4 py-2">Warsztat</th>
              <th className="px-4 py-2 text-right">Koszt</th>
              <th className="px-4 py-2">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-gray-100 hover:backdrop-blur-xs transition-all hover:shadow-xl "
              >
                <td className="px-4 py-3">
                  {new Date(r.date).toLocaleDateString("pl-PL")}
                </td>
                <td className="px-4 py-3">{r.carLabel}</td>
                <td className="px-4 py-3">{r.type}</td>
                <td className="px-4 py-3">{r.description}</td>
                <td className="px-4 py-3">{r.workshop}</td>
                <td className="px-4 py-3 text-right font-semibold">
                  {r.cost} zł
                </td>
                <td
                  className="px-4 py-3 text-emerald-600 hover:text-emerald-500 hover:underline cursor-pointer transition-all"
                  onClick={() => router.push(`/dashboard/repairs/${r.id}`)}
                >
                  Szczegóły
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Brak zarejestrowanych napraw.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal dodawania naprawy */}
      {showModal && (
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
              <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
                <button
                  className="absolute top-4 right-4 text-gray-600"
                  onClick={() => setShowModal(false)}
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold mb-4">
                  Dodaj nową naprawę
                </h2>
                <form
                  onSubmit={handleAdd}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {/* 1. Pojazd */}
                  <div>
                    <label className="block text-sm font-medium">Pojazd</label>
                    <select
                      className="w-full border rounded px-3 py-2"
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
                  <div>
                    <label className="block text-sm font-medium">Data</label>
                    <DatePicker
                      selected={newDate}
                      onChange={(d) => setNewDate(d)}
                      className="w-full border rounded px-3 py-2"
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                  {/* 3. Typ */}
                  <div>
                    <label className="block text-sm font-medium">
                      Typ naprawy
                    </label>
                    <select
                      className="w-full border rounded px-3 py-2"
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
                  <div>
                    <label className="block text-sm font-medium">
                      Warsztat
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={newWorkshop}
                      onChange={(e) => setNewWorkshop(e.target.value)}
                    />
                  </div>
                  {/* 5. Przebieg */}
                  <div>
                    <label className="block text-sm font-medium">
                      Przebieg (km)
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2"
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
                  <div>
                    <label className="block text-sm font-medium">
                      Całkowity koszt (zł)
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2"
                      placeholder="np. 650"
                      value={newCost}
                      onChange={(e) => setNewCost(parseFloat(e.target.value))}
                    />
                  </div>
                  {/* 7. Opis */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium">
                      Opis naprawy
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      placeholder="Co zostało zrobione?"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                    />
                  </div>
                  {/* 8. Notatki */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium">
                      Dodatkowe notatki
                    </label>
                    <textarea
                      className="w-full border rounded px-3 py-2"
                      rows={3}
                      placeholder="Uwagi dodatkowe..."
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                    />
                  </div>
                </form>

                {/* Akcje */}
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={(e) => handleAdd(e as any)}
                    className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
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
