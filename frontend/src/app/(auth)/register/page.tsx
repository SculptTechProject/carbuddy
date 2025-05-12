"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import axios from "axios";
import { Car } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

type Plan = "free" | "pro";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  plan: Plan;
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
      await axios.post(
        `${API_URL}/api/v1/auth/register`,
        { ...form /*, phoneNumber jeśli kiedyś dodasz*/ },
        { headers: { "Content-Type": "application/json" } }
      );
      window.location.href = "/login";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message =
        err.response?.data?.error || err.message || "Coś poszło nie tak";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50 p-4">
      <div
        className="flex-grow flex items-center justify-center"
        data-aos="fade-out"
      >
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8">
          {/* header */}
          <div className="text-center mb-8">
            <Car className="mx-auto mb-2 w-8 h-8 text-emerald-500" />
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
            {/* dwie kolumny na md+ */}
            <div className="md:flex md:space-x-8">
              {/* lewa kolumna – pola */}
              <div className="md:w-1/2 space-y-6">
                {/* Imię i nazwisko */}
                <div className="grid grid-cols-2 gap-4">
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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3 transition-all hover:py-3"
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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3 transition-all hover:py-3"
                    />
                  </div>
                </div>

                {/* Email */}
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
                    placeholder="twoj@email.com"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3 transition-all hover:py-3"
                  />
                </div>

                {/* Hasła */}
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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3 transition-all hover:py-3"
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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3 transition-all hover:py-3"
                    />
                  </div>
                </div>
              </div>

              {/* prawa kolumna – plany */}
              <div className="md:w-1/2 space-y-4 mt-6 md:mt-0">
                <p className="text-sm font-medium text-gray-700">
                  Wybierz plan
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {(["free", "pro"] as Plan[]).map((p) => (
                    <label
                      key={p}
                      className={`border rounded-md p-4 cursor-pointer hover:bg-gray-50 transition-all ${
                        form.plan === p
                          ? "border-emerald-500"
                          : "border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={p}
                        checked={form.plan === p}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <div className="flex justify-between items-center font-semibold">
                        <span>
                          {p === "free" ? "Free" : "Pro"}{" "}
                          {p === "free" ? "0 zł" : "19,99 zł/mies"}
                        </span>
                        {p === "pro" && (
                          <span className="text-sm text-white bg-emerald-500 rounded-full px-2 py-0.5">
                            Polecany
                          </span>
                        )}
                      </div>
                      <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                        {(p === "free"
                          ? [
                              "Zarządzanie 1 pojazdem",
                              "Podstawowe przypomnienia",
                              "Historia napraw",
                            ]
                          : [
                              "Nieograniczona liczba pojazdów",
                              "Zaawansowane przypomnienia",
                              "Szczegółowa historia napraw",
                              "Priorytetowe wsparcie",
                            ]
                        ).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* regulamin */}
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
                <Link
                  href="/terms"
                  className="text-emerald-600 hover:underline"
                >
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

            {/* przycisk */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              {loading ? "Proszę czekać..." : "Utwórz konto"}
            </button>
          </form>

          {/* OAuth */}
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
            <div className="mt-4 flex justify-center space-x-6">
              <button
                type="button"
                className="
                  flex items-center justify-center
                  w-12 h-12
                  rounded-full
                  border border-gray-300
                  shadow-sm
                  hover:bg-gray-50
                  focus:outline-none focus:ring-2 focus:ring-emerald-500
                "
              >
                <FcGoogle className="w-8 h-8" />
              </button>
              <button
                type="button"
                className="
                  flex items-center justify-center
                  w-12 h-12
                  rounded-full
                  border border-gray-300
                  shadow-sm
                  hover:bg-gray-50
                  focus:outline-none focus:ring-2 focus:ring-emerald-500
                "
              >
                <FaFacebook className="w-8 h-8 text-blue-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-4 px-4 md:px-36">
        <div className="max-w-screen-md mx-auto grid grid-cols-1 md:grid-cols-3 items-center">
          {/* Lewa kolumna */}
          <div className="flex justify-center md:justify-start items-center space-x-2 mb-2 md:mb-0 text-gray-600">
            <Car className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold">CarBuddy</span>
          </div>

          {/* Środek */}
          <div className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} CarBuddy. Wszelkie prawa zastrzeżone.
          </div>

          {/* Prawa kolumna */}
          <div className="flex justify-center md:justify-end items-center space-x-4 mt-2 md:mt-0 text-gray-600 text-sm">
            <Link href="/privacy" className="hover:underline">
              Polityka prywatności
            </Link>
            <Link href="/terms" className="hover:underline">
              Warunki korzystania
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
