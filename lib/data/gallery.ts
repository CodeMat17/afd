/**
 * DEVELOPMENT / TEST DATA — editorial gallery built from the supplied
 * product photography. Replace with dedicated editorial shots when available.
 */
import type { GalleryImage } from "@/lib/types";

const entry = (
  id: string,
  path: string,
  caption: string,
  altText: string,
  productSlug?: string,
): GalleryImage => ({
  id,
  imageUrl: path,
  caption,
  altText,
  width: 680,
  height: 920,
  productSlug,
});

export const mockGallery: GalleryImage[] = [
  entry(
    "g-01",
    "/images/luxury-lace/1000597840-680x920.jpg",
    "Midnight crystal, in the showroom",
    "Black sheer beaded gown on a mannequin in front of shelves stacked with African fabrics",
    "midnight-crystal-beaded-gown",
  ),
  entry(
    "g-02",
    "/images/wooven-kente/1000294627-680x920.jpg",
    "Crimson & teal, strip by strip",
    "Red woven Kente with teal and blush zigzag bands",
    "crimson-and-teal-woven-kente",
  ),
  entry(
    "g-03",
    "/images/ankara/1000132850-680x920.jpg",
    "Starburst in monochrome",
    "Black and white starburst Ankara print",
    "monochrome-starburst-ankara",
  ),
  entry(
    "g-04",
    "/images/isiagu-fabric/1000536839-680x920.jpg",
    "The crowned lion",
    "Plum Isiagu fabric with gold crowned lion heads",
    "royal-lion-isiagu-plum",
  ),
  entry(
    "g-05",
    "/images/luxury-lace/1000258429-680x920.jpg",
    "Amber jewels on champagne tulle",
    "Close view of champagne tulle embellished with crystals and amber jewels",
    "champagne-jewel-beaded-tulle",
  ),
  entry(
    "g-06",
    "/images/ankara/1000219273-680x920.jpg",
    "Amber botanicals, stacked",
    "Charcoal and amber botanical Ankara with folded pieces stacked on top",
    "amber-botanical-ankara",
  ),
  entry(
    "g-07",
    "/images/wooven-kente/1000506363-680x920.jpg",
    "A sunset, woven",
    "Kente cloth fading from indigo to tangerine to azure",
    "tangerine-and-azure-ombre-kente",
  ),
  entry(
    "g-08",
    "/images/ankara-sequin/1000527318-680x920.jpg",
    "Sequins trace the tree of life",
    "Yellow and turquoise print with iridescent sequins",
    "golden-tree-sequin-ankara",
  ),
  entry(
    "g-09",
    "/images/luxury-lace/1000597868-680x920.jpg",
    "Ivory crystal gown",
    "Ivory sheer beaded gown with tulle cape on a mannequin in the showroom",
    "ivory-crystal-beaded-gown",
  ),
  entry(
    "g-10",
    "/images/ankara/1000132832-680x920.jpg",
    "Wildflowers after dark",
    "Black Ankara printed with multicoloured wildflowers",
    "midnight-wildflower-ankara",
  ),
  entry(
    "g-11",
    "/images/wooven-kente/1000294384-680x920.jpg",
    "Blush, sky and gold",
    "Pink, sky blue and gold woven Kente with key motifs",
    "blush-and-sky-woven-kente",
  ),
  entry(
    "g-12",
    "/images/ankara/1000848746-680x920.jpg",
    "Fern wreath, two ways",
    "Mustard and red fern-pattern Ankara fabrics folded side by side",
    "fern-wreath-ankara",
  ),
  entry(
    "g-13",
    "/images/luxury-lace/1000258289-680x920.jpg",
    "Ivory & gold stonework",
    "Ivory lace with an ornate gold stone border",
    "ivory-and-gold-stone-lace",
  ),
  entry(
    "g-14",
    "/images/isiagu-fabric/1000536623-1-680x920.jpg",
    "Emerald lion crest",
    "Emerald Isiagu fabric laid flat in the showroom",
    "lion-crest-isiagu-emerald",
  ),
  entry(
    "g-15",
    "/images/ankara/1000259130-680x920.jpg",
    "Coral and mint plumes",
    "Navy Ankara with large coral and mint plume shapes",
    "coral-and-mint-plume-ankara",
  ),
  entry(
    "g-16",
    "/images/wooven-kente/1000506391-680x920.jpg",
    "Colour-blocked ombré",
    "Pink, saffron and violet woven Kente laid flat",
    "saffron-pink-and-violet-ombre-kente",
  ),
];
