"use client";

import EnablePush from "@/components/component/EnablePush";

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Ustawienia</h1>

      <section className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-medium">Powiadomienia Web Push</h2>
        <p className="text-sm text-gray-600">
          Włącz, aby otrzymywać przypomnienia o przeglądach i poziomie płynów.
        </p>
        <EnablePush />
      </section>
    </div>
  );
}
