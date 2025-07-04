"use client";

import React, { useState } from "react";
import axios from "axios";

export default function Verification() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL!;

  const handleSend = async () => {
    setError(null);
    try {
      await axios.post(
        `${API}/api/v1/auth/send-verification`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSent(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Błąd wysyłki.");
    }
  };

  return (
    <div className="space-y-3">
      {!sent ? (
        <>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          <button
            onClick={handleSend}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-all cursor-pointer"
          >
            Wyślij link weryfikacyjny
          </button>
        </>
      ) : (
        <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
          Link weryfikacyjny został wysłany. Sprawdź pocztę.
        </div>
      )}
    </div>
  );
}
