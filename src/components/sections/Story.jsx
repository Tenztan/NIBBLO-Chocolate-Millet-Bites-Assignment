import Image from "next/image";
import Wordmark from "../ui/Wordmark";
import styles from "./Story.module.css";

const views = [
  { title:["Millet","bites."], label:"Front", name:"Chocolate Millet Bites", note:"150 g resealable pouch", lead:"Our starting point", text:"At NIBBLÅŒ, we start with two grains, jowar and ragi.", detail:"Our kind of snack", info:"Toast them for crunch, add a dark chocolate shell, and take a handful along.", img:"front", color:"#bd071d", shade:"#1a0e0c" },
  { title:["Jowar","& ragi."], label:"Back", name:"The grain blend", note:"The back of the pack", lead:"High fibre", text:"2.8 g of dietary fibre per 30 g.", detail:"Baked bites", info:"No maida in the grain blend.", img:"back", color:"#205a7f", shade:"#0b1720" },
  { title:["Inside","the bag."], label:"Open", name:"A closer look", note:"Pull the zipper apart", lead:"Chocolate coating", text:"Dark chocolate, cocoa and jaggery.", detail:"Save some", info:"Press the zipper closed for later.", img:"open", color:"#69354f", shade:"#1c1018" }
];

export default function Story({view,select}) {
  const active = views[view];
  return <section id="story" data-section="story" className={styles.story} style={{"--tone":active.color,"--shade":active.shade}}>
    <div key={active.label} className={styles.content}>
      <h2>{active.title.map(line=><span key={line}>{line}</span>)}</h2>
      <div className={styles.signature}><span>Chocolate millet bites</span><Wordmark/></div>
      <div className={styles.facts}>
        <div><strong>{active.name}</strong><p>{active.note}</p></div>
        <div><span>{active.lead}</span><p>{active.text}</p></div>
        <div><span>{active.detail}</span><p>{active.info}</p></div>
      </div>
    </div>
    <div className={styles.picker} role="group" aria-label="Pouch views">
      {views.map((item,i)=><button type="button" key={item.label} onClick={()=>select(i)} aria-label={item.label+" view"} aria-pressed={view===i}
        title={item.label+" view"} style={{"--tile":item.color}}>
        <Image width={78} height={85} src={"/pack/view-"+item.img+".webp"} alt=""/>
      </button>)}
    </div>
  </section>;
}
