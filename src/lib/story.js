// The one piece of state the page and the 3D scene share.
// GSAP timelines (scroll, intro, clicks) write these numbers; the WebGL scene reads them every frame.
// Positions are in viewport fractions (x from the left, y from the top) and sizes in fractions of the viewport
// height, so the same values work at any screen size.
export const story = {
  bite: {
    x: 0.585, y: 0.66, // where the bite's centre sits on screen
    s: 0,              // its diameter as a fraction of the viewport height (0 = hidden)
    rx: 0, ry: 0, rz: 0, // extra rotation on top of its slow idle spin (radians)
    split: 0,          // 0 whole → 1 broken open into two halves
    roll: 0,           // distance rolled (the "Why" row): turned into spin about z
  },
  explode: 0,          // ingredients flying out of the broken bite: 0 → 1
  orbit: 0,            // millet grains circling the bite in the story chapter: 0 → 1
  rain: 0,             // bites pouring into the pack at the end: 0 → 1
  openingView: 0,
  openingTravel: 0,
  insideTravel: 0,
  outline: 0,
  shopTravel: 0,
  // World-space pose of the bite lifted from the zipper, before its close-up.
  liftedBite: { active: false, x: 0, y: 0, z: 0, radius: 0 },
  packOpen: 0,
  packProgress: 0,
  manualOpen: null,
  dragAngle: 0,
  reduced: false,
  packAngle: 0,        // the pack turntable, degrees (Showcase)
  pointer: { x: 0, y: 0 }, // -1..1, eased in the scene
};

// The slots the ingredient pieces fly to when the bite breaks open: the HTML labels sit at the same
// fractions, so the 3D pieces and their names line up at any size.
export const INGREDIENTS = [
  { key: "millet", name: "Jowar & ragi millets", note: "Ancient grains for slow, steady energy", x: 0.22, y: 0.38 },
  { key: "choc", name: "Dark chocolate", note: "Real cocoa butter, glossy and rich", x: 0.78, y: 0.38 },
  { key: "cocoa", name: "Cocoa", note: "Deep roast for that bitter edge", x: 0.2, y: 0.66 },
  { key: "jaggery", name: "Jaggery", note: "Sweetness from cane, not white sugar", x: 0.8, y: 0.66 },
  { key: "crisp", name: "Rice crisp", note: "Air-light puffs for the crunch", x: 0.5, y: 0.8 },
];
export const INGREDIENTS_MOBILE = [
  { x: 0.25, y: 0.30 }, { x: 0.75, y: 0.30 }, { x: 0.22, y: 0.59 }, { x: 0.78, y: 0.59 }, { x: 0.5, y: 0.76 },
];
