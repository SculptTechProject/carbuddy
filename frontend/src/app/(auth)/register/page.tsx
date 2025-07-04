"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { CarFront, Loader2, CheckCircle, Car } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
type Plan = "free" | "pro";

export default function Register() {
  const router = useRouter();

  /* ---------------------- state ---------------------- */
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [plan, setPlan] = useState<Plan>("free");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    accept: false,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });

  /* --------------------- submit ---------------------- */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);

    if (form.password !== form.confirm) {
      return setErr("Hasła nie są zgodne");
    }
    if (!form.accept) {
      return setErr("Musisz zaakceptować regulamin");
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/v1/user/register`, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        plan,
      });
      router.push("/login?welcome=1");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e.response?.data?.error || "Ups, spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  /* ----------------------- UI ------------------------ */
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main
        className="flex-grow flex items-center justify-center px-4"
        data-aos="fade-out"
      >
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[560px] bg-white rounded-2xl shadow-xl p-8 space-y-8"
        >
          {/* brand ------------------------------------------------------- */}
          <header className="text-center space-y-2">
            <CarFront className="mx-auto text-emerald-500" size={32} />
            <h1 className="text-2xl font-semibold">Utwórz konto</h1>
            <p className="text-sm text-gray-500">
              Masz już konto?{" "}
              <Link href="/login" className="text-emerald-600 hover:underline">
                Zaloguj się
              </Link>
            </p>
          </header>

          {/* kroki zegara ----------------------------------------------- */}
          <Stepper step={step} />

          {/* Step 0 – dane osobowe -------------------------------------- */}
          {step === 0 && (
            <section className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Imię"
                  name="firstName"
                  value={form.firstName}
                  onChange={onChange}
                  required
                />
                <Field
                  label="Nazwisko"
                  name="lastName"
                  value={form.lastName}
                  onChange={onChange}
                  required
                />
              </div>
              <Field
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
              />
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={!form.firstName || !form.lastName || !form.email}
                className="px-5 py-3 border border-transparent text-gray-50 cursor-pointer transition-all rounded-xl bg-gray-600 hover:bg-gray-50 hover:text-gray-600 hover:border-gray-600"
              >
                Dalej
              </button>
            </section>
          )}

          {/* Step 1 – wybór planu --------------------------------------- */}
          {step === 1 && (
            <section className="space-y-6" data-aos="flip-left">
              <PlanSelect plan={plan} setPlan={setPlan} />
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="btn-secondary"
                >
                  Wstecz
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-primary"
                >
                  Dalej
                </button>
              </div>
            </section>
          )}

          {/* Step 2 – hasło i akcept ------------------------------------ */}
          {step === 2 && (
            <section className="space-y-6" data-aos="flip-right">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  type="password"
                  label="Hasło"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  required
                />
                <Field
                  type="password"
                  label="Potwierdź hasło"
                  name="confirm"
                  value={form.confirm}
                  onChange={onChange}
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="accept"
                  checked={form.accept}
                  onChange={onChange}
                  className="h-4 w-4 text-emerald-600"
                />
                <span>
                  Akceptuję&nbsp;
                  <Link href="/terms" className="link">
                    regulamin
                  </Link>{" "}
                  i&nbsp;
                  <Link href="/privacy" className="link">
                    politykę prywatności
                  </Link>
                </span>
              </label>

              {err && <p className="text-red-500 text-sm text-center">{err}</p>}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                >
                  Wstecz
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  Utwórz konto
                </button>
              </div>
            </section>
          )}
        </form>
      </main>
      <footer className="w-full bg-white border-t border-gray-200 pt-4 sm:px-8 lg:px-36">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-gray-600 text-sm">
          {/* Lewa kolumna */}
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Car className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold">CarBuddy</span>
          </div>

          {/* Środek */}
          <div className="text-center">
            © {new Date().getFullYear()} CarBuddy. Wszelkie prawa zastrzeżone.
          </div>

          {/* Prawa kolumna */}
          <div className="flex items-center justify-center md:justify-end gap-4">
            <Link href="/privacy" className="hover:underline">
              Polityka prywatności
            </Link>
            <Link href="/terms" className="hover:underline">
              Warunki korzystania
            </Link>
          </div>
        </div>
      </footer>
      ;
    </div>
  );
}

/* --------------------------------------------------------------------- */
/*  Szablony / pomocnicze                                                */
/* --------------------------------------------------------------------- */

function Field(props: React.ComponentProps<"input"> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="text-sm space-y-1">
      <span className="font-medium text-gray-700">{label}</span>
      <input
        {...rest}
        className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm
          focus:border-emerald-500 focus:ring-emerald-500"
      />
    </label>
  );
}

function Stepper({ step }: { step: 0 | 1 | 2 }) {
  const labels = ["Dane", "Plan", "Hasło"];
  return (
    <div className="flex justify-center gap-4">
      {labels.map((l, i) => {
        const active = i <= step;
        return (
          <div key={l} className="flex items-center gap-1 text-sm">
            <div
              className={`
              w-5 h-5 rounded-full flex items-center justify-center
              ${
                active
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }
            `}
            >
              {active ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={active ? "text-gray-800" : "text-gray-400"}>
              {l}
            </span>
            {i < 2 && <div className="w-8 h-px bg-gray-300" />}
          </div>
        );
      })}
    </div>
  );
}

function PlanSelect({
  plan,
  setPlan,
}: {
  plan: Plan;
  setPlan: (p: Plan) => void;
}) {
  const Card = ({
    id,
    title,
    price,
    perks,
  }: {
    id: Plan;
    title: string;
    price: string;
    perks: string[];
  }) => (
    <button
      type="button"
      onClick={() => setPlan(id)}
      className={`
        border rounded-lg p-4 text-left w-full
        ${plan === id ? "border-emerald-500 shadow-sm" : "border-gray-300"}
      `}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">
          {title} <span className="text-sm text-gray-500">{price}</span>
        </span>
        {id === "pro" && (
          <span className="text-xs bg-emerald-500 text-white rounded-full px-2">
            Polecany
          </span>
        )}
      </div>
      <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
        {perks.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </button>
  );

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Card
        id="free"
        title="Free"
        price="0 zł / mies."
        perks={[
          "Do 3 pojazdów",
          "Historia napraw 12 mies.",
          "Podstawowe analizy",
          "CSV eksport lokalny",
        ]}
      />
      <Card
        id="pro"
        title="Pro"
        price="19,99 zł / mies."
        perks={[
          "Brak limitu pojazdów",
          "Zaawansowane przypomnienia",
          "Pełna historia",
          "PDF / Excel",
          "Chmura & wsparcie",
        ]}
      />
    </div>
  );
}
