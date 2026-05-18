import Link from "next/link";
import { FaInstagram, FaMapMarkerAlt, FaStar, FaWhatsapp } from "react-icons/fa";

export function Footer() {
  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "919999999999";

  return (
    <footer className="border-t border-black/10 bg-white/72 px-4 py-8 backdrop-blur-xl dark:border-white/10 dark:bg-ink/72 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-xl font-black text-ink dark:text-white">Royal Spice</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600 dark:text-stone-300">
            Premium red-and-gold restaurant ordering built for Android Chrome, iPhone Safari, tablets, and desktop.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/menu"
            className="tap-target inline-flex items-center gap-2 rounded-full bg-royal-600 px-4 text-sm font-black text-white"
          >
            <FaStar />
            Menu
          </Link>
          <a
            href={`https://wa.me/${whatsappPhone}`}
            className="tap-target inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-black text-ink dark:border-white/10 dark:bg-white/10 dark:text-white"
          >
            <FaWhatsapp />
            WhatsApp
          </a>
          <a
            href="https://www.instagram.com"
            className="tap-target inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-black text-ink dark:border-white/10 dark:bg-white/10 dark:text-white"
          >
            <FaInstagram />
            Instagram
          </a>
          <Link
            href="/reserve"
            className="tap-target inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-black text-ink dark:border-white/10 dark:bg-white/10 dark:text-white"
          >
            <FaMapMarkerAlt />
            Reserve
          </Link>
        </div>
      </div>
    </footer>
  );
}
