/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { HashLoader } from "react-spinners";
import { CreditCard, TrendingUp, Activity } from "lucide-react";
import clsx from "clsx";

import { useDashboardData } from "@/hooks/useDashboardData";

/* -------------------------------------------------------------------------- */
/* PAGE                                                                        */
/* -------------------------------------------------------------------------- */
export default function DashboardPage() {
  /* główny hook z danymi oraz flagą ładowania */
  const {
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
  } = useDashboardData();

  const router = useRouter();

  /* prosty redirect, gdy zniknie token (wylogowanie w innej karcie itp.) */
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.replace("/login");
    }
  }, [router]);

  /* ---------------------------------------------------------------------- */
  /* UI ładowania / błędu                                                   */
  /* ---------------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HashLoader size={60} />
      </div>
    );
  }

  if (!me) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 font-medium">
          Nie udało się pobrać danych użytkownika.
        </p>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* NORMALNY WIDOK DASHBOARDU                                              */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="w-full p-6 space-y-8">
      {/* KPI ---------------------------------------------------------------- */}
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
          fractionDigits={2}
        />
      </section>

      {/* Wykresy ------------------------------------------------------------ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartLine data={monthlyCost} />
        <ChartBar data={barCostKm} />
      </section>

      {/* Listy -------------------------------------------------------------- */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingList list={upcoming} />
        <Timeline list={timeline} />
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* POD-KOMPONENTY                                                             */
/* -------------------------------------------------------------------------- */

/* ---------- KPI box ---------- */
function Kpi({
  icon,
  label,
  value,
  fractionDigits = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  fractionDigits?: number;
}) {
  const money = new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
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

/* ---------- Radial ---------- */
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

/* ---------- Wykres – linia ---------- */
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

/* ---------- Wykres – słupki ---------- */
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

/* ---------- Upcoming list ---------- */
type UpcomingItem = {
  id: string;
  type: string;
  date: string;
  dateFmt: string;
  carLabel: string;
};

const daysDiff = (iso: string) =>
  Math.ceil(
    (new Date(iso).getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000
  );

function UpcomingList({ list }: { list: UpcomingItem[] }) {
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

              let badgeTxt = "";
              let badgeCls = "";
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
                return null; // starsze niż wczoraj
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

/* ---------- Timeline ---------- */
type TimelineItem = {
  date: string;
  label: string;
  type: "repair" | "service" | "expense" | "planned";
  carLabel: string;
};

function Timeline({ list }: { list: TimelineItem[] }) {
  const dot = (t: string) =>
    ((
      {
        repair: "bg-rose-500",
        service: "bg-sky-500",
        expense: "bg-amber-500",
        planned: "bg-emerald-500",
      } as const
    )[t] ?? "bg-gray-400");

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
