"use client";

import ChangePassword from "@/components/component/ChangePassword";
import EnablePush from "@/components/component/EnablePush";
import SubscriptionCard from "@/components/component/SubscriptionCard";
import Verification from "@/components/component/Verification";

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
      <h3 className="flex justify-center font-semibold underline shadow-xl underline-offset-2 text-red-600 border py-3 rounded-xl bg-red-100 hover:text-red-700 hover:bg-red-300 hover:underline-offset-8 hover:text-xl transition-all">
        Opcję poniżej będą dostępne później!
      </h3>
      <section className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-medium">Weryfikacja konta</h2>
        <p className="text-sm text-gray-600">
          Kliknij, aby otrzymać link weryfikacyjny na e-mail.
        </p>
        <Verification />
      </section>

      <section className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-medium">Zmiana hasła</h2>
        <ChangePassword />
      </section>

      <section className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-medium">Subskrypcja</h2>
        <SubscriptionCard />
      </section>
    </div>
  );
}
