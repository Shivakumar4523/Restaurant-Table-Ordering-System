"use client";

import { FormEvent, useState } from "react";
import { CalendarCheck, MapPin } from "lucide-react";
import { createReservation } from "@/services/api";

export default function ReservePage() {
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries()) as Record<string, string>;

    try {
      await createReservation({ ...payload, guests: Number(payload.guests) });
      setMessage("Reservation request sent. The restaurant will confirm shortly.");
      formElement.reset();
    } catch (error) {
      setMessage(error instanceof Error ? `${error.message}. Demo request captured.` : "Demo request captured.");
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-black uppercase text-royal-600 dark:text-gold-300">Table reservation</p>
        <h1 className="mt-2 text-3xl font-black text-ink dark:text-white">Book a table without a phone call.</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <form onSubmit={onSubmit} className="glass rounded-[8px] p-5 shadow-gold">
          <div className="mb-4 flex items-center gap-2">
            <CalendarCheck className="text-royal-600 dark:text-gold-300" />
            <h2 className="text-xl font-black text-ink dark:text-white">Reservation details</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["name", "Name", "text"],
              ["phone", "Phone", "tel"],
              ["email", "Email", "email"],
              ["date", "Date", "date"],
              ["time", "Time", "time"],
              ["guests", "Guests", "number"],
              ["occasion", "Occasion", "text"]
            ].map(([name, label, type]) => (
              <label key={name}>
                <span className="text-xs font-black text-stone-600 dark:text-stone-300">{label}</span>
                <input
                  name={name}
                  type={type}
                  required={["name", "phone", "date", "time", "guests"].includes(name)}
                  min={name === "guests" ? 1 : undefined}
                  max={name === "guests" ? 20 : undefined}
                  className="mt-1 h-12 w-full rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold outline-none focus:border-royal-500 dark:border-white/10 dark:bg-stone-950 dark:text-white"
                />
              </label>
            ))}
            <label className="sm:col-span-2">
              <span className="text-xs font-black text-stone-600 dark:text-stone-300">Notes</span>
              <textarea name="notes" rows={4} className="mt-1 w-full rounded-[8px] border border-black/10 bg-white p-3 text-sm font-semibold outline-none focus:border-royal-500 dark:border-white/10 dark:bg-stone-950 dark:text-white" />
            </label>
          </div>
          <button className="tap-target mt-5 inline-flex w-full items-center justify-center rounded-full bg-royal-600 px-5 text-sm font-black text-white shadow-glow">
            Request table
          </button>
          {message ? <p className="mt-4 rounded-[8px] bg-gold-100 p-3 text-sm font-bold text-ink">{message}</p> : null}
        </form>

        <aside className="overflow-hidden rounded-[8px] border border-black/10 bg-white shadow-gold dark:border-white/10 dark:bg-white/10">
          <div className="p-5">
            <MapPin className="text-royal-600 dark:text-gold-300" />
            <h2 className="mt-3 text-xl font-black text-ink dark:text-white">Royal Spice location</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
              Replace this map query with your restaurant address before deployment.
            </p>
          </div>
          <iframe
            title="Royal Spice map"
            className="h-80 w-full"
            loading="lazy"
            src="https://www.google.com/maps?q=Connaught%20Place%20New%20Delhi&output=embed"
          />
        </aside>
      </div>
    </main>
  );
}
