// app/dashboard/cars/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Car as CarIcon, Plus } from "lucide-react";
import HashLoader from "react-spinners/HashLoader";

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        // pobieramy user/me, który zwraca user.cars z upcomingServices
        const { data } = await axios.get<{ user: { cars: Car[] } }>(
          `${API_URL}/api/v1/user/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const carsData = data.user.cars;
        setCars(carsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

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
              <button className="px-4 py-2 bg-white border rounded hover:bg-gray-100 cursor-pointer transition-all">
                Edytuj
              </button>
              <button
                onClick={() => router.push(`/dashboard/cars/${car.id}`)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:opacity-90 transition-all cursor-pointer font-semibold"
              >
                Szczegóły
              </button>
            </div>
          </div>
        ))}

        {/* Dodaj nowy */}
        <div
          onClick={() => router.push("/dashboard/add-car")}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 font-semibold transition-all"
        >
          <Plus className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-gray-500 mb-4">Dodaj nowy pojazd</p>
          <button className="px-4 py-2 bg-gray-700 text-white rounded cursor-pointer">
            Dodaj pojazd
          </button>
        </div>
      </div>
    </div>
  );
}
