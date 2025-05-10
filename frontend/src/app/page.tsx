// frontend/src/app/page.tsx
"use client";
import React, { useState } from "react";
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

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [openFaq, setOpenFaq] = useState<string | null>(null);

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
      <header className="sticky top-0 bg-gray-100 shadow-xl z-50 transition-all">
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
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-white z-50">
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Car className="w-6 h-6 text-emerald-500" />
                CarBuddy
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="px-4 py-6 space-y-4">
              {["features", "how-it-works", "pricing", "faq"].map((id) => (
                <Link
                  key={id}
                  href={`#${id}`}
                  className="block text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {id === "features"
                    ? "Funkcje"
                    : id === "how-it-works"
                    ? "Jak to działa"
                    : id === "pricing"
                    ? "Cennik"
                    : "FAQ"}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-2">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login">Logowanie</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/register">Rejestracja</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto grid lg:grid-cols-2 gap-8 items-center py-40 px-8 pb-32 text-gray-700">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">
              Twój cyfrowy asystent do zarządzania autem
            </h1>
            <p className="text-lg text-gray-600">
              CarBuddy pilnuje wszystkich terminów związanych z Twoim autem,
              gromadzi historię napraw i pomaga znaleźć najlepsze warsztaty.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="/register">
                  Rozpocznij za darmo <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Zaloguj się</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-80 w-full">
            <Image
              src={heroImg}
              alt="Podgląd aplikacji"
              className="object-cover rounded-lg shadow-lg"
              height={650}
              width={650}
            />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-700">
              Wszystko, czego potrzebujesz
            </h2>
            <div className="mt-10 grid md:grid-cols-4 gap-6">
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
            <div className="mt-10 grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <p className="text-2xl font-bold mt-2">0 zł</p>
                  <CardDescription>Podstawowe funkcje</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="mt-4 space-y-2 text-left">
                    <li>1 pojazd</li>
                    <li>Przypomnienia</li>
                    <li>Historia napraw</li>
                    <li>ELo</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href="/register">Rozpocznij za darmo</Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="p-6 border-2 border-emerald-500 bg-emerald-50">
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <p className="text-2xl font-bold mt-2">19,99 zł/mies</p>
                  <div className="mt-2 inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                    Polecany
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="mt-4 space-y-2 text-left">
                    <li>Nieograniczona liczba pojazdów</li>
                    <li>Zaawansowane przypomnienia</li>
                    <li>Raporty wydatków</li>
                    <li>Integracja z kalendarzem</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    asChild
                  >
                    <Link href="/register?plan=pro">Wybierz plan Pro</Link>
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
                <div key={faq.value} className="border-b">
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
                          ? "rotate-90 transition-transform"
                          : "transition-transform"
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
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Car className="w-6 h-6 text-emerald-500" /> CarBuddy
            </Link>
            <p className="mt-2 text-sm text-gray-600">
              Twój cyfrowy asystent do zarządzania autem. <br></br>Pilnujemy
              terminów, gromadzimy historię napraw i pomagamy znaleźć najlepsze
              warsztaty.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Produkt</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>
                <Link href="#features">Funkcje</Link>
              </li>
              <li>
                <Link href="#pricing">Cennik</Link>
              </li>
              <li>
                <Link href="#faq">FAQ</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Firma</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>
                <Link href="#">O nas</Link>
              </li>
              <li>
                <Link href="#">Blog</Link>
              </li>
              <li>
                <Link href="#">Kontakt</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Legalne</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>
                <Link href="#">Polityka prywatności</Link>
              </li>
              <li>
                <Link href="#">Warunki</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-gray-500">
          © 2025 CarBuddy. Wszelkie prawa zastrzeżone.
        </div>
      </footer>
    </div>
  );
}
