# NIBBLŌ · Chocolate Millet Bites

A responsive product landing page for a 150 g pouch of chocolate-coated millet bites. Follow a bite from the pack to its toasted-grain centre, explore four everyday snacking moments, and choose a quantity in the shop.

## Walkthrough

https://github.com/user-attachments/assets/1de2d7c5-090f-4fdd-9685-14fbfac8089a

## Run locally

Use Node.js 22 LTS and npm. From the repository root:

```sh
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3009
```

Open [the local site](http://localhost:3009). To check the source and run a production build:

```sh
npm run lint
npm run build
npm start -- --hostname 127.0.0.1 --port 3009
```

Stop the development server before starting production on the same port. The first build needs network access for the Bricolage Grotesque and DM Mono font files. Next.js serves those fonts locally at runtime.

## Explore the page

| Section | Interaction |
| --- | --- |
| Hero | The loading wordmark fills, then moves into the header. Drag a floating pack label or select it to read it. The purchase card leads to the shop. |
| Brand story | Scroll from the headline into the product story. The pouch moves alongside the story, and the three view selectors reveal the grain blend, chocolate coating, and resealable pack. |
| Product showcase | Drag to turn the pouch. Use **Turn over** or **Open pouch** to inspect the back, zipper, and contents. Scroll to reseal it. |
| Ingredients | A whole bite splits into two halves. Five ingredient models fan out to their labels and the nutrition panel displays values per 30 g. |
| Why NIBBLŌ | The bite rolls over four product features as the corresponding column is highlighted. |
| Snacking moments | Scroll through four photographic scenes, or use the time buttons to jump between morning training, a road trip, an afternoon break, and movie night. |
| Shop and footer | Set a quantity from one to nine and add it to the bag. The total reflects ₹199 per pack. The footer links back to the top. |

The bag count is local to the page session. Checkout and payment processing are outside the scope of this landing page.

## Technologies and animation

- **Next.js App Router and React** render the page structure and handle the view selector, receipt dialogs, pouch controls, and bag state. CSS Modules define responsive layouts for each section.
- **Three.js and React Three Fiber** share one transparent WebGL canvas. The pouch uses front and back print textures derived from the supplied product artwork. Morph targets spread the zipper and gussets. Falling bites follow the pouch's local coordinates and pass between the lips.
- **GSAP and ScrollTrigger** pin chapters and synchronize text masks, diagonal photo reveals, and the 3D product poses. The split bite uses clipping planes through a chocolate shell and an instanced grain centre.
- **Lenis** uses the GSAP ticker for smooth scrolling. The reduced-motion layout presents the content in reading order, and a pack image remains available when WebGL cannot start.
- **Asset loading** uses WebP photography, instanced geometry for repeated grains and bites, and a capped device pixel ratio. The WebGL scene loads on the client; text, navigation, and pack imagery are rendered in the page markup.

## Project structure

| Path | Contents |
| --- | --- |
| `src/app/` | App entry point, page metadata, global design tokens, and fonts |
| `src/components/Experience.jsx` | Loading lifecycle, navigation, smooth scrolling, and bag state |
| `src/components/sections/` | Page sections and their scoped styles |
| `src/components/three/` | Pouch and bite geometry, materials, lighting, and animation |
| `src/components/ui/` | Shared wordmark |
| `src/lib/` | Scroll timelines, shared animation state, and ingredient placement |
| `public/` | Product textures, lifestyle photos, footer artwork, and the licensed Barlow Condensed font |
| `docs/` | Captioned screen recording |

Deployment link : https://nibblo-chocolate-millet-bites-assig.vercel.app/ 
