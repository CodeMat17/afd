/**
 * DEVELOPMENT / TEST DATA.
 *
 * Names, colours and pattern notes describe what is visible in the supplied
 * photographs. Prices, units, minimums, stock and availability are
 * placeholders for UI development only and must be replaced with real
 * catalogue data before launch. Do not import this file from UI components —
 * go through `lib/repository`.
 */
import type { Product, ProductUnit } from "@/lib/types";

interface Seed {
  file: string;
  folder: string;
  categoryId: string;
  name: string;
  sku: string;
  description: string;
  alt: string;
  colours: string[];
  patternNotes: string;
  price: string;
  unit: ProductUnit;
  minimumQuantity: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  createdAt: string;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function build(seed: Seed): Product {
  const slug = slugify(seed.name);
  return {
    id: `prd-${seed.sku.toLowerCase()}`,
    categoryId: seed.categoryId,
    name: seed.name,
    slug,
    sku: seed.sku,
    description: seed.description,
    price: seed.price,
    currency: "USD",
    unit: seed.unit,
    minimumQuantity: seed.minimumQuantity,
    quantityStep: "1",
    stockQuantity: "0",
    isAvailable: seed.isAvailable ?? true,
    isFeatured: seed.isFeatured ?? false,
    createdAt: seed.createdAt,
    colours: seed.colours,
    details: { patternNotes: seed.patternNotes },
    images: [
      {
        id: `img-${seed.sku.toLowerCase()}-1`,
        imageUrl: `/images/${seed.folder}/${seed.file}`,
        altText: seed.alt,
        width: 680,
        height: 920,
        sortOrder: 0,
        isPrimary: true,
      },
    ],
  };
}

const ankara = (s: Omit<Seed, "folder" | "categoryId" | "unit" | "minimumQuantity">): Seed => ({
  ...s,
  folder: "ankara",
  categoryId: "cat-ankara",
  unit: "yard",
  minimumQuantity: "6",
});

const kente = (s: Omit<Seed, "folder" | "categoryId" | "unit" | "minimumQuantity">): Seed => ({
  ...s,
  folder: "wooven-kente",
  categoryId: "cat-woven-kente",
  unit: "piece",
  minimumQuantity: "1",
});

const lace = (
  s: Omit<Seed, "folder" | "categoryId" | "unit" | "minimumQuantity"> &
    Partial<Pick<Seed, "unit" | "minimumQuantity">>,
): Seed => ({
  unit: "yard",
  minimumQuantity: "5",
  ...s,
  folder: "luxury-lace",
  categoryId: "cat-luxury-lace",
});

const isiagu = (s: Omit<Seed, "folder" | "categoryId" | "unit" | "minimumQuantity">): Seed => ({
  ...s,
  folder: "isiagu-fabric",
  categoryId: "cat-isiagu",
  unit: "yard",
  minimumQuantity: "5",
});

const sequin = (s: Omit<Seed, "folder" | "categoryId" | "unit" | "minimumQuantity">): Seed => ({
  ...s,
  folder: "ankara-sequin",
  categoryId: "cat-ankara-sequin",
  unit: "yard",
  minimumQuantity: "5",
});

const seeds: Seed[] = [
  // ── Ankara ────────────────────────────────────────────────────────────
  ankara({
    file: "1000259131-680x920.jpg",
    name: "Sunflower Vine Ankara",
    sku: "ANK-1001",
    description:
      "A saturated yellow ground carrying royal-blue blooms on curling black vines — a confident, sunlit print.",
    alt: "Yellow Ankara fabric with royal blue flowers on black curling vines, shown flat with a folded piece",
    colours: ["Yellow", "Royal blue", "Black"],
    patternNotes: "All-over floral vine repeat.",
    price: "6.50",
    isFeatured: true,
    createdAt: "2026-09-28",
  }),
  ankara({
    file: "1000132716-680x920.jpg",
    name: "Leaf & Chevron Stripe Ankara",
    sku: "ANK-1002",
    description:
      "Fine black-and-white pinstripes scattered with red, green and white leaves, framed by bold chevron borders in yellow, green and red.",
    alt: "Black and white striped Ankara with red, green and white leaves and yellow, green and red chevron borders",
    colours: ["Black", "White", "Red", "Green", "Yellow"],
    patternNotes: "Chevron border at both ends with a leaf-and-stripe field.",
    price: "6.50",
    createdAt: "2026-07-14",
  }),
  ankara({
    file: "1000132832-680x920.jpg",
    name: "Midnight Wildflower Ankara",
    sku: "ANK-1003",
    description:
      "A meadow of yellow, cobalt, red, violet and orange wildflowers scattered across a deep black ground.",
    alt: "Black Ankara fabric densely printed with multicoloured wildflowers and fronds",
    colours: ["Black", "Yellow", "Cobalt", "Red", "Violet"],
    patternNotes: "Dense botanical all-over print.",
    price: "6.80",
    isFeatured: true,
    createdAt: "2026-08-30",
  }),
  ankara({
    file: "1000132848-680x920.jpg",
    name: "Sky Comet Ankara",
    sku: "ANK-1004",
    description:
      "Rows of yellow and maroon discs trailing sky-blue tails over a speckled ground — rhythmic and kinetic.",
    alt: "Ankara fabric with rows of yellow and maroon circles trailing sky blue tails",
    colours: ["Sky blue", "Yellow", "Maroon"],
    patternNotes: "Diagonal repeat of comet-like motifs.",
    price: "6.50",
    createdAt: "2026-06-02",
  }),
  ankara({
    file: "1000132850-680x920.jpg",
    name: "Monochrome Starburst Ankara",
    sku: "ANK-1005",
    description:
      "White starbursts radiating from black centres over a dotted black ground. Graphic and endlessly versatile.",
    alt: "Black Ankara fabric with white starburst motifs and fine white dots",
    colours: ["Black", "White"],
    patternNotes: "Half-drop starburst repeat.",
    price: "6.20",
    isFeatured: true,
    createdAt: "2026-09-10",
  }),
  ankara({
    file: "1000132851-680x920.jpg",
    name: "Cobalt Bloom Ankara",
    sku: "ANK-1006",
    description:
      "Large lilac and sky-blue rosettes give way to rows of cobalt and white blooms on a deep brown ground.",
    alt: "Ankara fabric with large lilac and blue flowers over rows of cobalt and white blooms on dark brown",
    colours: ["Cobalt", "Lilac", "Sky blue", "Brown"],
    patternNotes: "Border of large rosettes over a small-bloom field.",
    price: "6.50",
    createdAt: "2026-05-21",
  }),
  ankara({
    file: "1000132854-680x920.jpg",
    name: "Pink & Lime Panel Ankara",
    sku: "ANK-1007",
    description:
      "Panels of pink and lime fan flowers, starburst blossoms and lip-shaped motifs stacked across a white ground.",
    alt: "White Ankara fabric with panels of pink and lime fan flowers and starburst blossoms",
    colours: ["Pink", "Lime", "White", "Black"],
    patternNotes: "Panelled layout with distinct horizontal bands.",
    price: "6.80",
    createdAt: "2026-04-11",
  }),
  ankara({
    file: "1000219273-680x920.jpg",
    name: "Amber Botanical Ankara",
    sku: "ANK-1008",
    description:
      "Peach-toned leaves and blossoms against amber honeycomb shapes on a charcoal ground, with a dotted halo effect.",
    alt: "Charcoal Ankara fabric with peach leaves and amber honeycomb blossoms, folded pieces stacked on top",
    colours: ["Charcoal", "Amber", "Peach"],
    patternNotes: "Large-scale botanical repeat.",
    price: "6.80",
    isFeatured: true,
    createdAt: "2026-09-02",
  }),
  ankara({
    file: "1000259130-680x920.jpg",
    name: "Coral & Mint Plume Ankara",
    sku: "ANK-1009",
    description:
      "Towering coral and mint plumes filled with circles rise from a navy ground scattered with tiny flowers.",
    alt: "Navy Ankara fabric with large coral and mint feather-like plumes, a folded piece on top",
    colours: ["Navy", "Coral", "Mint"],
    patternNotes: "Plume border with a small floral field above.",
    price: "6.50",
    createdAt: "2026-03-18",
  }),
  ankara({
    file: "1000848729-680x920.jpg",
    name: "Ember Spiral Ankara",
    sku: "ANK-1010",
    description:
      "Crackle-textured spirals in cream, orange and berry over black, recalling hand-resist dyeing.",
    alt: "Black Ankara fabric with crackle-textured cream and orange spirals",
    colours: ["Black", "Cream", "Orange", "Berry"],
    patternNotes: "Interlocking spiral repeat with a crackle effect.",
    price: "6.20",
    createdAt: "2026-08-08",
  }),
  ankara({
    file: "1000848730-680x920.jpg",
    name: "Golden Arc Ankara",
    sku: "ANK-1011",
    description:
      "Concentric amber and yellow arcs meet a field of leaf-shaped ovals on black, with a crackled finish.",
    alt: "Black Ankara fabric with amber and yellow arcs and oval leaf shapes, folded piece on top",
    colours: ["Black", "Amber", "Yellow"],
    patternNotes: "Two-zone layout: arcs above, ovals below.",
    price: "6.20",
    createdAt: "2026-07-27",
  }),
  ankara({
    file: "1000848746-680x920.jpg",
    name: "Fern Wreath Ankara",
    sku: "ANK-1012",
    description:
      "Fern-leaf wreaths and sweeping bands on black. Photographed in two colourways: mustard and red.",
    alt: "Two folded Ankara fabrics with fern-leaf patterns on black, one mustard and one red",
    colours: ["Mustard", "Red", "Black"],
    patternNotes: "Shown in two colourways; confirm your colour when ordering.",
    price: "6.20",
    createdAt: "2026-06-25",
  }),
  ankara({
    file: "1000848750-680x920.jpg",
    name: "Marbled Heart Ankara",
    sku: "ANK-1013",
    description:
      "Liquid, marbled heart shapes swirl in navy, cream and rust — an organic, painterly texture.",
    alt: "Ankara fabric with marbled heart-shaped swirls in navy, cream and rust",
    colours: ["Navy", "Cream", "Rust"],
    patternNotes: "Marbled all-over repeat.",
    price: "6.20",
    isAvailable: false,
    createdAt: "2026-02-09",
  }),
  ankara({
    file: "1000848751-680x920.jpg",
    name: "Maroon Glyph Ankara",
    sku: "ANK-1014",
    description:
      "White zigzags, bars and rings marching in rows across a deep maroon ground. Crisp and architectural.",
    alt: "Maroon Ankara fabric with rows of white zigzag, bar and ring motifs",
    colours: ["Maroon", "White"],
    patternNotes: "Horizontal banded glyph repeat.",
    price: "6.20",
    createdAt: "2026-05-04",
  }),

  // ── Woven Kente ──────────────────────────────────────────────────────
  kente({
    file: "1000294627-680x920.jpg",
    name: "Crimson & Teal Woven Kente",
    sku: "KEN-2001",
    description:
      "Crimson cloth with a broad band of teal, blush and cocoa zigzags, shown with coordinating patterned and plain teal pieces.",
    alt: "Red woven Kente with teal, blush and brown zigzag bands, folded patterned and teal pieces on top",
    colours: ["Crimson", "Teal", "Blush", "Cocoa"],
    patternNotes: "Shown with two folded coordinating pieces.",
    price: "145.00",
    isFeatured: true,
    createdAt: "2026-09-20",
  }),
  kente({
    file: "1000294298-680x920.jpg",
    name: "Magenta & Silver Woven Kente",
    sku: "KEN-2002",
    description:
      "Magenta strips woven with silver-white geometric blocks and a violet shimmer.",
    alt: "Magenta woven Kente with silver-white geometric blocks, two folded pieces on top",
    colours: ["Magenta", "Silver", "Violet"],
    patternNotes: "Shown with two folded coordinating pieces.",
    price: "140.00",
    createdAt: "2026-08-15",
  }),
  kente({
    file: "1000294374-680x920.jpg",
    name: "Saffron & Violet Woven Kente",
    sku: "KEN-2003",
    description:
      "Burnt-saffron strips with gold metallic threads, finished with a violet band and matching folded pieces.",
    alt: "Saffron woven Kente with gold metallic thread and a violet band, folded pieces on top",
    colours: ["Saffron", "Gold", "Violet"],
    patternNotes: "Shown with two folded coordinating pieces.",
    price: "140.00",
    createdAt: "2026-07-03",
  }),
  kente({
    file: "1000294384-680x920.jpg",
    name: "Blush & Sky Woven Kente",
    sku: "KEN-2004",
    description:
      "A patchwork of blush, sky-blue, gold and cocoa key motifs in a soft, contemporary palette.",
    alt: "Pink woven Kente with sky blue, gold and brown key motifs, folded patterned and blue pieces on top",
    colours: ["Blush", "Sky blue", "Gold", "Cocoa"],
    patternNotes: "Shown with patterned and plain sky-blue pieces.",
    price: "150.00",
    isFeatured: true,
    createdAt: "2026-09-12",
  }),
  kente({
    file: "1000294386-680x920.jpg",
    name: "Chartreuse & Coral Woven Kente",
    sku: "KEN-2005",
    description:
      "Chartreuse and olive-gold strips with coral and charcoal diamond columns.",
    alt: "Chartreuse woven Kente with coral and charcoal diamond columns, folded pieces on top",
    colours: ["Chartreuse", "Olive gold", "Coral", "Charcoal"],
    patternNotes: "Shown with patterned and plain folded pieces.",
    price: "145.00",
    createdAt: "2026-06-19",
  }),
  kente({
    file: "1000294589-680x920.jpg",
    name: "Cocoa & Gold Woven Kente",
    sku: "KEN-2006",
    description:
      "Cocoa-brown ground flecked with multicolour threads and stepped gold-and-white motifs.",
    alt: "Brown woven Kente with stepped gold and white motifs and multicolour flecks, folded piece on top",
    colours: ["Cocoa", "Gold", "White"],
    patternNotes: "Shown with a folded coordinating piece.",
    price: "135.00",
    createdAt: "2026-05-30",
  }),
  kente({
    file: "1000294617-680x920.jpg",
    name: "Forest Green Woven Kente",
    sku: "KEN-2007",
    description:
      "Tonal forest and lime greens woven in a diamond lattice with an iridescent fleck.",
    alt: "Forest green woven Kente with lime diamond lattice, two folded pieces on top",
    colours: ["Forest green", "Lime"],
    patternNotes: "Shown with two folded coordinating pieces.",
    price: "140.00",
    isAvailable: false,
    createdAt: "2026-04-22",
  }),
  kente({
    file: "1000294771-680x920.jpg",
    name: "Amber & Black Woven Kente",
    sku: "KEN-2008",
    description:
      "High-contrast amber and black chevrons with a subtle iridescent thread throughout.",
    alt: "Amber and black chevron woven Kente with iridescent threads, folded pieces on top",
    colours: ["Amber", "Black"],
    patternNotes: "Shown with two folded coordinating pieces.",
    price: "145.00",
    createdAt: "2026-08-24",
  }),
  kente({
    file: "1000506363-680x920.jpg",
    name: "Tangerine & Azure Ombré Kente",
    sku: "KEN-2009",
    description:
      "Indigo melts into tangerine and then azure — a sunset ombré woven with sparkling threads.",
    alt: "Woven Kente fading from indigo to tangerine to azure blue, folded orange and indigo pieces on top",
    colours: ["Indigo", "Tangerine", "Azure"],
    patternNotes: "Ombré colour transition along the cloth.",
    price: "155.00",
    isFeatured: true,
    createdAt: "2026-10-01",
  }),
  kente({
    file: "1000506391-680x920.jpg",
    name: "Saffron, Pink & Violet Ombré Kente",
    sku: "KEN-2010",
    description:
      "Hot pink, saffron and deep violet blocks with a shimmering gold thread.",
    alt: "Woven Kente in blocks of hot pink, saffron and violet, folded saffron and pink pieces on top",
    colours: ["Pink", "Saffron", "Violet"],
    patternNotes: "Colour-blocked ombré.",
    price: "155.00",
    createdAt: "2026-09-25",
  }),

  // ── Luxury Lace ──────────────────────────────────────────────────────
  lace({
    file: "1000258289-680x920.jpg",
    name: "Ivory & Gold Stone Lace",
    sku: "LAC-3001",
    description:
      "Ivory ground with a deep gold stonework border of scrolls, medallions and teardrop motifs.",
    alt: "Ivory lace with an ornate gold stonework border of scrolls and medallions",
    colours: ["Ivory", "Gold"],
    patternNotes: "Heavy border with scattered stone motifs above.",
    price: "38.00",
    isFeatured: true,
    createdAt: "2026-09-18",
  }),
  lace({
    file: "1000258292-680x920.jpg",
    name: "Champagne Baroque Stone Lace",
    sku: "LAC-3002",
    description:
      "Baroque flame and scroll motifs in gold-tone stones over a pale champagne ground.",
    alt: "Pale champagne lace with gold baroque stonework border",
    colours: ["Champagne", "Gold"],
    patternNotes: "Heavy border with scattered stone motifs above.",
    price: "38.00",
    createdAt: "2026-07-21",
  }),
  lace({
    file: "1000258299-680x920.jpg",
    name: "Onyx & Silver Beaded Tulle",
    sku: "LAC-3003",
    description:
      "Flowing waves of black and clear crystal beading on tulle, shown in black and on a pale ground.",
    alt: "Beaded tulle with flowing waves of black and silver crystals, shown in black and grey",
    colours: ["Black", "Silver", "Grey"],
    patternNotes: "Wave-like beading; two ground shades shown.",
    price: "45.00",
    createdAt: "2026-06-08",
  }),
  lace({
    file: "1000258429-680x920.jpg",
    name: "Champagne Jewel Beaded Tulle",
    sku: "LAC-3004",
    description:
      "Swirling clear crystals, gold cord and amber jewels across champagne tulle.",
    alt: "Champagne tulle embellished with clear crystals, gold cord swirls and amber jewels",
    colours: ["Champagne", "Gold", "Amber"],
    patternNotes: "All-over jewelled scroll pattern.",
    price: "45.00",
    createdAt: "2026-08-12",
  }),
  lace({
    file: "1000379802-1-680x920.jpg",
    name: "Gold Diamond Border Lace",
    sku: "LAC-3005",
    description:
      "Gold-tone stones form diamonds, sunbursts and paisleys along an ivory ground, with a gold tulle variant alongside.",
    alt: "Ivory lace with a gold stonework border of diamonds, sunbursts and paisleys beside gold tulle",
    colours: ["Ivory", "Gold"],
    patternNotes: "Deep geometric border.",
    price: "40.00",
    createdAt: "2026-05-15",
  }),
  lace({
    file: "1000597840-680x920.jpg",
    name: "Midnight Crystal Beaded Gown",
    sku: "LAC-3006",
    description:
      "A sheer black gown on a mannequin, densely beaded with silver vines and finished with a flowing tulle cape.",
    alt: "Black sheer gown on a mannequin, densely embellished with silver beaded vines and a tulle cape",
    colours: ["Black", "Silver"],
    patternNotes: "Displayed as a finished gown.",
    price: "420.00",
    unit: "piece",
    minimumQuantity: "1",
    isFeatured: true,
    createdAt: "2026-10-05",
  }),
  lace({
    file: "1000597868-680x920.jpg",
    name: "Ivory Crystal Beaded Gown",
    sku: "LAC-3007",
    description:
      "A sheer ivory gown with crystal beading sculpted to the bodice, cascading fringe and a full tulle cape.",
    alt: "Ivory sheer gown on a mannequin with crystal beading, fringe and a tulle cape",
    colours: ["Ivory", "Silver"],
    patternNotes: "Displayed as a finished gown.",
    price: "420.00",
    unit: "piece",
    minimumQuantity: "1",
    createdAt: "2026-10-03",
  }),

  // ── Isiagu Fabric ────────────────────────────────────────────────────
  isiagu({
    file: "1000536839-680x920.jpg",
    name: "Royal Lion Isiagu — Plum",
    sku: "ISI-4001",
    description:
      "Plum plush cloth with gold-tone crowned lion heads framed by curved tusks.",
    alt: "Plum Isiagu fabric with gold crowned lion heads and curved tusks",
    colours: ["Plum", "Gold"],
    patternNotes: "Lion head, tusk and crown repeat.",
    price: "14.00",
    isFeatured: true,
    createdAt: "2026-09-08",
  }),
  isiagu({
    file: "1000536623-1-680x920.jpg",
    name: "Lion Crest Isiagu — Emerald",
    sku: "ISI-4002",
    description:
      "Deep emerald plush cloth with gold-tone lion heads and tusk motifs in orderly rows.",
    alt: "Emerald green Isiagu fabric with gold lion heads and tusks",
    colours: ["Emerald", "Gold"],
    patternNotes: "Lion head and tusk repeat.",
    price: "14.00",
    createdAt: "2026-08-01",
  }),
  isiagu({
    file: "1000536838-680x920.jpg",
    name: "Lion Crest Isiagu — Crimson",
    sku: "ISI-4003",
    description:
      "Crimson plush cloth with gold-tone lion heads and tusks — a ceremonial classic.",
    alt: "Crimson Isiagu fabric with gold lion heads and tusks",
    colours: ["Crimson", "Gold"],
    patternNotes: "Lion head and tusk repeat.",
    price: "14.00",
    createdAt: "2026-07-09",
  }),
  isiagu({
    file: "1000536837-680x920.jpg",
    name: "Crown & Tusk Isiagu — Black",
    sku: "ISI-4004",
    description:
      "Black ground with crossed white-and-gold tusks arching over crowns.",
    alt: "Black Isiagu fabric with crossed white and gold tusks over crowns",
    colours: ["Black", "White", "Gold"],
    patternNotes: "Crown and crossed-tusk repeat.",
    price: "13.50",
    createdAt: "2026-06-14",
  }),

  // ── Ankara Sequin ────────────────────────────────────────────────────
  sequin({
    file: "1000527318-680x920.jpg",
    name: "Golden Tree Sequin Ankara",
    sku: "SEQ-5001",
    description:
      "A yellow and turquoise tree-of-life print overlaid with trailing iridescent sequins.",
    alt: "Yellow and turquoise Ankara print with a tree motif overlaid with iridescent sequins",
    colours: ["Yellow", "Turquoise", "Black"],
    patternNotes: "Sequins follow the printed motif.",
    price: "18.00",
    isFeatured: true,
    createdAt: "2026-09-15",
  }),
  sequin({
    file: "1000527274-680x920.jpg",
    name: "Copper Peacock Sequin Ankara",
    sku: "SEQ-5002",
    description:
      "Copper ground with sky-blue eye motifs and black linework, embellished with silver and iridescent sequins.",
    alt: "Copper Ankara print with blue eye motifs overlaid with silver and iridescent sequins",
    colours: ["Copper", "Sky blue", "Silver"],
    patternNotes: "Sequin scrolls across the print.",
    price: "18.00",
    createdAt: "2026-08-19",
  }),
];

export const mockProducts: Product[] = seeds.map(build);
