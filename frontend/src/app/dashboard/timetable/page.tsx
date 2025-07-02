"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Fragment, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar as Spinner } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { formatPL } from "@/utils/date";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

/* ─── typy ─────────────────────────────────────────────────────── */
type Car = { id: string; make: string; model: string };

type RawRepair = {
  id: string;
  name: string;
  date: string;
  type: "Naprawa" | "Serwis";
  cost?: number;
  description?: string;
};

type Event = {
  id: string;
  carId: string;
  title: string;
  date: string;
  type: "repair" | "service" | "planned";
  raw: RawRepair;
};

const typeColors: Record<Event["type"], string> = {
  repair: "bg-rose-500",
  service: "bg-sky-500",
  planned: "bg-amber-500",
};

/* ─── helpers ──────────────────────────────────────────────────── */
const buildMatrix = (y: number, m: number) => {
  const first = new Date(y, m, 1);
  const offset = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = Array(offset).fill(null);
  const days = new Date(y, m + 1, 0).getDate();
  for (let d = 1; d <= days; d++) cells.push(new Date(y, m, d));
  while (cells.length < 42) cells.push(null);
  return cells;
};
const monthPL = (y: number, m: number) =>
  new Date(y, m).toLocaleString("pl-PL", { month: "long" });

/* ─── komponent ────────────────────────────────────────────────── */
export default function TimetablePage() {
  const router = useRouter();
  const today = new Date();

  const [y, setY] = useState(today.getFullYear());
  const [m, setM] = useState(today.getMonth());
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEvents, setActiveEvents] = useState<Event[] | null>(null);

  const prev = () =>
    setM((cur) => (cur === 0 ? (setY((yy) => yy - 1), 11) : cur - 1));
  const next = () =>
    setM((cur) => (cur === 11 ? (setY((yy) => yy + 1), 0) : cur + 1));

  /* ── fetch ── */
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.replace("/login");

      setLoading(true);
      try {
        // auta
        const { data } = await axios.get(`${API_URL}/api/v1/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const carList: Car[] = data.user.cars.map((c: any) => ({
          id: c.id,
          make: c.make,
          model: c.model,
        }));
        setCars(carList);

        // repairs (zawiera Naprawa + Serwis)
        const evArr: Event[] = [];
        await Promise.all(
          carList.map(async (car) => {
            const { data: repairs } = await axios.get(
              `${API_URL}/api/v1/cars/${car.id}/repairs`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            evArr.push(
              ...repairs.map((r: RawRepair) => ({
                id: r.id,
                carId: car.id,
                title: r.name,
                date: r.date,
                type: r.type === "Serwis" ? "service" : "repair",
                raw: r,
              }))
            );
          })
        );
        setEvents(evArr);
      } catch (err) {
        console.error(err);
        alert("Błąd pobierania kalendarza");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const cells = useMemo(() => buildMatrix(y, m), [y, m]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );

  return (
    <>
      {/* header */}
      <div className="px-4 py-8 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-semibold capitalize">
              {monthPL(y, m)} {y}
            </h2>
            <button
              onClick={next}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <select
            value={selectedCar}
            onChange={(e) => setSelectedCar(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Wszystkie pojazdy</option>
            {cars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.make} {c.model}
              </option>
            ))}
          </select>
        </div>

        {/* calendar */}
        <div className="grid grid-cols-7 gap-1 text-xs sm:text-sm">
          {["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"].map((d) => (
            <div
              key={d}
              className="text-center font-semibold py-1 text-gray-600"
            >
              {d}
            </div>
          ))}

          {cells.map((cell, idx) => {
            if (!cell)
              return <div key={idx} className="h-20 bg-gray-50 rounded" />;

            const dayEvents = events.filter(
              (ev) =>
                (selectedCar === "all" || ev.carId === selectedCar) &&
                new Date(ev.date).toDateString() === cell.toDateString()
            );
            const isToday = cell.toDateString() === today.toDateString();
            const isWeekend = cell.getDay() === 0 || cell.getDay() === 6;

            return (
              <div
                key={cell.toISOString()}
                onClick={() => dayEvents.length && setActiveEvents(dayEvents)}
                className={`relative h-20 rounded-lg p-1 flex flex-col overflow-hidden cursor-pointer border
                  ${isToday ? "border-emerald-600" : "border-transparent"}
                  ${isWeekend ? "bg-gray-50" : "bg-white"}`}
              >
                <span className="text-[11px] font-medium">
                  {cell.getDate()}
                </span>
                <div className="mt-1 space-y-[2px] overflow-y-auto hide-scrollbar">
                  {dayEvents.map((ev) => (
                    <span
                      key={ev.id}
                      className={`block truncate px-[4px] py-[1px] rounded text-white ${
                        typeColors[ev.type]
                      }`}
                      title={ev.title}
                    >
                      {ev.title}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL */}
      <Transition appear show={!!activeEvents} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setActiveEvents(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
                {activeEvents && (
                  <>
                    <Dialog.Title className="text-lg font-semibold mb-4">
                      {activeEvents.length === 1
                        ? activeEvents[0].title
                        : `${activeEvents.length} zdarzenia`}
                    </Dialog.Title>

                    <ul className="space-y-3 text-sm max-h-80 overflow-y-auto hide-scrollbar">
                      {activeEvents.map((ev) => (
                        <li
                          key={ev.id}
                          className="border rounded-md p-3 flex flex-col gap-1"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${
                                typeColors[ev.type]
                              }`}
                            />
                            <span className="font-medium truncate">
                              {ev.title}
                            </span>
                          </div>
                          <div className="text-gray-500">
                            {formatPL(ev.date)} •{" "}
                            {ev.type === "service" ? "Serwis" : "Naprawa"}
                          </div>
                          {ev.raw.cost && (
                            <div className="text-gray-500">
                              Koszt: {ev.raw.cost} zł
                            </div>
                          )}
                          {ev.raw.description && (
                            <div className="text-gray-500 truncate">
                              Opis: {ev.raw.description}
                            </div>
                          )}

                          <button
                            onClick={() =>
                              router.push(`/dashboard/repairs/${ev.id}`)
                            }
                            className="self-start mt-2 text-emerald-600 hover:text-gray-600 transition-all cursor-pointer"
                          >
                            szczegóły
                          </button>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => setActiveEvents(null)}
                        className="px-4 py-2 rounded-md border border-transparent hover:border-gray-600 bg-gray-600 hover:bg-gray-50 text-sm cursor-pointer text-gray-50 hover:text-gray-600 transition-all"
                      >
                        Zamknij
                      </button>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
