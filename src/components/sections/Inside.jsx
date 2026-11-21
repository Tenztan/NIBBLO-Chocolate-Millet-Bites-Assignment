import { INGREDIENTS, INGREDIENTS_MOBILE } from "@/lib/story";
import styles from "./Inside.module.css";

export const NUTRITION = [["Energy", 146, "kcal"], ["Protein", 3.2, "g"], ["Carbs", 19.5, "g"], ["Fibre", 2.8, "g"], ["Fat", 6.4, "g"]];

const POSTER_LINES = ["A dark chocolate shell.", "A toasted millet centre.", "Five ingredients.", "One loud crunch."];

export default function Inside() {
  return (
    <section id="ingredients" className={styles.inside} data-section="ingredients">
      <div className={styles.stage}>
        <h2 className={styles.poster}>
          {POSTER_LINES.map(line => (
            <span className={styles.mask} key={line}><span data-crunch-line>{line} </span></span>
          ))}
        </h2>
        <svg className={styles.rays} viewBox="0 0 100 88" aria-hidden="true">
          <g fill="#b5362d" stroke="#fffaf1" strokeWidth="4" strokeLinejoin="round">
            <path data-crunch-ray d="M66 63 18 33 30 17Z" />
            <path data-crunch-ray d="M79 55 60 7 74 4Z" />
            <path data-crunch-ray d="M59 75 8 79 10 65Z" />
          </g>
        </svg>
        <div className={styles.anatomy} data-anatomy>
          <div className={styles.head}>
            <p className={`mono ${styles.kicker}`}>What&apos;s inside</p>
            <h3 className={styles.title}><span className="line"><span data-inside-line>Five things.</span></span><span className="line"><span data-inside-line>Nothing to hide.</span></span></h3>
          </div>
          {INGREDIENTS.map((ing, i) => (
            <div key={ing.key} className={styles.label} data-ing style={{ "--x": ing.x, "--y": ing.y, "--mx": INGREDIENTS_MOBILE[i].x, "--my": INGREDIENTS_MOBILE[i].y }}>
              <b>{ing.name}</b>
              <span>{ing.note}</span>
            </div>
          ))}
          <dl className={styles.facts} data-facts>
            <dt className="mono">Per 30 g</dt>
            {NUTRITION.map(([k, v, u]) => (
              <div key={k}><dd><span data-count={v}>{v}</span><small>{u}</small></dd><dt className="mono">{k}</dt></div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
