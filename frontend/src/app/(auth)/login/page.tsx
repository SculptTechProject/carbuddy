"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import axios from "axios";
import { Car } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_URL}/api/v1/user/login`,
        { email, password, remember },
        { headers: { "Content-Type": "application/json" } }
      );
      localStorage.setItem("token", data.token);
      router.replace("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || "Coś poszło nie tak"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50 p-4">
      {/* Main content */}
      <div
        className="flex-grow flex items-center justify-center"
        data-aos="fade-out"
      >
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Car className="mx-auto mb-2 w-8 h-8 text-emerald-500" />
            <h1 className="text-2xl font-semibold text-gray-700 pb-2">
              Zaloguj się do swojego konta
            </h1>
            <p className="text-sm text-gray-600">
              Nie masz jeszcze konta?{" "}
              <Link
                href="/register"
                className="text-emerald-600 hover:underline"
              >
                Zarejestruj się
              </Link>
            </p>
          </div>

          {/* Error */}
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Adres email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder="twoj@email.com"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3 hover:py-3 transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Hasło
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-emerald-600 hover:underline"
                >
                  Zapomniałeś hasła?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                placeholder="●●●●●●●"
                minLength={6}
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3 hover:py-3 transition-all"
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setRemember(e.target.checked)
                }
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-900 transition-all"
              >
                Zapamiętaj mnie
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all hover:py-4"
            >
              {loading ? "Proszę czekać..." : "Zaloguj się"}
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
            <div className="mt-6 flex justify-center space-x-12">
              <button
                type="button"
                className="
      flex items-center justify-center
      w-12 h-12
      rounded-full
      border border-gray-300
      shadow-sm
      hover:bg-gray-100
      focus:outline-none focus:ring-2 focus:ring-emerald-500
      transition-all
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
      hover:bg-gray-100
      focus:outline-none focus:ring-2 focus:ring-emerald-500
      transition-all
    "
              >
                <FaFacebook className="w-8 h-8" />
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
