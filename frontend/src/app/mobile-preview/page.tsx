import { ShoppingBag, Utensils } from "lucide-react";

const screens = [
  { title: "Home", subtitle: "Hero, reviews, maps", accent: "bg-royal-600" },
  { title: "Menu", subtitle: "Filters and food cards", accent: "bg-gold-300" },
  { title: "Checkout", subtitle: "Sticky mobile action", accent: "bg-ink" }
];

export default function MobilePreviewPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-black uppercase text-royal-600 dark:text-gold-300">Mobile screenshots preview</p>
        <h1 className="mt-2 text-3xl font-black text-ink dark:text-white">Responsive Android and iPhone layout frames.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300">
          These preview frames are generated in-app so designers and clients can inspect the intended mobile structure
          before capturing real screenshots from a deployed build.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {screens.map((screen) => (
          <div key={screen.title} className="mx-auto w-full max-w-[320px] rounded-[36px] border-[10px] border-ink bg-ink p-2 shadow-gold dark:border-black">
            <div className="overflow-hidden rounded-[26px] bg-cream text-ink">
              <div className="h-8 bg-ink" />
              <div className="relative h-[560px] overflow-hidden bg-white">
                <div className={`h-44 ${screen.accent} p-5 text-white`}>
                  <p className="text-xs font-black uppercase">Royal Spice</p>
                  <h2 className="mt-3 text-3xl font-black">{screen.title}</h2>
                  <p className="mt-2 text-sm text-white/82">{screen.subtitle}</p>
                </div>
                <div className="-mt-6 space-y-3 px-4">
                  <div className="rounded-[8px] bg-white p-4 shadow-lg">
                    <div className="h-4 w-1/2 rounded-full bg-stone-900" />
                    <div className="mt-3 h-3 w-4/5 rounded-full bg-stone-200" />
                    <div className="mt-2 h-3 w-3/5 rounded-full bg-stone-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2].map((item) => (
                      <div key={item} className="rounded-[8px] bg-white p-3 shadow">
                        <div className="h-20 rounded-[8px] bg-stone-200" />
                        <div className="mt-3 h-3 rounded-full bg-stone-900" />
                        <div className="mt-2 h-3 w-2/3 rounded-full bg-stone-200" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute inset-x-3 bottom-3 rounded-full bg-ink px-4 py-3 text-white">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="inline-flex items-center gap-2"><Utensils size={15} /> Menu</span>
                    <span className="inline-flex items-center gap-2"><ShoppingBag size={15} /> Cart</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
