/**
 * DEVELOPMENT / TEST DATA — the /gallery page: finished looks and showroom
 * styling made with our fabrics. Files live in /public/images/gallery and are
 * named `<slug>-<width>x<height>.jpg`.
 */
import type { GalleryImage } from "@/lib/types";

const entry = (
  id: string,
  file: string,
  caption: string,
  altText: string,
): GalleryImage => {
  const [, width, height] = file.match(/-(\d+)x(\d+)\.jpg$/) ?? [];
  return {
    id,
    imageUrl: `/images/gallery/${file}`,
    caption,
    altText,
    width: Number(width),
    height: Number(height),
  };
};

export const mockGallery: GalleryImage[] = [
  entry(
    "gl-01",
    "african-fabric-12-200x300.jpg",
    "Matching in red Isiagu",
    "Couple in matching red outfits trimmed with Isiagu lion-head print, the bride in a fitted mermaid gown",
  ),
  entry(
    "gl-02",
    "african-fabric-30-240x300.jpg",
    "Gold sequins for the evening",
    "Woman in a gold and black sequin gown beside a man in a navy suit on stone steps",
  ),
  entry(
    "gl-03",
    "african-fabric-31-240x300.jpg",
    "Silver fringe and a tiara",
    "Woman in a short silver beaded fringe dress and crystal tiara on brick steps",
  ),
  entry(
    "gl-04",
    "african-fabric-32-200x300.jpg",
    "Blush and lime, hand in hand",
    "Man in a peach two-piece holding hands with a woman in a pink and lime Ankara dress",
  ),
  entry(
    "gl-05",
    "african-fabric-33-240x300.jpg",
    "Copper swirls, full skirt",
    "Woman in a black bodice and full copper and black print skirt on a garden path",
  ),
  entry(
    "gl-06",
    "african-fabric-34-240x300.jpg",
    "Emerald check and wax print",
    "Bride in a green plaid and yellow wax-print mermaid gown on a lawn",
  ),
  entry(
    "gl-07",
    "african-fabric-35-240x300.jpg",
    "Royal blue for two",
    "Couple in coordinated royal blue plaid looks, the bride's gown with a white train and silver bodice",
  ),
  entry(
    "gl-08",
    "african-fabric-36-240x300.jpg",
    "Tiered Ankara and plaid",
    "Woman in a tiered blue Ankara and red plaid gown with beaded necklaces in a garden",
  ),
  entry(
    "gl-09",
    "african-fabric-37-240x300.jpg",
    "Teal and olive, side by side",
    "Man in a teal kaftan beside a woman in an olive Ankara gown with sheer blue sleeves",
  ),
  entry(
    "gl-10",
    "african-fabric-38-240x300.jpg",
    "Embroidered navy kaftan",
    "Man in a navy kaftan with a grey embroidered panel, holding a walking cane on a garden path",
  ),
  entry(
    "gl-11",
    "african-fabric-39-240x300.jpg",
    "Medallions in brown and blue",
    "Woman in a brown and blue medallion-print Ankara gown on a lawn",
  ),
  entry(
    "gl-12",
    "african-fabric-40-240x300.jpg",
    "Coral tulle, sunburst hem",
    "Woman in a coral corset with draped tulle and a ruffled sunburst-print Ankara skirt",
  ),
  entry(
    "gl-13",
    "african-fabric-41-240x300.jpg",
    "Fuchsia lace by the pool",
    "Woman in a fuchsia gown with an embellished bodice and lace appliqué hem beside a pool",
  ),
  entry(
    "gl-14",
    "african-fabric-42-240x300.jpg",
    "Green stripes, floor length",
    "Woman in a green striped ruffled mermaid gown with a yellow head wrap",
  ),
  entry(
    "gl-15",
    "african-fabric-43-240x300.jpg",
    "Green stripes, cocktail length",
    "Woman in a short green striped ruffled dress with a yellow head wrap",
  ),
  entry(
    "gl-16",
    "african-fabric-44-240x300.jpg",
    "Rust and cobalt ruffles",
    "Two women in ruffled maxi skirts, one rust with a black top and one cobalt with a white blouse",
  ),
  entry(
    "gl-17",
    "african-fabric-45-200x300.jpg",
    "Ivory with a woven placket",
    "Man in an ivory kaftan with a colourful woven placket and a black cap",
  ),
  entry(
    "gl-18",
    "african-fabric-46-200x300.jpg",
    "Silver bodice in the showroom",
    "Woman in a silver beaded top and black mermaid skirt in front of shelves of Ankara fabric",
  ),
  entry(
    "gl-19",
    "african-fabric-47-225x300.jpg",
    "Magenta sequins, one shoulder",
    "Magenta one-shoulder sequin gown with a bow, worn in the showroom",
  ),
  entry(
    "gl-20",
    "african-fabric-48-287x300.jpg",
    "Bridal lace and a long veil",
    "Bride in an ivory lace gown with a flowing veil outdoors",
  ),
  entry(
    "gl-21",
    "african-fabric-49-290x300.jpg",
    "Mother and daughters in tulle",
    "Mother and two daughters in matching Ankara bodices with white tulle skirts against a yellow backdrop",
  ),
  entry(
    "gl-22",
    "african-fabric-50-239x300.jpg",
    "Black and gold, with gele",
    "Man in a black and gold print kaftan beside a woman in a black gown with a gold gele and feather fan",
  ),
  entry(
    "gl-23",
    "african-fabric-51-169x300.jpg",
    "Sunburst Ankara, everyday",
    "Woman in an orange and white sunburst Ankara dress with ruffled sleeves outdoors",
  ),
  entry(
    "gl-24",
    "african-fabric-52-225x300.jpg",
    "Burgundy velvet, mother and child",
    "Showroom mannequins in a burgundy sequin-velvet gown and matching child's dress",
  ),
  entry(
    "gl-25",
    "african-fabric-53-169x300.jpg",
    "Navy sequins with a gold belt",
    "Showroom mannequin in a navy sequin peplum gown with a gold belt",
  ),
  entry(
    "gl-26",
    "african-fabric-54-169x300.jpg",
    "Crimson velvet cape",
    "Woman in a crimson velvet cape embroidered in gold over a white dress, with a gold crown",
  ),
];
