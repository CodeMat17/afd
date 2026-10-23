/** Decorative ticker of fabric names between the hero and categories. */
export function FabricTicker({ names }: { names: string[] }) {
  const items = [...names, ...names, ...names, ...names];
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y border-band-foreground/10 bg-band py-5 text-band-foreground mask-x-from-90% mask-x-to-100% sm:py-6"
    >
      <div className="flex w-max animate-marquee-x items-center [--marquee-duration:60s]">
        {items.map((name, i) => (
          <span key={i} className="flex items-center">
            <span className="px-8 font-heading text-2xl font-light whitespace-nowrap italic sm:px-12 sm:text-[2rem]">
              {name}
            </span>
            <span className="text-sm text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
