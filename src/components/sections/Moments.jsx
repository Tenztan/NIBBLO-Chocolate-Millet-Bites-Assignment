import Image from "next/image";
import styles from "./Moments.module.css";

const MOMENTS = [
  { key: "gym", time: "6:30 AM", lines: ["Before the", "first rep."], body: "Trainers laced. One more handful before you zip up the gym bag." },
  { key: "road", time: "11:20 AM", lines: ["Somewhere", "on NH48."], body: "Windows down. The playlist loops. Pass the pouch to the passenger seat." },
  { key: "desk", time: "4:07 PM", lines: ["The desk", "slump."], body: "Between the third call and the fourth, there's time for coffee and a little crunch." },
  { key: "movie", time: "9:45 PM", lines: ["Movie", "night."], body: "The opening credits roll. Slide the bowl down the row before the first plot twist." },
];

export default function Moments() {
  return (
    <section id="moments" className={styles.moments} data-section="moments" aria-labelledby="moment-heading">
      <header className={styles.head}>
        <h2 id="moment-heading">Made for the in-between.</h2>
      </header>
      <div className={styles.scenes}>
        {MOMENTS.map(({ key, time, lines, body }) => (
          <article key={key} className={styles.moment} data-moment={key}>
            <div className={styles.photo}>
              <Image src={'/moments/' + key + '.webp'} alt="" fill sizes="(max-width: 760px) 100vw, 55vw" unoptimized data-moment-photo />
            </div>
            <div className={styles.copy}>
              <p className={styles.time}><span aria-hidden="true" />{time}</p>
              <h3>
                {lines.map(line => <span key={line} className={styles.mask}><span data-moment-line>{line} </span></span>)}
              </h3>
              <p className={styles.body} data-moment-body>{body}</p>
            </div>
          </article>
        ))}
      </div>
      <nav className={styles.index} aria-label="Choose a snacking moment">
        {MOMENTS.map(({ key, time, lines }) => (
          <button key={key} data-moment-jump type="button" aria-label={time + ', ' + lines.join(' ')}>{time}</button>
        ))}
      </nav>
    </section>
  );
}
