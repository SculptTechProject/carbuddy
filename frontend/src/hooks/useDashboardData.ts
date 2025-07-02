import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

/* ---------------- typy ---------------- */
interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
}
interface Repair {
  id: string;
  type: "Naprawa" | "Serwis";
  date: string;
  cost: number;
}
interface Planned {
  id: string;
  type: string;
  date: string;
}
interface Car {
  id: string;
  make: string;
  model: string;
  kilometers?: number;
  expenses?: Expense[];
  recentRepairs?: Repair[];
  upcomingServices?: Planned[];
}
export interface MeResponse {
  id: string;
  firstName: string;
  cars: Car[];
}

/* ------------- helpers ------------- */
const monthsBack = (n = 12) => {
  const out: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < n; i++) {
    out.unshift(
      d.toLocaleString("default", { month: "short", year: "numeric" })
    );
    d.setMonth(d.getMonth() - 1);
  }
  return out;
};
const daysDiff = (iso: string) =>
  Math.ceil(
    (new Date(iso).getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000
  );

/* ======================================================================= */
/*  HOOK                                                                   */
/* ======================================================================= */
export function useDashboardData() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  /* 1. pobranie pełnych danych użytkownika + szczegółów aut --------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        /* me  */
        const { data: meRes } = await axios.get<{ user: MeResponse }>(
          `${API_URL}/api/v1/user/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const base = meRes.user;

        /* szczegóły każdego auta równolegle */
        const carsFull: Car[] = await Promise.all(
          base.cars.map(async (c) => {
            const [exp, rep, plan] = await Promise.all([
              axios.get<Expense[]>(`${API_URL}/api/v1/cars/${c.id}/expenses`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
              axios.get<Repair[]>(`${API_URL}/api/v1/cars/${c.id}/repairs`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
              axios.get<Planned[]>(
                `${API_URL}/api/v1/cars/${c.id}/planned-repairs`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              ),
            ]);
            return {
              ...c,
              expenses: exp.data,
              recentRepairs: rep.data,
              upcomingServices: plan.data,
            };
          })
        );

        setMe({ ...base, cars: carsFull });
      } catch (err) {
        console.error(err);
        setMe(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* 2. wyliczenia KPI / list --------------------------------------------- */
  const {
    healthScore,
    monthlyCost,
    barCostKm,
    upcoming,
    timeline,
    kpiMonth,
    kpiYear,
    costPerKm,
  } = useMemo(() => {
    if (!me || !me.cars?.length) {
      return {
        healthScore: 0,
        monthlyCost: monthsBack().map((m) => ({ month: m, cost: 0 })),
        barCostKm: [],
        upcoming: [],
        timeline: [],
        kpiMonth: 0,
        kpiYear: 0,
        costPerKm: 0,
      };
    }

    /* ---- zmienne robocze ---- */
    const events: {
      date: string;
      label: string;
      type: "repair" | "service" | "expense" | "planned";
      carLabel: string;
    }[] = [];

    const monthKeys = monthsBack();
    const monthCost: Record<string, number> = Object.fromEntries(
      monthKeys.map((k) => [k, 0])
    );

    const now = new Date();
    const yearNow = now.getFullYear();
    const monthNow = now.getMonth();

    let sumMonth = 0;
    let sumYear = 0;
    let overdue = 0;
    let upcnt = 0;

    const costCar: Record<string, { label: string; cost: number; km: number }> =
      {};

    /* ---- pętla po autach ---- */
    me.cars.forEach((car) => {
      const labelCar = `${car.make} ${car.model}`;

      /* expenses */
      (car.expenses ?? []).forEach((e) => {
        const d = new Date(e.date);
        const mk = d.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        if (mk in monthCost) monthCost[mk] += e.amount;
        if (d.getFullYear() === yearNow) sumYear += e.amount;
        if (d.getFullYear() === yearNow && d.getMonth() === monthNow)
          sumMonth += e.amount;

        costCar[car.id] ??= {
          label: labelCar,
          cost: 0,
          km: car.kilometers || 1,
        };
        costCar[car.id].cost += e.amount;

        events.push({
          date: e.date,
          label: `Wydatek • ${e.category}`,
          type: "expense",
          carLabel: labelCar,
        });
      });

      /* repairs */
      (car.recentRepairs ?? []).forEach((r) => {
        events.push({
          date: r.date,
          label: r.type,
          type: r.type === "Serwis" ? "service" : "repair",
          carLabel: labelCar,
        });
      });

      /* planned */
      const plans = [
        ...(car.upcomingServices ?? []),
        ...(car.recentRepairs ?? []).filter((r) => new Date(r.date) > now),
      ];

      plans.forEach((p) => {
        const diff = daysDiff(p.date);
        if (diff < 0) overdue += 1;
        else upcnt += 1;

        events.push({
          date: p.date,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: `Plan • ${"type" in p ? p.type : (p as any).type}`,
          type: "planned",
          carLabel: labelCar,
        });
      });
    });

    /* health score */
    const health =
      overdue === 0 && upcnt === 0
        ? 100
        : Math.max(0, 100 - overdue * 20 - upcnt * 5);

    /* koszt/km per car */
    const barArr = Object.values(costCar).map((v) => ({
      ...v,
      costKm: Number((v.cost / v.km).toFixed(5)),
    }));

    const dtFmt = new Intl.DateTimeFormat("pl-PL");

    return {
      healthScore: health,
      monthlyCost: monthKeys.map((m) => ({ month: m, cost: monthCost[m] })),
      barCostKm: barArr,
      upcoming: events
        .filter((e) => e.type === "planned" && daysDiff(e.date) >= -1)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5)
        .map((e, idx) => ({
          id: e.date + idx,
          type: e.label.replace("Plan • ", ""),
          date: e.date,
          dateFmt: dtFmt.format(new Date(e.date)),
          carLabel: e.carLabel,
        })),
      timeline: events
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10),
      kpiMonth: sumMonth,
      kpiYear: sumYear,
      costPerKm:
        barArr.reduce((s, v) => s + v.cost, 0) /
        barArr.reduce((s, v) => s + v.km, 1),
    };
  }, [me]);

  /* 3. zwracamy WSZYSTKO co potrzebuje strona ----------------------------- */
  return {
    me,
    loading,
    healthScore,
    monthlyCost,
    barCostKm,
    upcoming,
    timeline,
    kpiMonth,
    kpiYear,
    costPerKm,
  };
}
