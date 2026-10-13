/** Decorative ticker of fabric names between the hero and categories. */
export function FabricTicker({ names }: { names: string[] }) {
  const items = [...names, ...names, ...names, ...names];
  return (
    <div aria-hidden="true" className="overflow-hidden border-b bg-primary py-4 text-primary-foreground sm:py-5">
      <div className="flex w-max animate-marquee-x items-center [--marquee-duration:45s]">
        {items.map((name, i) => (
          <span key={i} className="flex items-center">
            <span className="px-6 font-heading text-2xl whitespace-nowrap italic sm:px-8 sm:text-3xl">
              {name}
            </span>
            <span className="size-2 rotate-45 bg-current opacity-60" />
          </span>
        ))}
      </div>
    </div>
  );
}
