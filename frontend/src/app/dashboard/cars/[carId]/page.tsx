/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  FormEvent,
  ChangeEvent,
} from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import clsx from "clsx";
import HashLoader from "react-spinners/HashLoader";
import { useMe } from "@/hooks/useMe"; // <-- nowy hook

import { Droplet as FluidIcon, Pencil, CircleX } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

/* ---------- typy ---------- */
interface Car {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  engine?: string;
  power?: number;
  kilometers?: number;
  registration?: string;
  purchaseDate?: string;
  fuelType?: string;
  color?: string;
}

interface Repair {
  id: string;
  date: string;
  type: string;
  description?: string;
  cost: number;
}

interface Expense {
  id: string;
  category: string;
  date: string;
  amount: number;
  description?: string;
}

/* ───────────────────────────────────────────────────────────── */

export default function CarDetailsPage() {
  /* url & router */
  const { carId } = useParams();
  const router = useRouter();

  /* user Premium info */
  const { me: user } = useMe();

  /* dane pojazdu */
  const [car, setCar] = useState<Car | null>(null);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  /* stany modal-UI */
  const [showFluids, setShowFluids] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  /* pobranie danych auta */
  useEffect(() => {
    if (!carId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [carRes, repRes, expRes] = await Promise.all([
          axios.get<Car>(`${API_URL}/api/v1/cars/${carId}`, { headers }),
          axios.get<Repair[]>(`${API_URL}/api/v1/cars/${carId}/repairs`, {
            headers,
          }),
          axios.get<Expense[]>(`${API_URL}/api/v1/cars/${carId}/expenses`, {
            headers,
          }),
        ]);
        setCar(carRes.data);
        setRepairs(repRes.data);
        setExpenses(expRes.data);
      } catch {
        router.replace("/dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [carId, router]);

  const fmt = (iso: string) => new Date(iso).toLocaleDateString();

  /* ---------- render ---------- */
  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <HashLoader size={60} />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 font-medium">Pojazd nie został znaleziony</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Wróć
        </button>
      </div>
    );
  }

  return (
    <>
      {/* ------- główny widok ------- */}
      <div className="p-6 space-y-8">
        {/* nagłówek + akcje */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <button
            onClick={() => router.back()}
            className="text-sm text-emerald-600 hover:text-gray-600 transition-all cursor-pointer"
          >
            ← Wróć do listy pojazdów
          </button>

          <div className="space-x-2">
            {/* PŁYNY ---------------------------------------------------- */}
            <button
              onClick={() => setShowFluids(true)}
              disabled={!user?.premium}
              className={clsx(
                "px-4 py-2 rounded-xl transition",
                user?.premium
                  ? "bg-emerald-500 text-gray-50 hover:bg-gray-500 cursor-pointer transition-all"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              )}
            >
              Płyny
            </button>

            {/* EDYTUJ --------------------------------------------------- */}
            <button
              onClick={() => setShowEdit(true)}
              className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-700 cursor-pointer transition-all"
            >
              Edytuj
            </button>

            <DeleteCarButton carId={car.id} />
          </div>
        </div>

        {/* szczegóły pojazdu */}
        <CarCard car={car} />

        {/* listy napraw / wydatków */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RepairList list={repairs} fmt={fmt} />
          <ExpenseList list={expenses} fmt={fmt} />
        </div>
      </div>

      {/* ------- MODALE ------- */}
      <FluidCheckModal
        carId={car.id}
        open={showFluids}
        onClose={() => setShowFluids(false)}
        isPremium={!!user?.premium}
      />

      <EditCarModal
        car={car}
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onUpdated={(updated) => setCar(updated)}
      />
    </>
  );
}

/* ===================================================================== */
/* ----------------------------- sub-komponenty ------------------------- */
/* ===================================================================== */

function CarCard({ car }: { car: Car }) {
  const details = useMemo(
    () => [
      ["VIN", car.vin],
      ["Rejestracja", car.registration],
      ["Przebieg", car.kilometers && `${car.kilometers.toLocaleString()} km`],
      ["Silnik", car.engine],
      ["Moc", car.power && `${car.power} KM`],
      ["Paliwo", car.fuelType],
      ["Kolor", car.color],
      [
        "Data zakupu",
        car.purchaseDate && new Date(car.purchaseDate).toLocaleDateString(),
      ],
    ],
    [car]
  );

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold mb-4">
        {car.make} {car.model} ({car.year})
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {details.map(
          ([l, v]) =>
            v && (
              <div key={l} className="flex">
                <span className="w-40 font-medium">{l}:</span>
                <span>{v}</span>
              </div>
            )
        )}
      </div>
    </div>
  );
}

/* --- listy --- */
const RepairList = ({
  list,
  fmt,
}: {
  list: Repair[];
  fmt: (s: string) => string;
}) => (
  <section className="bg-white shadow rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4">Naprawy</h2>
    {list.length ? (
      <ul className="space-y-4">
        {list.map((r) => (
          <li
            key={r.id}
            className="flex justify-between border-b pb-3 last:border-0"
          >
            <div>
              <div className="font-medium">{r.type}</div>
              <div className="text-sm text-gray-500">
                {fmt(r.date)}
                {r.description && ` • ${r.description}`}
              </div>
            </div>
            <div className="font-semibold">{r.cost} zł</div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500">Brak napraw</p>
    )}
  </section>
);

const ExpenseList = ({
  list,
  fmt,
}: {
  list: Expense[];
  fmt: (s: string) => string;
}) => (
  <section className="bg-white shadow rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4">Wydatki</h2>
    {list.length ? (
      <ul className="space-y-4">
        {list.map((e) => (
          <li key={e.id} className="flex justify-between">
            <div>
              <div className="font-medium">{e.category}</div>
              <div className="text-sm text-gray-500">
                {fmt(e.date)}
                {e.description && ` • ${e.description}`}
              </div>
            </div>
            <div className="font-semibold">{e.amount} zł</div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500">Brak wydatków</p>
    )}
  </section>
);

function DeleteCarButton({ carId }: { carId: string }) {
  const router = useRouter();
  const [del, setDel] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Usunąć pojazd?")) return;
    setDel(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/v1/cars/${carId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.replace("/dashboard");
    } catch {
      alert("Nie udało się usunąć.");
      setDel(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={del}
      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-60 cursor-pointer transition-all"
    >
      {del ? "Usuwanie…" : "Usuń"}
    </button>
  );
}

/* ===================================================================== */
/* ---------------------------- Fluid modal ----------------------------- */
/* ===================================================================== */

interface FluidPlan {
  id: string;
  intervalDay: number;
  lastCheck: string;
  nextCheck: string;
  enabled: boolean;
}

function FluidCheckModal({
  carId,
  open,
  onClose,
  isPremium,
}: {
  carId: string;
  open: boolean;
  onClose: () => void;
  isPremium: boolean;
}) {
  const [plan, setPlan] = useState<FluidPlan | null>(null);
  const [interval, setInterval] = useState(14);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* pobierz plan gdy modal otwierany */
  useEffect(() => {
    if (!open || !isPremium || !token) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get<FluidPlan>(
          `${API_URL}/api/v1/cars/${carId}/fluid-check`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPlan(data);
        setInterval(data.intervalDay);
      } catch {
        /* brak planu → plan = null */
        setPlan(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, isPremium, carId, token]);

  /* zapisz / utwórz plan */
  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const { data } = await axios.post<FluidPlan>(
        `${API_URL}/api/v1/cars/${carId}/fluid-check`,
        { intervalDay: interval, enabled: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlan(data);
    } finally {
      setSaving(false);
    }
  };

  /* potwierdź sprawdzenie */
  const handleConfirm = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const { data } = await axios.patch<FluidPlan>(
        `${API_URL}/api/v1/cars/${carId}/fluid-check`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlan(data);
    } finally {
      setSaving(false);
    }
  };

  /* wyłącz plan */
  const handleDisable = async () => {
    if (!token || !plan) return;
    if (!confirm("Wyłączyć przypomnienie o płynach?")) return;
    setSaving(true);
    try {
      await axios.delete(`${API_URL}/api/v1/cars/${carId}/fluid-check`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlan(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* backdrop */}
        <Transition.Child
          enter="ease-out duration-200"
          enterFrom="opacity-0 backdrop-blur-none"
          enterTo="opacity-100 backdrop-blur-sm"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 backdrop-blur-sm"
          leaveTo="opacity-0 backdrop-blur-none"
          as={Fragment}
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        {/* modal */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-6">
              <Dialog.Title className="flex items-center gap-2 text-lg font-semibold">
                <FluidIcon className="w-5 h-5 text-emerald-500" />
                Kontrola płynów
              </Dialog.Title>

              {!isPremium && (
                <div className="text-center space-y-4">
                  <CircleX className="w-10 h-10 text-red-500 mx-auto" />
                  <p className="text-gray-700">
                    Funkcja dostępna tylko w planie <b>Premium</b>.
                  </p>
                  <button
                    onClick={onClose}
                    className="mx-auto px-4 py-2 rounded bg-emerald-500 text-white"
                  >
                    Zamknij
                  </button>
                </div>
              )}

              {isPremium && loading && (
                <div className="flex justify-center py-8">
                  <HashLoader size={40} />
                </div>
              )}

              {isPremium && !loading && (
                <>
                  {/* plan ISTNIEJE ------------------------------------------------ */}
                  {plan ? (
                    <>
                      <div className="space-y-2 text-sm">
                        <p>
                          <b>Interwał:</b> co {plan.intervalDay} dni
                        </p>
                        <p>
                          <b>Ostatnio sprawdzone:</b>{" "}
                          {new Date(plan.lastCheck).toLocaleDateString()}
                        </p>
                        <p>
                          <b>Następne przypomnienie:</b>{" "}
                          {new Date(plan.nextCheck).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          onClick={handleDisable}
                          className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          Wyłącz
                        </button>
                        <button
                          onClick={handleConfirm}
                          disabled={saving}
                          className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
                        >
                          {saving ? "Zapisywanie…" : "Potwierdź: sprawdzone"}
                        </button>
                      </div>
                    </>
                  ) : (
                    /* plan NIE istnieje --------------------------------------- */
                    <>
                      <label className="block text-sm mb-1">
                        Co ile dni przypominać?
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={interval}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setInterval(Number(e.target.value))
                        }
                        className="w-full border rounded px-3 py-2"
                      />

                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          onClick={onClose}
                          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                        >
                          Anuluj
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
                        >
                          {saving ? "Zapisywanie…" : "Zapisz plan"}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}

/* ===================================================================== */
/* ----------------------------- Edit modal ---------------------------- */
/* ===================================================================== */

function EditCarModal({
  car,
  open,
  onClose,
  onUpdated,
}: {
  car: Car;
  open: boolean;
  onClose: () => void;
  onUpdated: (c: Car) => void;
}) {
  /* lokalny formularz */
  const [form, setForm] = useState<Car>(car);
  const [saving, setSaving] = useState(false);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => setForm(car), [car]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    /* zbuduj payload od zera, kopiując pola z formularza -------------- */
    const data: Partial<Car> = { ...form };

    const numericKeys = ["kilometers", "power", "year"] as const;
    numericKeys.forEach((k) => {
      const raw = (form as any)[k];
      if (raw === "" || raw == null) {
        delete (data as any)[k];
      } else {
        (data as any)[k] = Number(raw);
      }
    });

    setSaving(true);
    try {
      const { data: updated } = await axios.put<Car>(
        `${API_URL}/api/v1/cars/${car.id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdated(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog onClose={() => !saving && onClose()} className="relative z-50">
        {/* backdrop */}
        <Transition.Child
          enter="ease-out duration-200"
          enterFrom="opacity-0 backdrop-blur-none"
          enterTo="opacity-100 backdrop-blur-sm"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 backdrop-blur-sm"
          leaveTo="opacity-0 backdrop-blur-none"
          as={Fragment}
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        {/* modal */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-6">
              <Dialog.Title className="flex items-center gap-2 text-lg font-semibold">
                <Pencil className="w-5 h-5" />
                Edycja pojazdu
              </Dialog.Title>

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  ["registration", "Rejestracja"],
                  ["kilometers", "Przebieg"],
                  ["engine", "Silnik"],
                  ["power", "Moc"],
                  ["color", "Kolor"],
                ].map(([k, label]) => (
                  <div key={k}>
                    <label className="block text-sm font-medium mb-1">
                      {label}
                    </label>
                    <input
                      type={
                        k === "kilometers" || k === "power" ? "number" : "text"
                      }
                      name={k}
                      value={form[k as keyof Car] ?? ""}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                ))}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-60"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
                  >
                    {saving ? "Zapisywanie…" : "Zapisz zmiany"}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
