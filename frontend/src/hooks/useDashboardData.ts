// src/hooks/useDashboardData.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

/* ---------- typy takie jak w dashboardzie ---------- */
export interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
}
export interface Repair {
  id: string;
  type: "Naprawa" | "Serwis";
  title: string;
  date: string;
  cost: number;
}
export interface Planned {
  id: string;
  type: string;
  date: string;
}
export interface Car {
  id: string;
  make: string;
  model: string;
  kilometers?: number;
  expenses?: Expense[]; // ← dociągane później
  recentRepairs?: Repair[];
  upcomingServices?: Planned[];
}
export interface MeResponse {
  id: string;
  firstName: string;
  premium: boolean;
  cars: Car[];
}

/* ---------- hook ---------- */
export function useDashboardData() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoad] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const ac = new AbortController(); // żeby anulować przy un-mount

    (async () => {
      try {
        /* 1. bazowe „/user/me” ------------------------------------ */
        const { data } = await axios.get<{ user: MeResponse }>(
          `${API_URL}/api/v1/user/me`,
          { headers, signal: ac.signal }
        );
        const base = data.user;

        /* 2. jeśli są auta → pobierz szczegóły równolegle ---------- */
        if (base.cars.length) {
          const ext: Record<
            string,
            {
              expenses: Expense[];
              repairs: Repair[];
              planned: Planned[];
            }
          > = {};

          await Promise.all(
            base.cars.map(async (car) => {
              const [exp, rep, plan] = await Promise.all([
                axios.get(`${API_URL}/api/v1/cars/${car.id}/expenses`, {
                  headers,
                }),
                axios.get(`${API_URL}/api/v1/cars/${car.id}/repairs`, {
                  headers,
                }),
                axios.get(`${API_URL}/api/v1/cars/${car.id}/planned-repairs`, {
                  headers,
                }),
              ]);
              ext[car.id] = {
                expenses: exp.data,
                repairs: rep.data,
                planned: plan.data,
              };
            })
          );

          /* 3. scal bazę + rozszerzenia --------------------------- */
          base.cars = base.cars.map((c) => ({
            ...c,
            expenses: ext[c.id]?.expenses ?? c.expenses,
            recentRepairs: ext[c.id]?.repairs ?? c.recentRepairs,
            upcomingServices: ext[c.id]?.planned ?? c.upcomingServices,
          }));
        }

        setMe(base);
      } catch (err) {
        if (!axios.isCancel(err)) {
          localStorage.removeItem("token");
          router.replace("/login");
        }
      } finally {
        setLoad(false);
      }
    })();

    return () => ac.abort();
  }, [router]);

  return { me, loading };
}
