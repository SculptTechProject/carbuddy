/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { CreditCard, TrendingUp, Activity } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { HashLoader } from "react-spinners";
import clsx from "clsx";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

/* ──────── TYPES ────────────────── */
interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
}
interface Repair {
  id: string;
  type: "Naprawa" | "Serwis";
  title: string;
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
  upcomingServices?: Planned[];
  recentRepairs?: Repair[];
  expenses?: Expense[];
}
interface MeResponse {
  id: string;
  firstName: string;
  cars: Car[];
}

/* ──────── HELPERS ──────────────── */
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

/* ──────── PAGE ─────────────────── */
export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  /* 1. pobierz podstawowe info o użytkowniku */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.replace("/login");

    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get<{ user: MeResponse }>(
          `${API_URL}/api/v1/user/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMe(data.user);
      } catch {
        localStorage.removeItem("token");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* 2. dociągnij szczegóły każdego auta */
  useEffect(() => {
    if (!me?.cars?.length) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    (async () => {
      try {
        const ext: Record<
          string,
          { expenses: Expense[]; repairs: Repair[]; planned: Planned[] }
        > = {};

        await Promise.all(
          me.cars.map(async (car) => {
            const [exp, rep, plan] = await Promise.all([
              axios.get(`${API_URL}/api/v1/cars/${car.id}/expenses`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
              axios.get(`${API_URL}/api/v1/cars/${car.id}/repairs`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
              axios.get(`${API_URL}/api/v1/cars/${car.id}/planned-repairs`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
            ]);
            ext[car.id] = {
              expenses: exp.data,
              repairs: rep.data,
              planned: plan.data,
            };
          })
        );

        setMe((prev) =>
          !prev
            ? prev
            : {
                ...prev,
                cars: prev.cars.map((c) => ({
                  ...c,
                  expenses: ext[c.id]?.expenses ?? c.expenses,
                  recentRepairs: ext[c.id]?.repairs ?? c.recentRepairs,
                  upcomingServices: ext[c.id]?.planned ?? c.upcomingServices,
                })),
              }
        );
      } catch (err) {
        console.error(err);
      }
    })();
  }, [me?.cars]);

  /* 3. agregaty */
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
    if (!me || !me.cars?.length)
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

    /* --- pomocnicze zmienne --- */
    type TL = {
      date: string;
      label: string;
      type: "repair" | "service" | "expense" | "planned";
      carLabel: string;
    };
    const events: TL[] = [];

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

    /* --- pętla po autach --- */
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

      /* planned — z endpointu + przyszłe repairs */
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
          label: `Plan • ${"type" in p ? p.type : (p as Repair).type}`,
          type: "planned",
          carLabel: labelCar,
        });
      });
    });

    /* health */
    const health =
      overdue === 0 && upcnt === 0
        ? 100
        : Math.max(0, 100 - overdue * 20 - upcnt * 5);

    /* koszt/km per car */
    const barArr = Object.values(costCar).map((v) => ({
      ...v,
      costKm: v.cost / v.km,
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

  /* ładowanie */
  if (loading || !me)
    return (
      <div className="flex h-screen items-center justify-center">
        <HashLoader size={60} />
      </div>
    );

  /* ─────── UI ───────── */
  return (
    <div className="w-full p-6 space-y-8">
      {/* KPI */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow flex flex-col items-center justify-center p-6">
          <Radial value={healthScore} />
          <p className="mt-2 text-sm text-gray-600">Zdrowie floty</p>
        </div>
        <Kpi
          icon={<CreditCard className="w-5 h-5" />}
          label="Koszt w tym miesiącu"
          value={kpiMonth}
        />
        <Kpi
          icon={<CreditCard className="w-5 h-5" />}
          label="Koszt w tym roku"
          value={kpiYear}
        />
        <Kpi
          icon={<TrendingUp className="w-5 h-5" />}
          label="Średni koszt / km"
          value={costPerKm}
        />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartLine data={monthlyCost} />
        <ChartBar data={barCostKm} />
      </section>

      {/* Lists */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingList list={upcoming} />
        <Timeline list={timeline} />
      </section>
    </div>
  );
}

/* ─────── UI pod-komponenty ─────── */
function Kpi({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  const money = new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(value);
  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col min-h-[110px]">
      <div className="flex justify-between text-gray-500 mb-1">
        {icon}
        {label}
      </div>
      <div className="text-3xl font-bold">{money}</div>
    </div>
  );
}

function Radial({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const r = 40;
  const c = 2 * Math.PI * r;
  const off = ((100 - pct) / 100) * c;
  const col =
    pct > 80
      ? "stroke-emerald-500"
      : pct > 50
      ? "stroke-yellow-500"
      : "stroke-red-500";
  return (
    <svg width="120" height="120" className="-rotate-90">
      <circle
        cx="60"
        cy="60"
        r={r}
        strokeWidth="10"
        className="stroke-gray-200"
        fill="none"
      />
      <circle
        cx="60"
        cy="60"
        r={r}
        strokeWidth="10"
        className={clsx(col, "transition-all")}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={off}
        strokeLinecap="round"
      />
      <text
        x="60"
        y="60"
        textAnchor="middle"
        dominantBaseline="central"
        className="rotate-90 font-bold text-xl"
      >
        {pct.toFixed(0)}%
      </text>
    </svg>
  );
}

/* Charts */
function ChartLine({ data }: { data: { month: string; cost: number }[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-2">Koszt napraw • 12 mies.</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="cost"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartBar({ data }: { data: { label: string; costKm: number }[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-2">Koszt / km (samochód)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
          <XAxis type="number" />
          <YAxis dataKey="label" type="category" width={90} />
          <Tooltip />
          <Bar dataKey="costKm">
            {data.map((_, i) => (
              <Cell key={i} fill={i % 2 ? "#3B82F6" : "#10B981"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* Upcoming */
function UpcomingList({
  list,
}: {
  list: {
    id: string;
    type: string;
    date: string;
    dateFmt: string;
    carLabel: string;
  }[];
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-4">Najbliższe terminy</h3>

      <div className="max-h-[40vh] md:max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        {list.length === 0 ? (
          <p className="text-sm text-gray-500">Brak nadchodzących terminów.</p>
        ) : (
          <ul className="space-y-4 divide-y divide-gray-200">
            {list.map((u) => {
              const diff = daysDiff(u.date) - 1;

              /* -------------- badge ---------------- */
              let badgeTxt: string;
              let badgeCls: string;

              if (diff === 0) {
                badgeTxt = "Dzisiaj";
                badgeCls = "bg-yellow-100 text-yellow-700";
              } else if (diff === -1) {
                badgeTxt = "Wczoraj";
                badgeCls = "bg-red-100 text-red-700";
              } else if (diff > 0) {
                badgeTxt = `Za ${diff} dni`;
                badgeCls = "bg-gray-100 text-gray-700";
              } else {
                return null;
              }

              return (
                <li
                  key={u.id}
                  className="flex items-center justify-between pt-1 first:pt-0"
                >
                  <div>
                    <p className="font-medium">{u.type}</p>
                    <p className="text-xs text-gray-500">
                      {u.carLabel} • {u.dateFmt}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      "inline-flex px-3 py-[2px] rounded-full text-xs font-medium",
                      badgeCls
                    )}
                  >
                    {badgeTxt}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/* Timeline */
function Timeline({
  list,
}: {
  list: {
    date: string;
    label: string;
    type: "repair" | "service" | "expense" | "planned";
    carLabel: string;
  }[];
}) {
  const dot = (t: string) =>
    ({
      repair: "bg-rose-500",
      service: "bg-sky-500",
      expense: "bg-amber-500",
      planned: "bg-emerald-500",
    }[t] ?? "bg-gray-400");

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-4">Ostatnie zdarzenia</h3>
      <div className="max-h-[40vh] md:max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        <div className="relative pl-6">
          <span className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-gray-300 to-transparent" />
          {list.length === 0 ? (
            <p className="text-sm text-gray-500">Brak historii.</p>
          ) : (
            <ul className="space-y-4">
              {list.map((e, i) => (
                <li
                  key={i}
                  className="relative grid grid-cols-[auto_1fr_auto] gap-3 items-start hover:bg-gray-50/70 rounded-lg px-2 py-1"
                >
                  <span
                    className={clsx(
                      "absolute -left-[7px] top-[7px] w-[6px] h-[6px] rounded-full",
                      dot(e.type)
                    )}
                  />
                  <Activity className="w-4 h-4 text-gray-400 mt-[2px]" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-medium">{e.label}</span>
                    <span className="text-xs text-gray-500">{e.carLabel}</span>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(e.date).toLocaleDateString("pl-PL")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
