"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { story } from "@/lib/story";
import Story from "./Story";
import styles from "./Hero.module.css";

import PaperSlips from "./PaperSlips";

export default function Hero({ go }) {
  const root = useRef(null);
  const [view, setView] = useState(0);
  useGSAP(() => {
    const container = root.current;
    const hero = container.querySelector("[data-cover]");
    const update = () => {
      const rect = container.getBoundingClientRect();
      const p = Math.max(0,Math.min(1,-rect.top / hero.offsetHeight));
      container.style.setProperty("--travel",p);
      story.openingTravel = p;
    };
    const trigger = ScrollTrigger.create({trigger:container,start:"top top",end:"bottom top",onUpdate:update,onRefresh:update});
    update();
    return () => {
      trigger.kill();
      story.openingView = 0;
    };
  }, {scope:root});
  const select = i => { story.openingView = i; setView(i); };
  return <div ref={root} className={styles.opening} id="top">
    <section className={styles.hero} data-cover aria-label="NIBBLŌ chocolate millet bites">
      <PaperSlips/>
      <h1 className={styles.title}>
        <span className="line"><span data-hero-line>Small <b>bites.</b></span></span>
        <span className="line"><span data-hero-line>Big <b>crunch.</b></span></span>
      </h1>
    </section>
    <Story view={view} select={select}/>
    <div className={styles.overlay}>
      <div className={styles.viewport}>
        <div className={styles.pack} data-hero-pack data-pouch-anchor="hero">
          <Image src={view===1 ? "/pack/back.webp" : "/pack/front.webp"} alt="NIBBLŌ chocolate millet bites pouch" data-pack-poster priority width={441} height={640} sizes="(max-width:760px) 55vw,30vw"/>
        </div>
        <a className={styles.card} data-hero-card href="#shop"
          onPointerMove={e=>{
            if(e.pointerType!=="mouse") return;
            const el=e.currentTarget, r=el.getBoundingClientRect();
            el.style.setProperty("--tilt-x",((.5-(e.clientY-r.top)/r.height)*7)+"deg");
            el.style.setProperty("--tilt-y",(((e.clientX-r.left)/r.width-.5)*9)+"deg");
          }}
          onPointerLeave={e=>{e.currentTarget.style.removeProperty("--tilt-x");e.currentTarget.style.removeProperty("--tilt-y");}} onClick={e=>{e.preventDefault();go("shop");}}>
          <span className={styles.thumb}><Image src="/pack/three_quarter.webp" alt="" width={65} height={85}/></span>
          <span className={styles.details}><span>Chocolate Millet Bites</span><span>150 g</span><span>₹199</span><span className={styles.buy}>Buy now</span></span>
        </a>
      </div>
    </div>
  </div>;
}
