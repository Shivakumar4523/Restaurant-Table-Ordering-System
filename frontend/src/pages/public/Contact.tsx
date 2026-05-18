import { MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function Contact() {
  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
      <section>
        <p className="text-xs font-black uppercase text-gold-700">Contact</p>
        <h1 className="mt-3 text-4xl font-black text-ink">Reserve, enquire, or visit Royal Spice.</h1>
        <div className="mt-8 space-y-4 text-sm font-bold text-stone-700">
          <p className="flex items-center gap-3"><Phone size={18} /> +91 90000 00000</p>
          <p className="flex items-center gap-3"><MapPin size={18} /> Garden Road, Hyderabad</p>
        </div>
      </section>
      <form className="glass rounded-[8px] p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input placeholder="Name" />
          <Input placeholder="Phone" />
          <Input className="sm:col-span-2" placeholder="Email" />
          <textarea className="min-h-32 rounded-[8px] border border-black/10 bg-white p-3 text-sm font-semibold outline-none focus:border-forest-600 sm:col-span-2" placeholder="Message" />
        </div>
        <Button className="mt-5">
          <Send size={16} />
          Send enquiry
        </Button>
      </form>
    </main>
  );
}
