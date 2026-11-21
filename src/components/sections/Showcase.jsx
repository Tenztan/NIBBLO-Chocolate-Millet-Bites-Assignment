"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { story } from "@/lib/story";
import styles from "./Showcase.module.css";

const beats = [
  ["Turn the pouch.", "Drag to see the folded sides, or scroll to open the zipper."],
  ["Pop the seal.", "Pull the lips apart and three little bites make a break for it."],
  ["Save a handful.", "Press the zipper closed. The rest can wait until tomorrow. Probably."]
];

export default function Showcase() {
  const drag = useRef(null);
  const [frame, setFrame] = useState({ beat:0, open:false, back:false });
  useEffect(() => {
    let lastProgress = story.packProgress, overrideAt = lastProgress;
    let lastKey = "";
    const sync = () => {
      const p = story.packProgress;
      if (story.manualOpen === null) overrideAt = p;
      else if (p !== lastProgress && Math.abs(p - overrideAt) > .045) story.manualOpen = null;
      lastProgress = p;
      const open = (story.manualOpen ?? story.packOpen) >= .5;
      const beat = story.manualOpen !== null ? (open ? 1 : 2) : p < .42 ? 0 : p < .8 ? 1 : 2;
      const back = Math.cos((story.packAngle + story.dragAngle)*Math.PI/180) < 0;
      const key = [beat,open,back].join();
      if (lastKey !== key) { setFrame({ beat,open,back }); lastKey = key; }
    };
    gsap.ticker.add(sync);
    return () => { gsap.ticker.remove(sync); story.manualOpen = null; story.dragAngle = 0; };
  }, []);
  const down = e => {
    drag.current = { x:e.clientX, angle:story.dragAngle };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = e => { if (drag.current) story.dragAngle = drag.current.angle + (e.clientX - drag.current.x)*.65; };
  const up = () => { drag.current = null; };
  return <section id="product" className={styles.showcase} data-section="product">
    <div className={styles.stage}>
      <div className={styles.copy} data-studio-copy>
        <p className={`mono ${styles.kicker}`}>The resealable pouch</p>
        <div key={frame.beat} className={styles.caption}><h2>{beats[frame.beat][0].split(" ").map((word,i)=><span key={i} className={styles.mask}><span style={{"--delay":i*.035+"s"}}>{word}</span>{" "}</span>)}</h2><p>{beats[frame.beat][1]}</p></div>
        <div className={styles.controls}>
          <button className={styles.toggle} type="button" onClick={() => { story.manualOpen = frame.open ? 0 : 1; }} aria-pressed={frame.open}>{frame.open ? "Close pouch" : "Open pouch"}</button>
          <button type="button" onClick={() => { story.dragAngle += 180; }}>Turn over</button>
        </div>
      </div>
      <div className={styles.display}>
        <div className={styles.rings} aria-hidden="true" />
        <div className={styles.table} data-pouch-anchor="product" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <Image src={frame.back ? "/pack/back.webp" : "/pack/front.webp"} data-pack-poster draggable={false} alt="NIBBLŌ chocolate millet bites pouch" width={441} height={640} sizes="(max-width:760px) 54vw, 30vw"/>
        </div>
        <span className={`mono ${styles.hint}`}>Drag to rotate</span>
      </div>
      <div className={styles.steps} data-studio-rail>{["Turn", "Open", "Reseal"].map((label,i) => <span key={label} data-active={frame.beat === i}>{label}</span>)}</div>
    </div>
  </section>;
}
