"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import HashLoader from "react-spinners/HashLoader";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

interface Car {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  engine?: string;
  power?: number;
  kilometers?: number;
  registration?: string;
  purchaseDate?: string;
  fuelType?: string;
  color?: string;
}

interface Repair {
  id: string;
  date: string;
  type: string;
  description?: string;
  cost: number;
}

interface Expense {
  id: string;
  category: string;
  date: string;
  amount: number;
  description?: string;
}

export default function CarDetailsPage() {
  const { carId } = useParams();
  const router = useRouter();

  const [car, setCar] = useState<Car | null>(null);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!carId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        // 1) pojedynczy Car
        const carRes = await axios.get<Car>(`${API_URL}/api/v1/cars/${carId}`, {
          headers,
        });
        // 2) lista napraw
        const repRes = await axios.get<Repair[]>(
          `${API_URL}/api/v1/cars/${carId}/repairs`,
          { headers }
        );
        // 3) lista wydatków
        const expRes = await axios.get<Expense[]>(
          `${API_URL}/api/v1/cars/${carId}/expenses`,
          { headers }
        );

        setCar(carRes.data);
        setRepairs(repRes.data);
        setExpenses(expRes.data);
      } catch (err) {
        console.error(err);
        router.replace("/dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [carId, router]);

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <HashLoader size={60} />
      </div>
    );
  }
  if (!car) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Pojazd nie został znaleziony.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Wróć
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="text-sm text-emerald-600 hover:underline mb-4 block"
      >
        ← Wróć do listy pojazdów
      </button>

      <h1 className="text-2xl font-semibold mb-4">
        {car.make} {car.model} ({car.year})
      </h1>
      <ul className="mb-8 space-y-1 text-gray-700">
        <li>
          <strong>VIN:</strong> {car.vin}
        </li>
        {car.registration && (
          <li>
            <strong>Rejestracja:</strong> {car.registration}
          </li>
        )}
        {car.kilometers != null && (
          <li>
            <strong>Przebieg:</strong> {car.kilometers.toLocaleString()} km
          </li>
        )}
        {car.engine && (
          <li>
            <strong>Silnik:</strong> {car.engine}
          </li>
        )}
        {car.power != null && (
          <li>
            <strong>Moc:</strong> {car.power} KM
          </li>
        )}
        {car.fuelType && (
          <li>
            <strong>Paliwo:</strong> {car.fuelType}
          </li>
        )}
        {car.color && (
          <li>
            <strong>Kolor:</strong> {car.color}
          </li>
        )}
        {car.purchaseDate && (
          <li>
            <strong>Data zakupu:</strong>{" "}
            {new Date(car.purchaseDate).toLocaleDateString()}
          </li>
        )}
      </ul>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Naprawy</h2>
        {repairs.length > 0 ? (
          <ul className="space-y-3">
            {repairs.map((r) => (
              <li key={r.id} className="flex justify-between">
                <div>
                  <div className="font-medium">{r.type}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(r.date).toLocaleDateString()}
                    {r.description ? ` • ${r.description}` : ""}
                  </div>
                </div>
                <div className="font-semibold">{r.cost} zł</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Brak zarejestrowanych napraw.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Wydatki</h2>
        {expenses.length > 0 ? (
          <ul className="space-y-3">
            {expenses.map((e) => (
              <li key={e.id} className="flex justify-between">
                <div>
                  <div className="font-medium">{e.category}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(e.date).toLocaleDateString()}
                    {e.description ? ` • ${e.description}` : ""}
                  </div>
                </div>
                <div className="font-semibold">{e.amount} zł</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Brak zarejestrowanych wydatków.</p>
        )}
      </section>
    </div>
  );
}
