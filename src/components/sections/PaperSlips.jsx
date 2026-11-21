"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "./Hero.module.css";

const labels = [
  {pose:[13,26,-17,10], title:"Nutrition facts", rows:[["Serving","30 g"],["Energy","146 kcal"],["Protein","3.2 g"],["Fibre","2.8 g"]]},
  {pose:[42,10,20,17], title:"The grain blend", rows:[["Millets","Jowar & ragi"],["Crunch","Rice crisp"],["Preparation","Baked"]]},
  {pose:[77,18,-12,21], title:"Inside the pouch", rows:[["Net weight","150 g"],["Serving","30 g"],["Closure","Resealable"]]},
  {pose:[86,66,22,12], title:"Chocolate coating", rows:[["Coating","Dark chocolate"],["Flavour","Cocoa"],["Sweetener","Jaggery"]]},
  {pose:[24,79,16,14], title:"The crunch", rows:[["Centre","Millet bites"],["Texture","Crisp"],["Preparation","Baked"]]},
  {pose:[53,89,-25,18], title:"Per serving", rows:[["Carbs","19.5 g"],["Fat","6.4 g"],["Protein","3.2 g"],["Serving","30 g"]]},
  {pose:[1,57,13,20], title:"The pack label", rows:[["Product","Chocolate millet bites"],["Net weight","150 g"],["Price","₹199"]]}
];

function Slip({label, index, inspect}) {
  const layer=useRef(null), grip=useRef(null), suppressClick=useRef(false);
  const [x,y,tilt,speed]=label.pose;
  useEffect(()=>{const el=layer.current;return ()=>{gsap.killTweensOf(el);};},[]);
  const down=e=>{
    if(!e.isPrimary || e.button!==0) return;
    const el=layer.current;
    gsap.killTweensOf(el);
    suppressClick.current=false;
    grip.current={x:e.clientX,y:e.clientY,ox:Number(gsap.getProperty(el,"x")),oy:Number(gsap.getProperty(el,"y")),dragged:false};
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move=e=>{
    const g=grip.current;
    if(!g || !e.isPrimary) return;
    const dx=e.clientX-g.x,dy=e.clientY-g.y;
    if(Math.hypot(dx,dy)>6) g.dragged=true;
    if(g.dragged) gsap.set(layer.current,{x:g.ox+dx,y:g.oy+dy,rotation:gsap.utils.clamp(-23,23,dx*.10)});
  };
  const release=(e,cancelled=false)=>{
    const g=grip.current;
    if(!g || !e.isPrimary) return;
    grip.current=null;
    suppressClick.current=g.dragged || cancelled;
    if(e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    gsap.to(layer.current,{x:0,y:0,rotation:0,duration:matchMedia("(prefers-reduced-motion:reduce)").matches?0:1.05,ease:"elastic.out(1,.42)",overwrite:true});
  };
  return <div className={styles.drift} style={{left:x+"%",top:y+"%","--tilt":tilt+"deg","--time":speed+"s","--phase":(-index*2.7)+"s"}}>
    <div ref={layer} className={styles.handle}>
      <button type="button" className={styles.paper} aria-label={"Read "+label.title.toLowerCase()} aria-haspopup="dialog"
        onPointerDown={down} onPointerMove={move} onPointerUp={e=>release(e)} onPointerCancel={e=>release(e,true)}
        onClick={e=>{if(!suppressClick.current || e.detail===0) inspect(index);suppressClick.current=false;}}>
        <b>NIBBLŌ</b><small>{label.title}</small>
        {label.rows.slice(0,3).map(([key,value])=><span key={key} className={styles.paperRow}>{key}<span>{value}</span></span>)}<i/>
      </button>
    </div>
  </div>;
}

export default function PaperSlips() {
  const dialog=useRef(null);
  const [index,setIndex]=useState(0);
  const label=labels[index];
  const inspect=i=>{setIndex(i);dialog.current.showModal();};
  return <>
    <div className={styles.papers}>{labels.map((item,i)=><Slip key={item.title} label={item} index={i} inspect={inspect}/>)}</div>
    <dialog ref={dialog} className={styles.receiptDialog} aria-labelledby="pouch-slip-title" data-lenis-prevent=""
      onClick={e=>{if(e.target===e.currentTarget) dialog.current.close();}}>
      <article className={styles.receipt}>
        <div className={styles.receiptTop}><b>NIBBLŌ</b><button type="button" onClick={()=>dialog.current.close()} aria-label="Close label">×</button></div>
        <h2 id="pouch-slip-title">{label.title}</h2>
        <dl>{label.rows.map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
        <i aria-hidden="true"/>
      </article>
    </dialog>
  </>;
}
