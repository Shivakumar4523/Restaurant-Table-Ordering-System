"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Sparkles, Timer } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative isolate min-h-[72svh] overflow-hidden">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(22, 17, 15, 0.86) 0%, rgba(22, 17, 15, 0.52) 48%, rgba(22, 17, 15, 0.16) 100%), url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1800&q=84')"
        }}
      />
      <div className="mx-auto flex min-h-[72svh] max-w-7xl flex-col justify-center px-4 py-14 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-3xl text-white"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-300/50 bg-white/10 px-3 py-1.5 text-sm font-bold backdrop-blur">
            <Sparkles size={16} className="text-gold-300" />
            Luxury dining, delivered fast
          </span>
          <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[1.02] sm:text-6xl lg:text-7xl">
            Royal Spice
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/86 sm:text-lg">
            Premium Indian flavors, chef-built fast food, craft drinks, and decadent desserts with Razorpay, UPI, COD,
            WhatsApp ordering, reservations, and live tracking.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/menu"
              className="tap-target inline-flex items-center justify-center gap-2 rounded-full bg-royal-600 px-6 text-sm font-black text-white shadow-glow transition hover:bg-royal-700"
            >
              Order now
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/reserve"
              className="tap-target inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/12 px-6 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
            >
              Reserve a table
            </Link>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { icon: Timer, label: "25 min avg delivery" },
              { icon: MapPin, label: "Google Maps ready" },
              { icon: Sparkles, label: "4.8 guest rating" }
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-[8px] border border-white/18 bg-white/10 p-3 text-sm font-bold backdrop-blur">
                <Icon size={18} className="mb-2 text-gold-300" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
