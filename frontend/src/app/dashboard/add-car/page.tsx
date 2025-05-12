"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function AddCarPage() {
  const router = useRouter();
  // stan formularza
  const [form, setForm] = useState({
    vin: "",
    make: "",
    model: "",
    year: "",
    engine: "",
    power: "",
    kilometers: "",
    registration: "",
    purchaseDate: "",
    fuelType: "",
    color: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Brak tokena!");

      await axios.post(
        `${API_URL}/api/v1/cars`,
        {
          ...form,
          year: Number(form.year),
          power: form.power ? Number(form.power) : undefined,
          kilometers: form.kilometers ? Number(form.kilometers) : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      router.replace("/dashboard"); // albo /cars
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">{`Dodaj pojazd`}</h1>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded shadow"
      >
        {/* VIN */}
        <div>
          <label className="block text-sm font-medium">Numer VIN</label>
          <input
            name="vin"
            value={form.vin}
            onChange={handleChange}
            required
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        {/* Marka / model */}
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

        {/* Rok, silnik */}
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

        {/* Moc / przebieg */}
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

        {/* Rejestracja / data zakupu / paliwo */}
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

        {/* kolor */}
        <div>
          <label className="block text-sm font-medium">Kolor</label>
          <input
            name="color"
            value={form.color}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        {/* Akcje */}
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
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            {loading ? "Dodaję…" : "Dodaj pojazd"}
          </button>
        </div>
      </form>
    </div>
  );
}
