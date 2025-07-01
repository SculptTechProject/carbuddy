"use client";
import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";

interface FormData {
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

export default function AddCarPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Brak tokena");
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/cars`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.replace("/dashboard");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white bg-opacity-20 backdrop-blur-lg border border-gray-200 rounded-xl shadow-md">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Dodaj pojazd
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* VIN */}
        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-700">
            Numer VIN
          </label>
          <input
            {...register("vin", { required: "VIN jest wymagany" })}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
          />
          {errors.vin && (
            <p className="text-red-500 text-sm mt-1">{errors.vin.message}</p>
          )}
        </div>

        {/* Marka */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Marka
          </label>
          <input
            {...register("make", { required: "Pole wymagane" })}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
          />
          {errors.make && (
            <p className="text-red-500 text-sm mt-1">{errors.make.message}</p>
          )}
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Model
          </label>
          <input
            {...register("model", { required: "Pole wymagane" })}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
          />
          {errors.model && (
            <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>
          )}
        </div>

        {/* Rok */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Rok produkcji
          </label>
          <input
            type="number"
            {...register("year", {
              valueAsNumber: true,
              required: "Pole wymagane",
            })}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
          />
          {errors.year && (
            <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
          )}
        </div>

        {/* Silnik */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Silnik
          </label>
          <input
            {...register("engine")}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
          />
        </div>

        {/* Moc */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Moc (KM)
          </label>
          <input
            type="number"
            {...register("power", { valueAsNumber: true })}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
          />
        </div>

        {/* Przebieg */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Przebieg (km)
          </label>
          <input
            type="number"
            {...register("kilometers", { valueAsNumber: true })}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
          />
        </div>

        {/* Rejestracja */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Numer rej.
          </label>
          <input
            {...register("registration")}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
          />
        </div>

        {/* Data zakupu */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Data zakupu
          </label>
          <input
            type="date"
            {...register("purchaseDate")}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
          />
        </div>

        {/* Paliwo */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Rodzaj paliwa
          </label>
          <select
            {...register("fuelType")}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
          >
            <option value="">Wybierz</option>
            <option value="ON">ON</option>
            <option value="PB">PB</option>
            <option value="EV">EV</option>
          </select>
        </div>

        {/* Kolor */}
        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-700">
            Kolor
          </label>
          <input
            {...register("color")}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
          />
        </div>

        {/* Akcje */}
        <div className="col-span-full flex justify-end space-x-4 mt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            {isSubmitting ? "Dodaję…" : "Dodaj pojazd"}
          </button>
        </div>
      </form>
    </div>
  );
}
