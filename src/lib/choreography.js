import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { story } from "./story";

gsap.registerPlugin(ScrollTrigger);

// Where the bite rests in each chapter, as viewport fractions (see story.js). Desktop and phone differ because
// the layouts do; every hand-over goes from one rest to the next, so the bite never jumps or cuts.
const REST = {
  desk: {
    hero: { x: .594, y: .68, s: 0 },
    story: { x: .72, y: .5, s: .46 },
    product: { x: .71, y: .37, s: 0 },      // into the pack's mouth
    poster: { x: .80, y: .72, s: .43 },
    inside: { x: .5, y: .54, s: .3 },
    whyA: { x: .14, y: .44, s: .17 }, whyB: { x: .86, y: .44, s: .17 },
    moments: { x: .525, y: .71, s: .21 },
    shop: { x: .5, y: .34, s: 0 },         // drops into the pack with the rest of the rain
  },
  mob: {
    hero: { x: .26, y: .79, s: 0 },
    story: { x: .5, y: .3, s: .28 },
    product: { x: .5, y: .5, s: 0 },
    poster: { x: .66, y: .71, s: .28 },
    inside: { x: .5, y: .47, s: .13 },
    whyA: { x: .15, y: .3, s: .1 }, whyB: { x: .85, y: .3, s: .1 },
    moments: { x: .79, y: .505, s: .132 },
    shop: { x: .5, y: .5, s: 0 },
  },
};

const lines = sel => [...document.querySelectorAll(sel)];
// headline lines rise out of their masks; one tween per line (a staggered .from() in a scrubbed timeline only
// hides its first target up front)
const reveal = (tl, els, at, step = .08) => els.forEach((el, i) =>
  tl.fromTo(el, { yPercent: 110 }, { yPercent: 0, duration: .6, ease: "power3.out" }, at + i * step));

// Move the printed wordmark into the navigation while the paper rises off the hero.
export function playIntro({ loader, nav, onDone }) {
  const source = loader.querySelector("[data-loader-center]").getBoundingClientRect();
  const mark = nav.querySelector('a[href="#top"]');
  const target = mark.getBoundingClientRect();
  const tl = gsap.timeline({ onComplete: onDone });
  tl.set(mark, { opacity: 0 }, 0)
    .to("[data-loader-status]", { opacity: 0, y: -5, duration: .16 }, 0)
    .to("[data-loader-word]", {
      x: target.left + target.width / 2 - source.left - source.width / 2,
      y: target.top + target.height / 2 - source.top - source.height / 2,
      scale: target.width / source.width, duration: .74, ease: "power3.inOut"
    }, .03)
    .to("[data-loader-paper]", { yPercent: -101, duration: .73, ease: "power3.inOut" }, .12)
    .fromTo("[data-hero-pack]", { "--pouch-entry-y": "76px" }, {
      "--pouch-entry-y": "0px", duration: .83, ease: "power3.out"
    }, .27)
    .fromTo("[data-hero-line]", { yPercent: 106 }, {
      yPercent: 0, duration: .59, stagger: .075, ease: "power3.out", clearProps: "transform"
    }, .42)
    .fromTo("[data-hero-card]", { visibility: "hidden" }, { visibility: "visible", duration: 0 }, .45)
    .fromTo("[data-hero-card]", { y: 14 }, { y: 0, duration: .47, ease: "power3.out", clearProps: "transform,visibility" }, .45)
    .fromTo(nav.querySelectorAll("nav"), { opacity: 0 }, { opacity: 1, duration: .24, clearProps: "opacity" }, .70)
    .set(mark, { clearProps: "opacity" }, .77)
    .set("[data-loader-word]", { visibility: "hidden" }, .77);
  return tl;
}

// ── the 3D side of the story as ONE function of scroll position ──
// Each segment says: over this stretch of scroll (a ScrollTrigger's start → end, optionally a sub-range t0..t1),
// move these values from → to. Every frame the segments are applied in scroll order, so a chapter further
// down can never stamp its values over the one on screen (many scrubbed timelines all writing the same object
// do exactly that on refresh).
function createDriver(segments, base) {
  let enabled = false;
  const apply = () => {
    if (!enabled) return;
    const y = scrollY;
    Object.assign(story.bite, base.bite);
    Object.assign(story, base.story);
    for (const s of segments) {
      const { start, end } = s.st;
      const p = gsap.utils.clamp(0, 1, (y - start) / Math.max(1, end - start));
      const local = gsap.utils.clamp(0, 1, (p - s.t0) / (s.t1 - s.t0));
      if (p <= 0 || local <= 0) continue;
      const k = s.ease(local);
      const target = s.obj === "bite" ? story.bite : story;
      for (const key in s.to) target[key] = s.from[key] + (s.to[key] - s.from[key]) * k;
    }
  };
  gsap.ticker.add(apply);
  return { enable: () => { enabled = true; apply(); }, kill: () => gsap.ticker.remove(apply) };
}

export function buildScroll({ mobile }) {
  const R = REST[mobile ? "mob" : "desk"];
  const sec = id => document.getElementById(id);
  const moments = sec("moments");
  const sequence = moments.closest("[data-moment-sequence]");
  const runway = moments.closest("[data-moment-runway]");
  sequence.setAttribute("data-pinned", "");
  moments.setAttribute("data-reel", "");
  const pinCfg = (id, length, extra = {}) => ({ trigger: sec(id), start: "top top", end: `+=${length}%`, pin: true, scrub: true, anticipatePin: 1, ...extra });
  const enterCfg = id => ({ trigger: sec(id), start: "top bottom", end: "top top" });
  const segs = [];
  const seg = (st, obj, from, to, t0 = 0, t1 = 1, ease = "power2.inOut") => segs.push({ st, obj, from, to, t0, t1, ease: gsap.parseEase(ease) });
  const PI = Math.PI;

  const studioEntry = { ...enterCfg("product"), scrub: true };
  gsap.timeline({ scrollTrigger: studioEntry })
    .fromTo("[data-section=story] h2, [data-section=story] [role=group]", { opacity:1 }, { opacity:0, duration:.55 }, 0)
    .fromTo("[data-studio-copy]", { y:42, opacity:0 }, { y:0, opacity:1, duration:.55, ease:"power2.out" }, .35)
    .fromTo("[data-studio-rail]", { scaleX:0 }, { scaleX:1, duration:.5, ease:"power2.out" }, .5);

  // product, pinned: the pack turns a full circle (dragging adds on top, Showcase.jsx)
  const productPin = ScrollTrigger.create(pinCfg("product", mobile ? 180 : 220));
  seg(productPin, "story", { packProgress: 0 }, { packProgress: 1 }, 0, 1, "none");
  seg(productPin, "story", { packAngle: 0 }, { packAngle: 360 }, 0, .46);
  seg(productPin, "story", { packOpen: 0 }, { packOpen: 1 }, .46, .64);
  seg(productPin, "story", { packOpen: 1 }, { packOpen: 0 }, .79, .95);

  // The bite lands on the poster as its four lines rise through individual masks.
  const toInside = gsap.timeline({ scrollTrigger: { ...enterCfg("ingredients"), scrub: true } });
  seg(toInside.scrollTrigger, "story", { insideTravel: 0 }, { insideTravel: 1 });
  seg(toInside.scrollTrigger, "bite", { ...R.poster, ry: 0 }, { ...R.poster, ry: PI * 1.35 });
  seg(toInside.scrollTrigger, "story", { outline: 0 }, { outline: 1 }, .55, .93);
  toInside.to("[data-studio-copy], [data-studio-rail]", { opacity: 0, duration: .38 }, 0)
    .fromTo("[data-crunch-line]", { yPercent: 110, rotation: 2 }, {
      yPercent: 0, rotation: 0, transformOrigin: "0% 100%", duration: .32, stagger: .085, ease: "power3.out"
    }, .22)
    .fromTo("[data-crunch-ray]", { scale: 0 }, {
      scale: 1, transformOrigin: "100% 100%", duration: .14, stagger: .035, ease: "back.out(1.6)"
    }, .77);

  // The diagonal opens around the moving bite. All stages share a normalized timeline
  // with the WebGL driver so a fast scroll or a reversal lands on the same composition.
  const counters = lines("[data-count]");
  const insideTl = gsap.timeline({ scrollTrigger: pinCfg("ingredients", mobile ? 240 : 270, {
    onUpdate: self => {
      const k = gsap.utils.clamp(0, 1, (self.progress - .76) / .17);
      counters.forEach(el => { const v = Number(el.dataset.count); el.textContent = v % 1 ? (v * k).toFixed(1) : Math.round(v * k); });
    } }) });
  const pin = insideTl.scrollTrigger;
  seg(pin, "bite", { ...R.poster, rz: 0 }, { ...R.inside, rz: -.3 }, .14, .48);
  seg(pin, "story", { outline: 1 }, { outline: 0 }, .19, .36);
  seg(pin, "bite", { split: 0, rz: -.3 }, { split: 1, rz: 0 }, .43, .64);
  seg(pin, "story", { explode: 0 }, { explode: 1 }, .53, .86, "sine.inOut");
  insideTl.to({}, { duration: 1 }, 0)
    .to("[data-crunch-ray]", { opacity: 0, duration: .08 }, .13)
    .fromTo("[data-anatomy]", {
      clipPath: "polygon(59% 0%, 59% 0%, 41% 100%, 41% 100%)"
    }, {
      clipPath: "polygon(-2% 0%, 120% 0%, 102% 100%, -20% 100%)", duration: .32, ease: "power2.inOut"
    }, .13)
    .fromTo("[data-inside-line]", { yPercent: 115 }, {
      yPercent: 0, duration: .14, stagger: .045, ease: "power3.out"
    }, .42)
    .fromTo("[data-ing]", { opacity: 0, y: 14 }, {
      opacity: 1, y: 0, duration: .1, stagger: .034, ease: "power2.out"
    }, .64)
    .fromTo("[data-facts]", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .13 }, .76);

  // inside → why: the pieces fly home, the halves close, the bite drops to the start of the row
  const toWhy = gsap.timeline({ scrollTrigger: { trigger: sequence, start: "top bottom", end: "top top", scrub: true } });
  seg(toWhy.scrollTrigger, "story", { explode: 1 }, { explode: 0 }, 0, .45, "power2.in");
  seg(toWhy.scrollTrigger, "bite", { split: 1 }, { split: 0 }, .3, .7);
  seg(toWhy.scrollTrigger, "bite", { ...R.inside }, { ...R.whyA }, .5, 1);
  toWhy.fromTo("#ingredients > div", { opacity: 1 }, { opacity: 0, duration: .52 }, .03)
    .fromTo("#why > div", {
      clipPath: "polygon(0% 0%, 4% 0%, -18% 100%, 0% 100%)"
    }, {
      clipPath: "polygon(0% 0%, 125% 0%, 103% 100%, 0% 100%)", duration: .74, ease: "sine.inOut"
    }, .05);
  reveal(toWhy, lines("[data-why-line]"), .26);
  toWhy.fromTo("[data-claim]", { opacity: 0, y: 24 }, {
    opacity: 1, y: 0, duration: .27, stagger: .065, ease: "power3.out"
  }, .52);

  // why, pinned: the bite rolls across the four cards; the one under it lights up
  const cards = lines("[data-claim]");
  const span = R.whyB.x - R.whyA.x, rolled = span * 28;
  const whyPin = ScrollTrigger.create({ trigger: sequence, start: "top top", endTrigger: runway, end: "top top",
    onUpdate: self => { const on = Math.min(cards.length - 1, Math.floor(self.progress * cards.length)); cards.forEach((c, i) => c.toggleAttribute("data-on", i === on)); } });
  seg(whyPin, "bite", { x: R.whyA.x, roll: 0 }, { x: R.whyB.x, roll: rolled }, 0, 1, "none");

  // Each photographic spread wipes over the previous one. The same scroll position
  // drives the image mask, headline, time index and the bite on the fold.
  const spreads = lines("[data-moment]");
  const jumps = lines("[data-moment-jump]");
  const closed = "polygon(114% 0%, 115% 0%, 101% 100%, 100% 100%)";
  const open = "polygon(0% 0%, 115% 0%, 101% 100%, -14% 100%)";
  const revealSpread = (tl, spread, at) => {
    tl.fromTo(spread, { clipPath: closed }, {
      clipPath: open, duration: .68, ease: "power2.inOut"
    }, at)
      .fromTo(spread.querySelector("[data-moment-photo]"), { scale: 1.10 }, {
        scale: 1, duration: .85, ease: "power2.out"
      }, at)
      .fromTo(spread.querySelectorAll("[data-moment-line]"), { yPercent: 112 }, {
        yPercent: 0, duration: .31, stagger: .065, ease: "power3.out"
      }, at + .37)
      .fromTo(spread.querySelector("[data-moment-body]"), { y: 10, opacity: 0 }, {
        y: 0, opacity: 1, duration: .20
      }, at + .52);
  };
  const duration = spreads.length;
  let active = -1;
  function selectSpread(progress) {
    // The incoming date becomes current as the wipe crosses the centre of the screen.
    const index = gsap.utils.clamp(0, spreads.length - 1, Math.floor(progress * duration - .34));
    if (active === index) return;
    active = index;
    spreads.forEach((spread, i) => spread.setAttribute("aria-hidden", String(i !== index)));
    jumps.forEach((button, i) => {
      if (i === index) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
  }
  selectSpread(0);
  const reel = gsap.timeline({ scrollTrigger: pinCfg("moments", mobile ? 310 : 340, {
    onUpdate: self => selectSpread(self.progress)
  }) });
  reel.to({}, { duration }, 0);
  revealSpread(reel, spreads[0], 0);
  reel.fromTo("#moments header, #moments nav", { autoAlpha: 0 }, { autoAlpha: 1, duration: .22 }, .45);
  seg(reel.scrollTrigger, "bite", { ...R.whyB, roll: rolled }, { ...R.moments, roll: rolled + 2 }, 0, .72 / duration);
  seg(reel.scrollTrigger, "story", { outline: 0 }, { outline: 1 }, .28 / duration, .7 / duration);
  spreads.slice(1).forEach((spread, i) => {
    const at = i + 1;
    revealSpread(reel, spread, at);
    const pose = R.moments;
    const lift = { y: pose.y - (mobile ? .035 : .075), s: pose.s * 1.10 };
    seg(reel.scrollTrigger, "bite", { y: pose.y, s: pose.s }, lift, at / duration, (at + .34) / duration, "sine.out");
    seg(reel.scrollTrigger, "bite", lift, { y: pose.y, s: pose.s }, (at + .34) / duration, (at + .72) / duration, "sine.inOut");
    seg(reel.scrollTrigger, "bite", { roll: rolled + 2 + i * 2 }, { roll: rolled + 4 + i * 2 }, at / duration, (at + .72) / duration);
  });
  const chooseMoment = event => {
    const i = jumps.indexOf(event.currentTarget);
    const pin = reel.scrollTrigger;
    const target = pin.start + (pin.end - pin.start) * ((i + .86) / duration);
    window.__lenis?.scrollTo(target, { duration: .72 });
  };
  jumps.forEach(button => button.addEventListener("click", chooseMoment));

  // moments → shop: the bite drops into the pack and the rain of bites begins
  const toShop = gsap.timeline({ scrollTrigger: { trigger: sec("shop"), start: "top bottom", end: "top 20%", scrub: true } });
  seg(toShop.scrollTrigger, "story", { outline: 1 }, { outline: 0 }, 0, .4);
  seg(toShop.scrollTrigger, "story", { shopTravel:0 }, { shopTravel:1 }, 0, .9);
  seg(toShop.scrollTrigger, "story", { rain: 0 }, { rain: 1 }, .5, 1);
  reveal(toShop, lines("[data-shop-line]"), .24);
  toShop.fromTo("[data-shop-line]", { "--ink": "0%" }, {
    "--ink": "100%", duration: .55, stagger: .08, ease: "none"
  }, .37);
  const prints = lines("[data-shop-print]");
  const paper = gsap.timeline({ scrollTrigger: {
    trigger: sec("shop"), start: "top bottom", end: "bottom top", scrub: true
  } });
  prints.forEach((print, i) => paper.fromTo(print, { yPercent: i ? 22 : 34 }, {
    yPercent: i ? -28 : -45, duration: 1, ease: "none"
  }, 0));

  // As the trailing edge of the shop lifts, the stationary footer is uncovered.
  // Measure the moving shop edge so the timeline is independent of sticky positioning.
  const footer = gsap.timeline({ scrollTrigger: {
    trigger: sec("shop"), start: "bottom bottom", end: "bottom top", scrub: true
  } });
  seg(footer.scrollTrigger, "story", { rain: 1 }, { rain: 0 }, 0, .62);
  footer.fromTo("[data-footer-line]", { yPercent: 110 }, {
    yPercent: 0, duration: .42, stagger: .08, ease: "power3.out"
  }, .24)
    .fromTo("[data-footer-bite]", { xPercent: -16, yPercent: -12, rotation: -15 }, {
      xPercent: 0, yPercent: 0, rotation: 0, duration: .72, ease: "sine.out"
    }, .12)
    .fromTo("[data-footer-pouch]", { xPercent: 22, yPercent: 30, rotation: 12 }, {
      xPercent: 0, yPercent: 0, rotation: 0, duration: .65, ease: "power2.out"
    }, .30)
    .fromTo("[data-footer-tape]", { scale: .83, opacity: 0 }, {
      scale: 1, opacity: 1, duration: .17, ease: "back.out(1.5)"
    }, .68);

  // segments were declared top to bottom, so they're already in scroll order; base = the hero's rest
  const driver = createDriver(segs, {
    bite: { ...R.hero, rx: 0, ry: 0, rz: 0, split: 0, roll: 0 },
    story: { outline:0, insideTravel:0, shopTravel:0, orbit: 0, explode: 0, rain: 0, packAngle: 0, packOpen: 0, packProgress: 0 },
  });
  return {
    enable: driver.enable,
    kill() {
      driver.kill();
      moments.removeAttribute("data-reel");
      sequence.removeAttribute("data-pinned");
      jumps.forEach(button => {
        button.removeEventListener("click", chooseMoment);
        button.removeAttribute("aria-current");
      });
      spreads.forEach(spread => spread.removeAttribute("aria-hidden"));
    }
  };
}
