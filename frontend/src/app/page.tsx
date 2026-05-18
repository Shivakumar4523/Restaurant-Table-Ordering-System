import Link from "next/link";
import { CalendarCheck, MapPin, ShieldCheck, Sparkles, Truck, Utensils } from "lucide-react";
import { FeaturedCarousel } from "@/components/food/FeaturedCarousel";
import { Hero } from "@/components/ui/Hero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { reviews } from "@/utils/sample-data";

const promises = [
  { icon: Truck, title: "Live order tracking", body: "Track placed, confirmed, preparing, out-for-delivery, and delivered states." },
  { icon: ShieldCheck, title: "Secure payments", body: "Razorpay, UPI, and cash on delivery flows are wired through the API." },
  { icon: CalendarCheck, title: "Table reservations", body: "Guests can reserve a table for dates, times, occasions, and party sizes." }
];

export default function HomePage() {
  return (
    <main>
      <Hero />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="About the restaurant"
              title="A modern ordering experience for a premium dining room."
              body="Royal Spice blends a red-and-gold luxury restaurant identity with a fast mobile food-ordering flow. The first screen is built for ordering, not browsing through a brochure."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              {promises.map(({ icon: Icon, title, body }) => (
                <div key={title} className="glass rounded-[8px] p-4 shadow-sm">
                  <Icon className="mb-3 text-royal-600 dark:text-gold-300" size={23} />
                  <h3 className="font-black text-ink dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-[8px] p-4 shadow-gold">
            <div className="aspect-[4/3] overflow-hidden rounded-[8px] bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1100&q=82')] bg-cover bg-center" />
            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-royal-600 dark:text-gold-300">Open today</p>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">12:00 PM to 11:30 PM</p>
              </div>
              <Link
                href="/reserve"
                className="tap-target inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-black text-white dark:bg-gold-300 dark:text-ink"
              >
                Reserve
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured dishes"
          title="Signature plates guests reorder."
          body="A swipe-friendly carousel on mobile and a comfortable row on larger screens."
        />
        <FeaturedCarousel />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.name} className="glass rounded-[8px] p-5 shadow-sm">
              <div className="mb-3 flex gap-1 text-gold-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Sparkles key={index} size={15} />
                ))}
              </div>
              <p className="text-sm leading-6 text-stone-700 dark:text-stone-200">{review.body}</p>
              <p className="mt-4 font-black text-ink dark:text-white">{review.name}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[8px] border border-black/10 bg-white shadow-gold dark:border-white/10 dark:bg-white/10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="p-6">
            <MapPin className="text-royal-600 dark:text-gold-300" />
            <h2 className="mt-4 text-2xl font-black text-ink dark:text-white">Find Royal Spice</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
              Use the Google Maps block as your restaurant location. Update latitude, longitude, or the embed query in
              environment settings for production.
            </p>
            <Link
              href="/menu"
              className="tap-target mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-royal-600 px-5 text-sm font-black text-white"
            >
              <Utensils size={17} />
              Browse menu
            </Link>
          </div>
          <iframe
            title="Royal Spice location"
            className="h-80 w-full lg:h-full"
            loading="lazy"
            src="https://www.google.com/maps?q=Connaught%20Place%20New%20Delhi&output=embed"
          />
        </div>
      </section>
    </main>
  );
}
