"use client";

import React, { useState } from "react";
import axios from "axios";

export default function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPass !== confirm) {
      setError("Nowe hasło i potwierdzenie nie są takie same.");
      return;
    }
    try {
      await axios.post(
        `${API}/api/v1/user/change-password`,
        { currentPassword: current, newPassword: newPass },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSuccess(true);
      setCurrent("");
      setNewPass("");
      setConfirm("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Coś poszło nie tak.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
          Hasło zostało zmienione pomyślnie.
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Obecne hasło
        </label>
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:ring-emerald-500 focus:outline-none"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nowe hasło
        </label>
        <input
          type="password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:ring-emerald-500 focus:outline-none"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Potwierdź nowe hasło
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:ring-emerald-500 focus:outline-none"
          required
        />
      </div>
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-all cursor-pointer"
      >
        Zmień hasło
      </button>
    </form>
  );
}
