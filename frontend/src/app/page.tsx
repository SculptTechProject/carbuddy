"use client";
import React, { Fragment, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import heroImg from "@/assets/carbuddylanding.png";
import {
  Car,
  Bell,
  FileText,
  CreditCard,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Dialog, Transition } from "@headlessui/react";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const menuItems = [
    { id: "features", label: "Funkcje", icon: <Car className="w-5 h-5" /> },
    {
      id: "how-it-works",
      label: "Jak to działa",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      id: "pricing",
      label: "Cennik",
      icon: <CreditCard className="w-5 h-5" />,
    },
    { id: "faq", label: "FAQ", icon: <FileText className="w-5 h-5" /> },
  ];

  const footerSections = {
    Produkt: [
      { href: "#features", label: "Funkcje" },
      { href: "#pricing", label: "Cennik" },
      { href: "#faq", label: "FAQ" },
    ],
    Firma: [
      { href: "#", label: "O nas" },
      { href: "#", label: "Blog" },
      { href: "#", label: "Kontakt" },
    ],
    Legalne: [
      { href: "#", label: "Polityka prywatności" },
      { href: "#", label: "Warunki" },
    ],
  };

  const faqs = [
    {
      value: "q1",
      question: "Czy CarBuddy działa na wszystkich urządzeniach?",
      answer:
        "Tak, CarBuddy jest dostępny jako aplikacja webowa oraz mobilna na urządzenia z systemem iOS i Android. Możesz korzystać z niego na komputerze, tablecie lub smartfonie.",
    },
    {
      value: "q2",
      question: "Czy mogę zarządzać więcej niż jednym pojazdem?",
      answer:
        "W darmowym planie możesz zarządzać jednym pojazdem. Plan Pro umożliwia zarządzanie nieograniczoną liczbą pojazdów, co jest idealne dla rodzin lub małych firm.",
    },
    {
      value: "q3",
      question: "Jak działają przypomnienia o terminach?",
      answer:
        "CarBuddy wysyła powiadomienia push w aplikacji oraz e-maile z przypomnieniami o zbliżających się terminach przeglądów, wymian oleju, ubezpieczenia itp. Możesz dostosować częstotliwość i rodzaj powiadomień w ustawieniach.",
    },
    {
      value: "q4",
      question: "Czy mogę przechowywać zdjęcia faktur i dokumentów?",
      answer:
        "Tak, CarBuddy umożliwia przechowywanie zdjęć faktur, paragonów i innych dokumentów związanych z naprawami i serwisem Twojego pojazdu. W planie Pro masz dostęp do większej przestrzeni dyskowej.",
    },
    {
      value: "q5",
      question: "Czy mogę anulować subskrypcję w dowolnym momencie?",
      answer:
        "Tak, możesz anulować subskrypcję planu Pro w dowolnym momencie. Po anulowaniu będziesz mógł korzystać z planu do końca opłaconego okresu, a następnie Twoje konto zostanie automatycznie przełączone na plan Free.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/30 backdrop-blur-xl shadow-xl transition-all">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 ">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Car className="w-6 h-6 text-emerald-500" />
            <span className="text-xl text-gray-500">CarBuddy</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-gray-600 font-semibold">
            <Link
              href="#features"
              className="text-sm hover:text-emerald-500 transition-all"
            >
              Funkcje
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm hover:text-emerald-500 transition-all"
            >
              Jak to działa
            </Link>
            <Link
              href="#pricing"
              className="text-sm hover:text-emerald-500 transition-all"
            >
              Cennik
            </Link>
            <Link
              href="#faq"
              className="text-sm hover:text-emerald-500 transition-all"
            >
              FAQ
            </Link>
          </nav>
          <div className="hidden md:flex gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Logowanie</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Rejestracja</Link>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden transition-all"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
        {/* Mobile Nav */}
        <Transition.Root show={mobileMenuOpen} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-50"
            onClose={setMobileMenuOpen}
          >
            {/* overlay */}
            <Transition.Child
              as={Fragment}
              enter="transition-opacity duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div
                className="absolute inset-0 bg-white/30 backdrop-blur-xl"
                aria-hidden="true"
              />
            </Transition.Child>

            {/* panel */}
            <div className="fixed inset-y-0 right-0 flex max-w-full shadow-2xl">
              <Transition.Child
                as={Fragment}
                enter="transform transition duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="w-64 bg-white shadow-xl flex flex-col">
                  <div className="flex items-center justify-between h-16 px-4 border-b">
                    <Link
                      href="/"
                      className="flex items-center gap-2 font-semibold"
                    >
                      <Car className="w-6 h-6 text-emerald-500" />
                      <span className="text-xl text-gray-500">CarBuddy</span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <nav className="flex-1 px-6 py-4 space-y-4">
                    {menuItems.map(({ id, label, icon }) => (
                      <Link
                        key={id}
                        href={`#${id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-start gap-4 p-4 rounded-lg border border-gray-400 transition-all mx-2 my-6 text-gray-700 mt-6"
                      >
                        {icon}
                        <span className="font-medium">{label}</span>
                      </Link>
                    ))}
                  </nav>
                  <div className="px-6 pb-6 mb-8 space-y-3">
                    <Button variant="outline" className="w-full">
                      <Link href="/login">Logowanie</Link>
                    </Button>
                    <Button className="w-full">
                      <Link href="/register">Rejestracja</Link>
                    </Button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
      </header>

      {/* Main */}
      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Tekst */}
          <div className="space-y-6 text-center lg:text-left lg:max-w-lg">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
              Twój cyfrowy asystent do zarządzania autem
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              CarBuddy pilnuje wszystkich terminów związanych z Twoim autem,
              gromadzi historię napraw i pomaga znaleźć najlepsze warsztaty.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register" className="flex items-center">
                  Rozpocznij za darmo <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Zaloguj się</Link>
              </Button>
            </div>
          </div>

          {/* Obraz */}
          <div className="w-full flex justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl">
              <Image
                src={heroImg}
                alt="Podgląd aplikacji CarBuddy"
                className="w-full h-auto rounded-xl shadow-2xl"
                priority
                sizes="(min-width: 1024px) 800px, (min-width: 768px) 600px, 100vw"
              />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2
              className="text-3xl font-bold text-center text-gray-700"
              data-aos="fade-out"
            >
              Wszystko, czego potrzebujesz
            </h2>
            <div
              className="mt-10 grid md:grid-cols-4 gap-6"
              data-aos="slide-up"
            >
              {[
                {
                  icon: <Car className="w-8 h-8 text-emerald-500" />,
                  title: "Profil auta",
                  text: "Gotowy harmonogram serwisów z VIN.",
                },
                {
                  icon: <Bell className="w-8 h-8 text-emerald-500" />,
                  title: "Przypomnienia",
                  text: "Push i e-mail o przeglądach.",
                },
                {
                  icon: <FileText className="w-8 h-8 text-emerald-500" />,
                  title: "Historia napraw",
                  text: "Zdjęcia faktur i koszty.",
                },
                {
                  icon: <CreditCard className="w-8 h-8 text-emerald-500" />,
                  title: "Analiza wydatków",
                  text: "Raporty miesięczne i roczne.",
                },
              ].map((f, i) => (
                <Card key={i} className="text-center p-6">
                  <CardHeader className="mb-4 flex justify-center">
                    <div className="bg-emerald-100 p-3 rounded-full flex items-center justify-center">
                      {f.icon}
                    </div>
                  </CardHeader>
                  <CardTitle>{f.title}</CardTitle>
                  <CardDescription>{f.text}</CardDescription>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">Jak to działa</h2>
            <div className="mt-10 flex flex-col md:flex-row justify-center gap-8">
              {[
                {
                  num: "1",
                  title: "Rejestracja",
                  desc: "Załóż konto w kilka sekund.",
                },
                {
                  num: "2",
                  title: "Dodaj auto",
                  desc: "Wprowadź markę, model i VIN.",
                },
                {
                  num: "3",
                  title: "Korzystaj",
                  desc: "Otrzymuj przypomnienia i analizy.",
                },
              ].map((s, i) => (
                <div key={i} className="flex-1">
                  <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                    {s.num}
                  </div>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="text-gray-600">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">Cennik</h2>
            <p className="mt-2 text-gray-600">
              Wybierz plan idealny dla siebie — od indywidualnego kierowcy po
              małą flotę.
            </p>

            <div className="mt-10 grid gap-8 grid-cols-1 md:grid-cols-3">
              {/* Free */}
              <Card className="p-6 border border-gray-200 hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle className="text-xl">Free</CardTitle>
                  <p className="text-3xl font-bold mt-4">0&nbsp;zł</p>
                  <CardDescription className="mt-2 text-gray-600">
                    Podstawowe wsparcie dla jednoauto.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="my-9 space-y-3 text-left">
                    <li>📍 1 pojazd</li>
                    <li>⏰ Przypomnienia o terminach</li>
                    <li>📝 Historia napraw</li>
                    <li>📊 Podstawowy dashboard wydatków</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href="/register">Zarejestruj się za darmo</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Pro */}
              <Card className="p-6 border-2 border-emerald-500 bg-emerald-50 hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle className="text-xl">Pro</CardTitle>
                  <p className="text-3xl font-bold mt-4">19,99&nbsp;zł/mies.</p>
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm mt-2">
                    Najpopularniejszy
                  </span>
                </CardHeader>
                <CardContent>
                  <ul className="my-4 space-y-3 text-left">
                    <li>🚗 Nieograniczona liczba pojazdów</li>
                    <li>🔔 Zaawansowane powiadomienia (SMS & e-mail)</li>
                    <li>📈 Szczegółowe raporty wydatków</li>
                    <li>📆 Integracja z Google/Apple Calendar</li>
                    <li>📁 Eksport danych do CSV/PDF</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    asChild
                  >
                    <Link href="/register?plan=pro">Wybierz Pro</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Enterprise */}
              <Card className="p-6 border border-gray-200 hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle className="text-xl">Enterprise</CardTitle>
                  <p className="text-3xl font-bold mt-4">Oferta indyw.</p>
                  <CardDescription className="mt-2 text-gray-600">
                    Kompleksowe zarządzanie flotą
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="my-4 space-y-3 text-left">
                    <li>👥 Multi-user: role i uprawnienia</li>
                    <li>📑 Raporty kosztów dla całej floty</li>
                    <li>🔗 API i integracje warsztatowe</li>
                    <li>📍 Geolokalizacja warsztatów i rezerwacje</li>
                    <li>🛠︎ Priorytetowe wsparcie 24/7</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href="/contact-sales">Skontaktuj się</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-3xl font-bold text-center">FAQ</h2>
            <div className="mt-6 space-y-4">
              {faqs.map((faq) => (
                <div key={faq.value} className="border-b ">
                  <button
                    className="w-full flex justify-between items-center py-4 text-left"
                    onClick={() =>
                      setOpenFaq(openFaq === faq.value ? null : faq.value)
                    }
                  >
                    <span>{faq.question}</span>
                    <ChevronRight
                      className={
                        openFaq === faq.value
                          ? "rotate-90 transition-transform cursor-pointer"
                          : "transition-transform cursor-pointer"
                      }
                    />
                  </button>
                  {openFaq === faq.value && (
                    <p className="pb-4 text-gray-600">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t pt-8 pb-4">
        {/* mobile */}
        <div className="md:hidden px-4 space-y-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Car className="w-6 h-6 text-emerald-500" />
            <span className="text-xl text-gray-500">CarBuddy</span>
          </Link>
          <p className="text-sm text-gray-600">
            Twój cyfrowy asystent do zarządzania autem.
            <br />
            Pilnujemy terminów, gromadzimy historię napraw i pomagamy znaleźć
            najlepsze warsztaty.
          </p>

          {Object.entries(footerSections).map(([title, links]) => (
            <details key={title} className="bg-gray-50 p-4 rounded-lg">
              <summary className="cursor-pointer font-medium">{title}</summary>
              <ul className="mt-2 space-y-2">
                {links.map(({ href, label }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-gray-600 hover:text-emerald-500 transition"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>

        {/* desktop */}
        <div className="hidden md:grid container mx-auto px-4 grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Car className="w-6 h-6 text-emerald-500" /> CarBuddy
            </Link>
            <p className="mt-2 text-sm text-gray-600">
              Twój cyfrowy asystent do zarządzania autem.
              <br />
              Pilnujemy terminów, gromadzimy historię napraw i pomagamy znaleźć
              najlepsze warsztaty.
            </p>
          </div>
          {Object.entries(footerSections).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold mb-2">{title}</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                {links.map(({ href, label }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="hover:text-emerald-500 transition"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          © 2025 CarBuddy. Wszelkie prawa zastrzeżone.
        </div>
      </footer>
    </div>
  );
}
