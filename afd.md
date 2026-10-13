# African Fabric and Designs — Claude Code Project Specification

## 1. Project objective

Build a premium, elegant, compelling, mobile-first e-commerce storefront for **African Fabric and Designs**.

- **Domain:** `africanfabricanddesigns.com`
- **Business location:** Marcus Garvey Rd, Nairobi, Kenya
- **Phone:** +254 710 660 524
- **Email:** sales@africanfabricanddesigns.com
- **Currency:** USD
- **Backend:** Convex, but **do not integrate it in this phase**.
- **Payments:** Defer payment gateway integration.
- **Admin dashboard:** Not required for the initial phase.
- **Customer accounts:** Required in the intended final product; implement account screens and clean integration boundaries, but do not pretend real authentication works before a backend is connected.
- **Product images and logo:** The user will supply the real logo and test product images. Do not invent a replacement logo or assume supplied assets exist before checking the repository.

This document is the source of truth for the initial implementation. If a requirement is ambiguous, choose the simplest premium user experience that fits this specification, document the decision, and continue without adding unrelated features.

## 2. Critical development rules

1. Build **mobile-first**, then enhance for tablet and desktop. Do not design desktop first and merely squeeze it onto mobile.
2. Use strict TypeScript. **Never use `any`**, including in event handlers, component props, API types, error handling, or utility functions. Prefer `unknown` with proper narrowing when necessary.
3. Use the current stable versions compatible with the selected Next.js version and the installed package manager. Inspect the repository before changing dependencies or configuration.
4. Use Next.js App Router, Tailwind CSS v4, shadcn/ui, and Framer Motion where animation improves the experience.
5. Use `lucide-react` for ordinary icons. For WhatsApp, use the official WhatsApp SVG brand mark, not a generic message icon. Do not use emoji as interface icons.
6. Use accessible semantic HTML, visible keyboard focus, correctly associated form labels, keyboard-operable dialogs, reduced-motion support, and comfortable touch targets (aim for at least 44 × 44 CSS pixels).
7. Avoid generic template aesthetics, excessive gradients, glassmorphism, over-animation, oversized rounded cards everywhere, and unnecessary decorative elements. Aim for premium African textile editorial design.
8. Never fabricate products, prices, reviews, stock counts, delivery promises, business hours, or tax rates. Clearly mark mock catalogue data as development/test data.
9. Keep the application backend-ready without connecting Convex in this phase. UI components must not depend directly on mock-data arrays.
10. Do not implement fake checkout success, fake account authentication, fake payment confirmation, or pretend that orders are persisted. Clearly label non-operational features during development and keep production order submission disabled until a trusted backend is implemented.
11. Before completing a task, run the available lint, type-check, and build commands. Fix issues caused by your changes.
12. Do not overwrite or remove user files or assets without inspecting them first.

## 3. Brand and art direction

Create a premium African textile boutique aesthetic: editorial, tactile, confident, contemporary, and warm. Product photography should be the main source of visual richness.

### Suggested palette

- Warm ivory: `#F5F0E7` — primary background
- Terracotta: `#A64F36` — primary actions and restrained accents
- Olive: `#4C5943` — secondary accents
- Deep brown: `#342D28` — primary text
- White/off-white surfaces and subtle warm borders as needed

Use CSS variables and Tailwind utilities rather than scattering raw hex values across components. Ensure all text and controls have sufficient contrast. Dark mode is not required unless the user later asks for it.

### Typography

- Use an elegant editorial serif for large headings and selected brand moments.
- Use a highly legible sans-serif for navigation, prices, forms, product descriptions, and body text.
- Use a restrained type scale, clear hierarchy, readable line lengths, and comfortable line height.
- Prefer locally available or optimised font loading through `next/font` when practical.

### Layout principles

- Generous but purposeful whitespace.
- Refined spacing and alignment.
- Thin, subtle borders rather than heavy shadows.
- High-quality image presentation and consistent product-card geometry.
- Motion should be subtle and purposeful, with reduced-motion preferences respected.
- The interface must feel considered on small phones, not simply responsive at desktop breakpoints.

## 4. Required routes

Implement these routes in the Next.js App Router:

- `/` — Homepage
- `/shop` — Full catalogue
- `/shop/[category]` — Category-specific catalogue
- `/products/[slug]` — Product details
- `/gallery` — Editorial image gallery
- `/cart` — Shopping cart
- `/checkout` — Checkout interface, with order submission disabled until backend integration
- `/checkout/confirmation/[orderNumber]` — Confirmation-page design only; do not fabricate a real order
- `/account/sign-up` — Registration UI
- `/account/sign-in` — Login UI
- `/account/forgot-password` — Password-recovery UI
- `/account` — Account overview placeholder
- `/account/orders` — Order-history placeholder
- `/account/orders/[orderNumber]` — Order-detail placeholder
- `/contact` — Contact details, map, and form UI
- `/about` — Brand story placeholder
- `/shipping-returns` — Shipping and returns information
- `/privacy` — Privacy policy placeholder requiring business/legal review
- `/terms` — Terms placeholder requiring business/legal review

Also implement branded loading, error, and not-found states. Do not invent legal policies; use clearly identified draft placeholders until the business provides approved copy.

## 5. Homepage specification

The homepage must make the store feel credible and shoppable immediately.

Recommended section order:

1. **Announcement strip** — only display a factual, configurable message. Do not invent discounts, free shipping, or delivery guarantees.
2. **Header/navigation** — logo, Shop, categories or a shop menu, Gallery, About, Contact, account icon, and cart icon with item count.
3. **Hero** — premium brand headline, short supporting copy, strong textile imagery, primary “Shop the Collection” CTA, and optional secondary Gallery CTA.
4. **Category discovery** — visual category tiles.
5. **New arrivals / Featured collection** — a curated product row or grid, with a clear link to `/shop`.
6. **Editorial brand section** — concise brand story with supporting image.
7. **Gallery preview** — selected editorial images linking to `/gallery`.
8. **Trust and shopping information** — only confirmed facts; no fabricated testimonials or claims.
9. **Newsletter section** — include only if a real signup destination or clearly disabled prototype state is implemented.
10. **Footer** — navigation, contact details, policies, and copyright.

Do not make the homepage a long corporate landing page. Products should appear soon after the hero and category discovery. The full catalogue belongs on `/shop`.

On mobile, keep the hero compact, CTAs visible, and the path to products short.

## 6. Navigation and responsive behaviour

### Header

- Use the supplied logo once provided. Until then, use a restrained text-based wordmark placeholder, clearly isolated so the logo can be swapped easily.
- Desktop: brand on the left, primary navigation, account and cart actions.
- Mobile: compact header with logo and essential actions; use an accessible menu/drawer for secondary navigation.
- Cart badge updates immediately when local cart state changes.
- Do not let a sticky header obscure page headings or anchor targets.

### Floating cart

- A fixed cart shortcut appears at the bottom-right when useful.
- Show the current cart item count when greater than zero.
- Respect mobile safe-area insets.
- Never cover checkout buttons, cookie/consent controls, form fields, or bottom navigation.
- On the cart page, avoid duplicating a floating element that obscures the order summary.

### Responsive product grid

Use content-driven breakpoints, starting with approximately:
- Small mobile: 2 columns
- Tablet: 2–3 columns depending on available width
- Desktop: 3–4 columns
- Wide desktop: up to 5 columns only if cards remain comfortably readable

Avoid horizontal overflow. Test at narrow viewport widths, zoom, and enlarged text.

## 7. Shop and product cards

### Categories

Initial category examples:
- Ankara
- Shweshwe
- Isiagu Fabric
- Woven Kente
- Ankara Sequin
- Men's Hats
- Accessories

These are seed/test categories and should be editable in the data layer. Do not hard-code category-specific logic into the UI.

### Shop features

- Search by product name, SKU, and category where supported by the mock data.
- Category filters.
- Sorting: featured, newest, price low-to-high, price high-to-low.
- Optional price range and availability filters if they can be implemented cleanly.
- Filter state should be reflected in URL search parameters where practical so users can share filtered views.
- Provide clear empty states and a one-tap “Clear filters” action.
- Use pagination or a deliberate Load More interaction; do not render a huge catalogue all at once.
- Do not display non-functional controls.

### Product card

Each card should support:
- Primary image and, when useful, an accessible next/previous image control.
- Product name.
- Price in USD.
- Unit label (piece, metre, or yard).
- Availability only when the mock data provides a truthful state.
- Add to Cart action.
- WhatsApp action using the official WhatsApp SVG.
- Details action/link.

Mobile actions must be icon-only, with accessible names and tooltips where appropriate. Larger screens should display icons with text. Ensure the three actions remain clear and do not overcrowd small cards. Add to Cart should have a clear visual priority.

Use a real product route for Details. Do not use click handlers on non-interactive elements in place of semantic buttons or links.

## 8. Product details and image gallery

### Product details page

- Breadcrumbs.
- Main product image and thumbnail strip.
- Product name, SKU, USD price, unit, description, availability, quantity selector, and minimum order quantity when relevant.
- Add to Cart as the primary action.
- WhatsApp enquiry action with a prepared message containing product name, SKU, product URL, and selected quantity.
- Fabric-specific information when provided: width, material, care instructions, pattern/colour notes, and selling unit.
- Related products only when relevant mock data exists.

### Image interaction

- Initially show one large main image.
- Show the remaining images as thumbnails underneath.
- Clicking a thumbnail updates the main image and active thumbnail state.
- Clicking the main image opens a lightbox/modal.
- Lightbox includes Close, Previous, and Next controls.
- Support keyboard Escape and arrow keys; restore focus on close.
- Support touch gestures if reliable and accessible.
- Preserve original portrait/landscape proportions; do not crop away important textile patterns.
- Prevent background scrolling while the modal is open.
- Use accessible dialog semantics and useful alt text.
- Avoid layout shift by providing dimensions or aspect-ratio containers.

## 9. Editorial gallery

- `/gallery` shows editorial images in a refined masonry or responsive grid.
- Preserve the original aspect ratios of portrait and landscape photos.
- Clicking an image opens a lightbox with Previous, Next, and Close controls.
- Support keyboard navigation and mobile touch.
- Use lazy loading below the fold and appropriate image sizes.
- Gallery image data should come from the same replaceable mock-data layer, not be embedded throughout UI components.

## 10. Cart behaviour

Implement a typed cart provider/store using React Context or another lightweight state solution already present in the project. Do not add a large state library without need.

- Persist local cart data across refreshes.
- Store product IDs and quantities as the source of truth; product names/images may be copied for immediate rendering but should be reconciled with catalogue data.
- Add, remove, increment, decrement, and edit quantity.
- Enforce the product's minimum quantity and valid unit increments.
- Show subtotal and line totals with correct decimal-safe arithmetic.
- Display an empty-cart state with a clear Shop CTA.
- Show an accessible success notification when an item is added.
- Ensure the navbar and floating cart badge remain in sync.
- Handle missing/deleted products gracefully.
- Version persisted storage and validate parsed JSON as `unknown` before use. Never blindly trust local storage data.
- Use a decimal-safe money strategy; do not rely on floating-point arithmetic for authoritative financial calculations.
- Clear or migrate incompatible stored data safely.

The cart is a local prototype until backend integration. It is not a trusted order or inventory record.

## 11. Checkout and tax declaration

Payment integration is deferred, but the checkout UI should be designed to support it later.

### Checkout fields

- Customer full name
- Email
- Phone
- Delivery address line 1 and optional line 2
- City
- Region/state, if applicable
- Postal code, if applicable
- Country
- Optional customer notes
- Tax declaration checkbox
- Conditional Tax ID field

### Tax checkbox behaviour

Initial unchecked state:

> I am ready to provide my Tax ID and pay any applicable VAT or taxes on this order.

When checked:
- Reveal a Tax ID number input.
- Make the input required.
- Validate it on the server once backend integration exists.
- When unchecked, hide the field and clear the value.
- Do not treat the checkbox as a mechanism for opting out of legally applicable tax.
- Do not invent a VAT rate or calculate a real tax amount in the prototype.
- Clearly indicate that tax and shipping rules require confirmation before final totals can be calculated.

The business is based in Kenya while prices are displayed in USD. Tax treatment, Tax ID requirements, tax-inclusive/exclusive pricing, and any applicable rate must be confirmed with a qualified tax adviser before production checkout is enabled.

### Checkout prototype limitations

- Validate the form client-side for a good user experience.
- Keep validation schemas ready for reuse on the server.
- Do not show a successful order confirmation merely because a local button was clicked.
- Until Convex is integrated, label checkout as a preview or disable final order submission with a clear explanation.
- Do not collect or persist real Tax IDs in browser storage.
- Do not store payment card details.
- Do not claim an order has been placed or paid without a trusted backend response.

## 12. Accounts

Build polished account screens and forms, but do not fake real authentication.

- Sign-up, sign-in, forgot-password, email-verification, and account layouts.
- Useful loading, error, invalid-credentials, and success states.
- After authentication is integrated, checkout requires a signed-in customer.
- Preserve the local cart across sign-in/sign-up navigation.
- Order history and order details should have clear empty states before real data is available.
- Do not store passwords or sensitive account data locally.
- Do not claim account creation, email verification, or password reset succeeded without a real authentication service.

Convex authentication must be selected and integrated in the later backend phase. Keep UI components decoupled from the authentication implementation.

## 13. Contact page

Display the following supplied business information:

**African Fabric and Designs Kenya Ltd.**
- Address: Marcus Garvey Rd, Nairobi, Kenya
- Phone: +254 710 660 524
- Email: sales@africanfabricanddesigns.com
- Google Maps location: https://www.google.com/maps/place/African+Fabric+And+Designs+Kenya+Ltd./@-1.294248,36.7911309,17z/

Use an actual Google Maps embed or an accessible map link. Do not substitute a generic street image for the map.

Contact form fields:
- Name
- Email
- Phone (optional)
- Subject
- Message

Include validation and clear pending/success/error UI. Since no backend/email service is connected in this phase, do not pretend messages have been sent. Use an explicit prototype state or keep submission disabled with a useful explanation.

Do not invent business hours, response-time promises, delivery guarantees, or social media accounts.

## 14. Data types and repository boundary

Use a central type model. Example starting point:

```typescript
export type Currency = "USD";

export type ProductUnit = "piece" | "metre" | "yard";

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: string;
  currency: Currency;
  unit: ProductUnit;
  minimumQuantity: string;
  stockQuantity: string;
  isAvailable: boolean;
  isFeatured: boolean;
  images: ProductImage[];
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
}

export interface CartItem {
  productId: string;
  quantity: string;
}

export interface TaxDeclaration {
  readyToPayApplicableTaxes: boolean;
  taxId: string | null;
}
```

Use decimal strings or a decimal-safe library at the data boundary for quantities and money. Never use TypeScript `any`.

Create a `ProductRepository` interface with methods such as:
- `getFeaturedProducts()`
- `getProducts()`
- `getProductBySlug(slug)`
- `getProductsByCategory(categorySlug)`

Implement a mock repository first. Later, add a Convex-backed implementation without rewriting presentation components.

Do not create the full Convex schema or add Convex dependencies in this phase unless the user explicitly asks to begin backend integration.

## 15. Image assets supplied by the user

The user will supply:
1. Brand logo.
2. Test product images.

Before designing the hero or product layouts:
- Inspect the existing repository and identify the available asset directory.
- If the supplied logo/images are already present, inspect and use them.
- If assets have not yet been supplied, build a flexible image configuration and use clearly identified temporary placeholders only where necessary.
- Do not generate or invent a new logo.
- Do not assume file names, formats, dimensions, or image paths.
- Keep asset references centralised so replacing test images with final assets is straightforward.
- Preserve image aspect ratios and avoid unnecessary cropping.
- Provide meaningful alt text based on known content; do not invent textile details not visible or supplied.
- Configure Next.js image handling correctly for the actual asset sources.

Suggested organisation after assets are supplied (adjust to the actual repository and files):

```text
public/
  brand/
    logo.svg
  products/
  gallery/
```

Do not rename or overwrite supplied assets without a reason.

## 16. SEO, accessibility, and performance

- Unique page titles and metadata.
- Product metadata and Open Graph images.
- `sitemap.ts` and `robots.ts`.
- Semantic headings and landmarks.
- Keyboard-operable navigation, menus, filters, quantity controls, and lightboxes.
- Useful alt text for meaningful images; empty alt for decorative images.
- Visible focus indicators and accessible error messages.
- Reduced-motion support.
- Optimised images and explicit image dimensions/aspect ratios.
- Avoid unnecessary client components.
- Keep the homepage and product pages lightweight.
- Avoid layout shifts, blocking scripts, and heavy animation libraries beyond what is needed.
- Add product structured data only when product facts are real and reliable; do not publish fabricated price/availability data.
- Do not include private account or order information in metadata or public responses.

## 17. Future Convex integration requirements

When backend integration is authorised, plan for:
- Convex schema for products, categories, product images, gallery images, profiles, orders, order items, and order status.
- Authentication integrated with Convex using a supported authentication provider.
- Server-side access control for customer profiles and orders.
- Public queries restricted to published catalogue content.
- Trusted order mutations that recalculate prices and validate availability.
- Atomic inventory handling and duplicate-submission protection.
- Order snapshots of product name, SKU, unit, quantity, and unit price.
- Secure handling and minimal retention of Tax IDs.
- Tax and shipping calculation only after the business rules are confirmed.
- Payment provider integration in a separate later phase.
- No service secrets in client-side code.
- Tests for access-control boundaries and invalid checkout payloads.

Do not imply that a client-side interface provides these guarantees before Convex is connected.

## 18. Quality gates

Before calling the initial phase complete:

- All routes render without runtime errors.
- Responsive behaviour works on small phones, large phones, tablets, laptops, and wide desktops.
- Product category filters, search, sorting, and empty states work.
- Product thumbnails update the main image.
- Lightboxes support keyboard and touch interactions.
- Cart add/remove/quantity controls work and remain synchronised.
- Cart persists safely across refreshes.
- USD formatting is consistent.
- The conditional Tax ID field behaves correctly and clears when unchecked.
- No fake order/payment/account/contact success is displayed.
- No TypeScript `any` is present.
- No avoidable console errors or React key warnings.
- Lint, type-check, and production build pass.
- Basic accessibility checks are completed.
- No credentials or secrets are committed.
- The supplied logo and product images are used once available.

## 19. Recommended implementation sequence for Claude Code

Work in small, reviewable phases. Inspect the current repository first and report its existing framework, package manager, and relevant files before changing anything.

### Phase A — Audit and foundation
1. Inspect repository and assets.
2. Confirm Next.js version and package manager.
3. Set up design tokens and typography.
4. Establish shared layout, header, footer, navigation, and responsive primitives.
5. Run lint/type-check/build.

### Phase B — Storefront
1. Create typed test data and the repository interface.
2. Implement homepage and category discovery.
3. Implement shop grid, search, sorting, filters, and empty states.
4. Implement product detail pages and image gallery.
5. Implement editorial gallery and lightbox.

### Phase C — Cart and checkout preview
1. Implement typed local cart state and safe persistence.
2. Implement product quantity and unit rules.
3. Implement cart page and floating cart badge.
4. Implement checkout form, tax checkbox, and conditional Tax ID field.
5. Keep order submission disabled until Convex exists.

### Phase D — Supporting pages
1. Account UI.
2. Contact page and map.
3. About, shipping/returns, privacy and terms placeholders.
4. Loading, error, empty, and not-found states.

### Phase E — Polish and verification
1. Check real supplied images and logo.
2. Test mobile-first layouts and touch interactions.
3. Improve image loading, motion, accessibility, and metadata.
4. Run lint, type-check, and production build.
5. Report completed work, limitations, and any decisions that need user input.

Do not attempt the entire application in one giant component or one unreviewable code dump. Keep components focused, reusable, and strongly typed.

## 20. Definition of done

The initial implementation is complete when it delivers a polished, responsive storefront prototype with realistic test data, functioning catalogue discovery, product image interactions, editorial gallery, local cart, checkout UI with conditional Tax ID input, and contact/account screens, all ready for later Convex integration.

It is **not** production-ready for real orders, real accounts, Tax ID collection, or payments until the relevant backend, security, tax, email, and operational requirements have been implemented and verified.
