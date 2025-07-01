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
  const [deleting, setDeleting] = useState(false);

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
        const [carRes, repRes, expRes] = await Promise.all([
          axios.get<Car>(`${API_URL}/api/v1/cars/${carId}`, { headers }),
          axios.get<Repair[]>(`${API_URL}/api/v1/cars/${carId}/repairs`, {
            headers,
          }),
          axios.get<Expense[]>(`${API_URL}/api/v1/cars/${carId}/expenses`, {
            headers,
          }),
        ]);
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

  const handleDelete = async () => {
    if (!carId || !confirm("Czy na pewno chcesz usunąć ten pojazd?")) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/v1/cars/${carId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Nie udało się usunąć pojazdu.");
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/cars/${carId}/edit`);
  };

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
        <p className="text-red-600 font-medium">
          Pojazd nie został znaleziony.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          ← Wróć
        </button>
      </div>
    );
  }

  // helper to format date
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

  const details = [
    { label: "VIN", value: car.vin },
    { label: "Rejestracja", value: car.registration },
    {
      label: "Przebieg",
      value: car.kilometers ? `${car.kilometers.toLocaleString()} km` : null,
    },
    { label: "Silnik", value: car.engine },
    { label: "Moc", value: car.power ? `${car.power} KM` : null },
    { label: "Paliwo", value: car.fuelType },
    { label: "Kolor", value: car.color },
    {
      label: "Data zakupu",
      value: car.purchaseDate ? formatDate(car.purchaseDate) : null,
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-sm text-emerald-600 hover:text-emerald-800 hover:underline transition-all cursor-pointer"
        >
          ← Wróć do listy pojazdów
        </button>
        <div className="space-x-2">
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-gray-500 text-gray-100 rounded-xl hover:bg-gray-700 transition-all cursor-pointer"
          >
            Edytuj
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-500 text-gray-100 rounded-xl hover:bg-red-600 transition-all cursor-pointer"
          >
            {deleting ? "Usuwanie…" : "Usuń"}
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">
          {car.make} {car.model} ({car.year})
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-gray-700">
          {details.map((d) =>
            d.value ? (
              <div key={d.label} className="flex">
                <span className="w-40 font-medium text-gray-800">
                  {d.label}:
                </span>
                <span>{d.value}</span>
              </div>
            ) : null
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Naprawy</h2>
          {repairs.length ? (
            <ul className="space-y-4">
              {repairs.map((r) => (
                <li
                  key={r.id}
                  className="flex justify-between items-start border-b pb-4 last:border-0"
                >
                  <div>
                    <div className="font-medium text-gray-800">{r.type}</div>
                    <div className="text-sm text-gray-500">
                      {formatDate(r.date)}
                      {r.description && ` • ${r.description}`}
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900">{r.cost} zł</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Brak zarejestrowanych napraw.</p>
          )}
        </section>

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Wydatki</h2>
          {expenses.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {expenses.map((e) => (
                <li key={e.id} className="flex items-start py-4">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {e.category}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(e.date)}
                      {e.description ? <span> • {e.description}</span> : null}
                    </div>
                  </div>
                  <div className="ml-6 text-right font-semibold text-gray-900 min-w-[5rem]">
                    {e.amount} zł
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Brak zarejestrowanych wydatków.</p>
          )}
        </section>
      </div>
    </div>
  );
}
