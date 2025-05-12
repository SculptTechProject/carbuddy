"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CarIcon, Plus } from "lucide-react";

interface CarSummary {
  id: string;
  make: string;
  vin: string;
  model: string;
  year: number;
  engine?: string | null;
  power?: number | null;
  kilometers?: number | null;
  registration?: string | null;
  purchaseDate?: string | null;
  fuelType?: string | null;
  color?: string | null;
}

interface MyCarsPageProps {
  cars: CarSummary[];
}

export default function MyCarsPage({ cars }: MyCarsPageProps) {
  const router = useRouter();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Moje pojazdy</h1>
        <button
          onClick={() => router.push("/dashboard/add-car")}
          className="flex items-center bg-black text-white px-4 py-2 rounded"
        >
          <Plus className="w-4 h-4 mr-2" /> Dodaj pojazd
        </button>
      </div>

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
              <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded">
                Aktywny
              </span>
            </div>

            <div className="flex-1 bg-gray-100 rounded-md mb-4 h-[150px] flex items-center justify-center text-gray-400">
              <CarIcon className="w-12 h-12" />
            </div>

            <ul className="text-sm text-gray-600 space-y-1 flex-1">
              {car.kilometers != null && (
                <li>
                  <strong>Przebieg:</strong> {car.kilometers.toLocaleString()}{" "}
                  km
                </li>
              )}
              {car.vin && (
                <li>
                  <strong>VIN:</strong>{" "}
                  <code className="bg-gray-100 px-1 rounded">{car.vin}</code>
                </li>
              )}
              {car.registration && (
                <li>
                  <strong>Rejestracja:</strong> {car.registration}
                </li>
              )}
              {car.year && (
                <li>
                  <strong>Rok prod.:</strong> {car.year}
                </li>
              )}
              {car.purchaseDate && (
                <li>
                  <strong>Data zakupu:</strong>{" "}
                  {new Date(car.purchaseDate).toLocaleDateString()}
                </li>
              )}
            </ul>

            <div className="mt-4 flex justify-end space-x-2">
              <button className="px-4 py-2 bg-white border rounded hover:bg-gray-50">
                Edytuj
              </button>
              <button
                onClick={() => router.push(`/dashboard/cars/${car.id}`)}
                className="px-4 py-2 bg-black text-white rounded hover:opacity-90"
              >
                Szczegóły
              </button>
            </div>
          </div>
        ))}

        {/* Dodaj nowy */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6">
          <Plus className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-gray-500 mb-4">Dodaj nowy pojazd</p>
          <button
            onClick={() => router.push("/dashboard/add-car")}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Dodaj pojazd
          </button>
        </div>
      </div>

      {/* Sekcja nadchodzących terminów */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Nadchodzące terminy</h2>
        <ul className="space-y-2">
          {/* Tutaj mapujesz swoją tablicę upcomingServices */}
          {/* Przykład pojedynczej pozycji: */}
          <li className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
            <div className="flex items-center space-x-3">
              <CarIcon className="w-6 h-6 text-green-500" />
              <div>
                <div className="font-medium">Przegląd techniczny</div>
                <div className="text-sm text-gray-500">
                  Audi A4 • 15.06.2025
                </div>
              </div>
            </div>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
              15 dni
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
