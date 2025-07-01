"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import HashLoader from "react-spinners/HashLoader";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

type Car = {
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
};

export default function EditCarPage() {
  const { carId } = useParams();
  const router = useRouter();

  const [form, setForm] = useState<Car>({
    vin: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    engine: "",
    power: 0,
    kilometers: 0,
    registration: "",
    purchaseDate: "",
    fuelType: "",
    color: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!carId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        const { data } = await axios.get<Car>(
          `${API_URL}/api/v1/cars/${carId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setForm({
          vin: data.vin,
          make: data.make,
          model: data.model,
          year: data.year,
          engine: data.engine || "",
          power: data.power || 0,
          kilometers: data.kilometers || 0,
          registration: data.registration || "",
          purchaseDate: data.purchaseDate?.split("T")[0] || "",
          fuelType: data.fuelType || "",
          color: data.color || "",
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(err);
        setError("Nie udało się załadować danych pojazdu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [carId, router]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        name === "year" || name === "power" || name === "kilometers"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!carId) return;
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Brak tokena");
      await axios.patch(
        `${API_URL}/api/v1/cars/${carId}`,
        {
          ...form,
          year: Number(form.year),
          power: form.power || undefined,
          kilometers: form.kilometers || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.replace("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <HashLoader size={60} />
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Edytuj pojazd</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* VIN */}
        <div>
          <label className="block text-sm font-medium">VIN</label>
          <input
            name="vin"
            value={form.vin}
            onChange={handleChange}
            required
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        {/* Make / Model */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Marka</label>
            <input
              name="make"
              value={form.make}
              onChange={handleChange}
              required
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Model</label>
            <input
              name="model"
              value={form.model}
              onChange={handleChange}
              required
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Year / Engine */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Rok produkcji</label>
            <input
              name="year"
              type="number"
              value={form.year}
              onChange={handleChange}
              required
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Silnik</label>
            <input
              name="engine"
              value={form.engine}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Power / Kilometers */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Moc (KM)</label>
            <input
              name="power"
              type="number"
              value={form.power}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Przebieg (km)</label>
            <input
              name="kilometers"
              type="number"
              value={form.kilometers}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Registration / Purchase Date / Fuel */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Numer rej.</label>
            <input
              name="registration"
              value={form.registration}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Data zakupu</label>
            <input
              name="purchaseDate"
              type="date"
              value={form.purchaseDate}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Rodzaj paliwa</label>
            <select
              name="fuelType"
              value={form.fuelType}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
            >
              <option value="">Wybierz</option>
              <option>ON</option>
              <option>PB</option>
              <option>EV</option>
            </select>
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium">Kolor</label>
          <input
            name="color"
            value={form.color}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {saving ? "Zapisywanie…" : "Zapisz zmiany"}
          </button>
        </div>
      </form>
    </main>
  );
}
