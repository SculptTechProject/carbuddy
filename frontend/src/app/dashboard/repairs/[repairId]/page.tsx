"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

interface Repair {
  id: string;
  date: string;
  type: string;
  description?: string;
  workshop?: string;
  cost: number;
  kilometers?: number;
  notes?: string;
  car: {
    make: string;
    model: string;
    registration?: string;
  };
}

export default function RepairDetailsPage() {
  const { repairId } = useParams();
  const router = useRouter();
  const [repair, setRepair] = useState<Repair | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRepair() {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/v1/repairs/${repairId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setRepair(data); // ← tu poprawione
      } catch (err) {
        console.error("Błąd pobierania naprawy:", err);
        router.replace("/dashboard/repairs");
      } finally {
        setLoading(false);
      }
    }

    if (repairId) fetchRepair();
  }, [repairId, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!repair) {
    return <div className="p-6 text-red-600">Nie znaleziono naprawy.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Główny nagłówek */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-6 py-4 rounded-lg shadow">
        <h1 className="text-2xl font-bold">
          {repair.car.make} {repair.car.model}
          {repair.car.registration ? ` (${repair.car.registration})` : ""}
        </h1>
        <p className="text-sm opacity-90">
          Naprawa z dnia {new Date(repair.date).toLocaleDateString("pl-PL")}
        </p>
      </div>

      {/* Szczegóły */}
      <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Typ naprawy</p>
          <p className="font-semibold text-gray-800">{repair.type}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Koszt</p>
          <p className="font-semibold text-gray-800">{repair.cost} zł</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Warsztat</p>
          <p className="text-gray-700">{repair.workshop || "–"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Przebieg przy naprawie</p>
          <p className="text-gray-700">
            {repair.kilometers ? `${repair.kilometers} km` : "–"}
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm text-gray-500 mb-1">Opis naprawy</p>
          <p className="text-gray-700">{repair.description || "–"}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm text-gray-500 mb-1">Notatki serwisowe</p>
          <p className="text-gray-700 whitespace-pre-line">
            {repair.notes || "–"}
          </p>
        </div>
      </div>

      {/* Wróć */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Wróć do historii napraw
      </button>
    </div>
  );
}
