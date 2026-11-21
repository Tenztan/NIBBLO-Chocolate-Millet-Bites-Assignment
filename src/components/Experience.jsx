"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { story } from "@/lib/story";
import { buildScroll, playIntro } from "@/lib/choreography";
import Loader from "./sections/Loader";
import Nav from "./sections/Nav";
import Hero from "./sections/Hero";

import Showcase from "./sections/Showcase";
import Inside from "./sections/Inside";
import Why from "./sections/Why";
import Moments from "./sections/Moments";
import momentStyles from "./sections/Moments.module.css";
import Shop from "./sections/Shop";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// the WebGL scene only runs in the browser, and it shouldn't hold up the first paint
const Scene = dynamic(() => import("./three/Scene"), { ssr: false });

const wait = ms => new Promise(r => setTimeout(r, ms));


export default function Experience() {
  const root = useRef(null);
  const lenisRef = useRef(null);
  const [cart, setCart] = useState(0);

  useGSAP(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // smooth scroll, driven by GSAP's ticker so ScrollTrigger and Lenis share one clock
    const lenis = new Lenis({ autoRaf: false, lerp: reduce ? 1 : 0.1, smoothWheel: !reduce });
    lenisRef.current = lenis;
    window.__lenis = lenis;   // handy for scripted tests and the console
    lenis.on("scroll", ScrollTrigger.update);
    const productPanel = root.current.querySelector("#story");
    const nav = root.current.querySelector("[data-nav]");
    const shop = root.current.querySelector("#shop");
    let lastRest = lenis.scroll;
    let settleFrame;
    const settlePanels = () => {
      if (lenis.isScrolling) return;
      cancelAnimationFrame(settleFrame);
      settleFrame = requestAnimationFrame(() => {
        if (lenis.isScrolling) return;
        const y = lenis.scroll;
        const edge = shop.getBoundingClientRect().top;
        const range = gsap.utils.clamp(80, 144, innerHeight * .14);
        const oldEdge = edge + y - lastRest;
        const approaching = (edge > 0 && y > lastRest) || (edge < 0 && y < lastRest);
        const crossed = Math.abs(oldEdge) > range && oldEdge * edge < 0;
        const productGap = productPanel.getBoundingClientRect().top;
        lastRest = y;
        let target;
        if (Math.abs(edge) > 1 && Math.abs(edge) <= range && (approaching || crossed)) {
          target = y + edge;
        } else if (lenis.direction === 1 && productGap > 1 && productGap <= nav.offsetHeight + 1) {
          target = y + productGap;
        }
        if (target !== undefined) lenis.scrollTo(target, { duration: .22, immediate: reduce });
      });
    };
    lenis.on("scroll", settlePanels);
    ScrollTrigger.addEventListener("scrollEnd", settlePanels);
    const raf = t => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    story.reduced = reduce;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    scrollTo(0, 0);

    const onMove = e => {
      if (reduce) return;
      story.pointer.x = (e.clientX / innerWidth - .5) * 2;
      story.pointer.y = -(e.clientY / innerHeight - .5) * 2;
    };
    addEventListener("pointermove", onMove);
    const mm = gsap.matchMedia();
    const loader = root.current.querySelector("[data-loader]");
    const main = root.current.querySelector("main");
    const pct = loader.querySelector("[data-loader-pct]");
    let cancelled = false, introDone = false, intro, fillTween, driver;
    let ready;
    const releasePage = () => {
      loader.hidden = true;
      main.inert = false;
      nav.inert = false;
      lenis.start();
    };
    const finishIntro = () => {
      if (cancelled || introDone) return;
      introDone = true;
      releasePage();
      ScrollTrigger.refresh();
      driver?.enable();
    };
    const startIntro = () => {
      if (cancelled) return;
      // Chapter layouts can rebuild across a breakpoint. The loader plays once.
      mm.add({ desk: "(min-width:761px)", mob: "(max-width:760px)" }, ctx => {
        const current = buildScroll({ mobile: ctx.conditions.mob });
        driver = current;
        if (introDone) current.enable();
        return () => { current.kill(); };
      });
      intro = playIntro({ loader, nav, onDone: finishIntro });
    };
    const onIntroResize = () => {
      // The nav target has moved. Finish at its new position on this frame.
      if (intro && !introDone) intro.progress(1);
    };

    if (reduce) {
      releasePage();
      story.bite.s = 0;
      root.current.querySelectorAll("[data-count]").forEach(el => { el.textContent = el.dataset.count; });
    } else {
      loader.hidden = false;
      main.inert = true;
      nav.inert = true;
      lenis.stop();
      window.addEventListener("resize", onIntroResize);
      const fill = { value: 0 };
      let progress = 0;
      const advance = weight => {
        if (cancelled) return;
        progress += weight;
        fillTween?.kill();
        fillTween = gsap.to(fill, {
          value: progress, duration: .24, ease: "power2.out",
          onUpdate: () => {
            loader.style.setProperty("--fill", fill.value);
            pct.textContent = Math.round(fill.value * 100);
          },
          onComplete: progress >= 1 ? startIntro : undefined
        });
      };
      const rendered = new Promise(resolve => { ready = resolve; });
      window.addEventListener("pouch-ready", ready, { once: true });
      if (document.documentElement.hasAttribute("data-pouch-ready")) ready();
      const poster = root.current.querySelector("[data-pack-poster]");
      // A decoded pack shot can carry the opening on devices without WebGL.
      const track = (promise, timeout, weight) =>
        Promise.race([promise, wait(timeout)]).catch(() => {}).then(() => advance(weight));
      track(document.fonts.ready, 1800, .20);
      track(poster?.decode?.(), 1800, .30);
      track(rendered, 2100, .50);
    }

    return () => {
      cancelled = true;
      fillTween?.kill();
      intro?.revert();
      main.inert = false;
      nav.inert = false;
      window.removeEventListener("resize", onIntroResize);
      if (ready) window.removeEventListener("pouch-ready", ready);
      removeEventListener("pointermove", onMove);
      ScrollTrigger.removeEventListener("scrollEnd", settlePanels);
      lenis.off("scroll", settlePanels);
      cancelAnimationFrame(settleFrame);
      gsap.ticker.remove(raf);
      lenis.destroy();
      mm.revert();
    };
  }, { scope: root });

  // nav and buttons: glide to a chapter without putting #section in the address bar
  const go = useCallback(id => {
    const el = id === "top" ? 0 : document.getElementById(id);
    lenisRef.current?.scrollTo(el, { immediate: story.reduced, duration: 1.3, easing: t => 1 - Math.pow(1 - t, 4) });
  }, []);

  // add to bag: a chocolate drop flies from the button into the bag, which then bumps
  const onAdd = useCallback((qty, button) => {
    if (story.reduced) { setCart(c => c + qty); return; }
    const bag = document.querySelector("[data-cart]");
    const a = button.getBoundingClientRect(), b = bag.getBoundingClientRect();
    const drop = document.createElement("span");
    Object.assign(drop.style, { position: "fixed", zIndex: 90, left: `${a.left + a.width / 2 - 10}px`, top: `${a.top + a.height / 2 - 10}px`,
      width: "20px", height: "20px", borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #8a5434, #2b140b)", pointerEvents: "none" });
    document.body.append(drop);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    gsap.timeline({ onComplete: () => { drop.remove(); setCart(c => c + qty); } })
      .to(drop, { x: dx, duration: .8, ease: "power1.inOut" }, 0)
      .to(drop, { y: dy, duration: .8, ease: "back.in(1.4)" }, 0)
      .to(drop, { scale: .4, duration: .8, ease: "power2.in" }, 0)
      .fromTo("[data-cart-count]", { scale: 1 }, { scale: 1.6, duration: .16, yoyo: true, repeat: 1, ease: "power2.out" }, .8);
  }, []);

  return (
    <div ref={root}>
      <Loader />
      <Scene />
      <Nav go={go} cart={cart} />
      <main>
        <Hero go={go} />

        <Showcase />
        <Inside />
        <div className={momentStyles.sequence} data-moment-sequence>
          <Why />
          <div className={momentStyles.runway} data-moment-runway><Moments /></div>
        </div>
        <Shop onAdd={onAdd} go={go} />
      </main>
      <div className="grain" aria-hidden="true" />
    </div>
  );
}
