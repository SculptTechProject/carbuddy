"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

interface PlanInfo {
  plan: "Free" | "Pro" | "Enterprise";
  price?: number;
  renewalDate?: string;
  status: "active" | "canceled";
}

export default function SubscriptionCard() {
  const [info, setInfo] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL!;

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<{ plan: PlanInfo }>(
          `${API}/api/v1/user/subscription`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setInfo(res.data.plan);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Ładowanie…</div>;
  if (!info) return <div>Błąd ładowania planu</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Plan</h3>
          <p className="text-sm text-gray-600">
            {info.plan === "Free" ? "Darmowy" : info.plan}
          </p>
        </div>
        <div className="text-2xl font-bold">
          {info.plan === "Free" ? "0 zł" : `${info.price} zł/mies.`}
        </div>
      </div>

      {info.plan !== "Free" && (
        <div className="text-sm text-gray-600">
          Odnowienie:{" "}
          <strong>
            {new Date(info.renewalDate!).toLocaleDateString("pl-PL")}
          </strong>
        </div>
      )}

      {info.status !== "active" && (
        <div className="text-sm text-red-600">Subskrypcja wygasła</div>
      )}

      {info.plan === "Free" ? (
        <Button asChild className="w-full">
          <a href="/dashboard/subscription">Przejdź na Pro</a>
        </Button>
      ) : (
        <Button variant="outline" asChild className="w-full">
          <a href="/dashboard/subscription">Zarządzaj subskrypcją</a>
        </Button>
      )}
    </div>
  );
}
