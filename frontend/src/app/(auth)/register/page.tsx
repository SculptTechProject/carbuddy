"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { Car } from "lucide-react";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  plan: "free" | "pro";
  acceptedTerms: boolean;
}

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    plan: "free",
    acceptedTerms: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirmPassword) {
      setError("Hasła nie są zgodne");
      return;
    }
    if (!form.acceptedTerms) {
      setError("Musisz zaakceptować regulamin");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/v1/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          phoneNumber: form.lastName, // adjust if phone included elsewhere
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Coś poszło nie tak");
      }
      window.location.href = "/login";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="flex flex-row justify-center items-center gap-2 pb-4">
            <Car className="w-6 h-6 text-emerald-500" />
            <div className="text-emerald-600 text-3xl font-semibold">
              {" "}
              CarBuddy
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-700">
            Utwórz nowe konto
          </h1>
          <p className="text-sm text-gray-600">
            Masz już konto?{" "}
            <Link href="/login" className="text-emerald-600 hover:underline">
              Zaloguj się
            </Link>
          </p>
        </div>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-gray-600">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                Imię
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                placeholder="Jan"
                value={form.firstName}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 py-2 pl-3"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Nazwisko
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                placeholder="Kowalski"
                value={form.lastName}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 py-2 pl-3"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Adres email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="twoj@email.com"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 py-2 pl-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Hasło
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="●●●●●●●"
                minLength={6}
                value={form.password}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 py-2 pl-3"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Potwierdź hasło
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="●●●●●●●"
                minLength={6}
                value={form.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 py-2 pl-3"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Wybierz plan
            </p>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`border rounded-md p-4 cursor-pointer hover:bg-gray-50 transition-all ${
                  form.plan === "free"
                    ? "border-emerald-500"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value="free"
                  checked={form.plan === "free"}
                  onChange={handleChange}
                  className="hidden"
                />
                <div className="font-semibold">
                  Free <span className="font-normal text-gray-600">0 zł</span>
                </div>
                <ul className="mt-2 text-sm text-gray-600 list-disc list-inside ">
                  <li>Zarządzanie 1 pojazdem</li>
                  <li>Podstawowe przypomnienia</li>
                  <li>Historia napraw</li>
                </ul>
              </label>

              <label
                className={`border rounded-md p-4 cursor-pointer hover:bg-gray-50 transition-all ${
                  form.plan === "pro" ? "border-emerald-500" : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value="pro"
                  checked={form.plan === "pro"}
                  onChange={handleChange}
                  className="hidden"
                />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Pro</span>
                  <span className="text-sm text-white bg-emerald-500 rounded-full px-2 py-0.5">
                    Polecany
                  </span>
                </div>
                <div className="mt-1 font-normal text-gray-600 text-sm">
                  19,99 zł/mies
                </div>
                <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Nieograniczona liczba pojazdów</li>
                  <li>Zaawansowane przypomnienia</li>
                  <li>Szczegółowa historia napraw</li>
                  <li>Priorytetowe wsparcie</li>
                </ul>
              </label>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="acceptedTerms"
              name="acceptedTerms"
              type="checkbox"
              checked={form.acceptedTerms}
              onChange={handleChange}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label
              htmlFor="acceptedTerms"
              className="ml-2 block text-sm text-gray-900"
            >
              Akceptuję{" "}
              <Link href="/terms" className="text-emerald-600 hover:underline">
                regulamin
              </Link>{" "}
              oraz{" "}
              <Link
                href="/privacy"
                className="text-emerald-600 hover:underline"
              >
                politykę prywatności
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            {loading ? "Proszę czekać..." : "Utwórz konto"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Lub kontynuuj z
              </span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <button
              type="button"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
            >
              Google {/* TODO: ADD ICON */}
            </button>
            <button
              type="button"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
            >
              Facebook {/* TODO: ADD ICON */}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
